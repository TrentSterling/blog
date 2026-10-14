# Authentic article thumbnails

The first repair batch replaces the unrelated planet-jumper icon on Godgame Village, ORCFLOW and GameDev Vlogs 1–9. The vlog JPEGs are the exact original YouTube thumbnails for the video IDs already embedded in those articles. Godgame and ORCFLOW use fresh screenshots of their public games in isolated Chrome contexts on October 14, 2026. These are actual browser renders, not generated illustrations.

The second batch restores seven exact original WordPress featured images, recovered through each archived article's `og:image`: SketchFab Test, Hunger Games, both PlayMaker demos, both Just Cause 2 videos, and VaultScript. The existing identical VaultScript asset is reused. This batch changes only the thumbnail field; the article body and its historical video state are preserved.

All 182 article entries were reviewed visually. All 176 populated thumbnail URLs responded successfully; six articles already have no thumbnail. Eighteen of the 19 planet-jumper references were unrelated. The remaining reference on **Android Game Dev and Free Art** is authentic: its current `icon.jpg` exactly matches the original June 2014 featured image, SHA-256 `cf847069238854b0c1070fdf795706db18b374cfe2e73fd46369ea9495d18d5a`.

`manifest.json` records the source URL or capture receipt, exact image hashes, and each single frontmatter replacement. The verifier pins complete article hashes and reverses only the approved image field; it rejects changed titles, descriptions, prose, or unrelated media. The existing date checks remain in force. Existing historical content, embed IDs, URLs and publication dates are unchanged.

Run `node tools/article-thumbnails/verify.cjs` for this batch and the existing theme/content suite with `BLOG_BASELINE_ROOT` pointing to the comparison checkout.
