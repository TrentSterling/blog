'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fixture=require('./project-periods.json');
const periods=new Map(fixture.posts.map(post=>[post.path,post]));
const reviewed=new Map(fixture.reviewed.map(file=>[file.path,file]));
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
function normalizePeriod(relative,text){
 const entry=periods.get(relative);if(!entry)return text;
 const end=text.indexOf('\n---',4);assert.ok(text.startsWith('---\n')&&end>0);
 const front=text.slice(0,end);assert.ok(front.includes('\ndate: '+entry.published+'\n'),relative+': real publication timestamp retained');
 const lines=front.match(/^work_period: .+$/gm)||[];
 assert.ok(lines.length<=1);if(lines.length)assert.equal(lines[0],`work_period: "${entry.period}"`);
 return front.replace(/^work_period: .+\n/m,'')+text.slice(end);
}
function verifyReviewed(relative,current,original){
 const entry=reviewed.get(relative);assert.ok(entry,relative+': reviewed date rendering file');
 assert.equal(hash(current),entry.after,relative+': exact reviewed date change');
 if(original!==undefined)assert.ok([entry.before,entry.after].includes(hash(original)),relative+': known starting template');
 else assert.equal(entry.before,null,relative+': explicit new chronology file');
}
module.exports={periods,reviewed,normalizePeriod,verifyReviewed};
