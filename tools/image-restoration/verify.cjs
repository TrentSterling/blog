'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const manifest = require('./manifest.json');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function normalize(relative, contents) {
  let result = contents;
  for (const image of [...manifest.images].reverse().filter(image => image.postPath === relative)) {
    result = result.replace(image.insertion, '');
  }
  return result;
}
function verify(root) {
  const paths = new Set();
  for (const image of manifest.images) {
    assert.ok(!paths.has(image.path), 'no duplicate recovered asset'); paths.add(image.path);
    assert.equal(hash(fs.readFileSync(path.join(root, image.path))), image.sha256, image.path + ': exact archived bytes');
    const post = fs.readFileSync(path.join(root, image.postPath), 'utf8');
    assert.equal(post.split(image.markup).length - 1, 1, image.id + ': one exact image and caption');
  }
  for (const post of manifest.posts) {
    const text = fs.readFileSync(path.join(root, post.path), 'utf8');
    assert.equal(hash(text), post.restoredSha256, post.path + ': exact approved image-only change');
    assert.equal(hash(normalize(post.path, text)), post.baselineSha256,
      post.path + ': removing only exact restored image blocks recovers every original byte');
    const ordered = manifest.images.filter(image => image.postPath === post.path).sort((a,b)=>a.originalOrder-b.originalOrder);
    assert.deepEqual(ordered.map(image=>text.indexOf(image.markup)), ordered.map(image=>text.indexOf(image.markup)).sort((a,b)=>a-b), 'original relative order');
  }
  return {images:manifest.images.length,posts:manifest.posts.length,bytes:manifest.images.reduce((n,image)=>n+image.bytes,0)};
}
module.exports = { manifest, normalize, verify, hash };
if (require.main === module) console.log(JSON.stringify(verify(path.resolve(__dirname, '../..'))));
