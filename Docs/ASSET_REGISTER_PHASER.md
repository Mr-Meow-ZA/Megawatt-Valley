# Phaser asset register (sourced)

All commercial use under **CC0** unless noted. Credit Kenney.nl appreciated.

## Runtime pack (committed)

`public/assets/game/` — curated, trimmed, composited sprites used by the Phaser build (~180 KB).

## Source packs (local cache, not committed)

Downloaded under `public/assets/sourced/` for processing:

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

## Notes

- Industrial kit PNGs in `Previews/` are 64×64; upscaled ×3 nearest-neighbour for readability.
- Nature Kit isometric trees are cropped from 512×512 renders.
- Procedural Graphics remain only for ghosts, selection ring, fault icon, shadows, clouds, foam, inverter, and locked tiles.


## Autonomous visual correction (2026-10-01)
The revised valley uses original code-generated 2:1 art in src/game/siteArt.ts for solar racks, office, workshop, grid equipment, roads, fences, trees, shrubs, rocks, van and signs. It also uses original terrain geometry. These were made to enforce matching projection and ground anchors where the previously combined assets did not match. The existing technician frames and UI icons retain their prior provenance above. No additional third-party assets or licenses were introduced. Upstream Tiled documentation and Phaser projection code were consulted as research; Tiled is not bundled.
