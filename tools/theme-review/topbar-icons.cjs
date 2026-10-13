'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// This runs only inside the approved CI suite, with the released blog as baseline.
module.exports = async function checkPageNativeTopbarIcons(browser, base, baselineBase, out) {
  const results = [];
  const light = { version: 1, preset: 'light', mode: 'light', count: 4, angle: 135, intensity: 65, frost: 88,
    pegs: ['#75a1ce', '#c5c0eb', '#efd4b6', '#8ec8c3'].map((color, i) => ({ color, position: Math.round(i * 100 / 3) })) };
  const geometry = page => page.locator('#sidebar-trigger, #search-trigger').evaluateAll(buttons => buttons.map(button => {
    const r = button.getBoundingClientRect(), css = getComputedStyle(button), icon = button.firstElementChild;
    const ir = icon.getBoundingClientRect();
    return { id: button.id, label: button.getAttribute('aria-label'), rect: [r.x, r.y, r.width, r.height],
      font: css.font, padding: css.padding, icon: { tag: icon.tagName.toLowerCase(), rect: [ir.width, ir.height],
        family: getComputedStyle(icon).fontFamily, pseudo: getComputedStyle(icon, '::before').content } };
  }));
  for (const width of [320, 390, 768]) for (const preset of ['dark', 'light']) {
    const name = `${width}-${preset}`, contexts = [], pages = [];
    const evidence = { name, width, preset, status: 'running', before: null, after: null };
    try {
      for (const [kind, origin] of [['before', baselineBase], ['after', base]]) {
        const context = await browser.newContext({ viewport: { width, height: 844 }, serviceWorkers: 'block' });
        contexts.push(context);
        const blocked = [], errors = [], missing = [];
        await context.addInitScript(saved => {
          if (saved) localStorage.setItem('tront-theme-editor-v1', JSON.stringify(saved));
          window.__topbarPaint = { frames: [], paints: [], stop: false };
          new PerformanceObserver(list => window.__topbarPaint.paints.push(...list.getEntries().map(e => ({ name: e.name, t: e.startTime })))).observe({ type: 'paint', buffered: true });
          const sample = () => {
            const buttons = [...document.querySelectorAll('#sidebar-trigger, #search-trigger')];
            if (buttons.length === 2) window.__topbarPaint.frames.push({ t: performance.now(), icons: buttons.map(button => {
              const icon = button.firstElementChild, r = icon.getBoundingClientRect(), css = getComputedStyle(icon);
              return { id: button.id, tag: icon.tagName.toLowerCase(), width: r.width, height: r.height, visible: css.visibility, opacity: css.opacity, stroke: css.stroke };
            }) });
            if (!window.__topbarPaint.stop && window.__topbarPaint.frames.length < 300) requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
        }, preset === 'light' ? light : null);
        await context.route('**/*', route => {
          const req = route.request(), u = new URL(req.url());
          if (req.resourceType() === 'font' && /font-?awesome|fa-(solid|regular|brands)/i.test(u.href)) {
            blocked.push(u.href); return route.abort('failed');
          }
          if (u.hostname === '127.0.0.1' || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'].includes(u.hostname) || (req.resourceType() === 'image' && u.hostname === 'tront.xyz')) return route.continue();
          return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
        });
        const page = await context.newPage(); pages.push(page);
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => { if (response.url().startsWith(origin) && /\.(css|js)(\?|$)/.test(response.url()) && response.status() >= 400) missing.push(response.url()); });
        await page.goto(origin + '/blog/', { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator('html').getAttribute('data-te-mode'), preset);
        const buttons = await geometry(page);
        const fonts = await page.evaluate(() => [...document.fonts].filter(f => /Font Awesome/i.test(f.family)).map(f => ({ family: f.family, weight: f.weight, status: f.status })));
        const paint = await page.evaluate(() => { window.__topbarPaint.stop = true; return window.__topbarPaint; });
        evidence[kind] = { buttons, fonts, blocked, errors, missing, paint };
        assert.ok(blocked.length > 0, 'Font Awesome font requests were actually blocked');
        assert.ok(fonts.some(f => f.weight === '900' && f.status === 'error'), 'solid Font Awesome font failed as the experiment requires');
        assert.equal(fonts.some(f => f.status === 'loaded'), false, 'no cached Font Awesome face bypassed the block');
        assert.deepEqual(errors, []); assert.deepEqual(missing, []);
        await page.screenshot({ path: path.join(out, `topbar-icons-${name}-${kind}.png`) });
        await page.locator('#topbar-wrapper').screenshot({ path: path.join(out, `topbar-icons-${name}-${kind}-controls.png`) });
      }
      const page = pages[1];
      const outer = items => items.map(({ id, rect, font, padding }) => ({ id, rect, font, padding }));
      assert.deepEqual(outer(evidence.after.buttons), outer(evidence.before.buttons), 'outer Menu/Search button rectangles and styles remain exactly unchanged');
      assert.deepEqual(evidence.before.buttons.map(b => b.icon.tag), ['i', 'i'], 'baseline retains the original font glyphs');
      const fcp = evidence.after.paint.paints.find(p => p.name === 'first-contentful-paint')?.t;
      assert.ok(Number.isFinite(fcp), 'candidate has a real first contentful paint');
      const painted = evidence.after.paint.frames.filter(f => f.t >= fcp);
      assert.ok(painted.length, 'candidate has post-FCP icon samples');
      for (const frame of painted) for (const icon of frame.icons) {
        assert.equal(icon.tag, 'svg'); assert.ok(icon.width > 0 && icon.height > 0);
        assert.equal(icon.visible, 'visible'); assert.equal(icon.opacity, '1'); assert.notEqual(icon.stroke, 'none');
      }
      for (const [name, id] of [['Menu', 'sidebar-trigger'], ['Search', 'search-trigger']]) {
        const button = page.getByRole('button', { name, exact: true });
        assert.equal(await button.getAttribute('id'), id); assert.equal(await button.isVisible(), true);
        const svg = button.locator('svg');
        assert.equal(await svg.isVisible(), true); assert.equal(await svg.getAttribute('aria-hidden'), 'true');
        assert.equal(await svg.getAttribute('focusable'), 'false');
      }
      await page.getByRole('button', { name: 'Menu', exact: true }).focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('body').getAttribute('sidebar-display'), '');
      await page.locator('#mask').click(); assert.equal(await page.locator('body').getAttribute('sidebar-display'), null);
      const trigger = page.getByRole('button', { name: 'Search', exact: true }), input = page.locator('#search-input');
      for (const dismiss of ['Cancel', 'Escape']) {
        await trigger.focus(); await page.keyboard.press('Enter');
        assert.equal(await input.evaluate(el => el === document.activeElement), true);
        assert.equal(await input.inputValue(), '', 'opening and reopening have no stale query');
        await input.pressSequentially('Trontop'); await page.locator('#search-results article').first().waitFor();
        assert.match(await page.locator('#search-results').innerText(), /Trontop/i);
        if (dismiss === 'Cancel') {
          await page.screenshot({ path: path.join(out, `topbar-icons-${name}-search.png`) });
          await page.keyboard.press('Tab'); assert.equal(await page.locator('#search-cancel').evaluate(el => el === document.activeElement), true);
          await page.keyboard.press('Enter');
        } else await input.press('Escape');
        assert.equal(await input.inputValue(), ''); assert.equal(await page.locator('#search-result-wrapper').isVisible(), false);
        assert.equal(await trigger.evaluate(el => el === document.activeElement), true, 'dismissal restores Search focus');
      }
      assert.deepEqual(evidence.after.errors, []); assert.deepEqual(evidence.after.missing, []);
      evidence.status = 'passed'; evidence.keyboard = { menu: true, search: true, cancel: true, escape: true };
      results.push(evidence);
    } catch (error) {
      evidence.status = 'failed'; evidence.error = error.message;
      for (const [i, page] of pages.entries()) await page.screenshot({ path: path.join(out, `topbar-icons-${name}-failure-${i}.png`) }).catch(() => {});
      throw error;
    } finally {
      fs.writeFileSync(path.join(out, `topbar-icons-${name}.json`), JSON.stringify(evidence, null, 2));
      await Promise.all(contexts.map(context => context.close()));
    }
  }
  fs.writeFileSync(path.join(out, 'blog-topbar-icons-report.json'), JSON.stringify({ status: 'passed', experiment: 'Font Awesome font requests blocked in both released baseline and candidate', cases: results }, null, 2));
  console.log('PASS: six before/after blocked-font Menu/Search checks, exact button rectangles, accessible names and keyboard flows.');
};
