# Authentic article thumbnails

The first repair batch replaces the unrelated planet-jumper icon on Godgame Village, ORCFLOW and GameDev Vlogs 1–9. The vlog JPEGs are the exact original YouTube thumbnails for the video IDs already embedded in those articles. Godgame and ORCFLOW use fresh screenshots of their public games in isolated Chrome contexts on October 14, 2026. These are actual browser renders, not generated illustrations.

`manifest.json` records the source URL or capture receipt, exact image hashes, and each single frontmatter replacement. The verifier pins complete article hashes and reverses only the approved image field; it rejects changed titles, descriptions, prose, or unrelated media. The existing date checks remain in force. Existing historical content, embed IDs, URLs and publication dates are unchanged.

Run `node tools/article-thumbnails/verify.cjs` for this batch and the existing theme/content suite with `BLOG_BASELINE_ROOT` pointing to the comparison checkout.
