# Clean-sheet UI asset provenance
8 October 2026

- Directional reference: Rapha's issue #13, New visual inspiration. Inspected as a product reference; no pixels, logo, portrait or decorative artwork from the attachment are embedded in the game.
- UI glyphs: original inline SVG paths in src/ui/studio/components.ts. No icon CDN or new third-party icon licence.
- Equipment previews: rendered from the game's existing model library. Existing model provenance/licences remain in the asset documentation; the UI introduces no external models.
- Staff previews: original procedural geometry generated in the project and rendered locally. No external character portrait is copied.
- Minimap: generated from shared world geometry and current simulation state, including roads, river, plots, equipment and staff.
- Typography: system fonts (Inter when locally available, Segoe UI, Arial, sans-serif); no font download or network dependency.
- Design tokens/styles/components: original source in src/ui/studio. Historical tycoon styles are not imported into the active entrypoint.
