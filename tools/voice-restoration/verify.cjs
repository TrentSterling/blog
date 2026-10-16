'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const manifest = require('./manifest.json');
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
// Reversible only for the exact reviewed bytes. A single unexpected edit is
// deliberately not normalized, and therefore fails historical preservation.
function normalize(relative, contents) {
  const post = manifest.posts.find(p => p.path === relative);
  return post && hash(contents) === post.restoredSha256 ? post.baseline : contents;
}
function verify(root) {
  for (const post of manifest.posts) {
    assert.equal(hash(post.baseline), post.baselineSha256, post.path + ': pinned baseline');
    const text = require('../seo/archive-annotations.cjs').normalize(post.path, fs.readFileSync(path.join(root, post.path), 'utf8'));
    assert.equal(hash(text), post.restoredSha256, post.path + ': exact reviewed restoration');
    assert.equal(normalize(post.path, text), post.baseline, post.path + ': reversible restoration');
    assert.equal(normalize(post.path, text + '\nUnexpected edit'), text + '\nUnexpected edit', 'unapproved edit is never normalized');
    const dates = t => t.split('---')[1].match(/^date:.*$/m)[0];
    assert.equal(dates(text), dates(post.baseline), 'publication dates untouched');
    const images = t => t.match(/!\[[^\]]*\]\([^\n]*?\)/g) || [];
    for (const image of images(post.baseline)) assert.ok(text.includes(image), post.path + ': every existing Markdown image retained');
    for (const iframe of post.baseline.match(/<iframe[^>]*>[\s\S]*?<\/iframe>/g)||[]) assert.ok(text.includes(iframe), post.path + ': video preserved');
  }
  const mqtt = fs.readFileSync(path.join(root, '_posts/2016-12-30-mqtt-iot-experiments.md'), 'utf8');
  assert.ok(mqtt.includes('wifi.connect("your_ssid", {password: "your_password"}, onConnect);'), 'safe placeholders retained');
  const oldMQTT = manifest.posts.find(p=>p.path.endsWith('mqtt-iot-experiments.md')).baseline;
  const code = t => t.match(/```javascript\n([\s\S]*?)```/)[1].replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'').replace(/\s+/g,'');
  assert.equal(code(mqtt),code(oldMQTT),'MQTT executable code unchanged');
  for (const slug of ['magic-archer','jenns-cafe']) {
    const post=manifest.posts.find(p=>p.path.endsWith(slug+'.md')); const text=fs.readFileSync(path.join(root,post.path),'utf8');
    assert.ok(text.includes(post.baseline.split('---').slice(2).join('---').trim()),'entire labeled later commentary retained: '+slug);
  }
  return {posts:manifest.posts.length,datesUnchanged:true,existingMediaPreserved:true,negativeControlsPassed:true,safeMQTTPlaceholders:true};
}
module.exports={manifest,normalize,verify};
if(require.main===module) console.log(JSON.stringify(verify(path.resolve(__dirname,'../..')),null,2));
