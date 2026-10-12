'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'assets/js/tront-theme-bridge.js'), 'utf8');
function environment(denied = false) {
  const attrs = { 'data-te-mode': 'dark' }, writes = [], messages = [];
  let observer;
  const html = { getAttribute: key => attrs[key], setAttribute: (key, value) => attrs[key] = value };
  const doc = { documentElement: html, readyState: 'loading' };
  vm.runInNewContext(source, { document: doc, sessionStorage: { setItem(k, v) { if (denied) throw Error('Storage denied'); writes.push([k, v]); } },
    window: { location: { origin: 'https://tront.xyz' }, postMessage: (...args) => messages.push(args) }, Theme: { ID: 'theme-mode' },
    MutationObserver: class { constructor(fn) { observer = fn; } observe() {} } });
  return { attrs, writes, messages, doc, update(mode) { attrs['data-te-mode'] = mode; observer(); } };
}
test('Chirpy mode is initialized before paint, and later mode changes notify existing integrations once', () => {
  const e = environment(); assert.equal(e.attrs['data-mode'], 'dark'); assert.deepEqual(e.writes, [['mode', 'dark']]); assert.equal(e.messages.length, 0);
  e.doc.readyState = 'complete'; e.update('light'); assert.equal(e.attrs['data-mode'], 'light'); assert.equal(e.messages.length, 1); assert.equal(e.messages[0][1], 'https://tront.xyz');
  e.update('light'); assert.equal(e.messages.length, 1); e.update('dark'); assert.equal(e.messages.length, 2);
});
test('denied session storage does not stop rendering or mode changes', () => { const e = environment(true); e.update('light'); assert.equal(e.attrs['data-mode'], 'light'); });
test('one picker uses same-origin shared assets with the correct blog base path', () => {
  const head = fs.readFileSync(path.join(root, '_includes/head.html'), 'utf8');
  for (const file of ['css/tront-theme-editor.css', 'css/tront-navbar.css', 'js/tront-system.js', 'js/tront-theme-editor.js']) assert.ok(head.includes(`/assets/${file}`));
  assert.ok(!head.includes("'/assets/js/tront-theme.js'"));
  const nav = fs.readFileSync(path.join(root, '_includes/navbar.html'), 'utf8');
  assert.ok(!nav.includes('Theme.flip')); assert.match(nav, /type="button" hidden/);
  for (const link of ['href="/"', 'href="/games/"', 'href="/discord/"', 'href="/blog/"']) assert.ok(nav.includes(link));
  assert.ok(!fs.readFileSync(path.join(root, '_includes/sidebar.html'), 'utf8').includes('id="mode-toggle"'));
  assert.match(fs.readFileSync(path.join(root, 'Gemfile'), 'utf8'), /jekyll-theme-chirpy", "7\.2\.4"/);
});
test('posts, metadata, sidebar content and layout body remain untouched', () => {
  const baseline = process.env.BLOG_BASELINE_ROOT;
  if (!baseline) throw Error('BLOG_BASELINE_ROOT is required for preservation checks');
  const protectedPaths = ['_posts', '_tabs', '_data', '_plugins', 'Gemfile', '_config.yml', '_layouts/post.html', '_layouts/home.html', '_includes/footer.html'];
  const tree = dir => execFileSync('git', ['-C', dir, 'ls-tree', '-r', '--full-tree', 'HEAD', '--', ...protectedPaths], { encoding: 'utf8' });
  assert.equal(tree(root), tree(baseline));
  const layout = dir => fs.readFileSync(path.join(dir, '_layouts/default.html'), 'utf8').split('  <body>')[1];
  assert.equal(layout(root), layout(baseline), 'all blog layout/body content is preserved');
  const sidebar = dir => fs.readFileSync(path.join(dir, '_includes/sidebar.html'), 'utf8').replace(/  {% unless site.theme_mode %}[\s\S]*?  {% endunless %}\n/, '');
  assert.equal(sidebar(root), sidebar(baseline), 'only the obsolete duplicate theme control is removed');
});

test('lazy comments guard remains valid after HTML compression removes line breaks', () => {
  const html = fs.readFileSync(path.join(root, '_includes/comments/giscus.html'), 'utf8')
    .replace(/{%-?\s*comment\s*-?%}[\s\S]*?{%-?\s*endcomment\s*-?%}/g, '')
    .replace(/{{[\s\S]*?}}/g, 'placeholder');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.doesNotThrow(() => new vm.Script(script.replace(/\n/g, ' ')));
});
