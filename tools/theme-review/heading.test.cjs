'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const shared = path.resolve(process.env.BLOG_SHARED_ROOT || '.local/shared-source');
const bridge = fs.readFileSync(path.resolve(__dirname, '../../assets/js/tront-theme-bridge.js'), 'utf8');
const window = {};
for (const file of ['tront-system.js', 'tront-theme-editor.js']) vm.runInNewContext(fs.readFileSync(path.join(shared, 'assets/js', file), 'utf8'), { window });
const T = window.Tront, api = window.TrontThemeEditor;
function derive(state, denied) {
  const tokens = api.buildTokens(state), values = { ...tokens.vars }, attrs = { 'data-te-mode': state.mode };
  let callback, writes = 0;
  const html = { getAttribute: key => attrs[key], setAttribute: (key, value) => attrs[key] = value,
    style: { getPropertyValue: key => values[key] || '', setProperty: (key, value) => { values[key] = value; writes++; } } };
  vm.runInNewContext(bridge, { window, document: { documentElement: html, readyState: 'loading' },
    sessionStorage: { setItem() { if (denied) throw Error('denied'); } },
    MutationObserver: class { constructor(fn) { callback = fn; } observe(options) {} } });
  const first = values['--tront-heading-gradient'];
  callback(); assert.equal(writes, 1, 'observer settles without recursively writing its own token');
  return { tokens, gradient: first, apply(next) { Object.assign(values, api.buildTokens(next).vars); attrs['data-te-mode'] = next.mode; callback(); return values['--tront-heading-gradient']; } };
}
for (const mode of ['dark', 'light']) test(`${mode} heading follows all four stops/direction before paint and remains readable`, () => {
  for (const intensity of [0, 65, 100]) for (const colors of [['#ff0000', '#00ff00', '#0000ff', '#ffff00'], ['#000000', '#ffffff', '#ff00ff', '#00ffff']]) {
    const state = { ...api.preset(mode), mode, intensity, angle: 270, pegs: colors.map((color, i) => ({ color, position: [0, 27, 79, 100][i] })) };
    const d = derive(state, true);
    assert.match(d.gradient, /^linear-gradient\(270deg in srgb,/);
    assert.deepEqual(d.gradient.match(/\d+%/g), ['0%', '27%', '79%', '100%']);
    const ramp = d.gradient.match(/#[a-f\d]{6}/gi).map(T.hexToRgb);
    assert.equal(ramp.length, 4);
    for (let i = 1; i < ramp.length; i++) for (let step = 0; step <= 100; step++) {
      assert.ok(api.contrast(T.mix(ramp[i - 1], ramp[i], step / 100), d.tokens.bound) >= 4.5, 'all interpolated heading colors meet contrast');
    }
    const updated = d.apply({ ...state, angle: 90, pegs: state.pegs.map((peg, i) => ({ ...peg, position: [15, 40, 60, 90][i] })) });
    assert.match(updated, /^linear-gradient\(90deg in srgb,/);
    assert.deepEqual(updated.match(/\d+%/g), ['15%', '40%', '60%', '90%']);
  }
});

test('blog bridge consumes the gradient and material tokens without fixed angle/blur', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../../assets/css/tront-theme-bridge.css'), 'utf8');
  assert.match(css, /background-image:\s*var\(--te-wash\)/);
  assert.match(css, /background-size:\s*100vw 100vh/);
  assert.match(css, /\.card\s*\{[^}]*background:\s*var\(--te-panel-fill\);[^}]*backdrop-filter:\s*blur\(var\(--te-blur\)\)/);
  assert.match(css, /background-image:\s*var\(--tront-heading-gradient,/);
  assert.doesNotMatch(css, /blur\(12px\)/);
});
