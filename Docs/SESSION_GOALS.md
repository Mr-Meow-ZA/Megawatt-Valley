# Active session goals — true-3D desktop
Updated 9 October 2026. This is **not** the old Unity or Phaser roadmap.

## Immediate goal: verify current candidate and clean the active tree
1. Read latest [PR #11 Conversation](https://github.com/Mr-Meow-ZA/Megawatt-Valley/pull/11) messages and `Docs/RESUME_CHECKPOINT.md`.
2. Run tests/build/3D browser and Windows desktop verification on the exact latest 3D commit.
3. Inspect and document actual screenshots and an independent Level 1 playtest; distinguish automated checks from human acceptance.
4. Validate [3D cleanup branch](https://github.com/Mr-Meow-ZA/Megawatt-Valley/tree/cleanup/true-3d-only-2026-10-09) against the current candidate. No destructive merge if dependencies/tests break.
5. Inventory imports of old `src/game`, `src/main-2d.ts`, `src/ui/tycoon`, `src/ui/DomHud.ts` and Phaser package/lock before deleting them. Delete only once unused and tested.
6. Update checkpoint with verified SHA, exact links, screenshot findings and blockers.

## Following goal (after acceptance)
Review free licensed models (especially Kenney Industrial v2.0 solar) in one non-destructive proof-of-fit, then progress gameplay onboarding/pacing, performance and Windows release quality.

## Guardrails
True-3D Three.js/Electron; solar-only Level 1; approved Concept v1; no new engine, Level 2, wind or broad UI rework without explicit decision. PR #11 remains draft until product-owner acceptance. Never treat CI success as a complete player playtest.
