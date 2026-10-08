# Resume checkpoint — 8 October 2026

## Read first
1. CODEX_UI_UX_READ_FIRST.md
2. VISUAL_QUALITY_AND_WORLD_CHARACTER.md §15
3. Latest product decision in CHATGPT_REVIEW.md
4. CONCEPT_V1_IMPLEMENTATION.md

Rapha approved the 3D foundation and rejected the old UI design. Build the interface clean-sheet. Old src/ui/tycoon is scaffolding only. The concept JPG was absent at the specified main-branch path when checked; recheck before final review.

## Durable baseline
Branch codex/3d-isometric, draft PR #11. Last verified runtime cda9c376a061a52481533f4ac421ddbdac1c55a0.
77 tests, compilation, full UI/gesture regression and packaged Windows save/resume passed.
Windows https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/runs/37689028537
Screenshots https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/runs/37689028523

The final 7 October shoreline/selection-occlusion/fence-regression follow-up was interrupted before a branch commit. It is NOT in this baseline. Do not assume those draft edits were published.

## Current work
Read product direction and inspected simulation data. Implement a separate src/ui/studio system with four anchor experiences plus all existing management actions. Use real cash/time research, modeled solar output and actual staff data; no fabricated mockup values. Preserve renderer, simulation and save schema.

Next: implement tokens/primitives/adapters, original HUD/procurement/staff/research, connect actions; update UI and desktop regressions; run workflow tests; inspect screenshots. Record exact tested commit and residual gaps here before finishing.

## Working protocol
“Proceed/resume/keep working” means advance toward the approved target without routine questions. Periodically compare actual captures against the direction. Make focused commits and update this checkpoint at milestones; do not wait for a usage limit. Check branch/workflow state before retrying interrupted writes. Existing Unity history must remain untouched.

Tools currently provide GitHub access, not a local shell. Use GitHub Actions for builds/tests/screenshots. Platform approvals remain outside project control. Batch coherent edits. Keep draft PR open; do not merge unrelated development histories.
