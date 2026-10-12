'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(process.env.BLOG_SITE_ROOT || '_site');
const out = path.resolve(process.env.BLOG_SCREENSHOTS || '.local/theme-review');
fs.mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const createServer = root => http.createServer((req, res) => {
  try {
    const filePath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, '.' + filePath);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
  } catch { res.writeHead(404); res.end('Not found'); }
});
const server = createServer(root);
const baselineServer = createServer(path.resolve('_baseline'));
async function contrast(page) {
  const failed = await page.evaluate(() => {
    const api = window.TrontThemeEditor;
    const state = JSON.parse(localStorage.getItem(api.key) || 'null') || api.fromLegacy(localStorage.getItem('tront-theme'));
    const bound = api.buildTokens(state).bound;
    return [...document.body.querySelectorAll('*')].filter(el => !['SCRIPT', 'STYLE', 'OPTION'].includes(el.tagName) && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).flatMap(el => {
      const css = getComputedStyle(el), box = el.getBoundingClientRect();
      if (!box.width || !box.height || css.visibility === 'hidden' || Number(css.opacity) === 0) return [];
      const rgb = css.color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
      const ratio = rgb && api.contrast(rgb, bound);
      return ratio >= 4.5 ? [] : [{ tag: el.tagName, class: el.className, text: el.textContent.trim().slice(0, 55), color: css.color, ratio }];
    });
  });
  assert.deepEqual(failed, [], 'rendered blog text stays readable');
}
(async () => {
  let browser, page;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const url = `http://127.0.0.1:${server.address().port}`;
    await new Promise(resolve => baselineServer.listen(0, '127.0.0.1', resolve));
    const baselineUrl = `http://127.0.0.1:${baselineServer.address().port}`;
    browser = await chromium.launch({ headless: true, executablePath: process.env.THEME_BROWSER_EXECUTABLE || undefined });
    page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [], missing = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith(url) && /\.(css|js)(\?|$)/.test(response.url()) && response.status() >= 400) missing.push(response.url()); });
    await page.route('**/*', route => {
      const u = new URL(route.request().url());
      if (u.hostname === '127.0.0.1' || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'].includes(u.hostname)) return route.continue();
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    });
    const baselineContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await baselineContext.route('**/*', route => {
      const u = new URL(route.request().url());
      return u.hostname === '127.0.0.1' || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'].includes(u.hostname) ? route.continue() : route.fulfill({ status: 200, body: '' });
    });
    const baseline = await baselineContext.newPage();
    await baseline.goto(baselineUrl + '/blog/', { waitUntil: 'networkidle' });
    await baseline.evaluate(() => localStorage.setItem('tront-theme', 'tront-purple'));
    await baseline.reload({ waitUntil: 'networkidle' });
    const composition = p => p.evaluate(() => ({
      bodyImage: getComputedStyle(document.body).backgroundImage,
      panels: ['main', '#sidebar', '#post-list', '#post-list .card'].map(selector => { const el = document.querySelector(selector), r = el.getBoundingClientRect(), s = getComputedStyle(el); return { selector, x: r.x, width: r.width, radius: s.borderRadius, font: s.fontFamily }; }),
      titles: [...document.querySelectorAll('#post-list .card-title')].map(el => el.textContent),
      cardBlur: getComputedStyle(document.querySelector('#post-list .card')).backdropFilter,
      headingGradient: getComputedStyle(document.querySelector('#post-list h1')).backgroundImage.includes('linear-gradient')
    }));
    await page.goto(url + '/blog/', { waitUntil: 'networkidle' });
    await page.locator('#tront-theme-btn').click(); await page.selectOption('[name="preset"]', 'purple'); await page.keyboard.press('Escape');
    const comparisons = [];
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 }); await baseline.setViewportSize({ width, height: 1000 });
      const before = await composition(baseline), after = await composition(page);
      assert.deepEqual(after, before, 'Chirpy reading canvas, sidebar/card geometry, gradient headings and glass materials remain page-specific');
      await baseline.screenshot({ path: path.join(out, `blog-baseline-${width}.png`) });
      await page.screenshot({ path: path.join(out, `blog-themed-${width}.png`) });
      comparisons.push({ width, before, after });
    }
    await baselineContext.close();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(url + '/blog/', { waitUntil: 'networkidle' });
    await page.evaluate(() => { localStorage.setItem('tront-theme', 'tront-purple'); localStorage.setItem('tront-previews-paused', 'true'); });
    const firstPost = await page.locator('#post-list .post-preview').first().getAttribute('href');
    assert.ok(firstPost.startsWith('/blog/posts/'));
    let codePost;
    for (const entry of fs.readdirSync(path.join(root, 'blog/posts'), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = path.join(root, 'blog/posts', entry.name, 'index.html');
      if (fs.existsSync(file) && /class="highlight"/.test(fs.readFileSync(file, 'utf8'))) { codePost = '/blog/posts/' + entry.name + '/'; break; }
    }
    assert.ok(codePost, 'a built post with code is available for contrast coverage');
    for (const route of [...new Set(['/blog/', firstPost, codePost])]) {
      await page.goto(url + route, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('data-tront-theme-surface'), 'blog');
      assert.equal(await page.locator('#mode-toggle').count(), 0);
      assert.deepEqual(await page.locator('#magic-navbar-container a').evaluateAll(links => links.map(a => a.getAttribute('href'))), ['/discord/', '/blog/', '/games/', '/']);
      await page.locator('#tront-theme-btn').click();
      assert.equal(await page.locator('[data-peg-row]:visible').count(), 4);
      assert.equal(await page.locator('.te-dialog details, .te-dialog [name="count"]').count(), 0);
      for (const preset of ['dark', 'cyan', 'purple', 'ember', 'moss', 'light']) {
        await page.selectOption('[name="preset"]', preset); await contrast(page);
        const mode = preset === 'light' ? 'light' : 'dark';
        await page.waitForFunction(mode => document.documentElement.getAttribute('data-mode') === mode && sessionStorage.getItem('mode') === mode, mode);
        await page.locator('[data-action="close"]').click(); await contrast(page); await page.locator('#tront-theme-btn').click();
      }
      await page.selectOption('[name="preset"]', 'dark');
      if (route === '/blog/' || route === firstPost) await page.screenshot({ path: path.join(out, (route === '/blog/' ? 'blog-home' : 'blog-post') + '-editor-desktop-dark.png') });
      for (const key of ['Tab', 'Shift+Tab']) for (let n = 0; n < 30; n++) {
        await page.keyboard.press(key);
        assert.equal(await page.evaluate(() => !!document.activeElement.closest('.te-dialog')), true);
      }
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#tront-theme-btn').evaluate(el => el === document.activeElement), true);
      if (route === '/blog/' || route === firstPost) await page.screenshot({ path: path.join(out, (route === '/blog/' ? 'blog-home' : 'blog-post') + '-desktop-dark.png') });
      const saved = await page.evaluate(() => localStorage.getItem('tront-theme-editor-v1'));
      await page.reload(); assert.equal(await page.evaluate(() => localStorage.getItem('tront-theme-editor-v1')), saved);
      for (const width of [320, 390, 768]) {
        await page.setViewportSize({ width, height: 844 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'blog does not overflow horizontally');
        assert.equal(await page.locator('#magic-navbar-container').evaluate(nav => [...nav.children].every(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })), true, 'primary navbar fits');
        await page.locator('#tront-theme-btn').click(); await page.selectOption('[name="preset"]', 'light'); await contrast(page);
        assert.equal(await page.locator('.te-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true);
        if (width === 390 && (route === '/blog/' || route === firstPost)) await page.screenshot({ path: path.join(out, (route === '/blog/' ? 'blog-home' : 'blog-post') + '-editor-mobile-light.png') });
        await page.keyboard.press('Escape'); await contrast(page);
        if (width === 390 && (route === '/blog/' || route === firstPost)) await page.screenshot({ path: path.join(out, (route === '/blog/' ? 'blog-home' : 'blog-post') + '-mobile-light.png') });
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    await page.goto(url + '/blog/', { waitUntil: 'networkidle' });
    await page.locator('#search-input').fill('Tronto'); await page.locator('#search-input').press('p');
    await page.locator('#search-results article').first().waitFor();
    assert.match(await page.locator('#search-results').innerText(), /Trontop/i);
    const resultHref = await page.locator('#search-results article h2 a').first().getAttribute('href');
    assert.ok(resultHref.includes('/blog/posts/'));
    await page.locator('#search-input').fill(''); await page.locator('#search-input').press('Backspace');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url + '/blog/');
    await page.locator('#sidebar-trigger').click();
    assert.equal(await page.locator('body').getAttribute('sidebar-display'), '');
    await page.locator('#mask').click();
    assert.equal(await page.locator('body').getAttribute('sidebar-display'), null);
    assert.deepEqual(await page.evaluate(() => [localStorage.getItem('tront-theme'), localStorage.getItem('tront-previews-paused')]), ['tront-purple', 'true']);
    assert.deepEqual(missing, [], 'same-origin theme and blog scripts/styles load');
    assert.deepEqual(errors, [], 'no page JavaScript errors');
    fs.writeFileSync(path.join(out, 'blog-browser-report.json'), JSON.stringify({ status: 'passed', compositionComparisons: comparisons, routes: ['/blog/', firstPost, codePost], presets: 6, widths: [320, 390, 768, 1440], search: 'passed', sidebar: 'passed', errors, missing }, null, 2));
    console.log('PASS: blog build, shared navbar/editor, presets, post/code contrast, keyboard, mobile, persistence, search and sidebar.');
  } catch (error) {
    if (page) { fs.writeFileSync(path.join(out, 'blog-browser-failure.json'), JSON.stringify({ error: error.message, url: page.url() }, null, 2)); await page.screenshot({ path: path.join(out, 'blog-browser-failure.png') }); }
    throw error;
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); await new Promise(resolve => baselineServer.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
