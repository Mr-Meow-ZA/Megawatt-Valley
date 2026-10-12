# Current architecture — existing Three.js/Electron game (12 October 2026)

## Production track for this finalisation
**Runtime:** Three.js (true 3D) + TypeScript + Vite rendering into browser/Electron, orthographic camera, `src/three/` scene and current `src/ui/studio/` interface. **The current UI composition is REJECTED** and will be redesigned, keeping data correctness and gameplay. A game-quality art direction and UI architecture may replace CSS/components but must not break simulation or native application input.

**Gameplay rules:** `src/simulation/`, `src/content/`; equipment, generation/export/economy, staff/roads, weather, contracts, research, events and progression.

**Persistence:** `src/persistence/` and Electron native `desktop/save-store.cjs`; preserve version-1 compatibility, corrupted-save recovery and browser export/native import.

**Assets:** source Kenney CC0 GLBs, small original/procedural 3D and UI images. `Docs/ASSET_AUDIT_2026-10-09.md` notes Industrial v2.0 is **already included**, yet the principal equipment model is still code-built. Prefer professional packs/kitbashing; use `Docs/FREE_ASSET_RESOURCE_INDEX.md` and preserve provenance. Do not render photoreal portraits alongside crude low-poly in-world characters.

**Desktop:** Electron and packaging in `desktop/` and `scripts/`. GitHub Actions `three-isometric.yml` and `desktop-release.yml` must run for `codex/threejs-level1-final` with branch-isolated concurrency groups; output screenshot evidence, standalone HTML and Windows installer/portable artefacts. No local Codex development setup on Rapha's PC.

**Legacy dependency caution:** `package.json` still includes Phaser, and `src/three/World3D.ts` imports `SITE_ICONS` from `src/game/siteArt.ts` (which imports other historical modules). This is **technical debt**, not permission to tear out dependencies unsafely. Inventory and isolate imports before removing Phaser and old 2D/tycoon UI modules; run clean-clone validation on changes.

**Design docs:** current `Docs/LEVEL1_FINALISATION_PLAN_2026-10-12.md`, root `AGENTS.md`, issues #12/#13, issue #20. Historical Unity/Cursor/Phaser specs and older "Three.js is paused" decisions are overridden by Rapha's 12 October directive.

Do not start Unity/Godot engine migration or gameplay port while finalising this game's Level 1. After user accepts, archive a final independent snapshot, then resume future engine evaluation.
