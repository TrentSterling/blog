# Historical image restoration

This change restores 30 omitted images to 11 existing articles using the original WordPress and Wintersmith archives. It changes no article prose, publication dates, descriptions, existing links, theme code, or navigation.

`manifest.json` records each source article and image URL, exact SHA-256, dimensions, size, original alt text, original relative image order, destination, and exact inserted markup. Full-resolution originals are preferred. The LD31 and one Rebooting ME image use the available archived derivatives. Existing renamed Rotorz and Jenn's Cafe images were compared by hash and are not duplicated.

Original text interleaving cannot be reconstructed where a migrated article was abridged. Rebooting ME's first recovered image precedes its retained image, while the remaining images follow the existing prose in their original relative order. The other recovered images occupy the closest retained original paragraph or section. Only the original Rotorz collider caption is added; no captions are invented.

The broad source audit also found an unreferenced Planet Jumper image already in the repository, an equivalent Bomberman PNG/JPG, and one screenshot belonging to an absent Voxel Bomberman article. These require separate editorial reconciliation; they are not inserted into unrelated articles. Canonical Voxel Project Updates retains all its original images despite an abridged duplicate. Missing videos and prose are outside this image-only change.

## Verification

- `node tools/image-restoration/verify.cjs` checks exact original image bytes, a single insertion per image, original order, and pinned before/after article hashes. Removing only the declared insertions must recover every baseline article byte.
- `BLOG_BASELINE_ROOT=<baseline checkout> node --test tools/theme-review/test.cjs tools/theme-review/heading.test.cjs` retains the theme and protected-content regression suite, including negative tests rejecting altered images, prose, captions and destinations.
- The existing Chrome CI also runs `tools/image-restoration/browser.cjs` on built pages at 320, 390 and 1440 pixels. Each restored image must decode at the expected natural dimensions, fit its viewport, preserve the source alt text and caption, link to the recovered original, and match the declared bytes.
- After Pages deployment, the same real-browser checks run against the public release and publish screenshots plus a hash/dimension report as the `published-image-proof` Actions artifact.

This does not claim that every inaccessible historical source has been discovered. The image manifest describes the exact restoration scope and is separate from the full archival content audit.
