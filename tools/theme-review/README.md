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

## Mobile sidebar focus

`node tools/theme-review/sidebar-focus.cjs` runs a separate focused browser check
against `_site/blog` (override `BLOG_SITE_ROOT`, `BLOG_SCREENSHOTS`, and
`THEME_BROWSER_EXECUTABLE` as needed). CI gives it its own 180-second budget;
the existing full theme suite keeps its original 600-second budget.

The adapter in `assets/js/sidebar-focus.js` follows Chirpy's existing
`body[sidebar-display]` state and 850px breakpoint. It marks only the closed
mobile sidebar inert. Keyboard opening enters its first link; closing returns
focus to Menu. Escape uses Chirpy's existing toggle handler, so its private
state and mask remain synchronized. An open theme dialog retains Escape.
Desktop resizing preserves a focused sidebar link and clears the mobile mask;
focus only moves on resize when the currently focused sidebar/control becomes
hidden. No sidebar links, CSS, article content, theme controls or desktop tab
order are replaced.

The browser regression covers home, a real post and Tags in normal/reduced
motion: initial forward/reverse Tab order, all open-sidebar links, programmatic
focus exclusion while inert, repeated trigger/mask/Escape closure, modal Escape
priority, 849/850px boundary changes with focus inside/outside, and
320/390/768/849/850/1440px states. JSON results and screenshots are retained in
`.local/sidebar-review` by CI. Pointer opening does not explicitly move focus;
browsers that focus a clicked button use the same entry point as keyboard
activation, while Safari/WebKit's non-focusing pointer behavior is preserved.
