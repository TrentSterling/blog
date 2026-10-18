'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {periods,reviewed,normalizePeriod,verifyReviewed}=require('./precision.cjs');
const authorProfiles=require('../author-profiles/preservation.cjs');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
test('four project periods preserve publication timestamps and cannot conceal body changes',()=>{
 assert.equal(periods.size,4);
 for(const [relative,entry] of periods){
  const source=read(relative),normalized=normalizePeriod(relative,source);
  assert.ok(source.includes(`work_period: "${entry.period}"\n`));
  assert.equal(normalized,source.replace(`work_period: "${entry.period}"\n`,''));
  assert.throws(()=>normalizePeriod(relative,source.replace(entry.period,'2000-01-01')));
  assert.throws(()=>normalizePeriod(relative,source.replace(entry.published,'2000-01-01')));
  assert.notEqual(normalizePeriod(relative,source+'Altered body'),normalized);
 }
 for(const [relative, entry] of reviewed) {
  if(authorProfiles.reviewed.has(relative)) {
   assert.equal(authorProfiles.reviewed.get(relative).before,entry.after,'author links build on exact reviewed date template');
   authorProfiles.verify(relative,read(relative),read(relative));
  } else verifyReviewed(relative,read(relative),entry.before===null?undefined:read(relative));
 }
});
