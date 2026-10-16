'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const manifest = require('./manifest.json');
const { normalizeDateMetadata } = require('../game-posts/dates.cjs');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
// Reverse only a complete, hash-pinned article with its exact approved image line.
// Any change to the title, date, description, body or other media stays visible.
function normalize(relative, text) {
  text = normalizeDateMetadata(relative, text);
  const post = manifest.posts.find(item => item.path === relative);
  if (!post || hash(text) !== post.afterSha256) return text;
  assert.equal(text.split(post.after).length - 1, 1, 'one exact thumbnail field');
  const before = text.replace(post.after, post.before);
  assert.equal(hash(before), post.beforeSha256, 'thumbnail edit recovers every prior article byte');
  return before;
}
function verify(root) {
  for (const post of manifest.posts) {
    const text = normalizeDateMetadata(post.path, require('../seo/archive-annotations.cjs').normalize(post.path, fs.readFileSync(path.join(root, post.path), 'utf8')));
    assert.equal(hash(text), post.afterSha256, post.path + ': exact reviewed thumbnail change');
    assert.equal(hash(normalize(post.path, text)), post.beforeSha256);
    for (const altered of [text + '\nUnexpected prose', text.replace(/^title:.+$/m, 'title: Other'), text.replace(post.after, 'image: "/assets/img/other.jpg"')]) {
      assert.notEqual(hash(normalize(post.path, altered)), post.beforeSha256, 'unapproved edits cannot be normalized');
    }
    if (post.source.videoId) assert.ok(text.includes(post.source.videoId), 'thumbnail belongs to the retained embedded video');
  }
  for (const asset of manifest.assets) {
    const bytes = fs.readFileSync(path.join(root, asset.path));
    assert.equal(hash(bytes), asset.sha256, asset.path + ': exact authentic image bytes');
    assert.equal(bytes.length, asset.bytes);
  }
  return { posts: manifest.posts.length, assets: manifest.assets.length, preserved: 'titles, dates, descriptions, prose and other media' };
}
module.exports = { manifest, normalize, verify };
if (require.main === module) console.log(JSON.stringify(verify(path.resolve(__dirname, '../..')), null, 2));
