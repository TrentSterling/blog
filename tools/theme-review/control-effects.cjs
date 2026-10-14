'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PNG } = require('pngjs');

/* Rendered integration checks, deliberately outside the editor and shared navbar.
 * State and computed CSS are corroboration; every control must change real page
 * pixels. The old adapter is measured separately so its alpha-only frost effect
 * is not confused with the repaired variable blur and page wash. */
module.exports = async function checkControlEffects(browser, base, baselineBase, out) {
  const dir = path.join(out, 'controls');
  fs.mkdirSync(dir, { recursive: true });
  const report = { status: 'running', viewportHeight: 1000,
    methodology: 'Real editor input/change/click events. Screenshots exclude the editor and shared navbar. Changed pixels have a maximum RGB channel delta of at least 2/255. Each change also preserves content/layout and passes rendered-ink contrast checks.',
    thresholds: { changedChannelDelta: 2, minimumChangedPixels: 100, minimumChangedFraction: 0.002, restorationChangedFraction: 0.0005, restorationMeanChannelDelta: 0.01 },
    restorationNoisePolicy: 'Restoration requires identical saved state and computed paint, at most 0.05% changed pixels, and mean channel delta <=0.01/255. Fresh per-control reference images and no-change modal calibration separate sparse browser raster noise from theme differences. Changed controls still require >=0.2% changed pixels.',
    baseline: [], calibration: [], cases: [], persistence: [], preview: [] };
  const reportFile = path.join(out, 'blog-control-effects-report.json');
  const writeReport = () => fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  const key = 'tront-theme-editor-v1';
  const colors = ['#ff3500', '#05df69', '#125cff', '#ed08e7'];
  const replacements = ['#00aaff', '#ffbf00', '#ff2050', '#10edaf'];
  const previewPairs = [];
  let latestPair = null;
  const liveContexts = new Set();
  function diff(aBuffer, bBuffer) {
    const a = PNG.sync.read(aBuffer), b = PNG.sync.read(bBuffer);
    assert.equal(a.width, b.width, 'pixel comparison widths match');
    assert.equal(a.height, b.height, 'pixel comparison heights match');
    let changed = 0, total = 0, maximum = 0, minX = a.width, minY = a.height, maxX = -1, maxY = -1;
    for (let i = 0; i < a.data.length; i += 4) {
      let delta = 0;
      for (let c = 0; c < 3; c++) {
        const d = Math.abs(a.data[i + c] - b.data[i + c]);
        total += d; maximum = Math.max(maximum, d); delta = Math.max(delta, d);
      }
      if (delta >= report.thresholds.changedChannelDelta) {
        changed++;
        const x = (i / 4) % a.width, y = Math.floor(i / 4 / a.width);
        minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
    }
    return { width: a.width, height: a.height, pixels: a.width * a.height, changedPixels: changed,
      changedFraction: changed / (a.width * a.height), meanChannelDelta: total / (a.width * a.height * 3), maximumChannelDelta: maximum, changedBounds: changed ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null };
  }
  function changed(metrics, label) {
    assert.ok(metrics.changedPixels >= report.thresholds.minimumChangedPixels && metrics.changedFraction >= report.thresholds.minimumChangedFraction,
      `${label} must visibly change page pixels outside editor/navbar: ${JSON.stringify(metrics)}`);
  }
  function restored(metrics, label) {
    assert.ok(metrics.changedFraction <= report.thresholds.restorationChangedFraction && metrics.meanChannelDelta <= report.thresholds.restorationMeanChannelDelta,
      `${label} must restore the rendered page: ${JSON.stringify(metrics)}`);
  }
  async function open(page) {
    if (!await page.locator('.te-dialog').evaluate(el => el.open)) await page.locator('#tront-theme-btn').click();
  }
  async function close(page) {
    if (await page.locator('.te-dialog').evaluate(el => el.open)) await page.locator('[data-action="close"]').click();
  }
  // Native value setters plus the same bubbling events dispatched by real color
  // pickers/range gestures; no editor API, CSS variables or storage are mutated.
  async function input(page, name, value, commit = true) {
    await page.locator(`.te-dialog [name="${name}"]`).evaluate((el, { value, commit }) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(value));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      if (commit) el.dispatchEvent(new Event('change', { bubbles: true }));
    }, { value, commit });
  }
  async function configure(page, mode) {
    await open(page);
    await page.selectOption('.te-dialog [name="preset"]', mode === 'light' ? 'light' : 'cyan');
    for (let i = 0; i < 4; i++) await input(page, 'color-' + i, colors[i]);
    await input(page, 'angle', 90);
    await input(page, 'intensity', 100);
    await input(page, 'frost', 75);
    await close(page);
  }
  async function settle(page) {
    await page.mouse.move(0, 0);
    await page.evaluate(async () => { window.scrollTo(0, 0); await document.fonts.ready; });
    await page.waitForTimeout(180);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  async function inspect(page, audit = true) {
    return page.evaluate(({ key, audit }) => {
      const api = window.TrontThemeEditor;
      const state = JSON.parse(localStorage.getItem(key));
      const tokens = api.buildTokens(state);
      const rect = el => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(v => Math.round(v * 100) / 100); };
      const style = selector => {
        const el = document.querySelector(selector), css = getComputedStyle(el);
        return { background: css.backgroundColor, image: css.backgroundImage, blur: css.backdropFilter,
          attachment: css.backgroundAttachment, size: css.backgroundSize, fill: css.webkitTextFillColor,
          radius: css.borderRadius, font: css.fontFamily };
      };
      const rgb = color => {
        const m = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
        return m ? m.slice(1, 4).map(Number) : null;
      };
      const failures = [], ratios = [];
      if (audit) {
        for (const el of document.body.querySelectorAll('*')) {
          if (el.closest('.te-dialog') || ['SCRIPT', 'STYLE', 'OPTION'].includes(el.tagName) || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
          const css = getComputedStyle(el), r = el.getBoundingClientRect();
          if (!r.width || !r.height || css.visibility === 'hidden' || Number(css.opacity) === 0 || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
          const ink = rgb(css.color);
          if (!ink) continue;
          const ratio = api.contrast(ink, tokens.bound);
          ratios.push(ratio);
          if (ratio < 4.5) failures.push({ selector: el.tagName + '.' + el.className, text: el.textContent.trim().slice(0, 65), color: css.color, ratio });
        }
      }
      const heading = style('#post-list h1');
      const stops = [...heading.image.matchAll(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[^)]*)\)/g)].map(m => m.slice(1, 4).map(Number));
      const headingRatios = stops.map(stop => api.contrast(stop, tokens.bound));
      return {
        state, legacy: [localStorage.getItem('tront-theme'), localStorage.getItem('tront-previews-paused')],
        mode: [document.documentElement.getAttribute('data-te-mode'), document.documentElement.getAttribute('data-mode'), sessionStorage.getItem('mode')],
        geometry: [...document.querySelectorAll('#main-wrapper, main, #post-list, #post-list .card, #post-list h1, #sidebar, #topbar-wrapper, #magic-navbar-container > *')].map(el => ({ tag: el.tagName, class: el.className, id: el.id, rect: rect(el) })),
        content: [...document.querySelectorAll('#post-list .card')].map(el => ({ text: el.innerText, links: [...el.querySelectorAll('a')].map(a => a.getAttribute('href')) })),
        css: { body: style('body'), main: style('main'), sidebar: style('#sidebar'), topbar: style('#topbar-wrapper'), card: style('#post-list .card'), cardSurface: style('#post-list .post-preview'), heading },
        contrast: { bound: tokens.bound, checkedTextNodes: ratios.length, minimumTextRatio: Math.min(...ratios), headingStops: stops, headingRatios, failures },
        overflow: document.documentElement.scrollWidth > innerWidth,
        editorOpen: !!document.querySelector('.te-dialog').open
      };
    }, { key, audit });
  }
  async function capture(page, name, audit = true) {
    await settle(page);
    const data = await inspect(page, audit);
    assert.equal(data.editorOpen, false, 'pixel proof is captured with the editor closed');
    assert.equal(data.overflow, false, 'controls never introduce horizontal overflow');
    if (audit) {
      assert.ok(data.contrast.checkedTextNodes > 5, 'actual visible blog text was audited');
      assert.deepEqual(data.contrast.failures, [], `${name}: rendered text contrast`);
      assert.ok(data.contrast.headingStops.length >= 4, `${name}: four rendered readable heading stops`);
      assert.ok(data.contrast.headingRatios.every(r => r >= 4.5), `${name}: actual heading gradient stops meet contrast`);
      assert.deepEqual(data.mode, Array(3).fill(data.state.mode), 'shared appearance and Chirpy session stay synchronized');
      assert.deepEqual(data.legacy, ['tront-purple', 'true'], 'legacy preferences remain untouched');
    }
    const clips = await page.evaluate(() => {
      const bottom = selector => document.querySelector(selector).getBoundingClientRect().bottom;
      const y = Math.max(0, Math.ceil(Math.max(bottom('#magic-navbar-container'), bottom('#topbar-wrapper'))) + 8);
      const r = document.querySelector('#post-list .card').getBoundingClientRect();
      const x = Math.max(0, Math.ceil(r.left)), cy = Math.max(y, Math.ceil(r.top));
      const text = document.querySelector('#post-list .post-preview .card-body') || document.querySelector('#post-list .post-preview');
      const t = text.getBoundingClientRect(), tx = Math.max(0, Math.ceil(t.left)), ty = Math.max(y, Math.ceil(t.top));
      return { page: { x: 0, y, width: innerWidth, height: Math.floor(innerHeight - y) },
        card: { x, y: cy, width: Math.floor(Math.min(innerWidth, r.right) - x), height: Math.floor(Math.min(innerHeight, r.bottom) - cy) },
        surface: { x: tx, y: ty, width: Math.floor(Math.min(innerWidth, t.right) - tx), height: Math.floor(Math.min(innerHeight, t.bottom) - ty) } };
    });
    assert.ok(clips.page.height > 300 && clips.card.height > 40, 'large real page/card pixel regions exist');
    const buffers = {};
    for (const region of ['page', 'card', 'surface']) buffers[region] = await page.screenshot({ path: path.join(dir, `${name}-${region}.png`), clip: clips[region], animations: 'disabled', caret: 'hide' });
    return { name, data, clips, buffers };
  }
  function sameStructure(before, after, label) {
    assert.deepEqual(after.data.geometry, before.data.geometry, label + ': all reading/sidebar/navbar/card geometry remains unchanged');
    assert.deepEqual(after.data.content, before.data.content, label + ': visible post content and destinations remain unchanged');
    assert.deepEqual(after.clips, before.clips, label + ': identical pixel region coordinates');
  }
  function samePaint(before, after, label) {
    assert.deepEqual(after.data.css, before.data.css, label + ': actual computed canvas, heading, card surface, blur, sidebar and topbar paint is restored exactly');
    assert.deepEqual(after.data.state, before.data.state, label + ': editor state is restored exactly');
  }
  function metricPair(before, after) {
    return { page: diff(before.buffers.page, after.buffers.page), card: diff(before.buffers.card, after.buffers.card), surface: diff(before.buffers.surface, after.buffers.surface) };
  }
  function files(snapshot) { return { page: `controls/${snapshot.name}-page.png`, card: `controls/${snapshot.name}-card.png`, surface: `controls/${snapshot.name}-surface.png` }; }
  function copyBefore(snapshot, name) {
    for (const region of ['page', 'card', 'surface']) fs.writeFileSync(path.join(dir, `${name}-${region}.png`), snapshot.buffers[region]);
    return { ...snapshot, name };
  }
  async function contextFor(url, width) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce', serviceWorkers: 'block' });
    liveContexts.add(context);
    await context.addInitScript(() => {
      // Seed only unrelated legacy sentinels. The editable state is always set
      // through controls, and this runs without overwriting persisted edits.
      if (!localStorage.getItem('tront-theme')) localStorage.setItem('tront-theme', 'tront-purple');
      if (!localStorage.getItem('tront-previews-paused')) localStorage.setItem('tront-previews-paused', 'true');
    });
    await context.route('**/*', route => {
      const u = new URL(route.request().url());
      if (u.hostname === '127.0.0.1' || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'].includes(u.hostname) || (route.request().resourceType() === 'image' && u.hostname === 'tront.xyz')) return route.continue();
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    });
    const page = await context.newPage();
    await page.goto(url + '/blog/', { waitUntil: 'networkidle' });
    await page.locator('#tront-theme-btn').waitFor({ state: 'visible' });
    return { context, page };
  }
  const closeContext = async context => { await context.close(); liveContexts.delete(context); };
  // PNGJS-only nearest-neighbor preview. Reduce the overview if necessary to
  // keep CI's inline diagnostic under 60 KB; full-resolution evidence is saved.
  function createPreview(pairs, filename = 'blog-control-effects-preview.png') {
    let preview, sheet, tileWidth = 300;
    do {
      const tileHeight = Math.round(tileWidth * 145 / 240), gutter = 4;
      sheet = new PNG({ width: tileWidth * 2 + gutter, height: (tileHeight + gutter) * pairs.length + gutter });
      sheet.data.fill(255);
      function blit(buffer, dx, dy) {
        const source = PNG.sync.read(buffer);
        const scale = Math.min(tileWidth / source.width, tileHeight / source.height);
        const drawWidth = Math.floor(source.width * scale), drawHeight = Math.floor(source.height * scale);
        dx += Math.floor((tileWidth - drawWidth) / 2); dy += Math.floor((tileHeight - drawHeight) / 2);
        for (let y = 0; y < drawHeight; y++) for (let x = 0; x < drawWidth; x++) {
          const sx = Math.floor(x * source.width / drawWidth), sy = Math.floor(y * source.height / drawHeight);
          const src = (sy * source.width + sx) * 4, dest = ((dy + y) * sheet.width + dx + x) * 4;
          for (let c = 0; c < 4; c++) sheet.data[dest + c] = source.data[src + c];
        }
      }
      pairs.forEach((pair, row) => {
        const y = gutter + row * (tileHeight + gutter);
        const region = pair.region || 'page';
        blit(pair.before.buffers[region], 0, y); blit(pair.after.buffers[region], tileWidth + gutter, y);
      });
      preview = PNG.sync.write(sheet, { colorType: 2 });
      tileWidth -= 20;
    } while (preview.length > 60000 && tileWidth >= 80);
    fs.writeFileSync(path.join(out, filename), preview);
    report.preview = pairs.map((pair, row) => ({ row: row + 1, label: pair.label, region: pair.region || 'page', left: files(pair.before), right: files(pair.after) }));
    report.previewDimensions = { width: sheet.width, height: sheet.height, bytes: preview.length };
    return preview;
  }
  try {
    // Reproduce the original adapter's disconnected controls at both requested
    // widths/modes, without assuming frost's opacity change had no effect.
    for (const width of [390, 1440]) for (const mode of ['dark', 'light']) {
      const { context, page } = await contextFor(baselineBase, width);
      await configure(page, mode);
      const seed = await capture(page, `baseline-${width}-${mode}-seed`, false);
      for (const [control, value] of [['angle', 270], ['position-0', 24], ['position-1', 12], ['position-2', 88], ['position-3', 76], ['frost', 100]]) {
        const label = `baseline-${width}-${mode}-${control}`;
        const before = copyBefore(seed, label + '-before');
        await open(page); await input(page, control, value); await close(page);
        const after = await capture(page, label + '-after', false);
        sameStructure(before, after, label);
        const metrics = metricPair(before, after);
        latestPair = { label, before, after };
        const record = { width, mode, control, from: before.data.state, to: after.data.state,
          before: files(before), after: files(after), pixels: metrics, beforeCss: before.data.css, afterCss: after.data.css };
        report.baseline.push(record); writeReport();
        assert.equal(before.data.css.body.image, 'none', 'old adapter has no page wash');
        assert.equal(after.data.css.body.image, 'none', 'old adapter still has no page wash');
        assert.equal(before.data.css.card.blur, 'blur(12px)', 'baseline has fixed 12px blur');
        assert.equal(after.data.css.card.blur, 'blur(12px)', 'old frost does not change blur');
        assert.equal(after.data.css.heading.image, before.data.css.heading.image, 'old heading ignores angle/positions/frost');
        if (control !== 'frost') restored(metrics.page, label + ' reproduces disconnected rendered control');
        await open(page); await page.locator('[data-action="undo"]').click(); await close(page);
      }
      await closeContext(context);
    }
    for (const width of [390, 1440]) for (const mode of ['dark', 'light']) {
      const { context, page } = await contextFor(base, width);
      const prefix = `${width}-${mode}`;
      await open(page); await page.selectOption('.te-dialog [name="preset"]', 'dark'); await close(page);
      const resetExpected = await capture(page, `${prefix}-reset-reference`);
      await configure(page, mode);
      const seed = await capture(page, `${prefix}-seed`);
      await open(page); await close(page);
      const calibration = await capture(page, `${prefix}-no-change-editor-cycle`);
      latestPair = { label: prefix + '-no-change-editor-cycle', before: seed, after: calibration };
      sameStructure(seed, calibration, prefix + ' no-change calibration');
      samePaint(seed, calibration, prefix + ' no-change calibration');
      const calibrationPixels = metricPair(seed, calibration);
      report.calibration.push({ width, mode, before: files(seed), after: files(calibration), pixels: calibrationPixels, paintAndStateIdentical: true });
      console.log('BLOG_CONTROL_NO_CHANGE_CALIBRATION ' + JSON.stringify(report.calibration.at(-1)));
      restored(calibrationPixels.page, prefix + ' no-change editor cycle');
      restored(calibrationPixels.card, prefix + ' no-change card');
      writeReport();
      const controls = [
        ...[0, 1, 2, 3].map(i => ({ name: 'color-' + i, value: replacements[i] })),
        ...[24, 12, 88, 76].map((value, i) => ({ name: 'position-' + i, value })),
        { name: 'angle', value: 270 }, { name: 'intensity', value: 0 }, { name: 'frost', value: 100 },
        { name: 'palette', value: mode === 'light' ? 'light' : 'purple' },
        { name: 'appearance', value: mode === 'light' ? 'dark' : 'light' },
        { name: 'color-magic' }, { name: 'input-draft' }, { name: 'reset' }
      ];
      for (const control of controls) {
        const label = `${prefix}-${control.name}`;
        const before = await capture(page, label + '-before');
        samePaint(seed, before, label + ' fresh pre-control reference');
        await open(page);
        if (control.name === 'palette') await page.selectOption('.te-dialog [name="preset"]', control.value);
        else if (control.name === 'appearance') await page.locator(`.te-dialog [name="mode"][value="${control.value}"]`).check();
        else if (control.name === 'color-magic') await page.locator('[data-action="magic"]').evaluate(button => {
          const original = Math.random;
          // Stable harmony output makes failures and artifact comparison reproducible.
          try { Math.random = () => 0.37; button.click(); } finally { Math.random = original; }
        });
        else if (control.name === 'input-draft') {
          await input(page, 'angle', 135, false); await input(page, 'angle', 215, false);
        } else if (control.name === 'reset') await page.locator('[data-action="reset"]').click();
        else await input(page, control.name, control.value);
        await close(page);
        const after = await capture(page, label + '-after');
        sameStructure(before, after, label);
        const metrics = metricPair(before, after);
        latestPair = { label, before, after };
        const record = { width, mode, control: control.name, before: files(before), after: files(after),
          from: before.data.state, to: after.data.state, pixels: metrics, beforeCss: before.data.css, afterCss: after.data.css,
          contrast: after.data.contrast, geometryAndContentUnchanged: true };
        report.cases.push(record); writeReport();
        changed(metrics.page, label);
        assert.notDeepEqual(after.data.state, before.data.state, 'real control persisted a changed state');
        if (control.name === 'frost') {
          changed(metrics.card, label + ' actual glass card');
          changed(metrics.surface, label + ' actual text surface, excluding thumbnail');
          assert.equal(before.data.css.card.blur, 'blur(12.5px)');
          assert.equal(after.data.css.card.blur, 'blur(0px)');
          assert.notEqual(after.data.css.cardSurface.background, before.data.css.cardSurface.background, 'frost changes the actual post-preview card surface alpha');
        }
        if (control.name === 'angle' || control.name.startsWith('position-')) {
          assert.notEqual(after.data.css.body.image, before.data.css.body.image, 'control reaches rendered body gradient');
          assert.notEqual(after.data.css.heading.image, before.data.css.heading.image, 'control reaches rendered four-peg heading gradient');
        }
        if (control.name === 'reset') {
          assert.deepEqual(after.data.state, resetExpected.data.state, 'Reset restores the default editor state');
          samePaint(resetExpected, after, label + ' default reference');
          record.resetReferencePixels = metricPair(resetExpected, after);
          restored(record.resetReferencePixels.page, label + ' matches independently selected Midnight');
        }
        if (['angle', 'frost'].includes(control.name)) {
          console.log('BLOG_CONTROL_CASE_METRICS ' + JSON.stringify({ width, mode, control: control.name, pixels: metrics, beforeCss: before.data.css, afterCss: after.data.css, before: files(before), after: files(after) }));
          // Preserve full-resolution public-site evidence in the decoded CI log
          // as well as the artifact, so reviewers without a browser sign-in can
          // inspect the actual pixels. Lossless PNG re-encoding never resizes.
          if (width === 1440) {
            for (const [side, snapshot] of [['before', before], ['after', after]]) {
              for (const region of control.name === 'frost' ? ['surface'] : ['page']) {
                const source = PNG.sync.read(snapshot.buffers[region]);
                const png = PNG.sync.write(source, { deflateLevel: 9 });
                console.log('BLOG_CONTROL_FULL_PNG ' + JSON.stringify({ label, side, region,
                  width: source.width, height: source.height, png: png.toString('base64') }));
              }
            }
          }
          const region = control.name === 'frost' ? 'surface' : 'page';
          if (width === 1440) previewPairs.push({ label, before, after, region });
          const partialPairs = previewPairs.length ? previewPairs : [{ label, before, after, region }];
          const partial = createPreview(partialPairs, 'blog-control-effects-partial-preview.png');
          console.log('BLOG_CONTROL_PARTIAL_PREVIEW_ROWS ' + JSON.stringify(partialPairs.map(p => p.label)));
          console.log('BLOG_CONTROL_PARTIAL_PREVIEW_PNG ' + partial.toString('base64'));
        }
        await open(page); await page.locator('[data-action="undo"]').click(); await close(page);
        const undo = await capture(page, label + '-undo');
        latestPair = { label: label + '-Undo', before, after: undo };
        sameStructure(before, undo, label + ' Undo');
        record.undo = { files: files(undo), pixels: metricPair(before, undo), stateRestored: false, computedPaintRestored: false };
        samePaint(before, undo, label + ' Undo');
        record.undo.stateRestored = true; record.undo.computedPaintRestored = true;
        assert.deepEqual(undo.data.state, seed.data.state, 'one Undo restores the complete pre-gesture state');
        restored(record.undo.pixels.page, label + ' Undo');
        restored(record.undo.pixels.card, label + ' Undo card');
        writeReport();
      }
      // Pixel-level persistence, actual navigation, and storage-event propagation.
      await open(page); await input(page, 'angle', 217); await close(page);
      const persisted = await capture(page, `${prefix}-persist-before`);
      const persistence = { width, mode, before: files(persisted), checks: [] };
      report.persistence.push(persistence); writeReport();
      await page.reload({ waitUntil: 'networkidle' });
      const reloaded = await capture(page, `${prefix}-persist-reload`);
      sameStructure(persisted, reloaded, prefix + ' reload');
      samePaint(persisted, reloaded, prefix + ' reload');
      assert.deepEqual(reloaded.data.state, persisted.data.state);
      const reloadPixels = metricPair(persisted, reloaded); restored(reloadPixels.page, prefix + ' reload');
      persistence.checks.push({ name: 'reload', after: files(reloaded), pixels: reloadPixels });
      const post = page.locator('#post-list .post-preview').first();
      const postHref = await post.getAttribute('href');
      await post.click(); await page.waitForURL('**' + new URL(postHref, base).pathname);
      await page.waitForLoadState('networkidle');
      assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key), persisted.data.state);
      await page.goBack({ waitUntil: 'networkidle' });
      const returned = await capture(page, `${prefix}-persist-navigation`);
      sameStructure(persisted, returned, prefix + ' post navigation');
      samePaint(persisted, returned, prefix + ' post navigation');
      const navigationPixels = metricPair(persisted, returned); restored(navigationPixels.page, prefix + ' real post navigation');
      persistence.checks.push({ name: 'post-navigation-and-back', route: postHref, after: files(returned), pixels: navigationPixels });
      const receiver = await context.newPage();
      await receiver.goto(base + '/blog/', { waitUntil: 'networkidle' });
      const receiveBefore = await capture(receiver, `${prefix}-storage-before`);
      await open(page); await input(page, 'intensity', 0); await close(page);
      await receiver.waitForFunction(() => getComputedStyle(document.documentElement).getPropertyValue('--te-glow-opacity').trim() === '0');
      const senderAfter = await capture(page, `${prefix}-storage-sender`);
      const receiveAfter = await capture(receiver, `${prefix}-storage-after`);
      sameStructure(receiveBefore, receiveAfter, prefix + ' storage event');
      samePaint(senderAfter, receiveAfter, prefix + ' receiving tab');
      assert.deepEqual(receiveAfter.data.state, senderAfter.data.state);
      const storagePixels = metricPair(receiveBefore, receiveAfter), synchronizedPixels = metricPair(senderAfter, receiveAfter);
      changed(storagePixels.page, prefix + ' receiving tab must visibly update');
      restored(synchronizedPixels.page, prefix + ' receiving tab matches sender');
      await open(receiver); assert.equal(await receiver.locator('[data-action="undo"]').isDisabled(), true, 'storage updates clear stale receiving-tab Undo'); await close(receiver);
      persistence.checks.push({ name: 'storage-event', before: files(receiveBefore), after: files(receiveAfter), sender: files(senderAfter), pixels: storagePixels, synchronizedPixels, staleUndoCleared: true });
      await receiver.close();
      await open(page); await page.locator('[data-action="reset"]').click(); await close(page);
      const reset = await capture(page, `${prefix}-reset-persist-before`);
      await page.reload({ waitUntil: 'networkidle' });
      const resetReload = await capture(page, `${prefix}-reset-persist-after`);
      samePaint(reset, resetReload, prefix + ' Reset reload');
      assert.deepEqual(resetReload.data.state, resetExpected.data.state);
      const resetPixels = metricPair(reset, resetReload); restored(resetPixels.page, prefix + ' Reset survives reload');
      persistence.checks.push({ name: 'reset-reload', before: files(reset), after: files(resetReload), pixels: resetPixels });
      writeReport(); await closeContext(context);
    }
    const preview = createPreview(previewPairs);
    report.status = 'passed';
    report.summary = [...new Set(report.cases.map(c => c.control))].map(control => {
      const records = report.cases.filter(c => c.control === control);
      return { control, combinations: records.length, minimumChangedPixels: Math.min(...records.map(c => c.pixels.page.changedPixels)),
        minimumChangedPercent: Math.min(...records.map(c => c.pixels.page.changedFraction * 100)),
        minimumMeanChannelDelta: Math.min(...records.map(c => c.pixels.page.meanChannelDelta)),
        undoMaximumChangedPixels: Math.max(...records.map(c => c.undo.pixels.page.changedPixels)) };
    });
    writeReport();
    console.log('BLOG_CONTROL_PIXEL_SUMMARY ' + JSON.stringify({ status: report.status, controls: report.summary, baseline: report.baseline.map(c => ({ width: c.width, mode: c.mode, control: c.control, changedPixels: c.pixels.page.changedPixels, cardBlur: c.afterCss.card.blur })), persistence: report.persistence.map(p => ({ width: p.width, mode: p.mode, checks: p.checks.map(c => c.name) })), report: path.basename(reportFile), previewRows: report.preview.map(r => r.label), previewBytes: preview.length }));
    console.log('BLOG_CONTROL_PREVIEW_PNG ' + preview.toString('base64'));
    console.log('PASS: 64 rendered control changes, their pixel-restoring Undo actions, 24 baseline reproductions, and 16 persistence/navigation/storage checks at 390/1440 light/dark.');
    return report;
  } catch (error) {
    report.status = 'failed'; report.error = error.stack || error.message;
    console.log('BLOG_CONTROL_PIXEL_FAILURE ' + JSON.stringify({ error: error.message, lastCase: report.cases.at(-1), lastBaseline: report.baseline.at(-1), completedCases: report.cases.length, completedControlMetrics: report.cases.map(c => ({ width: c.width, mode: c.mode, control: c.control, pixels: c.pixels, undo: c.undo?.pixels })), calibration: report.calibration }));
    if (latestPair) {
      const failurePairs = [...previewPairs, latestPair];
      const preview = createPreview(failurePairs, 'blog-control-effects-failure-preview.png');
      console.log('BLOG_CONTROL_FAILURE_PREVIEW_ROWS ' + JSON.stringify(failurePairs.map(p => p.label)));
      console.log('BLOG_CONTROL_PREVIEW_PNG ' + preview.toString('base64'));
    }
    writeReport(); throw error;
  } finally { for (const context of liveContexts) await context.close(); }
};
