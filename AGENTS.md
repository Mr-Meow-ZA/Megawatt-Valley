# AGENTS.md — Megawatt Valley (Codex, active finalisation branch)

## Latest user decision — 12 October 2026 — TAKES PRECEDENCE
**Finish the existing Three.js/Electron Megawatt Valley game fully before shelving it.** Rapha cannot currently run Codex locally, so implement via remote Codex/GitHub and validate through GitHub Actions. The Unity proof and migration are **ON HOLD**. Cursor is retired permanently.

**This branch `codex/threejs-level1-final` is the ONLY active game implementation track until Level 1 is accepted.** It descends from the latest archived full game at `98cfc2c32a92321c70cfd1a1d196ec9fbe602163`. Do not touch the frozen `archive/threejs-solar-candidate-2026-10-09`, historic `codex/3d-isometric`, the `prototype/unity-visual-proof` branch, or the main planning baseline. No engine migration, no Unity work and no return to Phaser.

## Message board — REQUIRED
[**GitHub issue #20 — active Codex Level 1 finalisation board**](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/20) is the coordination source of truth, replacing the old closed PR #11 board and the parked Unity issue #19.
1. **At session start:** fetch the latest branch, read new comments on #20, then read `Docs/LEVEL1_FINALISATION_PLAN_2026-10-12.md`, `Docs/RESUME_CHECKPOINT.md`, the actual approved visual references [#12](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/12) and [#13](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13), and any new user instruction.
2. **Before consequential visual, architectural, scope or asset decisions:** check new #20 comments again. Explicit newer Rapha direction overrides earlier documents.
3. **Before session handoff:** read #20 again; post a short factual progress comment with exact head/test runs, screenshot/build links, blockers, and which board items were handled/pending. Update the checkpoint.
4. If GitHub cannot be accessed, explicitly say so rather than falsely claiming to have checked. This is **session-based**, not background monitoring.

## Non-negotiable scope and design rules
- **Finish and polish solar-only Level 1 "Here Comes the Sun"** with the existing TypeScript simulation, true-3D Three.js scene and Electron Windows distribution. Preserve version-1 saves and functional player systems.
- **Full clean-sheet UI/UX overhaul:** the October 9 seven-screen review rejected the current large pale management dashboards, generic research boxes, irrelevant icon art, huge empty contract panels and photoreal-portrait-vs-low-poly-world mismatch. **Do not iteratively reskin the rejected structure.** Start with a strong game-world HUD + solar build/compare/placement vertical slice; get visual feedback, then apply one consistent game-like design system to all screens.
- **Approved quality bar:** visually rich stylised world [issue #12](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/12), premium management-game four-anchor UI [issue #13](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13) and `Docs/References/megawatt-valley-ui-ux-approved-concept-v1.jpg`. Draw visual inspiration, not copyrighted assets, invented mechanics or copied numbers.
- **Asset first:** reuse licensed professional/community assets, adapt/kitbash next, bespoke/generative only for real gaps and after visual coherence check. Check `Docs/FREE_ASSET_RESOURCE_INDEX.md` and `Docs/ASSET_AUDIT_2026-10-09.md`; Kenney Industrial v2.0 is already vendored. Track exact licences and credits.
- Preserve economy, staff, research, repairs/cleaning, Radio Dispatch, weather/hail, road service, contract decisions, objectives, star progression, save/import/export and native persistence. Retain all currently working simulation/gameplay while rebuilding player-facing UX.
- No Level 2 implementation, wind/BESS, new engine, backend requirement, paid tooling or paid assets. Never claim a future campaign chapter is currently playable.
- No partial visual screenshots presented as completed features. **Actual running game** at 1920×1080, 1366×768 and laptop 1024×768 where applicable. Product-owner approval, not Codex's internal self-review, is the visual acceptance gate.

## Work sequence and quality gates
Follow `Docs/LEVEL1_FINALISATION_PLAN_2026-10-12.md`:
0. Baseline clean-clone test and screenshot gaps; preserve current mechanics/saves.
1. **Demonstrate one excellent integrated HUD/build/world visual slice**, report evidence to Rapha.
2. Rebuild all player-facing surfaces in the same coherent language, including objective timeline, research, staff, operations, finance/contracts, minimap, alert, main menu/settings.
3. Validate complete new-player Level 1 journey, 30–60-minute target, achievable optional 2★/3★, real player clarity, weather and recovery, tutorial and pacing.
4. Polish 3D world composition, character/vehicle activity, audio and performance.
5. Verify full Windows installer and portable build offline, screenshot and test evidence, licences, fresh-save/regression tests and final acceptance report.

A passing CI run does not equal a fun game or an approved visual design. If owner feedback is pending after Phase 1, continue safe QA and gameplay tasks without blindly copying an unapproved visual language across the whole game.

## Environment and verification
Do **not** require Rapha to install Codex, Unity or development tools locally. Use repository automation (npm ci, npm test, npm run build, browser checks and GitHub Actions Windows runner). Leave working exact-SHA evidence and a downloadable Windows artifact. Existing workflows must trigger on this branch and have branch-specific concurrency groups. Keep third-party licences in distributables and resolve import/LFS issues before declaring success.

## Branch management
- Work in this dedicated branch with small verifiable commits; use draft PR **against the frozen old archive only for diff/review**, and **never merge into the frozen archive or clean Unity-planning main**.
- No force-push or deletion of historical branches.
- When Rapha accepts finished Level 1, create a **new final snapshot/archive branch**; only after this should Unity issue #19 become active.
