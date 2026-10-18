# Author, About and navigation metadata

The visible post byline and existing Jekyll SEO tag share one resolver. Post authors may be a data key, literal name, inline name/URL map, or an ordered list. `author` takes precedence over `authors`; the configured site author is used only when neither is present. Unknown names and authors without a complete HTTP(S) URL remain visible plain text. URLs and entity IDs are explicit metadata, never inferred from a name.

The default profile links to `https://tront.xyz/` and uses the established Person ID `https://tront.xyz/#trent-sterling`. The original visible name and existing structured name are retained. Guest authors never inherit the default URL or ID.

`_plugins/author_profiles.rb` extends only the author method of the existing `jekyll-seo-tag` JSON-LD drop for actual `posts` using the `post` layout. It does not copy the SEO template or add a second Article. The genuine About tab has the tightly scoped profile exception described below; Archives, Tags and Discord have the separate date-only exception below. All other non-post pages remain unchanged. The actual generator is exercised in fixtures, so an upstream API change fails the build rather than silently dropping author metadata.

Checks:

- `bundle exec ruby tools/author-profiles/test.rb`: real post-layout/Jekyll SEO author fixtures plus actual About and navigation source fixtures, negative controls and isolated navigation guards.
- `bundle exec ruby tools/author-profiles/check_built.rb _site/blog`: verify generated author links, existing Article nodes, the About profile and all three undated navigation routes.
- Pass a second built baseline directory to compare every HTML route/body/metadata output. Only the exact navigation type/date/article fields may change from the released baseline; older reviewed byline/author ID and About transitions remain supported. Other non-post generated date values may vary, but their presence and all other metadata are preserved. Passing the candidate directory twice checks candidate-as-base behavior.
- `node tools/author-profiles/browser.cjs`: actual keyboard traversal, visible focus, underlines, contrast and overflow at 390px/1440px in light/dark. CI uses official Chrome; `THEME_BROWSER_ENGINE` and `THEME_BROWSER_EXECUTABLE` can select another installed engine for additional checks.

The exact source hashes in `reviewed.json` keep historical content-preservation checks strict while permitting this small reviewed template/config/plugin change. Original articles, collaborative credits, dates and media are not edited.

## About profile opt-in

Only `_tabs/about.md`, in the `tabs` collection with the `page` layout and `/about/` URL, opts into `seo.type: ProfilePage`. The existing SEO tag remains the only schema owner. Its JSON-LD drop adds the distinct page ID `https://tront.xyz/blog/about/#profile-page`; `mainEntity` and `author` share the configured canonical Person, `https://tront.xyz/#trent-sterling`.

Jekyll assigns an unproven build-time date to tabs. The About SEO drop exception omits publication/modification timestamps from both JSON-LD and Open Graph; the upstream template consequently uses `og:type=website`. No profile creation date is invented. Original article dates retain their existing behavior. The About body, credits, links and styles are unchanged.

The real Jekyll fixtures exercise the actual About source plus missing-opt-in, path, collection, layout, URL, and ordinary-page negative controls. Generated-output checks require exactly one ProfilePage at the canonical About route, one matching Person, no invented dates, and otherwise unchanged bodies/metadata. Source preservation uses exact hashes for this front-matter and plugin transition, including a candidate-as-base check before review.

## Three navigation tab opt-ins

Archives and Tags declare `seo.type: CollectionPage`; Discord declares `seo.type: WebPage`. Date suppression requires the `tabs` collection plus the exact source path, layout, URL and type for each route. This reuses the existing SEO drop and upstream template: JSON-LD changes only type and removes `datePublished`, `dateModified` and the article `mainEntityOfPage`; Open Graph changes to `website` and loses its article timestamps. No entity, author, template, link, visible content or style is added.

Each actual tab source is rendered through Jekyll, alongside missing-opt-in, wrong path/collection/layout/URL/type and ordinary-page/post controls that retain publication and modification dates. Isolated guard checks ensure the collection condition cannot be masked by a different source path. The generated comparison covers all 420 current HTML routes and 182 posts against the released output and candidate-as-base; these counts can grow with future content without weakening route-inventory parity. Exact source hashes permit only the reviewed three front-matter additions and plugin transition.
