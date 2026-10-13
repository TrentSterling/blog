'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Run only inside the existing approved CI browser suite, against its built blog.
module.exports = async function checkNavbarFirstPaint(browser, base, out) {
  const results = [];
  const light = { version: 1, preset: 'light', mode: 'light', count: 4, angle: 135, intensity: 65, frost: 88,
    pegs: ['#75a1ce', '#c5c0eb', '#efd4b6', '#8ec8c3'].map((color, i) => ({ color, position: Math.round(i * 100 / 3) })) };
  const navigation = () => {
    const nav = document.querySelector('#magic-navbar-container');
    if (!nav) return null;
    const controls = [...nav.querySelectorAll('.nav-link')];
    if (controls.length !== 5) return null;
    return controls.map(el => {
      const r = el.getBoundingClientRect();
      return { text: el.textContent.trim(), rect: [r.x, r.y, r.width, r.height].map(n => Math.round(n * 100) / 100) };
    });
  };
  for (const route of ['/blog/', '/blog/posts/trontop/']) {
    for (const width of [390, 1440]) {
      for (const savedLight of [false, true]) {
        for (const delayed of [false, true]) {
          const name = `${route.includes('/posts/') ? 'post' : 'home'}-${width}-${savedLight ? 'light' : 'dark'}-${delayed ? 'delayed-defer' : 'cold'}`;
          const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: 'dark', serviceWorkers: 'block' });
          let release, page;
          const hold = new Promise(resolve => release = resolve);
          try {
            await context.addInitScript(({ saved, snapshot }) => {
              if (window.top !== window) return;
              if (saved) localStorage.setItem('tront-theme-editor-v1', JSON.stringify(saved));
              window.__navPaint = { frames: [], paints: [], timeOrigin: performance.timeOrigin, stop: false };
              const measure = new Function('return (' + snapshot + ')()');
              const sample = () => {
                const nav = measure();
                if (nav) {
                  const heading = document.querySelector('#main-wrapper h1');
                  const card = document.querySelector('#post-list .card');
                  window.__navPaint.frames.push({ t: performance.now(), nav, hidden: document.getElementById('tront-theme-btn').hidden,
                    canvas: getComputedStyle(document.body).backgroundImage,
                    heading: heading ? getComputedStyle(heading).backgroundImage : null,
                    card: card ? { fill: getComputedStyle(card.querySelector('.post-preview') || card).backgroundColor, blur: getComputedStyle(card).backdropFilter } : null });
                }
                if (!window.__navPaint.stop && window.__navPaint.frames.length < 600) requestAnimationFrame(sample);
              };
              requestAnimationFrame(sample);
              new PerformanceObserver(list => window.__navPaint.paints.push(...list.getEntries().map(e => ({ name: e.name, t: e.startTime })))).observe({ type: 'paint', buffered: true });
            }, { saved: savedLight ? light : null, snapshot: navigation.toString() });
            // Fresh contexts are cold loads; this route is not used for warm-cache claims.
            await context.route('**/*', async routeRequest => {
              const req = routeRequest.request(), u = new URL(req.url());
              if (delayed && u.origin === base && /\/assets\/js\/dist\/(home|post)\.min\.js$/.test(u.pathname)) await hold;
              if (u.hostname === '127.0.0.1' || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'].includes(u.hostname) || (req.resourceType() === 'image' && u.hostname === 'tront.xyz')) return routeRequest.continue();
              return routeRequest.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
            });
            page = await context.newPage();
            await page.goto(base + route, { waitUntil: 'commit' });
            let pending = null;
            if (delayed) {
              await page.waitForFunction(() => {
                const b = document.getElementById('tront-theme-btn');
                return b && b.hidden && b.hasAttribute('data-te-pending-slot') && b.getBoundingClientRect().width > 0 && performance.getEntriesByType('paint').some(e => e.name === 'first-contentful-paint');
              });
              pending = await page.evaluate(navigation);
              const safety = await page.locator('#tront-theme-btn').evaluate(button => {
                button.focus(); const css = getComputedStyle(button);
                return { hidden: button.hidden, visible: css.visibility, pointerEvents: css.pointerEvents, focused: document.activeElement === button };
              });
              assert.deepEqual(safety, { hidden: true, visible: 'hidden', pointerEvents: 'none', focused: false }, 'pending slot is not an interactive or focusable dead button');
              await page.screenshot({ path: path.join(out, `nav-first-paint-${name}-pending.png`) });
            }
            release();
            await page.waitForLoadState('domcontentloaded');
            await page.locator('#tront-theme-btn').waitFor({ state: 'visible' });
            await page.waitForTimeout(150);
            const final = await page.evaluate(navigation);
            const trace = await page.evaluate(() => { window.__navPaint.stop = true; return window.__navPaint; });
            fs.writeFileSync(path.join(out, `nav-first-paint-${name}.json`), JSON.stringify({ name, route, width, savedLight, delayed, pending, final, trace }, null, 2));
            if (pending) assert.deepEqual(final, pending, 'revealing Theme preserves every navbar label and rectangle exactly');
            assert.ok(trace.frames.length, 'first-paint navigation samples were captured');
            const fcp = trace.paints.find(p => p.name === 'first-contentful-paint')?.t;
            const painted = trace.frames.filter(f => fcp === undefined || f.t >= fcp);
            assert.ok(painted.length, 'post-FCP samples exist');
            const finalPaint = trace.frames[trace.frames.length - 1];
            for (const frame of painted) {
              assert.deepEqual(frame.nav, final, 'navbar does not move at editor reveal after first paint');
              assert.equal(frame.canvas, finalPaint.canvas, 'canvas gradient has no post-first-paint theme flash');
              if (frame.heading) assert.equal(frame.heading, finalPaint.heading, 'readable heading ramp is applied before first paint');
              if (frame.card) assert.deepEqual(frame.card, finalPaint.card, 'panel frost is applied before first paint');
            }
            assert.equal(await page.locator('#tront-theme-btn').evaluate(b => b.hasAttribute('aria-controls')), true);
            await page.locator('#tront-theme-btn').click();
            await page.locator('#tront-theme-editor').waitFor({ state: 'visible' });
            await page.keyboard.press('Escape');
            await page.screenshot({ path: path.join(out, `nav-first-paint-${name}-ready.png`) });
            results.push({ name, route, width, savedLight, delayed, pending, final, trace, status: 'passed' });
          } catch (error) {
            fs.writeFileSync(path.join(out, `nav-first-paint-${name}-failure.json`), JSON.stringify({ name, error: error.message }, null, 2));
            if (page) await page.screenshot({ path: path.join(out, `nav-first-paint-${name}-failure.png`) }).catch(() => {});
            throw error;
          } finally { release(); await context.close(); }
        }
      }
    }
  }
  for (const fallback of ['no-js', 'unsupported-dialog']) {
    const context = await browser.newContext({ javaScriptEnabled: fallback !== 'no-js', viewport: { width: 390, height: 844 } });
    try {
      if (fallback === 'unsupported-dialog') await context.addInitScript(() => { HTMLDialogElement.prototype.showModal = undefined; });
      const page = await context.newPage();
      await page.goto(base + '/blog/', { waitUntil: 'load' });
      assert.equal(await page.locator('#tront-theme-btn').isVisible(), false);
      assert.equal(await page.locator('#tront-theme-btn').getAttribute('data-te-pending-slot'), null);
      assert.equal(await page.locator('#tront-theme-btn').evaluate(b => b.getBoundingClientRect().width), 0, 'unsupported/no-JS fallback intentionally retains the four-link layout');
      assert.equal(await page.locator('#magic-navbar-container a:visible').count(), 4);
      await page.screenshot({ path: path.join(out, `nav-first-paint-${fallback}.png`) });
      results.push({ name: fallback, status: 'passed', themeControlHidden: true, reservedSlot: false, workingLinks: 4 });
    } finally { await context.close(); }
  }
  fs.writeFileSync(path.join(out, 'blog-first-paint-report.json'), JSON.stringify({ status: 'passed', cases: results }, null, 2));
  console.log('PASS: 16 cold/delayed navbar first-paint checks and two honest fallback checks.');
};

