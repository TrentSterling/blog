'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const manifest = require('./manifest.json');
const root = path.resolve(process.env.BLOG_SITE_ROOT || '_site');
const out = path.resolve(process.env.BLOG_SCREENSHOTS || '.local/presentation-review');
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
(async()=>{
  let browser;
  const report={videos:[],footers:[]};
  try {
    await new Promise(r=>server.listen(0,'127.0.0.1',r));
    const base=process.env.RELEASE_URL || `http://127.0.0.1:${server.address().port}/blog`;
    browser=await chromium.launch({headless:true,executablePath:process.env.THEME_BROWSER_EXECUTABLE||undefined});
    for(const post of manifest.posts){
      const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
      const page=await context.newPage(), media=[];
      page.on('request',r=>{if(/\.mp4(?:\?|$)/.test(r.url())) media.push(r.url());});
      const slug=post.url.split('/posts/')[1];
      await page.goto(`${base}/posts/${slug}`,{waitUntil:'networkidle'});
      for(const [index,video] of (await page.locator('main video').all()).entries()){
        await video.scrollIntoViewIfNeeded();
        const cold=await video.evaluate(async e=>{
          const image=new Image(); image.src=e.poster; await image.decode();
          const r=e.getBoundingClientRect();
          return {poster:e.poster,posterWidth:image.naturalWidth,width:r.width,height:r.height,preload:e.preload,controls:e.controls,playsInline:e.playsInline,time:e.currentTime,ready:e.readyState};
        });
        assert.ok(cold.posterWidth>100,'real poster decodes before playback');
        assert.equal(cold.preload,'none'); assert.ok(cold.controls && cold.playsInline);
        assert.equal(cold.time,0);assert.equal(cold.ready,0);assert.equal(media.length,0,'cold article does not request video bytes');
        if(['smear/','craftmine2/','gems-together/'].includes(slug)) {
          await video.screenshot({path:path.join(out,`${slug.slice(0,-1)}-${index}-cold.png`)});
        }
      }
      // Only after every cold player is captured may video data be requested.
      for(const video of await page.locator('main video').all()){
        const playback=await video.evaluate(async e=>{e.muted=true;await e.play();await new Promise(r=>setTimeout(r,250));e.pause();return {time:e.currentTime,width:e.videoWidth,height:e.videoHeight,renderedHeight:e.getBoundingClientRect().height};});
        assert.ok(playback.time>0 && playback.width>0); report.videos.push({url:post.url,...playback});
      }
      await context.close();
    }
    for(const width of [390,1440,2048]) for(const route of ['/','/page2/','/posts/smear/','/posts/magic-archer/']){
      const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'}),page=await context.newPage();
      await page.goto(base+route,{waitUntil:'networkidle'});
      const footer=page.locator('footer');await footer.scrollIntoViewIfNeeded();await page.waitForTimeout(800);await footer.scrollIntoViewIfNeeded();
      const data=await page.evaluate(()=>{
        const f=document.querySelector('footer'),r=f.getBoundingClientRect(),m=document.querySelector('main').getBoundingClientRect(),p=f.querySelector('p').getBoundingClientRect(),s=getComputedStyle(f);
        return {text:f.innerText,x:r.x,right:r.right,width:r.width,height:r.height,mainX:m.x,mainRight:m.right,textX:p.x,textRight:p.right,background:s.backgroundColor,scroll:document.documentElement.scrollWidth,viewport:innerWidth};
      });
      assert.ok(data.x>=data.mainX && data.right<=data.mainRight+1,'footer shares the main content column');
      assert.ok(data.textX>=data.x && data.textRight<=data.right+1,'copyright stays inside footer');
      assert.equal(data.background,'rgba(0, 0, 0, 0)','footer follows the page wash');
      assert.match(data.text,/© \d{4} Trent Sterling\./);assert.ok(data.scroll<=width+1,'no horizontal overflow');
      await page.screenshot({path:path.join(out,`${route.replaceAll('/','-') || 'index'}-${width}-footer.png`)});
      report.footers.push({route,width,...data});await context.close();
    }
    assert.equal(report.videos.length,34);
    report.status='passed';
    fs.writeFileSync(path.join(out,'presentation-report.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify({status:'passed',coldPosters:34,videoPlayback:34,footerViews:report.footers.length}));
  } finally { if(browser) await browser.close();server.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
