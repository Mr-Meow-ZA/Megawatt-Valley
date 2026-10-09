# Archived Megawatt Valley implementations

**Archival performed:** 9 October 2026. All links are GitHub version-control snapshots. `main` is now a **clean Unity evaluation baseline**, not an executable game. Snapshots retain the original source files, history, configuration, assets and tests as recorded at their commits (subject to existing Git LFS object retention).

## Current game preserved (Three.js/Electron)
- [Snapshot branch](https://github.com/Mr-Meow-ZA/Megawatt-Valley/tree/archive/threejs-solar-candidate-2026-10-09)
- Exact frozen commit: `98cfc2c32a92321c70cfd1a1d196ec9fbe602163`.
- Includes current solar gameplay, simulation logic, 3D rendering, menu code, Electron desktop packaging, tests, downloaded asset pointers, licences and evidence/docs.
- [Historical development PR #11](https://github.com/Mr-Meow-ZA/Megawatt-Valley/pull/11) is **superseded**; do not merge the old 3D code into the new Unity-first main.
- Existing newer work would require a separate deliberate snapshot and explicit acceptance; do not assume archive tracks an actively moving branch.

## Previous default branch and history
- [Pre-rebaseline `main` snapshot](https://github.com/Mr-Meow-ZA/Megawatt-Valley/tree/archive/pre-unity-rebaseline-main-2026-10-09): commit `bd7ae89813ed54d8fd92fca2edd5cc77f3e5f85e`. Preserves old Unity/Phaser rebaseline history, free asset index and docs.
- [Prior unity prototype archive](https://github.com/Mr-Meow-ZA/Megawatt-Valley/tree/archive/unity-prototype-2026-09-29): historical, **not** the new Unity pilot.
- [Pre-cleanup 3D archive](https://github.com/Mr-Meow-ZA/Megawatt-Valley/tree/archive/3d-before-legacy-purge-2026-10-09): supplementary legacy snapshot.
- [Cleanup proposal PR #18](https://github.com/Mr-Meow-ZA/Megawatt-Valley/pull/18): **superseded** by the controlled new baseline; don't merge.

## Recovering
Use `git fetch origin archive/threejs-solar-candidate-2026-10-09` and check out that branch (or use the exact SHA above) to inspect the previous complete game. Restore only by explicit product-owner decision. **Do not force-push or remove archived branches.**

## New active work
- [Issue #19 — Codex Unity visual proof board](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/19)
- `Docs/ENGINE_DECISION_2026-10-09.md`
- `Docs/UNITY_VISUAL_PROOF_PLAN.md`
