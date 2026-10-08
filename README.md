# Megawatt Valley

**Megawatt Valley** is a characterful, stylised 3D renewable-energy management/tycoon game. The first playable campaign is **Solar — Level 1: Here Comes the Sun**.

> **Development transition (8 October 2026):** The current preferred candidate is the Three.js + Electron desktop build in [draft PR #11](https://github.com/Mr-Meow-ZA/Megawatt-Valley/pull/11). This candidate has **not merged into main**. Main still contains the earlier Phaser implementation. This README describes the *target direction*, not a claim that main already runs it.

## Start here
- [Active development direction](Docs/ACTIVE_DEVELOPMENT.md) — product decisions, scope, architecture candidate and immediate acceptance goal.
- [Repository cleanup plan](Docs/REPOSITORY_CLEANUP_PLAN.md) — archival and migration sequence.
- [Visual quality and world character](Docs/VISUAL_QUALITY_AND_WORLD_CHARACTER.md) — approved aesthetic; see §15.
- [Chronological ChatGPT reviews](Docs/CHATGPT_REVIEW.md) — most recent decisions supersede older ones.
- [Historical archive index](Docs/Archive/README.md).

## Current development
- **Active candidate:** [PR #11 — Three.js/Electron desktop 3D](https://github.com/Mr-Meow-ZA/Megawatt-Valley/pull/11), branch `codex/3d-isometric`.
- **Visual reference:** [issue #13](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13).
- **Next milestone:** validate and playtest the clean-sheet UI across HUD, solar build/compare, staff and research, then confirm the canonical stack.
- **Core loop:** develop → finance → build → operate → improve → expand.
- **Rule:** solar and wind are never mixed in the same level.

## Historical implementation
The earlier Phaser browser-first code and instructions remain on main until a reviewed migration is approved. Unity is preserved in `archive/unity-prototype-2026-09-29`. A pre-rebaseline main snapshot is preserved in `archive/pre-3d-rebaseline-2026-10-08`.

Do **not** follow the old Phaser-specific build specifications for new 3D work, and do not merge the competing implementation PRs wholesale. For running/testing the 3D candidate, follow the instructions and workflow artifacts on PR #11.

## Collaboration
Codex handles the active 3D implementation and validation; ChatGPT supports product review and documentation; Rapha decides major gameplay, visual and architecture acceptance. No extra paid tooling without explicit approval.
