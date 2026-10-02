# Visual asset pass: free models, consistent rendering

## Why free assets help

Good models provide more believable geometry and detail than the existing tiny
procedural sprites. They still need a consistent camera, scale, palette, lighting,
ground anchor and placement footprint. Downloading unrelated packs is not a visual
strategy. The current objective is a bright, cozy solar park inspired by the supplied
reference, delivered in the existing Phaser game.

## Verified sources

| Source | Licence | Fit and decision |
|---|---|---|
| [Kenney City Kit Industrial](https://kenney.nl/assets/city-kit-industrial) | CC0 | Version 2.0 includes solar/wind assets. Use selected solar and low-rise building meshes. Source licence in the repository permits personal, educational and commercial use. |
| [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) | CC0 | Use selected broadleaf/conifer, shrub and stone meshes. Render them with the same camera and lighting as the buildings. |
| [Kenney Isometric Tiles Buildings](https://kenney.nl/assets/isometric-tiles-buildings) | CC0 | Ready-made 2D alternative, but mixing its view with other packs requires care. Not newly integrated in this pass. |
| [Quaternius Ultimate Stylized Nature](https://quaternius.com/packs/ultimatestylizednature.html) | CC0 | Promising richer nature option, with 3D formats. Not downloaded/integrated in this pass. Keep as a candidate rather than introduce a second foliage style prematurely. |

The repository already had the selected Kenney source models. Earlier iterations
used some small previews and later replaced many mismatched sprites with procedural
art. This pass uses the actual model geometry to produce better matched sprites.
It does not require purchasing packs or installing an editor to play.

## Delivered visual slice

- Nine rendered sprites: bargain/premium solar arrays, operations office, workshop,
  two broadleaf variants, a conifer, shrub and stone.
- One orthographic projection whose ground axes match the existing 2:1 grid exactly.
- Consistent light and ground-plane shadows; cream walls, blue roofs and warm foliage.
- Front-facing building facades, rooftop detail, planters, physical solar supports,
  and an authored cell grid on solar modules. Basic/premium modules retain a visual
  distinction.
- Original texture keys, sizes and ground anchors retained, so placement, selection,
  build previews, inspectors and the simulation continue working.
- SVG sprites rasterise once during preload. The distributed game uses Phaser's
  existing sprite renderer; there is no Three.js, Blender or 3D runtime dependency.
- All nine vectors are embedded in the double-click offline HTML. The original
  Kenney licence files are included in the downloadable package.

## Reproduce the art

Generated outputs live in `public/assets/low-poly/`; `manifest.json` records the
source model, author, licence and dimensions. Runtime code does not read source
GLBs. Build and CI consume the already generated SVG files.

Development regeneration uses `scripts/render-low-poly-assets.py` with Python,
NumPy and Pillow. Fetch only these LFS sources and the Industrial colormap:

- Industrial `Models/GLB format/solar-panel-landscape-group.glb`, `building-p.glb`,
  `building-i.glb`, and `Models/GLB format/Textures/colormap.png`.
- Nature `Models/GLTF format/tree_oak.glb`, `tree_pineRoundA.glb`, `plant_bush.glb`
  and `stone_largeA.glb`.

Run `python scripts/render-low-poly-assets.py`, then the ordinary build/package
commands. The renderer reads GLB scene transforms, mesh indices and material colours,
samples the source palette, culls backfaces, orders faces, lights them, projects
shadows and adds the solar cell pattern. It does not use pack preview thumbnails.

## Validation and limits

The actual standalone game was inspected at its default and close cameras. Desktop
and laptop browser checks cover placement, staff selection, imports, events, research,
navigation and lighting. An additional capture records the nine decoded offline
sprites as a palette. The 34 existing simulation tests remain the gameplay safety
check; this pass changes art, not the economy or research rules.

This is a first asset slice, not the final visual target. Remaining priorities:

1. Improve terrain, river edges and background composition; remove abrupt scenery
   transitions and make the opening camera feel deliberately composed.
2. Bring substation, inverter, vehicles and staff into the same level of art detail.
3. Improve movement, work animation, shadows and weather feedback.
4. Add purposeful landscaping around service buildings while keeping player lots
   readable and buildable.
5. Compare the real game with the target at normal play zoom, not only enlarged
   individual asset renders. Do not raise quality scores from asset count alone.
