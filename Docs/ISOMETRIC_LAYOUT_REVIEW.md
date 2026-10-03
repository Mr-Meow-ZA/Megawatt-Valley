# Isometric layout correction — 1 October 2026

## Findings
The previous screenshots did not meet the visual quality brief. Specific defects:
- Road art used screen-horizontal/vertical strips in a diagonal ground grid.
- The same front-facing fence image was repeated along both map axes.
- A small bridge image did not span the river or meet the approach roads.
- World tiles, pointer picking and placement footprints used different half-cell offsets.
- Industrial and vegetation sprites had inconsistent anchors and scale.
- Random prop scatter competed with gameplay land and produced a dotted landscape.
- Decorative access roads were not reserved by the build rules.
- Staff travelled directly across the river and the minimap had another hardcoded road map.
The previous automated acceptance checks did not assess these visual failures.

## Research consulted
- [Tiled: Using Terrains](https://doc.mapeditor.org/en/stable/manual/terrain/):
  edge sets connect roads/fences; neighbour updates preserve joins. Low probabilities
  and valid terrain constraints are preferable to unconstrained decorative scatter.
  Source read: mapeditor/tiled, docs/manual/terrain.rst.
- [Tiled: Working with Objects](https://doc.mapeditor.org/en/stable/manual/objects/):
  object layers separate authoring data from code, snapping is available, and
  isometric tile objects default to bottom-centre alignment.
  Source read: docs/manual/objects.rst.
- [Tiled: Automapping](https://doc.mapeditor.org/en/stable/manual/automapping/):
  input/output rules support contextual placement and NoOverlappingOutput;
  authoring rules should prevent half-objects and unintended overlaps.
  Source read: docs/manual/automapping.md.
- [Phaser isometric projection](https://github.com/phaserjs/phaser/blob/master/src/tilemaps/components/IsometricTileToWorldXY.js):
  x=(tileX-tileY)*tileWidth/2; y=(tileX+tileY)*tileHeight/2.
  All rendered ground geometry and picking must agree on this transform.

Research was read from the upstream GitHub sources through the connected tools.
The grouping/composition decisions below are project-specific judgments, not a
claim that the sources establish aesthetic quality.

## Implemented approach
- Shared valleyLayout.ts defines road cells, fence edges, gates, river and groves.
- 16 road/fence connectivity masks generated on a common 100x50 projection.
- Fences use world-space segments; the bridge deck connects bank to bank.
- Flat build terraces with quiet continuous ground; no fake elevated tile wedges.
- Original modest office, electrical yard and solar racks replace incompatible
  industrial silhouettes. Art manifests record ground anchors explicitly.
- Vegetation uses grouped groves, minimum separation and infrastructure setbacks.
- Build validation reserves access and office parking; previews and picking use
  the same cell-centre convention.
- The minimap reads the same road/river definitions.
- Cross-site staff routes use the gates and bridge; the van follows a closed route.
- Unit tests cover connectivity, gate openings, setbacks, picking and river crossing.
- Browser evidence includes UI overview, clean valley overview and infrastructure detail.

## Optional authoring tool recommendation
Use Tiled if the owner wants to author whole maps. It already has isometric maps,
terrain brushes, object layers, snapping and undo. Do not build a competing editor
before the art kit and layout rules are stable.

A useful project-specific integration would ship with a ready-made Tiled project:
Ground, Access, Boundaries, Scenery and Gameplay layers; prepared terrain sets;
named spawn/build-area objects; and an importer that validates overlaps and paths.
The owner would paint roads and move scenery, without selecting individual corner
tiles, editing source code or wiring gameplay. The importer and prepared project
are NOT included in this revision. Current layout remains fully maintained by Codex.

A map editor would provide creative control; it would not fix incompatible assets,
poor composition or incorrect projection. Those remain the developer's job.

## Visual acceptance
Compare actual runtime captures at overview and close zoom. Check continuous roads,
aligned corners, real gate openings, complete river crossing, grounded buildings,
consistent scale, vegetation grouping, open build land and legible staff.
Passing tests alone does not establish visual acceptance.
