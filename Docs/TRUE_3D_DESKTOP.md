# True 3D desktop path — 5 October 2026

This branch replaces the Phaser world renderer with Three.js WebGL geometry. It is an isolated transition from the working `codex/solar-release-hardening` Windows release. Unity assets, scripts and settings are untouched. The previous browser entry point remains in `src/main-2d.ts` for reference.

## Architecture

Simulation, version-1 saves, objectives, research, operations, staff assignments and the DOM management UI are shared unchanged. `src/three/` owns the orthographic camera, terrain, mesh library, instanced scenery, staff animation, lighting, ray picking and placement previews. Each simulation tile corresponds to one X/Z world unit. Build plots are level; river beds and surrounding slopes have elevation. The camera preserves the previous 2:1 ground projection to retain input/UI coordinates.

Eight original GLB files from the repository's Kenney City Kit Industrial and Nature Kit packs are loaded directly as meshes, with CC0 licences retained in distribution. They are not pre-rendered sprites. Original procedural 3D geometry supplies staff, substation, inverter, fences, bridge and utility vehicle. Catalogue pictures are generated from the same meshes at startup.

Packaging embeds GLB bytes so both the Electron app and standalone review build run offline. The desktop process isolation, local protocol, save backups, native menu and close/resume flow remain in place. No visual editor or external service is required.

## Current checkpoint

First 3D rendering implementation; automated build, gameplay regression and visual review pending. This is not yet a visual-quality sign-off. No claims of completed desktop validation until the new renderer has passed the packaged Windows checks.

## Validation

`npm ci && npm test && npm run build`
`node scripts/package-playable.mjs`
`node scripts/three-capture.mjs`
`node scripts/browser-check.mjs`

Use `npm run dev` with the curated GLBs hydrated by Git LFS. Release packaging runs through GitHub Actions; no local scene assembly. The tests retain full scenario completion, staff training, operations, contracts, research, save/load and input checks. New projection tests verify that real 3D ground positions match simulation tile coordinates.

## Next

Inspect actual frames and fix visual issues; validate interactions/performance; package and test the Windows 3D app. Continue refinement of building silhouettes, terrain detail and character animation. The transition uses stylised low-poly geometry; a final pixel treatment remains an art-direction task and should not be confused with merely wrapping the former 2D version.
