'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const reviewed = new Map(Object.entries(require('./reviewed.json')));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function verify(relative, current, original) {
  const entry = reviewed.get(relative);
  assert.equal(hash(current), entry.after, `${relative}: exact reviewed author-profile change`);
  if (original) assert.ok([entry.before, entry.after].includes(hash(original)), `${relative}: known author-profile baseline`);
  else assert.equal(entry.before, null, `${relative}: only reviewed author-profile additions`);
}
module.exports = { reviewed, verify };
