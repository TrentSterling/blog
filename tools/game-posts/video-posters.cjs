'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const manifest = require('./video-posters.json');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
function normalize(relative, contents) {
  const post = manifest.posts.find(p => p.path === relative);
  if (!post || hash(contents) !== post.afterSha256) return contents;
  let original = contents;
  for (const edit of [...post.edits].reverse()) {
    assert.equal(original.split(edit.after).length - 1, 1, 'one exact reviewed media edit');
    original = original.replace(edit.after, edit.before);
  }
  assert.equal(hash(original), post.beforeSha256, 'media edits preserve all original article bytes');
  return original;
}
function verify(root) {
  for (const post of manifest.posts) {
    const text = fs.readFileSync(path.join(root, post.path), 'utf8');
    assert.equal(hash(text), post.afterSha256, post.path + ': reviewed poster fix');
    assert.equal(hash(normalize(post.path, text)), post.beforeSha256);
    assert.equal(normalize(post.path, text + 'unexpected'), text + 'unexpected');
  }
  for (const asset of manifest.assets) assert.equal(hash(fs.readFileSync(path.join(root,asset.path))),asset.sha256);
}
module.exports = {manifest, normalize, verify};
