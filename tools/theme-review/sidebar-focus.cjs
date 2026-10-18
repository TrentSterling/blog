'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Run against the real built pages and their unmodified Chirpy toggle handlers.
module.exports = async function checkSidebarFocus(browser, base, out, configure) {
  const results = [];
  const state = page => page.evaluate(() => {
    const sidebar = document.getElementById('sidebar'), trigger = document.getElementById('sidebar-trigger');
    const active = document.activeElement, rect = active.getBoundingClientRect();
    return { inert: sidebar.inert, open: document.body.hasAttribute('sidebar-display'),
      expanded: trigger.getAttribute('aria-expanded'), controls: trigger.getAttribute('aria-controls'),
      maskHidden: document.getElementById('mask').classList.contains('d-none'),
      focus: active.id || active.getAttribute('href'), inSidebar: sidebar.contains(active),
      x: rect.x, right: rect.right, width: innerWidth };
  });
  const closed = async page => {
    await page.waitForFunction(() => document.getElementById('sidebar').inert && !document.body.hasAttribute('sidebar-display'));
    const actual = await state(page);
    assert.equal(actual.expanded, 'false'); assert.equal(actual.controls, 'sidebar');
    assert.equal(actual.maskHidden, true); assert.equal(actual.inSidebar, false);
  };
  const open = async page => {
    await page.locator('#sidebar-trigger').focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.body.hasAttribute('sidebar-display') && !document.getElementById('sidebar').inert);
    assert.equal((await state(page)).focus, 'avatar', 'keyboard open enters sidebar before the trigger in DOM order');
    assert.equal((await state(page)).expanded, 'true');
    await page.waitForFunction(() => document.getElementById('sidebar').getBoundingClientRect().left >= 0); // Existing slide animation.
  };
  for (const route of ['/blog/', '/blog/posts/scamper/', '/blog/tags/']) {
    for (const motion of ['no-preference', 'reduce']) {
      const name = `${route.replace(/[^a-z0-9]+/gi, '-')}-${motion}`;
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: motion, serviceWorkers: 'block' });
      const errors = [], missing = [], evidence = { route, motion, status: 'running', checks: [] };
      if (configure) await configure(context);
      else await context.route('**/*', request => {
        const req = request.request(), url = new URL(req.url());
        if (url.origin === new URL(base).origin || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'].includes(url.hostname) || (req.resourceType() === 'image' && url.hostname === 'tront.xyz')) return request.continue();
        return request.fulfill({ status: 200, body: '' });
      });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.url().startsWith(base) && /\.(js|css)(\?|$)/.test(response.url()) && response.status() >= 400) missing.push(response.url()); });
      try {
        await page.goto(base + route, { waitUntil: 'networkidle' });
        await closed(page);
        // The bug's original path: theme button, shared nav, then hidden avatar.
        await page.locator('#tront-theme-btn').focus();
        evidence.initialTabs = [];
        for (let i = 0; i < 9; i++) {
          const s = await state(page); evidence.initialTabs.push(s);
          assert.equal(s.inSidebar, false, 'closed sidebar must never receive initial Tab focus');
          assert.ok(s.x >= 0 && s.right <= s.width + 1, 'initial keyboard focus is onscreen');
          await page.keyboard.press('Tab');
        }
        assert.equal(evidence.initialTabs[5].focus, 'sidebar-trigger');
        assert.equal(evidence.initialTabs[6].focus, 'search-trigger');
        await page.locator('#sidebar-trigger').focus(); await page.keyboard.press('Shift+Tab');
        assert.equal((await state(page)).focus, '/', 'reverse Tab also skips the closed sidebar');
        await page.locator('#avatar').evaluate(el => el.focus());
        assert.equal((await state(page)).inSidebar, false, 'inert blocks programmatic focus as well');
        await page.locator('#sidebar-trigger').focus();
        await page.screenshot({ path: path.join(out, `sidebar-${name}-closed.png`) });
        evidence.checks.push('initial forward/reverse Tab traversal and inert programmatic-focus exclusion');

        await open(page);
        await page.screenshot({ path: path.join(out, `sidebar-${name}-open.png`) });
        const links = page.locator('#sidebar a[href]');
        for (let i = 0; i < await links.count(); i++) {
          assert.equal(await links.nth(i).evaluate(el => el === document.activeElement), true, 'every sidebar link is keyboard reachable in original order');
          await page.waitForFunction(() => document.activeElement.getBoundingClientRect().left >= 0);
          const s = await state(page); assert.ok(s.x >= 0 && s.right <= s.width + 1, 'open sidebar focus is visible');
          await page.keyboard.press('Tab');
        }
        assert.equal((await state(page)).focus, 'sidebar-trigger');
        await page.keyboard.press('Enter'); await closed(page);
        assert.equal((await state(page)).focus, 'sidebar-trigger', 'Menu toggle close returns focus');
        evidence.checks.push('all open-sidebar links in original DOM order; trigger close');

        for (let i = 0; i < 3; i++) {
          await open(page); await page.keyboard.press('Tab');
          if (i === 1) await page.locator('#mask').click({ position: { x: 350, y: 400 } });
          else await page.keyboard.press('Escape');
          await closed(page);
          assert.equal((await state(page)).focus, 'sidebar-trigger', 'mask and Escape restore Menu focus every time');
        }
        await page.locator('#search-trigger').focus(); await page.keyboard.press('Escape');
        assert.equal((await state(page)).focus, 'search-trigger', 'Escape on a closed sidebar does not steal focus');
        evidence.checks.push('three repeat cycles; mask/Escape close and focus return; closed Escape no-op');

        // Pointer focus differs by browser: Safari does not focus clicked buttons.
        await page.locator('#tront-theme-btn').focus(); await page.locator('#sidebar-trigger').click();
        await page.waitForFunction(() => document.body.hasAttribute('sidebar-display') && !document.getElementById('sidebar').inert);
        evidence.pointerOpenFocus = (await state(page)).focus;
        assert.ok(['tront-theme-btn', 'avatar'].includes(evidence.pointerOpenFocus));
        await page.keyboard.press('Escape'); await closed(page);
        assert.equal((await state(page)).focus, 'sidebar-trigger');
        evidence.checks.push('pointer opening honors native focus behavior; Escape returns Menu');

        // An existing modal owns Escape. Dismissing it must not close the sidebar.
        await open(page); await page.locator('#tront-theme-btn').click(); await page.keyboard.press('Escape');
        await page.waitForFunction(() => !document.querySelector('dialog[open]'));
        assert.equal((await state(page)).open, true);
        assert.equal((await state(page)).focus, 'tront-theme-btn');
        await page.keyboard.press('Escape'); await closed(page);
        evidence.checks.push('theme-dialog Escape priority');

        await page.setViewportSize({ width: 849, height: 844 }); await closed(page);
        await page.locator('#tront-theme-btn').focus();
        await page.setViewportSize({ width: 850, height: 844 });
        await page.waitForFunction(() => !document.getElementById('sidebar').inert);
        assert.equal((await state(page)).focus, 'tront-theme-btn', 'desktop expansion preserves unrelated focus');
        await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
        assert.equal((await state(page)).focus, 'avatar', 'desktop original tab order restored');
        await page.keyboard.press('Escape'); assert.equal((await state(page)).focus, 'avatar');
        await page.setViewportSize({ width: 849, height: 844 }); await closed(page);
        assert.equal((await state(page)).focus, 'sidebar-trigger', 'shrinking rescues focus from the newly hidden sidebar');
        await page.setViewportSize({ width: 850, height: 844 });
        await page.waitForFunction(() => document.activeElement.id === 'avatar');
        assert.equal((await state(page)).inert, false, 'expanding rescues focus from the now-hidden mobile trigger');
        evidence.checks.push('849/850 closed boundary; desktop tab order; focused-sidebar and focused-trigger resize');

        await page.setViewportSize({ width: 849, height: 844 }); await closed(page); await open(page);
        await page.keyboard.press('Tab');
        const focusedLink = await page.evaluate(() => document.activeElement.outerHTML);
        await page.setViewportSize({ width: 850, height: 844 });
        await page.waitForFunction(() => !document.body.hasAttribute('sidebar-display'));
        assert.equal(await page.evaluate(() => document.activeElement.outerHTML), focusedLink, 'expanding an open sidebar keeps focused link');
        const desktop = await state(page);
        assert.equal(desktop.inert, false); assert.equal(desktop.maskHidden, true);
        await page.setViewportSize({ width: 849, height: 844 }); await closed(page);
        assert.equal((await state(page)).focus, 'sidebar-trigger');
        await open(page); await page.keyboard.press('Escape'); await closed(page);
        evidence.checks.push('open 849/850 boundary clears mobile mask without focus jump or stale Chirpy toggle');

        for (const width of [320, 390, 768, 849, 850, 1440]) {
          await page.locator('#tront-theme-btn').focus();
          await page.setViewportSize({ width, height: 844 });
          await page.waitForFunction(mobile => document.getElementById('sidebar').inert === mobile, width < 850);
          assert.equal((await state(page)).focus, 'tront-theme-btn', 'resize does not steal unrelated focus');
          assert.equal((await state(page)).open, false);
        }
        await page.locator('#avatar').focus();
        await page.screenshot({ path: path.join(out, `sidebar-${name}-desktop.png`) });
        evidence.checks.push('320/390/768/849/850/1440 viewport state; desktop visible focus');
        assert.deepEqual(errors, []); assert.deepEqual(missing, []);
        evidence.errors = errors; evidence.missing = missing; evidence.status = 'passed'; results.push(evidence);
      } catch (error) {
        evidence.status = 'failed'; evidence.error = error.message; evidence.state = await state(page).catch(() => null);
        await page.screenshot({ path: path.join(out, `sidebar-${name}-failure.png`) }).catch(() => {});
        throw error;
      } finally {
        fs.writeFileSync(path.join(out, `sidebar-${name}.json`), JSON.stringify(evidence, null, 2));
        await context.close();
      }
    }
  }
  fs.writeFileSync(path.join(out, 'blog-sidebar-focus-report.json'), JSON.stringify({ status: 'passed', cases: results }, null, 2));
  console.log('PASS: sidebar focus on home/post/tags in normal/reduced motion, repeated close, modal Escape, and exact desktop/mobile boundary.');
};

if (require.main === module) {
  const http = require('node:http');
  const root = path.resolve(process.env.BLOG_SITE_ROOT || '_site');
  const out = path.resolve(process.env.BLOG_SCREENSHOTS || '.local/sidebar-review');
  fs.mkdirSync(out, { recursive: true });
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
  const server = http.createServer((request, response) => {
    try {
      let file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
      if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403); return response.end(); }
      if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      const body = fs.readFileSync(file);
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); response.end(body);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  (async () => {
    let browser;
    try {
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      browser = await require('playwright').chromium.launch({ headless: true, executablePath: process.env.THEME_BROWSER_EXECUTABLE || undefined });
      await module.exports(browser, `http://127.0.0.1:${server.address().port}`, out);
    } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
