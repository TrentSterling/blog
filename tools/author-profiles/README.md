# Post author profiles

The visible post byline and existing Jekyll SEO tag share one resolver. Post authors may be a data key, literal name, inline name/URL map, or an ordered list. `author` takes precedence over `authors`; the configured site author is used only when neither is present. Unknown names and authors without a complete HTTP(S) URL remain visible plain text. URLs and entity IDs are explicit metadata, never inferred from a name.

The default profile links to `https://tront.xyz/` and uses the established Person ID `https://tront.xyz/#trent-sterling`. The original visible name and existing structured name are retained. Guest authors never inherit the default URL or ID.

`_plugins/author_profiles.rb` extends only the author method of the existing `jekyll-seo-tag` JSON-LD drop for actual `posts` using the `post` layout. It does not copy the SEO template, add a second Article, add ProfilePage markup, or change other metadata fields. Non-post pages remain unchanged. The actual generator is exercised in fixtures, so an upstream API change fails the build rather than silently dropping author metadata.

Checks:

- `bundle exec ruby tools/author-profiles/test.rb`: real post-layout/Jekyll SEO fixtures for default, keyed, scalar, inline, ordered list, no-URL, escaped and unsafe URL cases.
- `bundle exec ruby tools/author-profiles/check_built.rb _site/blog`: verify generated author links and existing Article nodes.
- Pass a second built baseline directory to additionally compare all HTML route/body/metadata output. This bounded comparison permits only the new byline and author ID, plus independently generated non-post timestamps.
- `node tools/author-profiles/browser.cjs`: actual keyboard traversal, visible focus, underlines, contrast and overflow at 390px/1440px in light/dark. CI uses official Chrome; `THEME_BROWSER_ENGINE` and `THEME_BROWSER_EXECUTABLE` can select another installed engine for additional checks.

The exact source hashes in `reviewed.json` keep historical content-preservation checks strict while permitting this small reviewed template/config/plugin change. Original articles, collaborative credits, dates and media are not edited.
