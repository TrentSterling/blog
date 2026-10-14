'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const expectations=require('./expectations.json');
const normalize=t=>t.replace(/[‘’]/g,"'").replace(/\s+/g,' ');
module.exports=async(browser,base,out)=>{
 base=base.replace(/\/$/,'');fs.mkdirSync(out,{recursive:true});
 const host=new URL(base).hostname;
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.route('**/*',r=>new URL(r.request().url()).hostname===host?r.continue():r.fulfill({status:200,body:''}));
 const page=await context.newPage(),report=[];
 try{
  for(const [slug,quotes] of Object.entries(expectations)){
   const response=await page.goto(base+'/posts/'+slug+'/',{waitUntil:'networkidle'});assert.equal(response.status(),200);
   const body=await page.locator('main article > .content').innerText();
   for(const quote of quotes)assert.ok(normalize(body).includes(normalize(quote)),slug+': rendered original words: '+quote);
   assert.equal(await page.locator('main h1').count(),1,slug+': one main heading');
   if(slug==='box2d-vs-nape')assert.equal(await page.locator('main del').count(),2,'superseded original observations stay struck through');
   if(slug==='that-dummy')assert.ok(!body.includes('I used a custom physics engine'));
   if(slug==='bear-party-ld33')assert.ok(!body.includes('versions were released'));
   if(slug==='bacon-game-jam-buttloads')assert.ok(!body.includes("wasn't originally linked"));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,slug+': no mobile horizontal overflow');
   if(['rebooting-me','voxel-engine-progress','box2d-vs-nape'].includes(slug))await page.screenshot({path:path.join(out,'voice-'+slug+'.png'),fullPage:true});
   report.push({slug,restoredQuotes:quotes.length,oneHeading:true});
  }
  fs.writeFileSync(path.join(out,'blog-voice-restoration-report.json'),JSON.stringify(report,null,2));
 }finally{await context.close();}
};

if(require.main===module){
 (async()=>{const {chromium}=require('playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.THEME_BROWSER_EXECUTABLE||undefined});try{await module.exports(browser,process.env.RELEASE_URL,process.env.BLOG_SCREENSHOTS||'.local/released-voice');}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
}
