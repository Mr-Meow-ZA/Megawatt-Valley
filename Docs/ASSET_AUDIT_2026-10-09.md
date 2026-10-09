# Asset and cleanup audit — 9 October 2026

Reviewed active branch `dd1b67d00d0fc2e96b4896b22c4b481e95b923cd` (documentation-only successor of tested runtime `3b7be5e`), plus the [resource index on main](https://github.com/Mr-Meow-ZA/Megawatt-Valley/blob/main/Docs/FREE_ASSET_RESOURCE_INDEX.md). No world assets or simulation systems were replaced in this audit.

## Industrial version: already 2.0
The vendored `public/assets/sourced/kenney-city-kit-industrial/License.txt` explicitly identifies **City Kit Industrial (2.0)**, creation date 31 August 2026, and **CC0** with commercial use permitted. The proposed v1→v2 download is unnecessary: inspect the existing files first.

Available GLB solar candidates are:
- `solar-panel-flat.glb`
- `solar-panel-landscape.glb`
- `solar-panel-landscape-group.glb`
- `solar-panel-portrait.glb`
- `solar-panel-portrait-group.glb`

Directory API sizes are 130-byte Git LFS pointers, not model byte sizes or triangle counts. No performance/polycount claims are made from those metadata.

## Bundled is not the same as displayed
`scripts/model-manifest.mjs` and `src/three/models.ts` load eight models: three Industrial templates (solar group, building-p, building-i) and five Nature templates (oak, pine, alder, shrub, rock).

However, `ModelLibrary.equipment()` currently returns code-built `solarRack()`, `campusBuilding()` and `gridEquipment()` for the principal purchased infrastructure. The loaded Industrial templates are available for comparison; their presence in the manifest does not prove that those sourced meshes are the main displayed equipment. Nature uses the sourced model path. Preserve this distinction in provenance.

The next controlled comparison can reuse `solar-panel-landscape-group.glb`, already bundled, against the current solar rack at identical footprint, camera and lighting. Capture before/after at 1920×1080 and 1366×768; measure renderer draw calls/triangles and frame timing, and verify soiling/fault/construction states before adoption. That visual/performance comparison has **not** been completed in this session.

## PR #18 review — proposal only
Reviewed all **269 changed files** at `a1841390d8ede7c8fe4da85974389fa4075e218c`; 234 are in the Unity engine tree. The runtime-affecting source change switches the packager's asset-credit input. No simulation files change in that reviewed diff. The PR is not merged or approved here.

Findings before integration:
1. **Cross-branch CI cancellation.** The cleanup enables both branch names but retains shared concurrency groups (`true-3d`, and the desktop group's equivalent). A cleanup push can cancel the active development branch's run. Scope groups by workflow and ref before using both lanes concurrently.
2. **Credit/provenance loss.** The cleanup deletes `Docs/ASSET_REGISTER_PHASER.md` and switches packaging to `Docs/ASSET_REGISTER.md`. Consolidate the retained PNG/SVG and domsson/Kenney provenance from the removed register first; the destination currently lacks that detailed record. This is traceability work, not an assertion that CC0 attribution is legally mandatory.
3. **Phaser dependency removal needs import tracing.** The active UI still imports `SITE_ICONS` from `src/game/siteArt.ts`; that module imports `lowPolyArt` and Phaser types. Extract the shared catalogue data before deleting the historical module tree or package. The reviewed cleanup appropriately has not yet removed those imports/dependencies.
4. Reconcile documentation changes with the latest checkpoint/screenshots; retain exact tested-runtime evidence. Preserve the recovery archive and coordinate any merge/retarget explicitly.

This is a read-only review of a fixed PR SHA, not a clean-clone build of the cleanup candidate. Exact-SHA cleanup CI and human/product acceptance remain separate evidence.
