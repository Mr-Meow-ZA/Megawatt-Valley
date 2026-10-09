# Megawatt Valley

**Current game:** stylised **true-3D isometric renewable-energy management tycoon** built with **Three.js, TypeScript, Vite and Electron** for Windows desktop. The first playable level is **Here Comes the Sun** (solar only). Wind and other energy types belong to future levels, never mixed into Level 1.

## Where development lives
- **Active 3D candidate:** [PR #11](https://github.com/Mr-Meow-ZA/Megawatt-Valley/pull/11), branch `codex/3d-isometric`. Still a **draft** awaiting actual visual and gameplay acceptance.
- **3D cleanup proposal:** [cleanup/true-3d-only-2026-10-09](https://github.com/Mr-Meow-ZA/Megawatt-Valley/tree/cleanup/true-3d-only-2026-10-09), based on PR #11; merge only after CI validation.
- **Main:** transition/history until the approved 3D candidate is promoted. Do **not** start new Phaser/Unity implementations.
- **Message board:** [PR #11 Conversation](https://github.com/Mr-Meow-ZA/Megawatt-Valley/pull/11). Check at session start/end and before major changes.

## Start here
1. [Current status](Docs/CURRENT_STATUS.md) and [session goals](Docs/SESSION_GOALS.md).
2. [Resume checkpoint](Docs/RESUME_CHECKPOINT.md) — current verified SHA, tests and next work.
3. [Desktop quality target](Docs/DESKTOP_QUALITY_TARGET.md), [approved Concept v1](Docs/CODEX_UI_UX_READ_FIRST.md), [implementation notes](Docs/CONCEPT_V1_IMPLEMENTATION.md).
4. [Asset-first index](Docs/FREE_ASSET_RESOURCE_INDEX.md) on main (merge/cherry-pick to 3D branch before relying on local path).
5. [Cleanup manifest](Docs/REPOSITORY_CLEANUP_3D.md).

## Build from a clean checkout
```sh
npm ci
npm test
npm run build
npm run dev
```
The desktop packaging and Windows-native verification use `desktop/`, `scripts/` and `.github/workflows/desktop-release.yml`. Git LFS is needed for selected source models/textures. Do not claim a clean build until CI runs on the exact cleanup commit.

## Scope
Build → generate/export → finance → operate → maintain → research → expand, with visible staff, weather, road access and an accessible management interface. Keep version-1 save compatibility. Reference images in [issue #13](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13) guide visual quality; they are not distributable art.

## Archives
Historical Unity and Phaser work remains recoverable through Git branches and history, notably `archive/3d-before-legacy-purge-2026-10-09` and `archive/unity-prototype-2026-09-29`. These are **not active development tracks**.
