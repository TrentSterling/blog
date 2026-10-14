'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {manifest,hash}=require('./verify.cjs');
async function check(browser, siteBase, out) {
  siteBase=siteBase.replace(/\/$/,'');fs.mkdirSync(out,{recursive:true});
  const context=await browser.newContext({serviceWorkers:'block'});
  const report={status:'running',siteBase,images:[],pages:[],baseCommit:manifest.baseCommit};
  const save=()=>fs.writeFileSync(path.join(out,'restored-image-browser-report.json'),JSON.stringify(report,null,2));
  try {
    for(const image of manifest.images){
      const url=`${siteBase}/${image.path}`;
      const response=await context.request.get(url,{timeout:60000});
      assert.equal(response.status(),200,url);
      assert.match(response.headers()['content-type'],new RegExp('^'+image.contentType.replace('/','\\/')));
      assert.equal(hash(await response.body()),image.sha256,url+': exact source bytes');
      report.images.push({url,sha256:image.sha256,bytes:image.bytes,dimensions:image.dimensions});save();
    }
    const page=await context.newPage();
    for(const post of manifest.posts){
      const images=manifest.images.filter(image=>image.postPath===post.path);
      for(const width of [320,390,1440]){
        await page.setViewportSize({width,height:1000});
        const url=`${siteBase}/posts/${images[0].postSlug}/`;
        const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
        assert.equal(response.status(),200,url);
        const evidence={url,width,images:[]};
        for(const image of images){
          const figure=page.locator(`[data-restored-image="${image.id}"]`);
          assert.equal(await figure.count(),1,image.id);
          const img=figure.locator('img');
          assert.equal(new URL(await img.getAttribute('src'),url).href,`${siteBase}/${image.path}`,'Chirpy image URL has exactly one base path');
          await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());
          const decoded=await img.evaluate(el=>{const r=el.getBoundingClientRect();return {width:el.naturalWidth,height:el.naturalHeight,visibleWidth:r.width,visibleHeight:r.height,left:r.left,right:r.right,complete:el.complete};});
          assert.deepEqual([decoded.width,decoded.height],image.dimensions,image.id);
          assert.ok(decoded.complete&&decoded.visibleWidth>0&&decoded.visibleHeight>0,image.id);
          assert.ok(decoded.left>=-1&&decoded.right<=width+1,image.id+': fits reading viewport');
          const link=figure.locator('a').first();
          assert.equal(new URL(await link.getAttribute('href'),url).href,`${siteBase}/${image.path}`,'enlargement URL');
          assert.equal(await img.getAttribute('alt'),image.alt);
          assert.equal((await figure.locator('figcaption').allTextContents()).join(''),image.caption);
          evidence.images.push({id:image.id,...decoded});
        }
        await page.locator(`[data-restored-image="${images[0].id}"]`).scrollIntoViewIfNeeded();
        await page.screenshot({path:path.join(out,`restored-${images[0].postSlug}-${width}.png`)});
        report.pages.push(evidence);save();
      }
    }
    report.status='passed';save();return report;
  }catch(error){report.status='failed';report.error=error.stack;save();throw error;}
  finally{await context.close();}
}
module.exports=check;
if(require.main===module){
 (async()=>{const {chromium}=require('playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.THEME_BROWSER_EXECUTABLE||undefined});try{await check(browser,process.env.RELEASE_URL,process.env.BLOG_SCREENSHOTS||'.local/released-images');}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
}
