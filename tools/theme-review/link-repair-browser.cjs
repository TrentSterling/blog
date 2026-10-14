'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { REPAIRS, verifyBuiltSite } = require('./link-repair.cjs');

const categoryNames = ['ai', 'devblog', 'experiments', 'hardware', 'personal', 'projects', 'tools'];
const widths = [1440, 390, 320];
const links = page => page.evaluate(() => {
  const read = selector => [...document.querySelectorAll(selector)].map(a => ({
    href: a.getAttribute('href'), text: a.textContent.trim(), target: a.getAttribute('target')
  }));
  return { sidebar: read('#sidebar .nav-link'), primary: read('#magic-navbar-container a') };
});
const article = page => page.evaluate(() => {
  const preserved = document.querySelector('main article > .content')?.cloneNode(true);
  preserved?.querySelectorAll('[data-restored-image]').forEach(el => el.remove());
  return ({
  heading: document.querySelector('main h1')?.textContent.trim(),
  content: preserved?.textContent.replace(/\s+/g, ' ').trim(),
  images: [...(preserved?.querySelectorAll('img') || [])].map(img => Object.fromEntries(
    ['src', 'alt', 'title', 'width', 'height', 'loading'].map(name => [name, img.getAttribute(name)]))),
  metadata: ['link[rel="canonical"]', 'meta[name="description"]', 'meta[property="og:title"]',
    'meta[property="og:description"]', 'meta[property="og:image"]', 'meta[property="og:url"]'].map(selector => {
    const el = document.querySelector(selector); return [selector, el?.getAttribute(el.tagName === 'LINK' ? 'href' : 'content')];
  }),
  title: document.title
}); });

module.exports = async function checkRepairedLinks(browser, base, baselineBase, siteRoot, out) {
  const report = { status: 'running', built: verifyBuiltSite(path.join(siteRoot, 'blog')),
    widths, categories: [], posts: [], destinations: [], errors: [], missingAssets: [],
    recoveredImages: [] };
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  let page;
  const save = () => fs.writeFileSync(path.join(out, 'blog-link-repair-report.json'), JSON.stringify(report, null, 2));
  const open = async (p, origin, route) => {
    const response = await p.goto(origin + route, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, 'generated route loads: ' + route);
    assert.equal(p.url(), origin + route, 'generated route does not rely on a redirect');
    await p.evaluate(() => document.fonts.ready);
  };
  const canonical = async (p, route) => {
    assert.deepEqual(await p.locator('link[rel="canonical"]').evaluateAll(nodes => nodes.map(n => n.href)),
      ['https://tront.xyz' + route], 'one exact public canonical for ' + route);
    assert.equal(await p.locator('meta[property="og:url"]').getAttribute('content'), 'https://tront.xyz' + route);
    assert.equal(await p.locator('main h1').count(), 1, 'exactly one main H1');
    assert.equal(await p.locator('main h1').isVisible(), true, 'page heading is visible');
  };
  try {
    await context.route('**/*', route => {
      const request = route.request(), u = new URL(request.url());
      // Blog documents and corrected image destinations use their real local
      // HTTP endpoints. The published SpaceView route is also checked live.
      if (u.hostname === '127.0.0.1' || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'].includes(u.hostname) ||
        (u.hostname === 'tront.xyz' && (request.resourceType() !== 'document' || u.pathname === '/spaceview/'))) return route.continue();
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
    });
    page = await context.newPage();
    const baseline = await context.newPage();
    for (const p of [page, baseline]) {
      p.on('pageerror', error => {
        if (p.url().startsWith(base + '/') || p.url().startsWith(baselineBase + '/')) report.errors.push({ url: p.url(), error: error.message });
      });
      p.on('requestfailed', request => {
        if ((request.url().startsWith(base + '/') || request.url().startsWith(baselineBase + '/')) &&
          /\.(css|js)(\?|$)/.test(request.url())) report.missingAssets.push({ url: request.url(), failure: request.failure()?.errorText });
      });
      p.on('response', response => {
        if ((response.url().startsWith(base + '/') || response.url().startsWith(baselineBase + '/')) &&
          /\.(css|js)(\?|$)/.test(response.url()) && response.status() >= 400) report.missingAssets.push(response.url());
      });
    }
    await open(baseline, baselineBase, '/blog/');
    const originalNavigation = await links(baseline);
    assert.ok(!originalNavigation.sidebar.some(link => link.href === '/blog/categories/'));
    const layout = async (route, width, screenshot = false) => {
      await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
      // Allow Chirpy's existing sidebar resize transition to settle.
      await page.waitForTimeout(350);
      await canonical(page, route);
      assert.deepEqual(await links(page), originalNavigation, 'sidebar and primary navigation stay unchanged');
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        navbarFits: [...document.querySelector('#magic-navbar-container').children].every(el => {
          const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth;
        })
      }));
      assert.equal(geometry.overflow, false, `${route} has no horizontal overflow at ${width}px`);
      assert.equal(geometry.navbarFits, true, `${route} navbar fits at ${width}px`);
      if (screenshot) await page.screenshot({ path: path.join(out, `links-${route.replace(/[^a-z0-9]+/gi, '-')}-${width}.png`) });
      return { width, ...geometry, canonical: 'https://tront.xyz' + route };
    };
    await open(page, base, '/blog/categories/');
    assert.equal((await page.locator('main h1').innerText()).trim(), 'Categories');
    const categories = await page.locator('main .categories a[href^="/blog/categories/"]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
    assert.deepEqual([...new Set(categories)].sort(), categoryNames.map(name => `/blog/categories/${name}/`).sort(), 'all seven category links are exposed');
    report.categoryIndex = [];
    for (const width of widths) report.categoryIndex.push(await layout('/blog/categories/', width, true));
    for (const name of categoryNames) {
      const route = `/blog/categories/${name}/`;
      await page.setViewportSize({ width: 1440, height: 1000 });
      await open(page, base, route);
      const evidence = { route, layouts: [await layout(route, 1440, true)] };
      const breadcrumb = page.locator('#breadcrumb a[href="/blog/categories/"]');
      assert.equal(await breadcrumb.count(), 1);
      await breadcrumb.click(); await page.waitForURL(base + '/blog/categories/');
      assert.equal((await page.locator('main h1').innerText()).trim(), 'Categories');
      const targets = page.locator(`main .categories a[href="${route}"]:visible`);
      assert.ok(await targets.count() >= 1, 'category has a visible index link');
      await targets.first().click(); await page.waitForURL(base + route); await canonical(page, route);
      await page.goBack({ waitUntil: 'domcontentloaded' }); assert.equal(page.url(), base + '/blog/categories/');
      await page.goBack({ waitUntil: 'domcontentloaded' }); assert.equal(page.url(), base + route);
      evidence.breadcrumbToIndex = true; evidence.indexToCategory = true; evidence.browserBack = true;
      for (const width of widths.slice(1)) evidence.layouts.push(await layout(route, width, name === 'devblog'));
      report.categories.push(evidence); save();
    }
    for (const repair of REPAIRS) {
      const slug = path.basename(repair.path, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');
      const route = `/blog/posts/${slug}/`;
      await page.setViewportSize({ width: 1440, height: 1000 });
      await Promise.all([open(page, base, route), open(baseline, baselineBase, route)]);
      const original = await article(baseline), repaired = await article(page);
      assert.ok(original.content && original.heading, 'baseline post content exists');
      const voice = require('../voice-restoration/verify.cjs').manifest.posts.find(post => post.path === repair.path);
      if (voice) {
        // Source hashes and the dedicated rendered-quote suite cover approved prose.
        // Keep all navigation, canonical, repaired-link and media checks in this suite.
        const stable = value => ({ ...value, content: undefined,
          images: [...value.images].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),
          metadata: value.metadata.filter(([name])=>!name.includes('description')) });
        assert.deepEqual(stable(repaired), stable(original), `${route}: all non-prose/description content stays intact`);
      } else assert.deepEqual(repaired, original, `${route}: rendered text, image sources, captions and metadata are unchanged`);
      const evidence = { route, renderedContentUnchanged: !voice, reviewedVoiceRestoration: !!voice, layouts: [] };
      const representative = repair === REPAIRS[0] || slug === 'still-alive-blocky-dungeon-prototype' || slug === 'building-spaceview-with-claude';
      for (const width of widths) evidence.layouts.push(await layout(route, width, representative));
      await page.setViewportSize({ width: 1440, height: 1000 });
      for (const edit of repair.edits) {
        const href = edit.kind === 'route' ? edit.target : '/blog/' + edit.target;
        const expected = new URL(href, base).href;
        // Chirpy 7.2.4 img-popup.js binds GLightbox only to .popup.
        // Chirpy adds .popup to automatic image wrappers. These repairs target
        // authored links, including the original whitespace-only Capture link.
        const anchors = page.locator(`main .content a[href="${href}"]:not(.popup)`);
        assert.equal(await anchors.count(), edit.count, 'every authored repaired link is rendered exactly once per occurrence');
        for (let i = 0; i < edit.count; i++) {
          const anchor = anchors.nth(i), target = await anchor.getAttribute('target');
          const popupPromise = target === '_blank' ? page.waitForEvent('popup') : null;
          const responsePromise = context.waitForEvent('response', { predicate: response =>
            response.url() === expected && response.request().isNavigationRequest() });
          const box = await anchor.boundingBox();
          let activation;
          if (box && box.width > 0 && box.height > 0) { activation = 'click'; await anchor.click(); }
          else { activation = 'keyboard'; await anchor.focus(); await page.keyboard.press('Enter'); }
          const response = await responsePromise;
          const destination = popupPromise ? await popupPromise : page;
          await destination.waitForURL(expected); await destination.waitForLoadState('domcontentloaded');
          assert.equal(response.status(), 200, 'actual link navigation returns HTTP 200: ' + href);
          assert.equal(response.request().redirectedFrom(), null, 'corrected URL needs no redirect');
          if (edit.kind === 'route') {
            assert.equal(await destination.locator('link[rel="canonical"]').getAttribute('href'), edit.target);
          } else {
            assert.match(response.headers()['content-type'], /^image\//, 'destination is served as an image');
            await destination.waitForFunction(() => [...document.images].some(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0));
          }
          if (popupPromise) await destination.close();
          else { await page.goBack({ waitUntil: 'domcontentloaded' }); assert.equal(page.url(), base + route); }
          assert.deepEqual(await article(page), original, 'returning from the target restores the unchanged article');
          report.destinations.push({ route, href, occurrence: i + 1, activation, status: response.status(),
            contentType: response.headers()['content-type'], returnFlow: popupPromise ? 'popup closed' : 'browser Back' });
          save();
        }
      }
      report.posts.push(evidence); save();
    }
    assert.equal(report.destinations.length, 40);
    // Preserve the migrated article exactly while restoring its two omitted JPEGs.
    const recoveredRoute = '/blog/posts/dont-touch-the-red-stuff/';
    await open(baseline, baselineBase, recoveredRoute);
    const recoveredOriginal = await article(baseline);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      await open(page, base, recoveredRoute);
      assert.deepEqual(await article(page), recoveredOriginal, 'restored screenshots do not change article content or metadata');
      for (const name of ['screen21', 'screen3']) {
        const href = `/blog/assets/img/blog/wp/${name}.jpg`;
        const image = page.locator(`main .content img[src="${href}"]`);
        assert.equal(await image.count(), 1);
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(img => img.decode());
        const decoded = await image.evaluate(img => {
          const r = img.getBoundingClientRect();
          return { complete: img.complete, width: img.naturalWidth, height: img.naturalHeight,
            visibleWidth: r.width, visibleHeight: r.height, left: r.left, right: r.right };
        });
        assert.equal(decoded.complete, true);
        assert.deepEqual([decoded.width, decoded.height], [600, 337]);
        assert.ok(decoded.visibleWidth > 0 && decoded.visibleHeight > 0);
        assert.ok(decoded.left >= -1 && decoded.right <= width + 1, 'restored image fits the reading viewport');
        assert.equal(await image.locator('..').getAttribute('href'), href, 'enlargement points to the same recovered image');
        await page.screenshot({ path: path.join(out, `recovered-${name}-${width}.png`) });
        report.recoveredImages.push({ viewportWidth: width, href, ...decoded });
      }
    }
    const imagePage = await context.newPage();
    for (const name of ['screen21', 'screen3']) {
      const response = await imagePage.goto(base + `/blog/assets/img/blog/wp/${name}.jpg`);
      assert.equal(response.status(), 200);
      assert.match(response.headers()['content-type'], /^image\/jpeg/);
      const image = imagePage.locator('img');
      await image.evaluate(img => img.decode());
      assert.deepEqual(await image.evaluate(img => [img.naturalWidth, img.naturalHeight]), [600, 337]);
    }
    await imagePage.close();
    save();
    assert.deepEqual(report.errors, [], 'repaired blog routes have no JavaScript errors');
    assert.deepEqual(report.missingAssets, [], 'same-origin scripts and styles load');
    report.status = 'passed';
    console.log('PASS: 40 repaired link navigations, unchanged article text/images/metadata, category index and seven breadcrumbs, Back, and 320/390/1440px layouts.');
    return report;
  } catch (error) {
    report.status = 'failed'; report.error = error.message; report.url = page?.url();
    if (page) await page.screenshot({ path: path.join(out, 'blog-link-repair-failure.png') }).catch(() => {});
    throw error;
  } finally { save(); await context.close(); }
};
