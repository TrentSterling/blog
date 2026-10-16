'use strict';

// One-time source-preservation and built-output checks for the historical link
// repair. Each original Git blob is pinned so no prose, alt text, image source,
// formatting, or unrelated URL can change unnoticed. No network requests.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const BASE_COMMIT = 'd92540bad695fbf96b926033d95eaa47b7950f52';
const REPAIRS = [
  {
    "path": "_posts/2010-12-02-away3dlite-and-new-recording-software.md",
    "originalBlob": "0932f753b4a3c253a499065487e5ca68773f6e5e",
    "edits": [
      {
        "before": ")](/assets/img/better_performance_lower_memory_shits_working.jpg)",
        "after": ")]({{ '/assets/img/better_performance_lower_memory_shits_working.jpg' | relative_url }})",
        "target": "assets/img/better_performance_lower_memory_shits_working.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2010-12-31-attempting-daily-posts.md",
    "originalBlob": "0087c151dc5b9012b4a2b3fab5b3a6ddd2873b97",
    "edits": [
      {
        "before": ")](/assets/img/colorpickerui.png)",
        "after": ")]({{ '/assets/img/colorpickerui.png' | relative_url }})",
        "target": "assets/img/colorpickerui.png",
        "count": 1
      },
      {
        "before": ")](/assets/img/no_activity.png)",
        "after": ")]({{ '/assets/img/no_activity.png' | relative_url }})",
        "target": "assets/img/no_activity.png",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2013-09-10-that-dummy.md",
    "originalBlob": "d3708e0651611754190746ff7e9523eadb841909",
    "edits": [
      {
        "before": ")](/assets/img/badguys.png)",
        "after": ")]({{ '/assets/img/badguys.png' | relative_url }})",
        "target": "assets/img/badguys.png",
        "count": 1
      },
      {
        "before": ")](/assets/img/effects.jpg)",
        "after": ")]({{ '/assets/img/effects.jpg' | relative_url }})",
        "target": "assets/img/effects.jpg",
        "count": 1
      },
      {
        "before": ")](/assets/img/ingamescripting.jpg)",
        "after": ")]({{ '/assets/img/ingamescripting.jpg' | relative_url }})",
        "target": "assets/img/ingamescripting.jpg",
        "count": 1
      },
      {
        "before": ")](/assets/img/lightrays.png)",
        "after": ")]({{ '/assets/img/lightrays.png' | relative_url }})",
        "target": "assets/img/lightrays.png",
        "count": 1
      },
      {
        "before": ")](/assets/img/manyobjects.jpg)",
        "after": ")]({{ '/assets/img/manyobjects.jpg' | relative_url }})",
        "target": "assets/img/manyobjects.jpg",
        "count": 1
      },
      {
        "before": ")](/assets/img/neededitor.jpg)",
        "after": ")]({{ '/assets/img/neededitor.jpg' | relative_url }})",
        "target": "assets/img/neededitor.jpg",
        "count": 1
      },
      {
        "before": ")](/assets/img/oldlevel1.png)",
        "after": ")]({{ '/assets/img/oldlevel1.png' | relative_url }})",
        "target": "assets/img/oldlevel1.png",
        "count": 1
      },
      {
        "before": ")](/assets/img/sepiacolortest.png)",
        "after": ")]({{ '/assets/img/sepiacolortest.png' | relative_url }})",
        "target": "assets/img/sepiacolortest.png",
        "count": 1
      },
      {
        "before": ")](/assets/img/turret.jpg)",
        "after": ")]({{ '/assets/img/turret.jpg' | relative_url }})",
        "target": "assets/img/turret.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2014-01-07-asset-review-qubicle.md",
    "originalBlob": "7135e353fa45af53345602b4fba0ae7cc50dba88",
    "edits": [
      {
        "before": ")](/assets/img/constructor.jpg)",
        "after": ")]({{ '/assets/img/constructor.jpg' | relative_url }})",
        "target": "assets/img/constructor.jpg",
        "count": 1
      },
      {
        "before": ")](/assets/img/unite.jpg)",
        "after": ")]({{ '/assets/img/unite.jpg' | relative_url }})",
        "target": "assets/img/unite.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2014-01-07-asset-review-rotorz.md",
    "originalBlob": "1b6dea54b4f25e773430459159e291161d31077c",
    "edits": [
      {
        "before": ")](/assets/img/rotorz-maxresdefault.jpg)",
        "after": ")]({{ '/assets/img/rotorz-maxresdefault.jpg' | relative_url }})",
        "target": "assets/img/rotorz-maxresdefault.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2014-02-28-3-day-rpg.md",
    "originalBlob": "2e65c0c81d7a8640a5e95869c69e0055b02d338a",
    "edits": [
      {
        "before": ")](/assets/img/img1.jpg)",
        "after": ")]({{ '/assets/img/img1.jpg' | relative_url }})",
        "target": "assets/img/img1.jpg",
        "count": 1
      },
      {
        "before": ")](/assets/img/img2.jpg)",
        "after": ")]({{ '/assets/img/img2.jpg' | relative_url }})",
        "target": "assets/img/img2.jpg",
        "count": 1
      },
      {
        "before": ")](/assets/img/img3.jpg)",
        "after": ")]({{ '/assets/img/img3.jpg' | relative_url }})",
        "target": "assets/img/img3.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2014-10-28-12-games-in-12-weeks.md",
    "originalBlob": "11cec86a358f84be1aed234bfb61b8325720c1e2",
    "edits": [
      {
        "before": ")](/assets/img/12games.jpg)",
        "after": ")]({{ '/assets/img/12games.jpg' | relative_url }})",
        "target": "assets/img/12games.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2015-07-19-bacon-game-jam-buttloads.md",
    "originalBlob": "882d54ff89c0026c0f141696b4612108a796f4b5",
    "edits": [
      {
        "before": ")](/assets/img/2015-06-12_17-32-56.png)",
        "after": ")]({{ '/assets/img/2015-06-12_17-32-56.png' | relative_url }})",
        "target": "assets/img/2015-06-12_17-32-56.png",
        "count": 1
      },
      {
        "before": ")](/assets/img/2015-06-14_16-32-21.png)",
        "after": ")]({{ '/assets/img/2015-06-14_16-32-21.png' | relative_url }})",
        "target": "assets/img/2015-06-14_16-32-21.png",
        "count": 1
      },
      {
        "before": ")](/assets/img/2015-06-14_16-34-46.png)",
        "after": ")]({{ '/assets/img/2015-06-14_16-34-46.png' | relative_url }})",
        "target": "assets/img/2015-06-14_16-34-46.png",
        "count": 2
      },
      {
        "before": ")](/assets/img/2015-06-15_03-42-08.png)",
        "after": ")]({{ '/assets/img/2015-06-15_03-42-08.png' | relative_url }})",
        "target": "assets/img/2015-06-15_03-42-08.png",
        "count": 1
      },
      {
        "before": ")](/assets/img/2015-06-15_04-41-13.png)",
        "after": ")]({{ '/assets/img/2015-06-15_04-41-13.png' | relative_url }})",
        "target": "assets/img/2015-06-15_04-41-13.png",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2016-05-31-rebooting-me.md",
    "originalBlob": "7ac437926b32e8b234c555a9c6256b96fb2a5403",
    "edits": [
      {
        "before": ")](/assets/img/2016-05-31_19-12-01.jpg)",
        "after": ")]({{ '/assets/img/2016-05-31_19-12-01.jpg' | relative_url }})",
        "target": "assets/img/2016-05-31_19-12-01.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2016-12-15-new-blog-new-tech.md",
    "originalBlob": "5f4be608e77086c28093d104fee60ccde4e32059",
    "edits": [
      {
        "before": ")](/assets/img/8266.jpg)",
        "after": ")]({{ '/assets/img/8266.jpg' | relative_url }})",
        "target": "assets/img/8266.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2016-12-25-christmas-stud-finder.md",
    "originalBlob": "b44881989f814ff74af08d77eda9579756326e93",
    "edits": [
      {
        "before": ")](/assets/img/tongue.jpg)",
        "after": ")]({{ '/assets/img/tongue.jpg' | relative_url }})",
        "target": "assets/img/tongue.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2016-12-26-iot-musings.md",
    "originalBlob": "8076facbcce43fbaa207232dbf33f90956997576",
    "edits": [
      {
        "before": ")](/assets/img/farmrobotics.jpg)",
        "after": ")]({{ '/assets/img/farmrobotics.jpg' | relative_url }})",
        "target": "assets/img/farmrobotics.jpg",
        "count": 1
      },
      {
        "before": ")](/assets/img/woodencore.jpg)",
        "after": ")]({{ '/assets/img/woodencore.jpg' | relative_url }})",
        "target": "assets/img/woodencore.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2017-01-06-jenns-cafe.md",
    "originalBlob": "5b24d10e947d88244cc1f50a0aacf37a73e59446",
    "edits": [
      {
        "before": ")](/assets/img/DZ1nsPwW4AEB7gE.jpg)",
        "after": ")]({{ '/assets/img/DZ1nsPwW4AEB7gE.jpg' | relative_url }})",
        "target": "assets/img/DZ1nsPwW4AEB7gE.jpg",
        "count": 1
      },
      {
        "before": ")](/assets/img/KQnkFb.jpg)",
        "after": ")]({{ '/assets/img/KQnkFb.jpg' | relative_url }})",
        "target": "assets/img/KQnkFb.jpg",
        "count": 1
      },
      {
        "before": ")](/assets/img/yRyskp.jpg)",
        "after": ")]({{ '/assets/img/yRyskp.jpg' | relative_url }})",
        "target": "assets/img/yRyskp.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2017-01-15-brake-pads.md",
    "originalBlob": "401bf264172f75ae7bb5c4e37321ec81df748316",
    "edits": [
      {
        "before": ")](/assets/img/dirtyhands.jpg)",
        "after": ")]({{ '/assets/img/dirtyhands.jpg' | relative_url }})",
        "target": "assets/img/dirtyhands.jpg",
        "count": 1
      },
      {
        "before": ")](/assets/img/vacuum.jpg)",
        "after": ")]({{ '/assets/img/vacuum.jpg' | relative_url }})",
        "target": "assets/img/vacuum.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2017-03-14-space-stuff.md",
    "originalBlob": "aab6f4daba56ea8639784d7574058e9962e5f7bc",
    "edits": [
      {
        "before": ")](/assets/img/spaceshot2.jpg)",
        "after": ")]({{ '/assets/img/spaceshot2.jpg' | relative_url }})",
        "target": "assets/img/spaceshot2.jpg",
        "count": 1
      },
      {
        "before": ")](/assets/img/spacesnap.jpg)",
        "after": ")]({{ '/assets/img/spacesnap.jpg' | relative_url }})",
        "target": "assets/img/spacesnap.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2014-04-23-still-alive-blocky-dungeon-prototype.md",
    "originalBlob": "4441ac1367299cbda6040edfa90a6799b09ba8c4",
    "edits": [
      {
        "before": "](../wp-content/uploads/2014/04/Capture.jpg)",
        "after": "]({{ '/assets/img/blog/wp/Capture.jpg' | relative_url }})",
        "target": "assets/img/blog/wp/Capture.jpg",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2026-02-07-building-spaceview-with-claude.md",
    "originalBlob": "a9deb956e775ce0c6bbf08fa5cfdf50b40bd849a",
    "edits": [
      {
        "before": "](https://tront.xyz/SpaceView/)",
        "after": "](https://tront.xyz/spaceview/)",
        "target": "https://tront.xyz/spaceview/",
        "kind": "route",
        "count": 1
      }
    ]
  },
  {
    "path": "_posts/2026-02-07-spaceview.md",
    "originalBlob": "1e3801645c840b28b21173923d345a8e399584a0",
    "edits": [
      {
        "before": "](https://tront.xyz/SpaceView/)",
        "after": "](https://tront.xyz/spaceview/)",
        "target": "https://tront.xyz/spaceview/",
        "kind": "route",
        "count": 1
      }
    ]
  }
];
const CATEGORY_INDEX = '---\nlayout: categories\ntitle: Categories\npermalink: /categories/\n---\n';
const CATEGORY_HEADING = "\n{% unless page.collection == 'tabs' %}\n  <h1>{{ page.title }}</h1>\n{% endunless %}\n";
const CATEGORY_TRACKING = [
  [
    "{% assign sort_categories = site.categories | sort %}\n",
    "{% assign _category_index_rendered = '' | split: '' %}\n"
  ],
  [
    "  {% if category_name == first_post.categories[0] %}\n",
    "    {% assign _category_index_rendered = _category_index_rendered | push: category_name %}\n"
  ],
  [
    "            {% for sub_category in sub_categories %}\n",
    "              {% assign _category_index_rendered = _category_index_rendered | push: sub_category %}\n"
  ]
];
const CATEGORY_FALLBACK = "\n{% unless page.collection == 'tabs' %}\n  {% for category in sort_categories %}\n    {% assign category_name = category | first %}\n    {% unless _category_index_rendered contains category_name %}\n      {% assign posts_size = category | last | size %}\n      <div class=\"card categories\">\n        <div class=\"card-header d-flex justify-content-between hide-border-bottom\">\n          <span class=\"ms-2\">\n            <i class=\"far fa-folder fa-fw\"></i>\n            {% capture _category_url %}/categories/{{ category_name | slugify | url_encode }}/{% endcapture %}\n            <a href=\"{{ _category_url | relative_url }}\" class=\"mx-2\">{{ category_name }}</a>\n            <span class=\"text-muted small font-weight-light\">\n              {{ posts_size }}\n              {% if posts_size > 1 %}\n                {{ site.data.locales[lang].categories.post_measure.plural | default: site.data.locales[lang].categories.post_measure }}\n              {% else %}\n                {{ site.data.locales[lang].categories.post_measure.singular | default: site.data.locales[lang].categories.post_measure }}\n              {% endif %}\n            </span>\n          </span>\n        </div>\n      </div>\n    {% endunless %}\n  {% endfor %}\n{% endunless %}\n";
const CATEGORY_LAYOUT_BLOB = '0515097049305fba3d8eabffbf812cf209b1ad19';
const CATEGORIES = ['ai', 'devblog', 'experiments', 'hardware', 'personal', 'projects', 'tools'];
// Frozen verification evidence for the case-sensitive route repair. This is
// provenance, not a substitute for rechecking availability after deployment.
const VERIFIED_ROUTES = {
  'https://tront.xyz/spaceview/': {
    status: 200,
    checkedAt: '2026-10-13T04:29:56.771975+00:00',
    title: 'SpaceView by Tront: Free Disk Space Visualizer for Windows',
    canonical: 'https://tront.xyz/spaceview/',
    existingCtaSource: 'https://github.com/TrentSterling/trentsterling.github.io/blob/6fbe52c2926bc13e8751be2d902b38e54b2c6df1/games/index.html#L211'
  }
};

function occurrences(text, fragment) {
  return text.split(fragment).length - 1;
}

function gitBlob(text) {
  const bytes = Buffer.from(text, 'utf8');
  return crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

// Also exported for the existing preservation suite. It canonicalizes only
// this exact allowlist; it does not strip arbitrary links or article content.
function normalizePostForPreservation(relativePath, contents) {
  contents = require('../seo/archive-annotations.cjs').normalize(relativePath, contents);
  contents = require("../voice-restoration/verify.cjs").normalize(relativePath, contents);
  contents = require("../image-restoration/verify.cjs").normalize(relativePath, contents);
  const repair = REPAIRS.find(item => item.path === relativePath);
  if (!repair) return contents;
  let result = contents;
  for (const edit of repair.edits) result = result.split(edit.after).join(edit.before);
  return result;
}

function normalizeCategoryLayoutForPreservation(contents) {
  let result = contents.replace(CATEGORY_HEADING, '').replace(CATEGORY_FALLBACK, '');
  for (const [, addition] of CATEGORY_TRACKING) result = result.replace(addition, '');
  return result;
}

function verifyPost(repair, contents, baselineContents) {
  for (const edit of repair.edits) {
    assert.equal(occurrences(contents, edit.after), edit.count,
      `${repair.path}: exact repaired destination count for ${edit.target}`);
    assert.equal(occurrences(contents, edit.before), 0,
      `${repair.path}: old destination must be absent for ${edit.target}`);
  }
  const restored = normalizePostForPreservation(repair.path, contents);
  assert.equal(gitBlob(restored), repair.originalBlob,
    `${repair.path}: all surrounding bytes, including prose, captions, and image syntax, must remain unchanged`);
  if (baselineContents !== undefined) {
    assert.equal(gitBlob(baselineContents), repair.originalBlob,
      `${repair.path}: supplied baseline must match the verified original`);
    assert.equal(restored, baselineContents, `${repair.path}: exact baseline preservation`);
  }
}

function verifySources(root, options = {}) {
  const manifest = options.assetManifest
    ? new Set(JSON.parse(fs.readFileSync(options.assetManifest, 'utf8')).map(item => item.path))
    : null;
  let edits = 0;
  for (const repair of REPAIRS) {
    const contents = fs.readFileSync(path.join(root, repair.path), 'utf8');
    const baselineContents = options.baselineRoot
      ? fs.readFileSync(path.join(options.baselineRoot, repair.path), 'utf8')
      : undefined;
    verifyPost(repair, contents, baselineContents);
    for (const edit of repair.edits) {
      if (edit.kind === 'route') {
        assert.equal(VERIFIED_ROUTES[edit.target]?.status, 200,
          `${repair.path}: route must have verified provenance`);
      } else {
        assert.ok(manifest ? manifest.has(edit.target) : fs.statSync(path.join(root, edit.target)).isFile(),
          `${repair.path}: authentic destination must exist: ${edit.target}`);
      }
      edits += edit.count;
    }
  }
  assert.equal(REPAIRS.length, 18);
  assert.equal(edits, 40, '37 outer image links, one Capture.jpg destination, and two SpaceView routes');
  assert.equal(fs.readFileSync(path.join(root, 'categories/index.html'), 'utf8'), CATEGORY_INDEX);
  assert.ok(!fs.existsSync(path.join(root, '_tabs/categories.md')), 'do not add a Categories sidebar tab');
  const layout = fs.readFileSync(path.join(root, '_layouts/categories.html'), 'utf8');
  assert.equal(occurrences(layout, CATEGORY_HEADING), 1, 'one non-tab heading, no duplicated tab heading');
  assert.equal(occurrences(layout, CATEGORY_FALLBACK), 1, 'one index-only fallback for categories beyond the existing hierarchy');
  assert.ok(layout.endsWith(CATEGORY_FALLBACK), 'fallback follows the unchanged existing hierarchy');
  for (const [anchor, addition] of CATEGORY_TRACKING) {
    assert.equal(occurrences(layout, addition), 1, 'each category tracking addition appears exactly once');
    assert.equal(occurrences(layout, anchor + addition), 1, 'track exactly the links emitted by the existing hierarchy');
  }
  assert.equal(gitBlob(normalizeCategoryLayoutForPreservation(layout)), CATEGORY_LAYOUT_BLOB,
    'existing categories layout must be otherwise byte-for-byte unchanged');
  assert.equal(occurrences(layout, '{% include lang.html %}\n' + CATEGORY_HEADING), 1,
    'heading follows language initialization');
  return { baseCommit: BASE_COMMIT, posts: REPAIRS.length, urlSubstitutions: edits, categories: CATEGORIES.length };
}

function verifyBuiltSite(siteRoot, baseurl = '/blog') {
  const index = fs.readFileSync(path.join(siteRoot, 'categories/index.html'), 'utf8');
  assert.match(index, /<h1\b[^>]*>\s*Categories\s*<\/h1>/, 'categories index has a heading');
  assert.equal((index.match(/<h1\b/g) || []).length, 1, 'categories index has exactly one H1');
  for (const category of CATEGORIES) {
    assert.ok(index.includes(`href="${baseurl}/categories/${category}/"`), `index links to ${category}`);
    const child = fs.readFileSync(path.join(siteRoot, `categories/${category}/index.html`), 'utf8');
    assert.ok(child.includes(`href="${baseurl}/categories/"`), `${category} breadcrumb links to index`);
  }
  for (const repair of REPAIRS) {
    const slug = path.basename(repair.path, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    const html = fs.readFileSync(path.join(siteRoot, `posts/${slug}/index.html`), 'utf8');
    for (const edit of repair.edits) {
      const target = edit.kind === 'route' ? edit.target : `${baseurl}/${edit.target}`;
      assert.ok(occurrences(html, `href="${target}"`) >= edit.count,
        `${slug}: rendered destination for ${edit.target}`);
      const oldUrl = edit.before.slice(edit.before.indexOf('](') + 2, -1);
      assert.ok(!html.includes(`href="${oldUrl}"`), `${slug}: old href is absent`);
      if (edit.kind !== 'route') {
        assert.ok(fs.statSync(path.join(siteRoot, edit.target)).isFile(), `built image exists: ${edit.target}`);
      }
    }
  }
  return { builtPosts: REPAIRS.length, categoryBreadcrumbs: CATEGORIES.length };
}

function verifyNegativeCases(root) {
  const first = REPAIRS[0];
  const good = fs.readFileSync(path.join(root, first.path), 'utf8');
  const edit = first.edits[0];
  const cases = [
    ['changed prose', first, good, good + '\nUnexpected added prose.\n'],
    ['changed caption', first, good, good.replace('Pretty huh?', 'Different caption?')],
    ['changed image source', first, good, good.replace(`](/${edit.target})`, '](/assets/img/different-image.jpg)')],
    ['changed repaired destination', first, good, good.replace(edit.after, edit.after.replace('relative_url', 'absolute_url'))],
    ['unrepaired URL', first, good, good.replace(edit.after, edit.before)]
  ];
  const repeated = REPAIRS.find(item => item.edits.some(change => change.count === 2));
  const repeatedGood = fs.readFileSync(path.join(root, repeated.path), 'utf8');
  const duplicate = repeated.edits.find(change => change.count === 2);
  cases.push(['missing duplicate link', repeated, repeatedGood, repeatedGood.replace(duplicate.after, '')]);
  const route = REPAIRS.find(item => item.path.includes('building-spaceview-with-claude'));
  const routeGood = fs.readFileSync(path.join(root, route.path), 'utf8');
  cases.push(['wrong-case SpaceView URL', route, routeGood, routeGood.replace(route.edits[0].after, route.edits[0].before)]);
  cases.push(['changed SpaceView link label', route, routeGood, routeGood.replace('[tront.xyz/SpaceView]', '[Changed label]')]);
  for (const [name, repair, original, bad] of cases) {
    assert.notEqual(original, bad, `${name}: negative fixture must change`);
    assert.throws(() => verifyPost(repair, bad), undefined, `${name}: must be rejected`);
  }
  return cases.map(([name]) => name);
}

function cli(argv) {
  const options = {};
  const flags = new Map([
    ['--root', 'root'], ['--baseline', 'baselineRoot'],
    ['--asset-manifest', 'assetManifest'], ['--built', 'builtRoot'], ['--baseurl', 'baseurl']
  ]);
  for (let i = 0; i < argv.length; i += 2) {
    assert.ok(flags.has(argv[i]) && argv[i + 1] !== undefined, `invalid option: ${argv[i]}`);
    options[flags.get(argv[i])] = argv[i + 1];
  }
  const root = options.root || path.resolve(__dirname, '../..');
  const results = { source: verifySources(root, options), rejectedNegativeCases: verifyNegativeCases(root) };
  if (options.builtRoot) results.build = verifyBuiltSite(options.builtRoot, options.baseurl || '/blog');
  console.log(JSON.stringify(results, null, 2));
}

module.exports = { BASE_COMMIT, REPAIRS, CATEGORY_INDEX, CATEGORY_HEADING, CATEGORY_TRACKING, CATEGORY_FALLBACK,
  gitBlob, normalizePostForPreservation, normalizeCategoryLayoutForPreservation,
  verifyPost, verifySources, verifyBuiltSite, verifyNegativeCases };
if (require.main === module) cli(process.argv.slice(2));
