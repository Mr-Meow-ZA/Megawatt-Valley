# Technical architecture — active true-3D candidate
Updated 9 October 2026. The old Phaser/browser-first architecture is retired. This describes the **current candidate**, not a claim of final release acceptance.

- **Runtime:** TypeScript + Vite. `src/main.ts` is the active browser/webview entry, `src/three/` is the Three.js world and interaction layer, `src/ui/studio/` is the current Concept v1 management UI.
- **Simulation:** `src/simulation/` and `src/content/` own economy, staff, equipment, progression, research, weather and events. UI renders actual simulation state; never invent mechanics or values.
- **Persistence:** `src/persistence/` and `desktop/save-store.cjs` preserve version-1 save compatibility; Windows native save/import/close/resume/corrupt-primary recovery tests exist.
- **Desktop:** Electron in `desktop/`, packaged by `scripts/package-desktop.mjs` and `.github/workflows/desktop-release.yml`. Offline game resources must be bundled.
- **Validation:** `npm test`, `npm run build`, `scripts/three-capture.mjs`, `scripts/browser-check.mjs`, `scripts/desktop-check.mjs` and native Windows CI. Record exact tested SHA.
- **Assets:** existing Kenney CC0 and generated artwork are tracked in `Docs/UI_ASSET_PROVENANCE.md`. Source commercially safe free assets first; see `Docs/FREE_ASSET_RESOURCE_INDEX.md` on main.

## Transitional technical debt
The branch still carries `src/game/`, `src/main-2d.ts`, legacy UI variants and the Phaser package/lock. These are **not authorized architecture**; remove only after import/dependency inventory and a passing clean-clone build. Removing source without fixing lockfile, imports or tests risks breaking the release. `Assets/`, `Packages/`, `ProjectSettings/` Unity trees and obsolete Phaser workflows/plans are removed in the dedicated cleanup branch.

## Constraints
True 3D with orthographic isometric camera; solar-only Level 1; consistent Concept v1 UI; preserve existing simulation and save data. Avoid new backend requirements and paid assets. Keep licensing and offline packaging auditable.
