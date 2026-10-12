# Current development priority — finish Three.js Level 1 before shelve (12 October 2026)

## Product-owner update
Rapha cannot use Codex locally and wants Codex to **finish the CURRENT Three.js/Electron Megawatt Valley game before shelving this version**. This overrides the prior 9 October instruction to stop Three.js immediately and begin Unity testing. **Unity is on hold, not abandoned.**

## Work location and coordination
- Code / screenshots / downloadable Windows builds: branch [`codex/threejs-level1-final`](https://github.com/Mr-Meow-ZA/Megawatt-Valley/tree/codex/threejs-level1-final).
- Active issue board: [#20](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/20).
- Coding rules: root `AGENTS.md` and new branch's `AGENTS.md`; full brief on that branch in `Docs/LEVEL1_FINALISATION_PLAN_2026-10-12.md`.
- `main` is only a coordination/documentation baseline. Don't try to run the Three.js game from main, and don't merge the finishing branch into main without explicit direction.
- The frozen starting version remains on [`archive/threejs-solar-candidate-2026-10-09`](https://github.com/Mr-Meow-ZA/Megawatt-Valley/tree/archive/threejs-solar-candidate-2026-10-09). Do not alter it.

## Definition of completed current version
A visually coherent actual Three.js game (world + HUD/build + people + research + operations + finances/contracts + goals + map/settings) substantially closer to visual references [#12](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/12) and [#13](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13) than the rejected 9 October screenshots. Real, clear onboarding and roughly 30–60 minutes to 1★, meaningful optional 2★/3★, working mechanics and recoverability, pleasant audio/feedback and purposeful 3D staff/vehicles. Native offline Windows portable ZIP + installer and evidence of exact build/tests, licences, saves, performance and visual/product acceptance.

## Next stage, after sign-off
Make a new immutable **final** Three.js release/archive, then reopen the timeboxed Unity visual-quality experiment as the next engine decision. No automatic engine migration.

**Status:** branch and board established; Codex has not yet delivered the overhaul or final release.
