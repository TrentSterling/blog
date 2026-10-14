# Archival wording restoration

Restores source-backed prose and credits in 15 altered historical posts, and
reintroduces the original posts separately from the intact, explicitly labeled
2025 expansions in Magic Archer and Jenn’s Cafe. Publication dates are unchanged.
The two original Box2D/Nape corrections retain their original strike-through.
MQTT restores documentation and reference links without changing executable code
or replacing safe credential placeholders.

Each manifest record links the authentic original, pins the complete pre-change
article, and pins the reviewed final SHA-256. Removed unmarked retrospective text
remains in the pinned baseline and Git history; omission from the original is not
proof that a later claim is false. No source-unverified claim is promoted to an
original author statement. The labeled Dynamite Max and Voxel Blocky Dungeon
retrospectives are untouched.

## Checks

- `node tools/voice-restoration/verify.cjs`: exact reviewed bytes, reversible
  baseline, preserved media and dates, unchanged MQTT executable code, intact
  2025 expansions, and rejection of unexpected edits.
- Existing image restoration checks still verify all 30 recovered assets by
  exact archived hash and figure markup; existing 40 link repairs remain checked.
- The source preservation suite normalizes only a complete post matching its
  reviewed final hash. Arbitrary added/changed prose cannot pass normalization.
- `browser.cjs`, invoked by the existing Chrome suite, checks source-backed
  wording in all 17 rendered posts, one main heading, mobile overflow, original
  strike-throughs, and absence of the specific contradicted claims.
- Existing browser link checks retain canonical/navigation/repaired-link/media
  tests. For the narrowly allowlisted restoration posts, approved text and
  description changes are checked by the dedicated source and rendered suite.

Dates, unverified later-commentary facts, external historical link availability,
and duplicate-post consolidation remain separate questions.
