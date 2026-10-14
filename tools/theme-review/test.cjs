'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { REPAIRS, normalizePostForPreservation, verifySources, verifyNegativeCases } = require('./link-repair.cjs');
const root = path.resolve(__dirname, '../..');
const restoration = require('../image-restoration/verify.cjs');
const voice = require('../voice-restoration/verify.cjs');
const publication = require('../game-posts/manifest.json');
const publishedFiles = new Map([...publication.posts, ...publication.assets].map(file => [file.path, file.sha256]));
test('reviewed archival wording, media, dates and safe placeholders are preserved', () => voice.verify(root));
const source = fs.readFileSync(path.join(root, 'assets/js/tront-theme-bridge.js'), 'utf8');
// Exact archived 600x337 JPEG bytes. The WordPress migration referenced the
// unsuffixed names but omitted these two images; the article is unchanged.
const recoveredImages = new Map([
  ['assets/img/blog/wp/screen21.jpg', '0129c8b2ff304ae9e4527d0d48691fccd1fb6c6548406d0891399c5aba3a16e8'],
  ['assets/img/blog/wp/screen3.jpg', 'a474e89407554af975d8110ffaf6eb78ef5a20fb2d88996e87f41c49cf79adfa']
]);
// Sources: http://old.trentsterling.com/trentsterling.com/wp-content/uploads/2014/10/screen21-600x337.jpg
//          http://old.trentsterling.com/trentsterling.com/wp-content/uploads/2014/10/screen3-600x337.jpg
for (const image of restoration.manifest.images) recoveredImages.set(image.path, image.sha256);
function verifyRecoveredImage(relative, bytes) {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), recoveredImages.get(relative),
    `${relative}: recovered image must match the authentic archived bytes`);
}
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
test('reviewed additions are exact and all existing protected working-tree bytes remain intact', () => {
  const baseline = process.env.BLOG_BASELINE_ROOT;
  if (!baseline) throw Error('BLOG_BASELINE_ROOT is required for preservation checks');
  const protectedPaths = ['_posts', '_tabs', '_data', '_plugins', 'assets/img', 'Gemfile', '_config.yml',
    '_layouts/post.html', '_layouts/home.html', '_layouts/default.html', '_includes/footer.html',
    '_includes/sidebar.html', '_includes/navbar.html', '_includes/topbar.html'];
  // Read the working tree, not only HEAD: this must catch uncommitted edits,
  // additions and removals as well as the committed PR changes in CI.
  const files = dir => {
    const result = [];
    function visit(relative) {
      const stat = fs.lstatSync(path.join(dir, relative));
      assert.ok(!stat.isSymbolicLink(), `protected path must not be a symlink: ${relative}`);
      if (stat.isDirectory()) {
        for (const name of fs.readdirSync(path.join(dir, relative)).sort()) visit(relative + '/' + name);
      } else result.push(relative);
    }
    for (const relative of protectedPaths) visit(relative);
    return result.sort();
  };
  const currentFiles = files(root), baselineFiles = files(baseline);
  const recoveredAdditions = new Set(currentFiles.filter(relative =>
    recoveredImages.has(relative) && !baselineFiles.includes(relative)));
  const publicationAdditions = new Set(currentFiles.filter(relative =>
    publishedFiles.has(relative) && !baselineFiles.includes(relative)));
  assert.equal(publication.posts.length, 35, 'the reviewed publication contains 35 posts');
  assert.deepEqual(currentFiles.filter(relative => !recoveredAdditions.has(relative) && !publicationAdditions.has(relative)), baselineFiles,
    'protected files are neither added nor removed except the exact reviewed additions');
  verifySources(root);
  for (const relative of currentFiles) {
    const current = fs.readFileSync(path.join(root, relative));
    if (publicationAdditions.has(relative)) {
      assert.equal(crypto.createHash('sha256').update(current).digest('hex'), publishedFiles.get(relative),
        `${relative}: exact reviewed publication bytes`);
      continue;
    }
    if (recoveredAdditions.has(relative)) {
      verifyRecoveredImage(relative, current);
      continue;
    }
    const original = fs.readFileSync(path.join(baseline, relative));
    if (REPAIRS.some(repair => repair.path === relative) || restoration.manifest.posts.some(post => post.path === relative) || voice.manifest.posts.some(post => post.path === relative)) {
      assert.equal(normalizePostForPreservation(relative, current.toString('utf8')),
        normalizePostForPreservation(relative, original.toString('utf8')),
        `${relative}: reverse only the approved URLs; preserve every other post byte`);
    } else {
      assert.deepEqual(current, original, `${relative}: unlisted protected content is byte-for-byte intact`);
    }
  }
});

test('image-only restoration preserves all prose, metadata, captions and image order', () => {
  restoration.verify(root);
});

test('recovered historical screenshots retain exact authentic bytes and reject tampering', () => {
  for (const [relative] of recoveredImages) {
    const bytes = fs.readFileSync(path.join(root, relative));
    verifyRecoveredImage(relative, bytes);
    const changed = Buffer.from(bytes);
    changed[changed.length - 1] ^= 1;
    assert.throws(() => verifyRecoveredImage(relative, changed), /authentic archived bytes/);
  }
});

test('URL preservation rejects prose, captions, image sources, wrong destinations and duplicate-count changes', () => {
  assert.equal(verifyNegativeCases(root).length, 8);
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
