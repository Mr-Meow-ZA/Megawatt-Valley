# Megawatt Valley — Three.js Level 1 finalisation

**ACTIVE DEVELOPMENT — 12 October 2026:** Finish the existing **true-3D Three.js / TypeScript / Electron** solar management game before shelving it. **Codex is the only coding agent.** Rapha cannot currently run Codex locally; Codex should use cloud/GitHub development and CI to build and test. **Unity is ON HOLD** until the complete first level is approved.

## Active links
- **Implementation branch:** [`codex/threejs-level1-final`](https://github.com/Mr-Meow-ZA/Megawatt-Valley/tree/codex/threejs-level1-final).
- **LIVE Codex message board:** [issue #20](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/20) — check at the start/end of each development session.
- **Mandatory agent rules:** [`AGENTS.md`](AGENTS.md).
- **Detailed full-finish brief:** [`Docs/LEVEL1_FINALISATION_PLAN_2026-10-12.md`](Docs/LEVEL1_FINALISATION_PLAN_2026-10-12.md).
- **Latest progress and build evidence:** [`Docs/RESUME_CHECKPOINT.md`](Docs/RESUME_CHECKPOINT.md).
- **Accepted visual targets:** [world issue #12](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/12); [four-screen management-game UI issue #13](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13).
- **Free resource index:** [`Docs/FREE_ASSET_RESOURCE_INDEX.md`](Docs/FREE_ASSET_RESOURCE_INDEX.md).

## First level
**Here Comes the Sun:** start a solar business, buy and place solar arrays, manage export/inverters and cash, develop roads/workshop/second site, recruit/train/direct staff, repair/clean/maintain, research upgrades, accept optional supply contracts and handle weather/hail. Win 1★ in a target **30–60-minute first playthrough**, with optional meaningful 2★ / 3★ mastery.

No wind technology, energy storage gameplay or playable Scenario 2 in this release.

## What must change
The existing UI, as shown in seven screenshots on 9 October 2026, was rejected. Its giant pale text/card dialogs, thin research tree, empty contracts screen, low-effort minimap and art-style mismatch feel like cheap office software. It is **functional scaffolding, NOT an approved design**.

Finish a visually coherent 3D solar valley and rework the ENTIRE player-facing UI, using the premium tycoon composition and art direction of #12/#13 rather than merely reskinning old cards. **Do not throw away the working simulation or save system.**

## Working locally (for Codex cloud runner; NOT a requirement for Rapha)
```sh
npm ci
npm test
npm run build
npm run dev
```
Git LFS is required for some 3D models and art; GitHub Actions performs LFS checkout, full browser UI/game checks, screenshots, and native Windows build/save/recovery tests. Codex must adapt and monitor the workflows for this branch. The exact commit must pass before it can be described as tested.

## Preserved history / other plans
- **Frozen starting archive:** [`archive/threejs-solar-candidate-2026-10-09`](https://github.com/Mr-Meow-ZA/Megawatt-Valley/tree/archive/threejs-solar-candidate-2026-10-09), SHA `98cfc2c32a92321c70cfd1a1d196ec9fbe602163`. **Never alter it.**
- The old `codex/3d-isometric` work branch and closed PR #11 are historical, and previous Unity/Phaser projects are archived.
- [`main`](https://github.com/Mr-Meow-ZA/Megawatt-Valley) holds engine-decision documentation, not this game's runtime. Do not merge this work into `main` without an explicit new decision.
- [Unity visual proof issue #19](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/19) is **parked**, not cancelled. Restart only after Rapha approves a complete Three.js Level 1 and the final game is archived.
