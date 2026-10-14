'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(process.env.BLOG_SITE_ROOT || '_site');
const out = path.resolve(process.env.BLOG_SCREENSHOTS || '.local/zoom-review');
fs.mkdirSync(out, { recursive: true });
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg' };
const server = http.createServer((req,res) => {
  try {
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
    if (!file.startsWith(root+path.sep)) throw Error('outside root');
    if(fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));
  } catch {res.writeHead(404);res.end('Not found');}
});
const levels=[['25%',.25],['50%',.5],['67%',2/3],['80%',.8],['100%',1],['125%',1.25],['150%',1.5],['200%',2]];
(async()=>{
  const report={desktop:[],mobile:[]};
  let context;
  try {
    await new Promise(r=>server.listen(0,'127.0.0.1',r));
    const base=process.env.RELEASE_URL || `http://127.0.0.1:${server.address().port}/blog`;
    async function inspect(page, name) {
      await page.goto(base+'/',{waitUntil:'networkidle'});
      await page.evaluate(()=>document.fonts.ready);
      for(const img of (await page.locator('#post-list img').all()).slice(0,3)) await img.evaluate(e=>e.decode());
      const data=await page.evaluate(()=>{
        const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,right:r.right,width:r.width,height:r.height};};
        return {dpr:devicePixelRatio,viewport:innerWidth,outer:outerWidth,visualScale:visualViewport.scale,
          cssZoom:getComputedStyle(document.documentElement).zoom,rootFont:parseFloat(getComputedStyle(document.documentElement).fontSize),
          scroll:document.documentElement.scrollWidth,container:rect(document.querySelector('#main-wrapper>.container')),
          cards:[...document.querySelectorAll('#post-list .post-preview')].map(e=>({
            ...rect(e),title:rect(e.querySelector('h1')),text:rect(e.querySelector('p')),image:rect(e.querySelector('img'))
          }))};
      });
      assert.equal(data.visualScale,1,'native browser zoom, without pinch scaling');
      assert.equal(data.cssZoom,'1','no CSS zoom workaround');
      assert.ok(data.scroll<=data.viewport+1,`${name}: no horizontal page overflow`);
      assert.ok(data.container.width<=76*data.rootFont+1,`${name}: content has a readable width limit`);
      assert.equal(data.cards.length,10);
      for(const card of data.cards){
        assert.ok(card.x>=-1 && card.right<=data.viewport+1,`${name}: card fits viewport`);
        assert.ok(card.width/data.rootFont<60,`${name}: cards stay proportional to text`);
        for(const item of [card.title,card.text,card.image]) {
          assert.ok(item.x>=card.x-1 && item.right<=card.right+1,`${name}: card content fits its surface`);
        }
        assert.ok(card.image.width>0 && card.image.height>0,`${name}: visible thumbnail`);
        assert.ok(card.image.height<=card.height+1,`${name}: media fits card height`);
      }
      // Capture physical viewport pixels. Playwright's CSS-sized screenshot path
      // crops or pads a page when native browser zoom differs from 100 percent.
      const session=await context.newCDPSession(page);
      const shot=await session.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
      fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(shot.data,'base64'));
      await session.detach();
      return {name,...data};
    }
    for(const width of [1440,2048]){
      context=await chromium.launchPersistentContext('',{headless:true,viewport:null,
        executablePath:process.env.THEME_BROWSER_EXECUTABLE||undefined,args:[`--window-size=${width},1100`]});
      const settings=context.pages()[0];
      await settings.goto('chrome://settings/appearance',{waitUntil:'domcontentloaded'});
      const control=settings.locator('#zoomLevel');await control.waitFor();
      const page=await context.newPage();
      for(const [label,factor] of levels){
        // Chrome's own Page zoom control changes real browser zoom in this
        // disposable profile. Viewport emulation and CSS scaling do not.
        await control.selectOption({label});
        const result=await inspect(page,`desktop-${width}-${label.slice(0,-1)}`);
        assert.ok(Math.abs(result.dpr-factor)<.02,`${label}: native device pixel ratio`);
        assert.ok(Math.abs(result.outer-width)<30,'desktop window size is unchanged');
        report.desktop.push(result);
        console.log(`Native Chrome zoom passed: ${width}px at ${label}`);
      }
      await context.close();context=undefined;
    }
    context=await chromium.launchPersistentContext('',{headless:true,viewport:{width:390,height:844},
      executablePath:process.env.THEME_BROWSER_EXECUTABLE||undefined});
    const page=context.pages()[0];
    for(const width of [320,390]){
      await page.setViewportSize({width,height:844});
      report.mobile.push(await inspect(page,`mobile-${width}`));
    }
    report.status='passed';
    fs.writeFileSync(path.join(out,'zoom-report.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify({status:'passed',nativeZoomViews:report.desktop.length,mobileViews:report.mobile.length}));
  } finally {if(context) await context.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
