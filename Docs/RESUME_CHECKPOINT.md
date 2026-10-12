# Resume checkpoint — 12 October 2026

## ACTIVE user decision (supersedes 9 October engine switch)
Rapha cannot currently run Codex on his PC. **Codex must FINISH the existing Three.js/Electron Megawatt Valley game, overhaul the full UI/UX, complete solar-only Level 1, create a polished offline Windows build, and only then shelve this version.** Unity is **ON HOLD**. Cursor is retired. Do not resume Unity from issue #19 or start a second game while this priority is open.

**Actual working branch:** `codex/threejs-level1-final` from frozen 3D archive SHA `98cfc2c32a92321c70cfd1a1d196ec9fbe602163`. Do not write to the archive or old `codex/3d-isometric`. Main holds engine planning docs and is not the game runtime.

**Coordination:** [Active Codex issue #20](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/20), check every session start, before major choices and at handoff. Follow `AGENTS.md` and `Docs/LEVEL1_FINALISATION_PLAN_2026-10-12.md`.

## Last previously VERIFIED playable runtime (historical, not fresh validation)
- Tested exact gameplay SHA: `3b7be5eca6b8a1a2dcfb46be90dbffa8e24d5d30`; then additional documentation/provenance edits through frozen archive commit `98cfc2c...`.
- [True 3D gameplay/browser workflow — success](https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/runs/37899566843), 81 data/simulation tests, browser interactions, screenshot capture.
- [Native Windows desktop workflow — success](https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/runs/37899566882), launch/save/import/fullscreen/close/resume/corrupt-primary recovery; installer + portable artifact.
- These are **not** evidence that new finalisation branch has already passed or that visuals/playtest were approved. Re-run exact new HEAD once CI branch triggers are in place.

## Existing game content to preserve
True-3D world, simulation, equipment/cash/export, roads/connected service access, work orders, staffing and training, research, maintenance/cleaning, contracts, weather/hail, objective/star systems and version-1 persistence/Windows builds.

## What was rejected on 9 October
Rapha's actual screenshots of Goals, Research, Staff, Contracts, Objective/next-action, Minimap and bottom navigation look like a cheap work app. Giant pale forms, empty white space, thin research boxes, photoreal Tess versus coarse low-poly world, disconnected generated icon art, sparse/undetailed solar park. They are **NOT** a design baseline for future reskins. Rebuild all player-facing UI with a coherent game visual language, richly arranged 3D world, and working interactions. Compare explicitly to [world issue #12](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/12) and [UI issue #13](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13). Reference image is `Docs/References/megawatt-valley-ui-ux-approved-concept-v1.jpg`.

## Smallest next useful step for Codex
1. Read all new #20 messages and check **current working HEAD**, not old PR #11.
2. Verify CI/build/browser/native workflow runs on `codex/threejs-level1-final`. Correct failures including LFS and window visibility, record exact evidence.
3. Prepare a focused real-screenshot/UI quality audit and a sourced-asset / world art plan.
4. Implement one strong game-quality **world + main HUD + solar build/placement** slice and post raw runtime comparisons for Rapha's feedback.
5. Continue safe Level 1 testing and onboarding/pacing investigation while awaiting visual approval; **do not** propagate an unapproved design to all screens.

## Roadmap after accepted visual slice
Rebuild People, Research, Operations, Company/Contracts, Goals, Minimap/site views, HUD/events/settings/help; complete first-time solar gameplay, 1★ in 30–60 min, 2★/3★, realistic staff progression/repair/cleaning/research/weather, recovery paths, sound and game-feel; performance/accessibility; final documented native Windows installer/portable build. Require Rapha's approval before calling Level 1 complete or shelving.

## Relevant technical caution
Kenney Industrial **v2.0 is already bundled**; model templates exist though main equipment is currently code-built. Avoid duplicate downloads; do a controlled asset swap and performance/visual check. Old Phaser source still enters via SITE_ICONS and related imports; never remove the dependency blindly. Old .cursor rules have been removed on this new branch; Codex-native `AGENTS.md` is authoritative. No paid dependencies or engine migration.
