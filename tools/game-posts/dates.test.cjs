'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { approved, normalizeDateMetadata } = require('./dates.cjs');
const publication = require('./manifest.json');
const root = path.resolve(__dirname, '../..');
test('30 verified dates retain update dates and existing article URLs', () => {
  assert.equal(approved.size, 30);
  for (const [relative, entry] of approved) {
    const source = fs.readFileSync(path.join(root, relative), 'utf8');
    assert.ok(source.includes(`\ndate: ${entry.date}\nlast_modified_at: ${entry.last_modified_at}\n`));
    assert.equal(publication.posts.find(post => post.path === relative).url, entry.url);
    assert.equal(entry.url, 'https://tront.xyz/blog/posts/' + path.basename(relative).replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '') + '/');
  }
  assert.match(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'), /permalink: \/posts\/:title\//);
});
test('date normalization permits only the approved dates and rejects hidden content changes', () => {
  const [relative, entry] = approved.entries().next().value;
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const normalized = normalizeDateMetadata(relative, source);
  assert.throws(() => normalizeDateMetadata(relative, source.replace(entry.date, '2000-01-01')));
  assert.throws(() => normalizeDateMetadata(relative, source.replace(entry.last_modified_at, '2000-01-01')));
  assert.notEqual(normalizeDateMetadata(relative, source.replace('Aqua Empire starts', 'Changed content starts')), normalized);
  assert.notEqual(normalizeDateMetadata(relative, source.replace('title: "Aqua Empire"', 'title: "Other title"')), normalized);
});
