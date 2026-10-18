'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(process.env.BLOG_SITE_ROOT || '_site');
const fixtureRoot = path.resolve(process.env.AUTHOR_FIXTURE_ROOT || '.local/author-fixtures');
const out = path.resolve(process.env.BLOG_SCREENSHOTS || '.local/author-review');
fs.mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const directory = pathname.startsWith('/author-fixtures/') ? fixtureRoot : root;
    const relative = directory === fixtureRoot ? pathname.slice('/author-fixtures'.length) : pathname;
    let file = path.resolve(directory, '.' + relative);
    if (!file.startsWith(directory + path.sep)) { res.writeHead(403); return res.end(); }
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    const body = fs.readFileSync(file); res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
(async () => {
  let browser;
  const results = [];
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    browser = await require('playwright')[process.env.THEME_BROWSER_ENGINE || 'chromium'].launch({ headless: true, executablePath: process.env.THEME_BROWSER_EXECUTABLE || undefined });
    for (const width of [390, 1440]) for (const mode of ['dark', 'light']) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, serviceWorkers: 'block' });
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.href === 'https://tront.xyz/' && route.request().isNavigationRequest()) return route.fulfill({ contentType: 'text/html', body: '<title>Verified profile destination</title><h1>Profile destination test fixture</h1>' });
        if (url.origin === base || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'].includes(url.hostname)) return route.continue();
        return route.fulfill({ status: 200, body: '' });
      });
      const page = await context.newPage();
      const errors = [], missing = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.url().startsWith(base) && /\.(css|js)(\?|$)/.test(response.url()) && response.status() >= 400) missing.push(response.url()); });
      await page.goto(base + '/blog/posts/scamper/', { waitUntil: 'networkidle' });
      await page.locator('#tront-theme-btn').click();
      await page.locator(`[name="mode"][value="${mode}"]`).check();
      await page.keyboard.press('Escape');
      const link = page.locator('.post-authors a');
      assert.equal(await link.textContent(), 'Trent Sterling');
      assert.equal(await link.getAttribute('href'), 'https://tront.xyz/');
      // Traverse real DOM order, including the fixed mobile sidebar behavior.
      await page.locator('#search-input').focus();
      let reached = false;
      for (let i = 0; i < 25; i++) {
        await page.keyboard.press('Tab');
        if (await link.evaluate(el => el === document.activeElement)) { reached = true; break; }
      }
      assert.ok(reached, 'author is reachable through sequential keyboard navigation');
      const result = await link.evaluate(el => {
        const css = getComputedStyle(el), r = el.getBoundingClientRect(), api = window.TrontThemeEditor;
        const state = JSON.parse(localStorage.getItem(api.key));
        const bound = api.buildTokens(state).bound;
        return { color: css.color, contrast: api.contrast(css.color.match(/[\d.]+/g).slice(0, 3).map(Number), bound),
          underline: css.textDecorationLine, outline: css.outlineStyle, outlineWidth: css.outlineWidth,
          focusVisible: el.matches(':focus-visible'), visible: r.x >= 0 && r.right <= innerWidth && r.y >= 0 && r.bottom <= innerHeight,
          overflow: document.documentElement.scrollWidth > innerWidth };
      });
      assert.ok(result.contrast >= 4.5); assert.match(result.underline, /underline/);
      assert.equal(result.outline, 'solid'); assert.equal(result.outlineWidth, '2px');
      assert.equal(result.focusVisible, true); assert.equal(result.visible, true); assert.equal(result.overflow, false);
      await page.screenshot({ path: path.join(out, `author-${width}-${mode}.png`) });
      // Check real link activation/history without substituting a local href.
      await page.keyboard.press('Enter'); await page.waitForURL('https://tront.xyz/');
      assert.equal(await page.title(), 'Verified profile destination');
      await page.goBack({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('.post-authors a').getAttribute('href'), 'https://tront.xyz/');
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('.post-authors a').click(); await page.waitForURL('https://tront.xyz/');
      await page.goBack({ waitUntil: 'networkidle' });
      result.navigation = 'Enter, Back, reload, pointer click, Back';
      const fixtureCases = [
        ['list', ['Guest Author', 'Offline Guest', 'Unregistered Guest'], 1],
        ['hash', ["Dana & Lee <script>alert(1)</script> \"O'Neil\" \\ café"], 1],
        ['mixed', ['Guest Author', "Dana & Lee <script>alert(1)</script> \"O'Neil\" \\ café"], 1]
      ];
      for (const [slug, labels, links] of fixtureCases) {
        await page.goto(base + `/author-fixtures/posts/${slug}/`, { waitUntil: 'load' });
        assert.deepEqual(await page.locator('.post-authors em').allTextContents(), labels);
        assert.equal(await page.locator('.post-authors a').count(), links);
        assert.equal(await page.locator('.post-authors script').count(), 0);
      }
      result.fixtures = fixtureCases.map(([slug]) => slug);
      assert.deepEqual(errors, []); assert.deepEqual(missing, []);
      results.push({ width, mode, ...result, errors, missing });
      await context.close();
    }
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ status: 'passed', results }, null, 2));
    console.log('PASS: author link keyboard traversal, visible focus, underline, 4.5:1 contrast, and no overflow on mobile/desktop in dark/light.');
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
