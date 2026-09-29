# Sourced Assets Inventory

Downloaded for Megawatt Valley Phaser Level 1 prototype.

**All packs below are Kenney.nl assets under Creative Commons Zero (CC0)** — free for commercial use, attribution appreciated but not required.

Source: https://kenney.nl · https://github.com/KenneyNL · OpenGameArt mirrors of Kenney packs  
Date obtained: 29 September 2026  
Total: ~29 packs · ~13,700 files · ~147 MB

---

## Packs

| Folder | Licence | Files | PNGs | Size | Best for |
| --- | --- | --- | --- | ---: | --- |
| `kenney-isometric-landscape` | CC0 | 134 | 130 | 1.4M | Grass / dirt / water terrain tiles (iso 128px) |
| `kenney-isometric-city` | CC0 | 147 | 142 | 1.3M | Urban ground, parking, street details |
| `kenney-isometric-buildings` | CC0 | 136 | 132 | 2.0M | Modular office / warehouse building pieces |
| `kenney-isometric-roads` | CC0 | 101 | 96 | 1.0M | Roads, grass, trees, lots, dirt |
| `kenney-isometric-blocks` | CC0 | 156 | 144 | 8.4M | Generic iso blocks / constructive tiles |
| `kenney-nature-kit` | CC0 | 3618 | 1640 | 36M | Iso + side trees, ground, grass (also GLB) |
| `kenney-city-kit-industrial` | CC0 | 201 | 48 | 12M | **Solar panels**, warehouses, tanks, chimneys (GLB + PNG previews) |
| `kenney-city-kit-commercial` | CC0 | 219 | 50 | 12M | Office / commercial buildings (GLB + previews) |
| `kenney-city-kit-suburban` | CC0 | 216 | 51 | 8.3M | Houses, fences, trees (GLB + previews) |
| `kenney-city-kit-roads` | CC0 | 487 | 102 | 7.9M | Roads, construction fence (GLB + previews) |
| `kenney-starter-kit-city-builder` | CC0 / MIT (code) | 110 | 7 | 2.4M | Godot city-builder sample + coin sprite |
| `kenney-rpg-urban-pack` | CC0 | 495 | 490 | 2.1M | Top-down urban tiles / props |
| `kenney-tiny-town` | CC0 | 141 | 136 | 708K | Tiny top-down town tiles |
| `kenney-map-pack` | CC0 | 198 | 194 | 3.4M | Top-down map / terrain tiles |
| `kenney-pixel-vehicle-pack` | CC0 | 87 | 80 | 396K | Van, truck, delivery vehicles (pixel top-down) |
| `kenney-racing-pack` | CC0 | 442 | 429 | 3.3M | Extra cars, barrels, dirt roads |
| `kenney-platformer-characters` | CC0 | 178 | 172 | 2.3M | Male/female character poses (side-view) |
| `kenney-new-platformer-pack` | CC0 | 1333 | 879 | 7.1M | Coloured characters, coins, fences |
| `kenney-simplified-platformer` | CC0 | 101 | 96 | 1.1M | Simple character sheets + tiles |
| `kenney-abstract-platformer` | CC0 | 401 | 382 | 4.3M | Fences, plants, props |
| `kenney-roguelike-characters` | CC0 | 8 | 4 | 92K | Tiny roguelike character spritesheet |
| `kenney-game-icons` | CC0 | 434 | 425 | 4.7M | UI icons (power/gear/home/… ) |
| `kenney-game-icons-expansion` | CC0 | 810 | 790 | 8.6M | coin, flag, cpu, tools |
| `kenney-board-game-icons` | CC0 | 774 | 513 | 3.7M | dollar, timer (calendar stand-in) |
| `kenney-ui-pack` | CC0 | 1315 | 870 | 5.5M | Buttons, panels, bars |
| `kenney-pixel-ui-pack` | CC0 | 40 | 36 | 348K | Pixel UI chrome |
| `kenney-puzzle-pack-2` | CC0 | 861 | 814 | 6.6M | Coins, pipes (industrial prop feel) |
| `kenney-medals` | CC0 | 35 | 31 | 248K | Star / medal UI |
| `kenney-emotes-pack` | CC0 | 534 | 513 | 2.3M | Speech / face emotes for staff |

---

## Gaps / notes

- **Hardhat workers:** no dedicated CC0 hardhat construction-worker pack found in Kenney downloads. Closest: platformer / new-platformer characters (can recolour / kitbash a helmet later).
- **Sun / lightning / calendar icons:** no exact filenames. Use `power.png` (lightning stand-in), `coin.png`, `dollar.png`, `timer_*.png`, and `medals` for star ratings. Simple sun icon can be drawn or sourced later.
- **Solar panels (2D):** industrial kit includes PNG *previews* plus GLB models — for Phaser, use preview PNGs or render GLBs offline. Isometric building/landscape tiles remain the primary 2D tile set.
- City Kit packs are primarily **3D (GLB)** with PNG previews — useful for Hero Corner / future 3D, and as temporary 2D placeholders via `Previews/`.

---

## Useful PNG paths (quick picks)

### Grass / terrain

```
public/assets/sourced/kenney-isometric-roads/png/grass.png
public/assets/sourced/kenney-isometric-roads/png/grassWhole.png
public/assets/sourced/kenney-isometric-roads/png/dirt.png
public/assets/sourced/kenney-isometric-landscape/PNG/landscapeTiles_000.png
public/assets/sourced/kenney-nature-kit/Isometric/grass_leafs_NE.png
public/assets/sourced/kenney-nature-kit/Isometric/grass_leafsLarge_NE.png
public/assets/sourced/kenney-map-pack/PNG/mapTile_005.png
```

### Trees

```
public/assets/sourced/kenney-isometric-roads/png/treeTall.png
public/assets/sourced/kenney-isometric-roads/png/treeShort.png
public/assets/sourced/kenney-isometric-roads/png/coniferTall.png
public/assets/sourced/kenney-nature-kit/Isometric/tree_default_NE.png
public/assets/sourced/kenney-nature-kit/Isometric/tree_pineTallA_SW.png
public/assets/sourced/kenney-nature-kit/Side/tree_pineTallD.png
public/assets/sourced/kenney-city-kit-suburban/Previews/tree-large.png
public/assets/sourced/kenney-city-kit-suburban/Previews/tree-small.png
```

### Roads

```
public/assets/sourced/kenney-isometric-roads/png/road.png
public/assets/sourced/kenney-isometric-roads/png/roadNS.png
public/assets/sourced/kenney-isometric-roads/png/roadES.png
public/assets/sourced/kenney-isometric-roads/png/crossroad.png
public/assets/sourced/kenney-isometric-city/PNG/cityTiles_001.png
public/assets/sourced/kenney-city-kit-roads/Previews/road-straight.png
```

### Buildings (office / warehouse)

```
public/assets/sourced/kenney-isometric-buildings/PNG/buildingTiles_010.png
public/assets/sourced/kenney-isometric-buildings/PNG/buildingTiles_039.png
public/assets/sourced/kenney-isometric-buildings/PNG/buildingTiles_065.png
public/assets/sourced/kenney-city-kit-industrial/Previews/building-a.png
public/assets/sourced/kenney-city-kit-industrial/Previews/building-d.png
public/assets/sourced/kenney-city-kit-commercial/Previews/building-a.png
public/assets/sourced/kenney-city-kit-commercial/Previews/building-skyscraper-a.png
public/assets/sourced/kenney-rpg-urban-pack/Tiles/tile_0000.png
```

### Characters / workers

```
public/assets/sourced/kenney-platformer-characters/PNG/Male/Poses/male_idle.png
public/assets/sourced/kenney-platformer-characters/PNG/Male/Poses/male_walk1.png
public/assets/sourced/kenney-platformer-characters/PNG/Female/Poses/female_idle.png
public/assets/sourced/kenney-new-platformer-pack/Sprites/Characters/Default/character_green_idle.png
public/assets/sourced/kenney-new-platformer-pack/Sprites/Characters/Default/character_beige_walk_a.png
public/assets/sourced/kenney-simplified-platformer/PNG/Characters/
public/assets/sourced/kenney-roguelike-characters/Spritesheet/roguelikeChar_transparent.png
```

### Vehicles

```
public/assets/sourced/kenney-pixel-vehicle-pack/PNG/Cars/van.png
public/assets/sourced/kenney-pixel-vehicle-pack/PNG/Cars/van_small.png
public/assets/sourced/kenney-pixel-vehicle-pack/PNG/Cars/truck.png
public/assets/sourced/kenney-pixel-vehicle-pack/PNG/Cars/truckdelivery.png
public/assets/sourced/kenney-pixel-vehicle-pack/PNG/Cars/truckdark.png
```

### Solar / industrial / fences

```
public/assets/sourced/kenney-city-kit-industrial/Previews/solar-panel-landscape.png
public/assets/sourced/kenney-city-kit-industrial/Previews/solar-panel-flat.png
public/assets/sourced/kenney-city-kit-industrial/Previews/solar-panel-portrait.png
public/assets/sourced/kenney-city-kit-industrial/Previews/detail-tank.png
public/assets/sourced/kenney-city-kit-industrial/Previews/shipping-container-a.png
public/assets/sourced/kenney-city-kit-roads/Previews/construction-fence.png
public/assets/sourced/kenney-city-kit-suburban/Previews/fence.png
public/assets/sourced/kenney-abstract-platformer/PNG/Other/fence.png
public/assets/sourced/kenney-new-platformer-pack/Sprites/Tiles/Default/fence.png
```

### UI icons (coin / power / time / medals)

```
public/assets/sourced/kenney-game-icons-expansion/PNG/Black/2x/coin.png
public/assets/sourced/kenney-game-icons-expansion/PNG/White/2x/coin.png
public/assets/sourced/kenney-game-icons/PNG/Black/2x/power.png
public/assets/sourced/kenney-game-icons/PNG/White/2x/power.png
public/assets/sourced/kenney-board-game-icons/PNG/Default (64px)/dollar.png
public/assets/sourced/kenney-board-game-icons/PNG/Default (64px)/timer_100.png
public/assets/sourced/kenney-starter-kit-city-builder/Starter-Kit-City-Builder-main/sprites/coin.png
public/assets/sourced/kenney-new-platformer-pack/Sprites/Tiles/Default/hud_coin.png
public/assets/sourced/kenney-puzzle-pack-2/PNG/Coins/coin_01.png
public/assets/sourced/kenney-medals/PNG/Medal/medal_01.png
```

---

## Attribution (optional, appreciated)

> Assets by Kenney (www.kenney.nl) — Creative Commons CC0
