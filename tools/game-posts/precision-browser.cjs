'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const fixture=require('./project-periods.json');
module.exports=async(browser,base,out)=>{
 base=base.replace(/\/$/,'');fs.mkdirSync(out,{recursive:true});
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000},timezoneId:'America/New_York'});
 const page=await context.newPage();
 const report={status:'running',base,checkedAt:new Date().toISOString(),posts:[],cards:[],archives:[],taxonomies:[]};
 const save=()=>fs.writeFileSync(path.join(out,'project-period-browser-report.json'),JSON.stringify(report,null,2));
 try{
  for(const post of fixture.posts){
   const slug=post.url.split('/').filter(Boolean).pop(),label=post.period.replace('-','\u2013');
   for(const width of [390,1440]){
    await page.setViewportSize({width,height:1000});const response=await page.goto(base+'/posts/'+slug+'/',{waitUntil:'networkidle'});assert.equal(response.status(),200);
    const header=page.locator('article > header');const period=header.locator('[data-work-period]');assert.equal(await period.innerText(),label);
    assert.equal(await period.getAttribute('data-ts'),null);assert.equal(await period.getAttribute('datetime'),null);
    assert.ok((await header.innerText()).includes('Work from '+label));
    assert.ok((await header.innerText()).includes('Published Oct 14, 2026'));
    const published=await page.locator('meta[property="article:published_time"]').getAttribute('content');
    assert.equal(published,'2026-10-14T15:16:48+00:00');
    const modified=await page.locator('meta[property="article:modified_time"]').getAttribute('content');assert.ok(modified.startsWith('2026-10-14'));
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),post.url);
    const structured=JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent());assert.equal(structured.datePublished,published);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:path.join(out,`period-${slug}-${width}.png`)});
    report.posts.push({slug,width,label,published,modified,canonical:post.url});save();
   }
  }
  // Pagination changes position, not the article's canonical URL or timestamp.
  await page.setViewportSize({width:1440,height:1000});
  let next=base+'/',seen=new Set(),pageNumber=0;
  while(next){
   assert.ok(!seen.has(next),'pagination does not loop');seen.add(next);pageNumber++;
   assert.ok(pageNumber<50);const response=await page.goto(next,{waitUntil:'networkidle'});assert.equal(response.status(),200);
   for(const post of fixture.posts){
    const pathname=new URL(post.url).pathname;
    const card=page.locator('#post-list article').filter({has:page.locator(`a[href="${pathname}"]`)});
    if(await card.count()){
     assert.equal(await card.count(),1);assert.ok(pageNumber>1,'old projects leave the first page');
     assert.equal(await card.locator('[data-work-period]').innerText(),post.period.replace('-','\u2013'));
     assert.equal(await card.locator('.post-meta [data-ts]').count(),0,'card does not format article date as project date');
     if(post.period==='2009'){await card.screenshot({path:path.join(out,'period-bombertank-card.png')});}
     report.cards.push({period:post.period,url:post.url,page:pageNumber,pageUrl:next});save();
    }
   }
   const link=page.locator('.pagination .page-link').last();
   const href=await link.count()?await link.getAttribute('href'):null;
   next=href&&href!=='#'?new URL(href,base+'/').href:null;
  }
  assert.equal(report.cards.length,4,'all four cards remain reachable once across pagination');
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:1000});await page.goto(base+'/archives/',{waitUntil:'networkidle'});
   for(const post of fixture.posts){
    const row=page.locator('#archives li').filter({has:page.locator(`a[href="${new URL(post.url).pathname}"]`)});
    assert.equal(await row.count(),1);assert.equal(await row.locator('[data-work-period]').innerText(),post.period.replace('-','\u2013'));
    assert.equal(await row.locator('[data-ts]').count(),0);
    const year=await row.evaluate(el=>el.parentElement.previousElementSibling.textContent.trim());assert.equal(year,post.period.split('-').pop());
    report.archives.push({period:post.period,year,width});
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.locator('#archives a[href="/blog/posts/bombertank/"]').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`period-archive-${width}.png`)});save();
  }
  for(const route of ['/categories/projects/','/tags/games/']){
   await page.goto(base+route,{waitUntil:'networkidle'});
   for(const post of fixture.posts){
    const row=page.locator('main li').filter({has:page.locator(`a[href="${new URL(post.url).pathname}"]`)});
    assert.equal(await row.count(),1);assert.equal(await row.locator('[data-work-period]').innerText(),post.period.replace('-','\u2013'));
   }
   report.taxonomies.push(route);save();
  }
  report.status='passed';save();return report;
 }catch(error){report.status='failed';report.error=error.stack;save();throw error;}
 finally{await context.close();}
};
