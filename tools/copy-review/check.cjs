'use strict';
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const reviewed = require('./about.json');
const hash = value => createHash('sha256').update(value).digest('hex');
function verify(current, original) {
  assert.equal(hash(current), reviewed.afterSha256, 'exact reviewed About copy');
  assert.ok([reviewed.beforeSha256, reviewed.afterSha256].includes(hash(original)), 'known About baseline');
}
module.exports = { reviewed, verify };
