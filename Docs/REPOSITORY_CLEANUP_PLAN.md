# Repository cleanup and archival plan
**Prepared 8 October 2026 — non-destructive first pass**

## Safeguards already established
- `archive/pre-3d-rebaseline-2026-10-08` preserves main before the cleanup.
- `archive/unity-prototype-2026-09-29` preserves Unity history.
- `chore/3d-project-rebaseline` contains this proposed documentation cleanup.
- Do not delete source, force-push, change the default branch or close draft PRs without a verified disposition.

## Proposed post-acceptance repository structure
```
README.md                     # what game is, current runnable build, developer quickstart
Docs/
  ACTIVE_DEVELOPMENT.md       # authoritative current scope, decisions, gates
  CURRENT_STATUS.md           # verified runtime status, exact commit/build
  ROADMAP.md                  # solar Level 1 -> acceptance -> later levels
  TECHNICAL_ARCHITECTURE.md   # accepted Three.js/Electron architecture
  VISUAL_QUALITY_AND_WORLD_CHARACTER.md
  CHATGPT_REVIEW.md           # chronological review/decisions
  ACTIVITY_LOG.md             # current entries; historic logs linked
  References/                # approved source artwork when uploaded
  Archive/
    README.md
    PHASER_ERA_INDEX.md
    UNITY_ERA_INDEX.md
```

## Document triage
**Keep and refresh:** README, CURRENT_STATUS, ROADMAP, TECHNICAL_ARCHITECTURE, visual-quality direction, CHATGPT_REVIEW, active desktop UX/Concept implementation documents.

**Retain as historical:** CURSOR_PRIMARY_BUILD_SPEC, VISUAL_DIRECTION if Phaser-specific, Unity-era SESSION_GOALS, pre-3D activity entries, obsolete Phaser plans. Prefer a clear Archive index and Git history over bulk copying or deleting.

**Branch/PR triage:** PR #11 remains the live desktop candidate. Evaluate #7/#8/#10 for uniquely useful changes; record any transfers, then close as superseded only after confirmation. No blind cross-stack merges.

**Issues:** keep #13 as visual reference and active 3D blockers; mark superseded Phaser/Unity issues with explanation after reviewing individually. Do not close issues merely because they are old.

## Acceptance sequence
1. Validate PR #11 at its latest SHA and review screenshots/playtest.
2. Decide which implementation becomes canonical.
3. Create a targeted migration PR to main; avoid importing obsolete Phaser implementation by accident.
4. Rewrite main README/status/architecture/roadmap to match the accepted stack.
5. Move or index historical documents, adjust workflows and build instructions, then triage superseded PRs/issues.
6. Confirm clean clone/build, CI and Windows packaging on the new canonical main.

## Current caveat
Main still runs the Phaser-era documentation and PR #11 is open/draft. This proposal intentionally does **not** falsely mark the Three.js build as merged.
