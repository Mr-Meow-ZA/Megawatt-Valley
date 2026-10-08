# Megawatt Valley — Active Development Direction
**Rebaseline proposed: 8 October 2026**

## Product
A characterful, polished, approachable renewable-energy management/tycoon game inspired by the quality and clarity of leading management games. The first playable campaign is **Solar — Level 1: Here Comes the Sun**. Solar and wind are **never mixed in the same level**.

## Current candidate
- **True-3D Three.js + Electron desktop** implementation: draft PR #11, branch `codex/3d-isometric`.
- The 3D foundation has product-owner approval as a **minimum** visual baseline, not final art acceptance.
- Old UI was explicitly rejected. The clean-sheet Concept v1 is the UI target, with four anchors: gameplay HUD, solar construction/comparison, staff management/character profile, and research.
- Reference: GitHub issue #13 and `Docs/VISUAL_QUALITY_AND_WORLD_CHARACTER.md` §15.
- Staff and research mockups in the ChatGPT conversation are further design exploration; do not claim they are repository-approved until explicitly recorded.

## Technology and ownership
Three.js world + Electron Windows desktop + TypeScript and the new `src/ui/studio` UI are the **current candidate architecture**, subject to acceptance of PR #11. Existing simulation/save compatibility should be retained and verified. Codex may implement/harden PR #11; Rapha decides visual/gameplay acceptance. Do not merge competing Phaser branches into it wholesale.

## Immediate milestone: validate Concept v1
1. Verify latest PR #11 head: tests, build, UI regression and Windows save/resume.
2. Inspect actual four anchor screens at 1920×1080 and 1366×768 against approved visual reference.
3. Validate build/compare/place/cancel, staff hire/assignment/training, research prerequisites, operations, contracts and save/reopen.
4. Fix observed defects, improve character and world readability, then request product-owner playtest.
5. Once accepted, choose canonical branch/stack and update main technical architecture, roadmap, status and README in one controlled merge.

## Non-goals for this milestone
No wind or mixed-energy level; no BESS/scenario 2; no feature sprawl; no premature branch merges; no treating mockups as proof of runtime quality.

## Historic material
- Unity source is preserved at `archive/unity-prototype-2026-09-29`.
- Main's earlier Phaser-era state is preserved at `archive/pre-3d-rebaseline-2026-10-08`.
- Older `Docs/SESSION_GOALS.md`, Phaser architecture/spec and old activity entries are **historical**, not current instructions.
- `Docs/CHATGPT_REVIEW.md` is a chronological decision/review record. Read its most recent dated product decisions.
- Draft PRs #7, #8 and #10 represent prior/competing implementation tracks and must be triaged, not blindly merged or deleted.

## Decision gates
**Do not rewrite main as if PR #11 has merged.** This document is the approved-direction proposal; implementation status must distinguish merged main from draft desktop candidate.
