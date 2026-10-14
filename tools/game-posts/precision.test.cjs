'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {periods,reviewed,normalizePeriod,verifyReviewed}=require('./precision.cjs');
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
 for(const [relative] of reviewed)verifyReviewed(relative,read(relative),reviewed.get(relative).before===null?undefined:read(relative));
});
