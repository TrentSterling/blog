'use strict';
const assert = require('node:assert/strict');
const dates = require('./historical-dates.json');
const approved = new Map(dates.posts.map(post => [post.path, post]));
function normalizeDateMetadata(relative, text) {
  const expected = approved.get(relative);
  if (!expected) return text;
  const end = text.indexOf('\n---', 4);
  assert.ok(text.startsWith('---\n') && end > 0, `${relative}: front matter`);
  const front = text.slice(0, end);
  const date = front.match(/^date: (.+)$/m);
  assert.ok(date && [expected.original_date, expected.date].includes(date[1]), `${relative}: approved date only`);
  const modified = front.match(/^last_modified_at: (.+)$/m);
  if (modified) assert.equal(modified[1], expected.last_modified_at, `${relative}: retain October 14 update`);
  return front.replace(/^date: .+$/m, `date: ${expected.original_date}`)
    .replace(/^last_modified_at: .+\n/m, '') + text.slice(end);
}
module.exports = { approved, normalizeDateMetadata };
