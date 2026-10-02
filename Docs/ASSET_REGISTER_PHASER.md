# Phaser asset register

All commercial use under **CC0** unless noted. Credit Kenney.nl appreciated.

## Runtime pack (committed)

`public/assets/low-poly/` — nine SVG sprites rendered from CC0 Kenney Industrial
and Nature meshes at the game's exact 2:1 projection. Generated files are committed;
source models are not required to build or play. See
[the visual asset pass](VISUAL_ASSET_PASS_2026-10-02.md) for the selected meshes,
render process, licence checks and remaining visual work.

`public/assets/game/` — retained PNG icons and legacy sprites (~180 KB). The new
solar/building/tree/shrub/stone sprites replace the corresponding procedural keys
at preload without changing their ground anchors.

## Source packs (development source, fetched selectively through Git LFS)

Stored under `public/assets/sourced/` for processing. Fetch selected model files only; the playable package embeds generated sprites:

| Pack | License | URL / origin | Used for |
|------|---------|--------------|----------|
| Kenney Isometric Roads (Nova) | CC0 | OpenGameArt / Kenney.nl | Grass, dirt, roads, river, water, banks, bridge, hills, small conifers |
| Kenney Isometric Buildings | CC0 | Kenney.nl / OGA | Office building tiles |
| Kenney Isometric Landscape | CC0 | Kenney.nl / OGA | Landscape reference |
| Kenney Isometric City | CC0 | Kenney.nl / OGA | Urban tile reference |
| Kenney City Kit Industrial | CC0 | Kenney.nl | Solar panel groups, tanks, warehouse, water tower, chimney, containers |
| Kenney City Kit Roads | CC0 | Kenney.nl | Construction fence |
| Kenney Nature Kit | CC0 | Kenney.nl | High-quality pine / deciduous trees, rocks |
| Kenney Pixel Vehicle Pack | CC0 | Kenney.nl | Van, truck |
| Kenney Game Icons (+ Expansion) | CC0 | Kenney.nl | Coin / power UI icons |
| Kenney Board Game Icons | CC0 | Kenney.nl | Dollar icon |
| Pixel Worker "Fukushima" (domsson) | CC0 | OpenGameArt | Worker sheet (reference; tech still procedural overlay) |

## Earlier asset processing (historical)

- Industrial kit PNGs in `Previews/` are 64×64; upscaled ×3 nearest-neighbour for readability.
- Nature Kit isometric trees are cropped from 512×512 renders.
- These notes describe earlier iterations. The current game also retains original terrain, operational props and staff art; selected model-derived sprites now replace the main solar/building/nature art.


## Autonomous visual correction (2026-10-01)
The revised valley uses original code-generated 2:1 art in src/game/siteArt.ts for solar racks, office, workshop, grid equipment, roads, fences, trees, shrubs, rocks, van and signs. It also uses original terrain geometry. These were made to enforce matching projection and ground anchors where the previously combined assets did not match. The existing technician frames and UI icons retain their prior provenance above. No additional third-party assets or licenses were introduced. Upstream Tiled documentation and Phaser projection code were consulted as research; Tiled is not bundled.


## Living-valley additions (2026-10-02)
Original code-generated flower clusters, reeds, ducks, picnic table, supply pallet, lamps, light texture, panel dirt and office detail were added in siteArt.ts. ValleyLife.ts draws original ground texture, ripples, insects, birds and window lighting. No assets from the indie inspiration games were imported or copied. Existing third-party credits above still apply to the retained staff frames and icons.


## Original improvement-pass art — 2 October 2026

`src/game/ValleyBackdrop.ts` draws decorative faceted mountain ridges, lake, distant
village and conifers in world coordinates. `src/game/siteArt.ts` now includes four
original staff uniforms (technician, cleaner, engineer, manager), walking poses and
roster portraits. Brighter roofs, cells and vegetation extend the existing original
canvas art. No new third-party image dependency or license was introduced. The
supplied reference was used for direction, not copied into the distributed build.


## Rendered Kenney visual slice — 2 October 2026

Nine generated SVG sprites use the actual CC0 Industrial/Nature GLB geometry,
rather than 64×64 previews. Their source paths and licence are recorded in
`public/assets/low-poly/manifest.json`. Palette, lighting, shadows, front-facing
orientation and a solar cell grid were adapted for the park. Original Kenney licence
files ship in `playable/licenses/`. No new paid asset or runtime 3D dependency.
