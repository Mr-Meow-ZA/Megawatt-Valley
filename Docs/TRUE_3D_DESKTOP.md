# True 3D desktop path — 5 October 2026

**Current desktop interface (0.4.0):** see [Desktop tycoon UX](DESKTOP_TYCOON_UX.md) for the rebuilt menus, connected roads, controls and validation. The initial transition notes below describe the 0.3.x renderer milestone; the legacy DOM management UI is no longer used by the current desktop entry point.

This branch replaces the Phaser world renderer with Three.js WebGL geometry. It is an isolated transition from the working `codex/solar-release-hardening` Windows release. Unity assets, scripts and settings are untouched. The previous browser entry point remains in `src/main-2d.ts` for reference.

## Architecture

Simulation, version-1 saves, objectives, research, operations, staff assignments and the DOM management UI are shared unchanged. `src/three/` owns the orthographic camera, terrain, mesh library, instanced scenery, staff animation, lighting, ray picking and placement previews. Each simulation tile corresponds to one X/Z world unit. Build plots are level; river beds and surrounding slopes have elevation. The camera preserves the previous 2:1 ground projection to retain input/UI coordinates.

Eight original GLB files from the repository's Kenney City Kit Industrial and Nature Kit packs are loaded directly as meshes, with CC0 licences retained in distribution. They are not pre-rendered sprites. Original procedural 3D geometry supplies staff, substation, inverter, fences, bridge and utility vehicle. Catalogue pictures are generated from the same meshes at startup.

Packaging embeds GLB bytes so both the Electron app and standalone review build run offline. The desktop process isolation, local protocol, save backups, native menu and close/resume flow remain in place. No visual editor or external service is required.

## Current checkpoint

Desktop 0.3.0 uses the true 3D renderer. The playable simulation and management features carry over from Desktop 0.2.0. This is the first 3D delivery, not final art-quality sign-off.

The first offline run exposed external palette references in industrial GLBs. The packager now embeds palette PNGs into GLB BIN chunks; no source asset is altered. Materials use diffuse lighting rather than environment-only metallic shading. Renderer resources are released on New Game.

## Play the Windows build

Download the `MEGAWATT-VALLEY-3D-WINDOWS` artifact from the Desktop release run linked in the release log. Extract the artifact, then either run the included installer or extract the portable ZIP and launch `Megawatt Valley.exe`. The installer remains unsigned.

Existing desktop companies resume from the same application save directory. A browser company can be transferred through the gear menu's Export / Import save controls. Imported companies start paused.

Drag to pan, wheel to zoom. B opens Build, T Staff, U research, H resets the camera, F centres the selected asset, Space pauses. R orders repair and C cleaning on selected equipment. Ctrl+S saves, F11 toggles fullscreen and F12 saves a screenshot.

## Validation

The texture-complete build passed all 58 unit tests and the full offline UI regression (run 37331406547). Packaged Windows runtime checks passed on the same renderer; the final palette/orientation and shadow-cache pass is being revalidated before delivery.


`npm ci && npm test && npm run build`
`node scripts/package-playable.mjs`
`node scripts/three-capture.mjs`
`node scripts/browser-check.mjs`

Use `npm run dev` with the curated GLBs hydrated by Git LFS. Release packaging runs through GitHub Actions; no local scene assembly. The tests retain full scenario completion, staff training, operations, contracts, research, save/load and input checks. New projection tests verify that real 3D ground positions match simulation tile coordinates.

## Next

Inspect actual frames and fix visual issues; validate interactions/performance; package and test the Windows 3D app. Continue refinement of building silhouettes, terrain detail and character animation. The transition uses stylised low-poly geometry; a final pixel treatment remains an art-direction task and should not be confused with merely wrapping the former 2D version.


## Living-valley pass — 6 October 2026

Desktop 0.3.1 adds cursor-centred zoom, moving public-road traffic, a small duck group with wakes, clustered reeds and subtle meadow grain. Roads continue beyond the playable plots so traffic enters from the valley outskirts. Wildlife and roadside props have explicit water/road/plot constraints.

Under-construction equipment now has a foundation, cones and stored materials, removed when commissioned. Cleaning, repair and service animations have task-driven particles. Ambient motion respects pause and decision events. Simulation balance and save format remain unchanged.

This pass also releases removed equipment and preview GPU resources. Unit coverage checks cursor anchoring and environmental paths; the runtime capture checks movement and pause. Full UI and Windows checks are required before sharing the new build. The previously shared 0.3.0 artifact remains available for the ongoing playtest.
