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

test('search paints one surface and moves keyboard focus to its rounded wrapper', () => {
  const css = fs.readFileSync(path.join(root, 'assets/css/tront-theme-bridge.css'), 'utf8');
  assert.doesNotMatch(css, /:is\(#search-input,/);
  assert.match(css, /#search-input\s*\{[^}]*min-width:\s*0;[^}]*background:\s*transparent;/);
  assert.match(css, /#search-input\s*\{[^}]*color:\s*var\(--te-ink\)/);
  assert.match(css, /#search-input\s*\{[^}]*transition:\s*none;/);
  assert.match(css, /#search:focus-within\s*\{[^}]*outline:\s*2px solid var\(--te-accent\)/);
  assert.match(css, /#search-input:focus-visible\s*\{\s*outline:\s*none;/);
});

test('search Cancel and Escape reset the real input value and mobile focus', () => {
  const html = fs.readFileSync(path.join(root, '_includes/search-loader.html'), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
    .replace(/{%-?\s*comment\s*-?%}[\s\S]*?{%-?\s*endcomment\s*-?%}/g, '')
    .replace(/{%[\s\S]*?%}/g, '').replace(/{{[\s\S]*?}}/g, 'placeholder');
  const handlers = {}, events = [];
  let mobile = false, focused = false, inputFocused = false, prevented = false;
  const input = { value: 'Trontop', focus: () => inputFocused = true, addEventListener: (name, fn) => handlers[name] = fn, dispatchEvent: event => events.push(event.type) };
  const cancel = { classList: { contains: () => mobile }, addEventListener: (name, fn) => handlers.cancel = fn, click: () => handlers.cancel() };
  const trigger = { focus: () => focused = true };
  const elements = { 'search-input': input, 'search-cancel': cancel, 'search-trigger': trigger, 'search-result-wrapper': { addEventListener: (name, fn) => handlers.resultKeydown = fn } };
  vm.runInNewContext(script.replace(/\n/g, ' '), {
    document: { addEventListener: (name, fn) => fn(), getElementById: id => elements[id] },
    SimpleJekyllSearch() {}, Event: class { constructor(type) { this.type = type; } }
  });
  handlers.cancel(); assert.equal(input.value, ''); assert.equal(focused, true); assert.deepEqual(events, ['input']);
  for (const isMobile of [false, true]) {
    mobile = isMobile; focused = false; input.value = 'Trontop';
    handlers.keydown({ key: 'Escape', preventDefault: () => prevented = true });
    assert.equal(input.value, ''); assert.equal(focused, isMobile); assert.equal(prevented, true);
  }
  for (const isMobile of [false, true]) {
    mobile = isMobile; focused = false; inputFocused = false; input.value = 'Trontop';
    handlers.resultKeydown({ key: 'Escape', preventDefault() {} });
    assert.equal(input.value, ''); assert.equal(focused, isMobile); assert.equal(inputFocused, !isMobile);
  }
  input.value = 'unchanged'; handlers.keydown({ key: 'Enter' }); assert.equal(input.value, 'unchanged');
});


test('supported blog editor reserves its exact pending label without exposing a control', () => {
  const nav = fs.readFileSync(path.join(root, '_includes/navbar.html'), 'utf8');
  const script = nav.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\n/g, ' ');
  assert.match(nav, /class="theme-label"> Theme<\/span>/);
  for (const mode of ['dark', 'light']) {
    const attrs = {}, icon = { textContent: '◐' };
    const button = { setAttribute: (key, value) => attrs[key] = value, querySelector: () => icon };
    const document = { getElementById: () => button, documentElement: { getAttribute: () => mode } };
    const window = { TrontThemeEditor: {}, HTMLDialogElement: class {} };
    window.HTMLDialogElement.prototype.showModal = function () {};
    vm.runInNewContext(script, { document, window });
    assert.equal(attrs['data-te-pending-slot'], '');
    assert.equal(icon.textContent, mode === 'light' ? '◑' : '◐');
    assert.equal(button.hidden, undefined, 'bootstrap never unhides the control');
  }
  const css = fs.readFileSync(path.join(root, 'assets/css/tront-theme-bridge.css'), 'utf8');
  assert.match(css, /#tront-theme-btn\[hidden\]\[data-te-pending-slot\]\s*\{[^}]*display:\s*flex !important;[^}]*visibility:\s*hidden;[^}]*pointer-events:\s*none;/);
});

test('missing editor or unsupported dialog never gets a pending slot or dead control', () => {
  const nav = fs.readFileSync(path.join(root, '_includes/navbar.html'), 'utf8');
  const script = nav.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\n/g, ' ');
  for (const window of [{}, { TrontThemeEditor: {} }, { TrontThemeEditor: {}, HTMLDialogElement: class {} }]) {
    const document = { getElementById: () => ({ setAttribute() { throw Error('must remain fully hidden'); } }) };
    assert.doesNotThrow(() => vm.runInNewContext(script, { document, window }));
  }
});


test('only Menu and Search trigger glyphs use page-native decorative SVGs', () => {
  const html = fs.readFileSync(path.join(root, '_includes/topbar.html'), 'utf8');
  for (const [id, label] of [['sidebar-trigger', 'Menu'], ['search-trigger', 'Search']]) {
    const button = html.match(new RegExp('<button[^>]*id="' + id + '"[\\s\\S]*?<\\/button>'))[0];
    assert.ok(button.includes('aria-label="' + label + '"'));
    assert.match(button, /<svg[^>]*width="1.25em"[^>]*height="1em"[^>]*stroke="currentColor"[^>]*aria-hidden="true"[^>]*focusable="false"/);
    assert.doesNotMatch(button, /<i|fa-bars|fa-search/);
  }
  assert.equal((html.match(/<svg/g) || []).length, 2);
  assert.match(html, /<search[^>]*id="search"[\s\S]*?<i class="fas fa-search fa-fw"><\/i>/, 'other font icons are unchanged');
});
