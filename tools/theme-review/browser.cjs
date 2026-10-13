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
    const body = fs.readFileSync(file); // Missing directory indexes must return 404, not crash the server.
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
const server = createServer(root);
const baselineServer = createServer(path.resolve('_baseline'));
const contrastFailures = [];
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
      return ratio >= 4.5 ? [] : [{ tag: el.tagName, class: el.className, text: el.textContent.trim().slice(0, 55), color: css.color, ratio, transition: css.transitionProperty, mode: document.documentElement.getAttribute('data-te-mode'), accent: getComputedStyle(document.documentElement).getPropertyValue('--te-accent') }];
    });
  });
  if (failed.length) contrastFailures.push({ url: page.url(), failures: failed });
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
      if ((route.request().resourceType() === 'image' && u.hostname === 'tront.xyz') || u.hostname === '127.0.0.1' || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'].includes(u.hostname)) return route.continue();
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    });
    const baselineContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await baselineContext.route('**/*', route => {
      const u = new URL(route.request().url());
      return (route.request().resourceType() === 'image' && u.hostname === 'tront.xyz') || u.hostname === '127.0.0.1' || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'].includes(u.hostname) ? route.continue() : route.fulfill({ status: 200, body: '' });
    });
    const baseline = await baselineContext.newPage();
    baseline.on('pageerror', error => errors.push('baseline: ' + error.message));
    baseline.on('response', response => { if (response.url().startsWith(baselineUrl) && /\.(css|js)(\?|$)/.test(response.url()) && response.status() >= 400) missing.push(response.url()); });
    await baseline.goto(baselineUrl + '/blog/', { waitUntil: 'networkidle' });
    await baseline.locator('#tront-theme-btn').click(); await baseline.selectOption('[name="preset"]', 'purple'); await baseline.keyboard.press('Escape');
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
      // Resize triggers Chirpy's existing sidebar transition; compare settled layouts.
      await Promise.all([page.waitForTimeout(500), baseline.waitForTimeout(500)]);
      const before = await composition(baseline), after = await composition(page);
      assert.deepEqual(after, before, 'Chirpy reading canvas, sidebar/card geometry, gradient headings and glass materials remain page-specific');
      await baseline.screenshot({ path: path.join(out, `blog-baseline-${width}.png`) });
      await page.screenshot({ path: path.join(out, `blog-themed-${width}.png`) });
      comparisons.push({ width, before, after });
    }
    await baseline.setViewportSize({ width: 1440, height: 1000 });
    for (const preset of ['dark', 'light']) {
      await baseline.locator('#tront-theme-btn').click(); await baseline.selectOption('[name="preset"]', preset); await baseline.keyboard.press('Escape');
      await baseline.locator('#topbar-wrapper').screenshot({ path: path.join(out, `search-before-${preset}.png`) });
    }
    await baselineContext.close();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(url + '/blog/', { waitUntil: 'networkidle' });
    await page.evaluate(() => { localStorage.setItem('tront-theme', 'tront-purple'); localStorage.setItem('tront-previews-paused', 'true'); });
    const firstPost = await page.locator('#post-list .post-preview').first().getAttribute('href');
    assert.ok(firstPost.startsWith('/blog/posts/'));
    const tabRoutes = await page.locator('#sidebar .nav-link').evaluateAll(links => links.map(a => a.getAttribute('href')).filter(h => h && h.startsWith('/blog/') && h !== '/blog/'));
    const paginationRoute = await page.locator('.pagination .page-item:not(.disabled) a[href^="/blog/"]:not([href="/blog/"])').first().getAttribute('href');
    assert.ok(paginationRoute?.startsWith('/blog/'), 'exercise a real pagination route, excluding disabled # arrows');
    const taxonomyRoutes = ['tags', 'categories'].map(kind => {
      const dir = fs.readdirSync(path.join(root, 'blog', kind), { withFileTypes: true }).find(e => e.isDirectory());
      assert.ok(dir, 'generated ' + kind + ' route exists'); return '/blog/' + kind + '/' + dir.name + '/';
    });
    let codePost;
    const textCoverage = [];
    for (const entry of fs.readdirSync(path.join(root, 'blog/posts'), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = path.join(root, 'blog/posts', entry.name, 'index.html');
      if (fs.existsSync(file) && /class="highlight"/.test(fs.readFileSync(file, 'utf8')) && /<code[^>]*class="[^"]*highlighter-rouge/.test(fs.readFileSync(file, 'utf8'))) { codePost = '/blog/posts/' + entry.name + '/'; break; }
    }
    assert.ok(codePost, 'a built post with code is available for contrast coverage');
    const routes = [...new Set(['/blog/', firstPost, codePost, '/blog/404.html', paginationRoute, ...tabRoutes, ...taxonomyRoutes])];
    for (const route of routes) {
      const response = await page.goto(url + route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, 'built route loads: ' + route);
      assert.equal(await page.locator('html').getAttribute('data-tront-theme-surface'), 'blog');
      assert.equal(await page.locator('#mode-toggle').count(), 0);
      textCoverage.push({ route, inlineCode: await page.locator('.content code:not(.highlight code)').count(), codeBlocks: await page.locator('.highlight').count() });
      assert.deepEqual(await page.locator('#magic-navbar-container a').evaluateAll(links => links.map(a => a.getAttribute('href'))), ['/discord/', '/blog/', '/games/', '/']);
      await page.locator('#tront-theme-btn').click();
      assert.equal(await page.locator('[data-peg-row]:visible').count(), 4);
      assert.equal(await page.locator('.te-dialog details, .te-dialog [name="count"]').count(), 0);
      for (const preset of ['dark', 'cyan', 'purple', 'ember', 'moss', 'light']) {
        await page.selectOption('[name="preset"]', preset); await contrast(page);
        const mode = preset === 'light' ? 'light' : 'dark';
        await page.waitForFunction(mode => document.documentElement.getAttribute('data-mode') === mode && sessionStorage.getItem('mode') === mode, mode);
        await page.locator('[data-action="close"]').click(); await contrast(page);
        const proseLink = page.locator('.content a:not(.img-link):not(.popup):not(.anchor):visible').first();
        if (await proseLink.count()) { await proseLink.hover(); await contrast(page); await page.mouse.move(0, 0); }
        await page.locator('#tront-theme-btn').click();
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
      if (route !== '/blog/' && route !== firstPost && route !== codePost) await page.screenshot({ path: path.join(out, 'child-' + route.replace(/[^a-z0-9]+/gi, '-') + '-desktop-dark.png') });
      const saved = await page.evaluate(() => localStorage.getItem('tront-theme-editor-v1'));
      await page.reload(); assert.equal(await page.evaluate(() => localStorage.getItem('tront-theme-editor-v1')), saved);
      for (const width of [320, 360, 390, 768]) {
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
    const searchCoverage = [];
    const input = page.locator('#search-input');
    const surface = async (preset, width) => {
      const state = await page.locator('#search').evaluate(wrapper => {
        const input = wrapper.querySelector('input'), css = getComputedStyle(input), outer = getComputedStyle(wrapper);
        const r = wrapper.getBoundingClientRect(), i = input.getBoundingClientRect();
        const api = window.TrontThemeEditor;
        const context = document.createElement('canvas').getContext('2d');
        const rgb = color => {
          context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1);
          return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
        };
        const backgrounds = [];
        for (let el = wrapper; el; el = el.parentElement) backgrounds.unshift(getComputedStyle(el).backgroundColor);
        context.clearRect(0, 0, 1, 1); context.fillStyle = '#fff'; context.fillRect(0, 0, 1, 1);
        for (const color of backgrounds) { context.fillStyle = color; context.fillRect(0, 0, 1, 1); }
        const ground = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
        return {
          textColor: css.color, placeholderColor: getComputedStyle(input, '::placeholder').color, backgrounds, ground,
          background: css.backgroundColor, image: css.backgroundImage, border: css.borderTopWidth,
          outerRadius: parseFloat(outer.borderTopLeftRadius), outerOutline: outer.outlineWidth, innerOutline: css.outlineWidth,
          inputFits: i.left >= r.left && i.right <= r.right && i.top >= r.top && i.bottom <= r.bottom,
          contrast: api.contrast(rgb(css.color), ground),
          placeholderContrast: api.contrast(rgb(getComputedStyle(input, '::placeholder').color), ground),
          overflow: document.documentElement.scrollWidth > innerWidth,
          focused: document.activeElement === input
        };
      });
      searchCoverage.push({ preset, width, ...state });
      fs.writeFileSync(path.join(out, 'blog-search-report.json'), JSON.stringify(searchCoverage, null, 2));
      assert.equal(state.background, 'rgba(0, 0, 0, 0)', 'input stays transparent inside the rounded search surface');
      assert.equal(state.image, 'none'); assert.equal(state.border, '0px');
      assert.ok(state.outerRadius > 0 && state.inputFits, 'search stays rounded and input fits');
      assert.ok(state.contrast >= 4.5 && state.placeholderContrast >= 4.5, 'typed text and placeholder stay readable: ' + JSON.stringify(state));
      assert.equal(state.overflow, false);
      if (state.focused) {
        assert.equal(state.outerOutline, '2px', 'focus is visible around the whole pill');
        assert.equal(state.innerOutline, '0px', 'no inner rectangular focus outline');
      }
    };
    for (const preset of ['dark', 'cyan', 'purple', 'ember', 'moss', 'light']) {
      await page.locator('#tront-theme-btn').click(); await page.selectOption('[name="preset"]', preset); await page.keyboard.press('Escape');
      await surface(preset, 1440);
      if (['dark', 'light'].includes(preset)) await page.locator('#topbar-wrapper').screenshot({ path: path.join(out, `search-after-${preset}.png`) });
      await input.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
      assert.equal(await input.evaluate(el => el === document.activeElement), true, 'keyboard reaches search');
      await surface(preset, 1440);
      if (['dark', 'light'].includes(preset)) await page.locator('#topbar-wrapper').screenshot({ path: path.join(out, `search-focus-${preset}.png`) });
    }
    await input.pressSequentially('Trontop');
    await page.locator('#search-results article').first().waitFor();
    assert.match(await page.locator('#search-results').innerText(), /Trontop/i);
    await page.screenshot({ path: path.join(out, 'search-desktop-results.png') });
    const result = page.locator('#search-results article h2 a').first();
    const resultHref = await result.getAttribute('href');
    const resultPath = new URL(resultHref, page.url()).pathname;
    assert.ok(resultPath.startsWith('/blog/posts/'));
    assert.equal(new URL(resultHref, page.url()).origin, url, 'result retains its real same-origin URL');
    await result.focus(); await page.keyboard.press('Enter'); await page.waitForURL('**' + resultPath);
    assert.equal(await page.locator('#search-result-wrapper').isVisible(), false, 'result navigation closes search');
    await page.goBack({ waitUntil: 'networkidle' });
    await input.fill(''); await input.pressSequentially('zzzz-no-matching-blog-post-zzzz');
    await page.locator('#search-results > p').waitFor();
    assert.equal(await page.locator('#search-results article').count(), 0, 'unmatched query shows the empty state');
    await input.press('ControlOrMeta+A'); await input.press('Backspace');
    assert.equal(await page.locator('#search-result-wrapper').isVisible(), false, 'clearing desktop search restores content');
    await input.pressSequentially('Trontop'); await input.press('Escape');
    assert.equal(await input.inputValue(), '');
    assert.equal(await page.locator('#search-result-wrapper').isVisible(), false, 'Escape clears desktop search');
    assert.equal(await input.evaluate(el => el === document.activeElement), true, 'desktop Escape keeps typing focus');
    for (const width of [320, 360, 390, 768]) {
      await page.setViewportSize({ width, height: 844 }); await page.goto(url + '/blog/', { waitUntil: 'networkidle' });
      for (const preset of ['dark', 'light']) {
        await page.locator('#tront-theme-btn').click(); await page.selectOption('[name="preset"]', preset); await page.keyboard.press('Escape');
        for (const dismiss of ['Cancel', 'Escape', 'ResultEscape']) {
          const trigger = page.locator('#search-trigger');
          await trigger.focus(); await page.keyboard.press('Enter');
          assert.equal(await input.evaluate(el => el === document.activeElement), true, 'mobile opening focuses input');
          assert.equal(await input.inputValue(), '', 'opening and reopening start without a stale query');
          await surface(preset, width);
          await input.pressSequentially('Trontop'); await page.locator('#search-results article').first().waitFor();
          if (width === 390 && dismiss === 'Cancel') await page.screenshot({ path: path.join(out, `search-mobile-results-${preset}.png`) });
          if (dismiss === 'Cancel') {
            await page.keyboard.press('Tab');
            assert.equal(await page.locator('#search-cancel').evaluate(el => el === document.activeElement), true);
            await page.keyboard.press('Enter');
          } else if (dismiss === 'ResultEscape') {
            await page.locator('#search-results article h2 a').first().focus();
            await page.keyboard.press('Escape');
          } else await input.press('Escape');
          assert.equal(await page.locator('#search-result-wrapper').isVisible(), false, `${dismiss} restores mobile content`);
          assert.equal(await input.inputValue(), '');
          assert.equal(await trigger.evaluate(el => el === document.activeElement), true, `${dismiss} restores trigger focus`);
          assert.equal(await page.locator('#sidebar-trigger').isVisible(), true);
          assert.equal(await page.locator('#post-list').isVisible(), true);
        }
      }
    }
    await page.locator('#post-list .post-preview').first().click();
    await page.waitForURL('**' + firstPost);
    assert.equal(await page.locator('#search-result-wrapper').isVisible(), false, 'post navigation starts with search closed');
    assert.equal(await input.inputValue(), '');
    await page.goto(url + '/blog/');
    await page.locator('#sidebar-trigger').click();
    assert.equal(await page.locator('body').getAttribute('sidebar-display'), '');
    await page.locator('#mask').click();
    assert.equal(await page.locator('body').getAttribute('sidebar-display'), null);
    assert.deepEqual(await page.evaluate(() => [localStorage.getItem('tront-theme'), localStorage.getItem('tront-previews-paused')]), ['tront-purple', 'true']);
    assert.ok(textCoverage.some(x => x.inlineCode > 0 && x.codeBlocks > 0), 'rendered contrast audit includes actual inline code and syntax blocks');
    fs.writeFileSync(path.join(out, 'blog-contrast-report.json'), JSON.stringify(contrastFailures, null, 2));
    assert.deepEqual(contrastFailures, [], 'rendered blog text stays readable across every route and preset');
    assert.deepEqual(missing, [], 'same-origin theme and blog scripts/styles load');
    assert.deepEqual(errors, [], 'no page JavaScript errors');
    fs.writeFileSync(path.join(out, 'blog-browser-report.json'), JSON.stringify({ status: 'passed', compositionComparisons: comparisons, textCoverage, routes, presets: 6, widths: [320, 360, 390, 768, 1440], search: 'passed', searchCoverage, sidebar: 'passed', errors, missing }, null, 2));
    console.log('PASS: blog build, shared navbar/editor, presets, post/code contrast, keyboard, mobile, persistence, search and sidebar.');
  } catch (error) {
    if (page) { fs.writeFileSync(path.join(out, 'blog-browser-failure.json'), JSON.stringify({ error: error.message, url: page.url() }, null, 2)); await page.screenshot({ path: path.join(out, 'blog-browser-failure.png') }); }
    throw error;
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); await new Promise(resolve => baselineServer.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
