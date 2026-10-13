# Blog ColorMagic integration

The blog keeps Chirpy 7.2.4, its sidebar, card geometry, gradient heading accents, glass cards and code-syntax roles. Its reading canvas now uses the editor’s bounded four-stop wash, sized to the viewport so all stops remain visible. Panel frost controls opacity and blur on cards/sidebar/topbar. Heading gradients retain all four stops and the selected angle, with an independently contrast-bounded foreground ramp. The shared editor supplies four peg colors and contrast-bounded tokens; it does not impose the homepage grid or Games' circular glows. The shared primary navbar is independent of article/sidebar navigation.

Post files, URLs, metadata, config, Gemfile and body layout remain unchanged. The bridge maps Chirpy CSS variables and synchronizes its session mode for existing comments/diagrams. Missing lazy comment frames are harmless. Main-site and blog choices share `tront-theme-editor-v1`; Games keeps its own preference.

## Checks

- `BLOG_BASELINE_ROOT=<base checkout> node --test tools/theme-review/test.cjs`: token bridge/state and protected-source contracts.
- Existing duplicate post URL and generated search metadata checks run with the normal Jekyll build.
- `node tools/theme-review/browser.cjs`: Playwright/Chrome on the locally built `_site/blog`, with the base separately built in `_baseline/blog`. It compares original and themed desktop/mobile reading geometry, typography, card materials and heading gradients, then covers six palettes, posts/inline code, 404, pagination, About/Discord tabs, archives, tags and categories; six-palette contrast including prose hover, keyboard focus, 320/360/390/768px layouts, persistence, search Cancel/navigation and sidebar behavior.

CI uses read-only access and no deployment. Shared main-site assets are checked out at an exact tested commit and served at their real same-origin root paths. Main-site assets must be deployed before releasing the blog integration. Review the before/after screenshots; passing contrast alone is not proof of preserving the blog's visual character.


## Visible control regression coverage

`control-effects.cjs` tests the actual editor against page screenshots with the dialog closed, at desktop/mobile widths in dark/light mode. Every color, position, angle, intensity and frost control must change intended blog pixels and computed paint properties without moving content. Palette, appearance, ColorMagic, Undo/Reset, persistence and navigation are also exercised. Baseline screenshots document the former disconnected effects; pixel metrics and individual before/after screenshots are saved with CI artifacts. The existing first-paint, accessibility, contrast, geometry and content-preservation checks still run.
