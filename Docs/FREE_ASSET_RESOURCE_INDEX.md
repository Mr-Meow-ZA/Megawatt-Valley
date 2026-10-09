# Free / commercially usable asset resource index — Megawatt Valley
**Researched 9 October 2026.** Owner: product/design. Applies to the approved **true-3D Three.js/Electron**, solar-only Level 1. This is a *discovery index*, not approval to import every asset or a claim that packs have been downloaded. Source links are publisher pages where possible. Confirm the exact downloaded version's license and contents before shipping.

## Decision: asset-first, not procedural-art-first
1. Reuse existing suitable licensed professional/community assets.
2. Recolor, combine, optimize, kitbash and re-render them into the **approved Concept v1** style.
3. Use original commissioned/generated *illustrations* only for genuine gaps, with recorded provenance and human visual review.
4. Model custom *hero* assets only where a recognizable solar-world identity or gameplay readability requires it.
5. Never replace an approved UI layout or the actual Three.js world just because a pack looks attractive. **No wind in Level 1.**

### License categories
- **GREEN:** Original publisher explicitly labels the specific free pack CC0, including commercial use. No attribution legally required, but keep source/version/license manifest anyway.
- **AMBER:** Mixed-license site, non-CC0, unclear free-vs-paid tier, or per-asset terms. Review individual file, commercial rights, redistribution and attribution before import.
- **RED:** Editorial-only, non-commercial, no-derivatives, ripped/extracted assets, unauthorized branded content, paid-only packs, or unverified third-party reuploads. Do not ship.

## A. Priority short list — directly useful to Solar Level 1
| Rank | Publisher / asset pack | Source | License / confidence | Best use / notes |
|---|---|---|---|---|
| A1 | **Kenney — City Kit (Industrial), v2.0** | https://kenney.nl/assets/city-kit-industrial | CC0 GREEN | 40 listed files; v2.0 explicitly adds solar/wind energy pieces. **Inspect new solar components first**; compare with already imported v1.0 files. Do not place wind models in Level 1. |
| A2 | **Kenney — City Kit (Roads)** | https://kenney.nl/assets/city-kit-roads | CC0 GREEN | 90 listed road/sign pieces. Road connections, intersections, entrances, service roads. Match to current placement logic, do not change rules just for art. |
| A3 | **Kenney — Nature Kit** | https://kenney.nl/assets/nature-kit | CC0 GREEN | 330 listed trees/rocks/foliage assets. Dry-region landscape variety, rock clusters, edge dressing; tune palette to Western Cape-like solar valley without geographic overclaim. |
| A4 | **Quaternius — Ultimate Stylized Nature** | https://quaternius.com/packs/ultimatestylizednature.html | CC0 GREEN | 60+ models, glTF/FBX/OBJ/Blend; coherent foliage, rocks, terrain dressing. Compare visual language to Kenney; avoid indiscriminate mixing. |
| A5 | **Quaternius — Ultimate Nature** | https://quaternius.com/packs/ultimatenature.html | CC0 GREEN | 150 models. Wider environmental palette; use selectively. |
| A6 | **Kenney — Factory Kit** | https://kenney.nl/assets/factory-kit | CC0 GREEN | 140 listed industrial pieces. Maintenance workshop, storage, crates, equipment, site clutter and animation ideas. |
| A7 | **Kenney — Building Kit** | https://kenney.nl/assets/building-kit | CC0 GREEN | 80 listed modular building assets. Operations cabin, workshop shells, visitor/service buildings. |
| A8 | **Kenney — City Kit (Suburban)** | https://kenney.nl/assets/city-kit-suburban | CC0 GREEN | 40 listed buildings. Distant town/worker accommodation dressing only if coherent. |
| A9 | **Quaternius — Farm Buildings** | https://quaternius.com/packs/farmbuildings.html | CC0 GREEN | 13 buildings; adapt as rural support facilities only after visual review. |
| A10 | **Quaternius — Cars Pack** | https://quaternius.com/packs/cars.html | CC0 GREEN | Eight cars; can recolor for staff/visitor vehicles. Need believable service pickups separately. |
| A11 | **Kenney — Car Kit** | https://kenney.nl/assets/car-kit | CC0 GREEN | 45 listed vehicle pieces; inspect whether shapes fit management-game world. |
| A12 | **Kenney — Toy Car Kit** | https://kenney.nl/assets/toy-car-kit | CC0 GREEN | 100 listed toy-styled pieces. Potentially too playful; prototype only. |

### Important solar-specific observation
Kenney City Kit (Industrial) **v2.0** now advertises *solar/wind energy* additions. The repository already used selected Kenney City Kit Industrial and Nature models, but **verify which version is currently vendored** before spending time generating replacement solar panels. A pack may include useful panels, but it does **not** guarantee the correct utility-scale trackers, mounting, inverter, substation, cables, string layout or construction-state variations. Those are likely selective custom/kitbash needs.

## B. Staff, people, character animation and portraits
| Pack | URL | License | Evaluation |
|---|---|---|---|
| **KayKit — Character Animations (current)** | https://kaylousberg.itch.io/kaykit-character-animations | CC0 GREEN (free tier) | 150+ free humanoid animations; idle/walk/interact are relevant. Check rigs, retargeting and Three.js glTF playback. |
| **KayKit — Adventurers (free tier)** | https://kaylousberg.itch.io/kaykit-adventurers | CC0 GREEN | Five free rigged characters; good technical rig test, but fantasy outfits **not** production solar technicians. |
| **Kenney — Animated Characters Protagonists** | https://kenney.nl/assets/animated-characters-protagonists | CC0 GREEN | 8 files; test proportions and animation pipeline, not automatic art approval. |
| **Kenney — Animated Characters Survivors** | https://kenney.nl/assets/animated-characters-survivors | CC0 GREEN | 8 files; inspect for civilian-like base rigs and suitable outfits. |
| **Kenney — Blocky Characters** | https://kenney.nl/assets | Check specific pack | Potential stylized staff base; may be too blocky for approved quality. |
| **Poly Pizza — individual characters** | https://poly.pizza/ | AMBER per model | Large search catalogue; **CC0 and CC-BY vary per model**, including uploads by same creator. Never treat site-wide as CC0. |

**Critical distinction:** low-poly world character models and polished illustrated **staff profile portraits** are different assets. Don't render low-detail primitive busts and pretend they meet Concept v1. Evaluate professional portrait illustration sources separately and compare at actual in-game pixel dimensions. Avoid fantasy adventurers in workwear roles without substantive rework.

## C. Terrain, materials, lighting and environment
| Publisher | URL | License | Specific value |
|---|---|---|---|
| **ambientCG** | https://ambientcg.com | CC0 GREEN | Ground, sand, gravel, soil, concrete, metal, rust, asphalt PBR. Use low/medium texture resolutions appropriate to orthographic camera. |
| **Poly Haven — textures** | https://polyhaven.com/textures | CC0 GREEN | Calibrated terrain and industrial materials; more photoreal than Kenney, so stylize consistently. |
| **Poly Haven — HDRIs** | https://polyhaven.com/hdris | CC0 GREEN | Outdoor daylight, overcast, sunset and storm lighting. Use suitable downsampled HDRIs; avoid heavy downloads. |
| **Poly Haven — models** | https://polyhaven.com/models | CC0 GREEN | Selected high-detail hero props if performance allows; avoid mixing realism with stylized world indiscriminately. |
| **Quaternius — Stylized Nature MegaKit** | https://quaternius.itch.io/stylized-nature-megakit | CC0 GREEN | Alternate environment set; test style coherence. |
| **Poly Haven license** | https://polyhaven.com/license | CC0 source | Primary licensing evidence. |

## D. Interface, icons and visual language
| Pack | URL | License | Use |
|---|---|---|---|
| **Kenney — UI Pack** | https://kenney.nl/assets/ui-pack | CC0 GREEN | 430 listed panel/button assets; useful reference, **not** permission to abandon navy/light Concept v1 layout. |
| **Kenney — Game Icons** | https://kenney.nl/assets/game-icons | CC0 GREEN | 105 symbols for secondary controls and prompts. |
| **Kenney — Board Game Icons** | https://kenney.nl/assets/board-game-icons | CC0 GREEN | 250 icon assets; possibly suitable for milestone/achievement badges. |
| **Kenney — Input Prompts** | https://kenney.nl/assets | Verify specific pack | Keyboard/mouse shortcut illustrations; search within publisher catalogue. |
| **Phosphor Icons** | https://phosphoricons.com | MIT; verify version | Existing branch uses professional control symbols. Keep a single consistent icon family and bundle its licence. |
| **Lucide** | https://lucide.dev | ISC; verify version | Alternative icon system; **don't mix** with Phosphor indiscriminately. |

Use standard UI design primitives (CSS, SVG, type scale) for the main HUD. A random fantasy/sci-fi UI skin will be inconsistent with Concept v1. Distinctive research illustrations and staff portraits need actual art-direction review rather than arbitrary pack substitutions.

## E. Audio and music
| Pack / library | URL | License | Use |
|---|---|---|---|
| **Kenney — Interface Sounds** | https://kenney.nl/assets/interface-sounds | CC0 GREEN | 100 UI sounds: selection, confirmation, failure, popup, construction acknowledgement. |
| **Kenney — UI Audio** | https://kenney.nl/assets/ui-audio | CC0 GREEN | 50 additional control sounds. |
| **Kenney — Music Jingles** | https://kenney.nl/assets | Verify pack | Short achievements, unlocks and star-award stingers. |
| **OpenGameArt** | https://opengameart.org | AMBER per asset | Search for CC0 ambient industry, electrical hum, wind, birds, machinery and gentle music. Each upload may use different licences. |
| **Kenney Interface Sounds mirrored on OGA** | https://opengameart.org/content/interface-sounds | CC0 GREEN | Alternative publisher-uploaded page, with 100 OGG files. Prefer Kenney primary where possible. |
| **Sonniss GameAudioGDC** | https://sonniss.com/gameaudiogdc | AMBER custom license | Large professional audio collection. Read each bundle's licence and size before adding; do not assume CC0. |
| **Incompetech** | https://incompetech.com/music/royalty-free/ | AMBER CC-BY where offered | Music with required credit/terms; only if tone fits and attribution tracked. |

Audio priorities: subtle construction, road placement, technicians moving, mechanical maintenance, soft electrical hum, weather, birds, clean reward stingers. No intrusive arcade sounds.

## F. Discovery sites — not blanket-approved libraries
- https://poly.pizza/ — searchable 3D models, **per-model** Creative Commons terms; mixed CC0/CC-BY.
- https://opengameart.org/ — many licences; use only verified commercial-compatible entries with tracked credit.
- https://itch.io/game-assets/free — filter 3D and inspect *specific* creator pack, free tier and licence.
- https://sketchfab.com/ — mixed licenses and download availability; no editorial-only or non-commercial files.
- https://www.blendswap.com/ — mixed Blender models; check each licence and source.
- https://tmhsdigital.github.io/Free-Game-Dev-Assets/ — third-party research index, useful for discovery but not a substitute for original publisher licence evidence.
- https://www.cgbookcase.com/ — candidate CC0 PBR material source; confirm current licence and download terms.
- https://www.texturecan.com/ — candidate CC0 textures; confirm specific asset licence.
- https://freesound.org/ — per-sound CC0/CC-BY/CC-BY-NC; only commercially compatible licences, and track attribution.

## G. Practical asset gap map (current design, not a completed inventory)
| Game need | Existing resource strategy | Remaining custom work likely |
|---|---|---|
| Utility-scale solar arrays | Kenney Industrial v2.0 first; compare current Kenney panels | Tracker/mount/inverter variants, grid footprint, damaged/dirty/clean states |
| Operations workshop / depot | Kenney Industrial + Factory + Building | Branding, interactive maintenance markers |
| Substation / grid | Industrial kitbash + CC0 PBR | Transformers, switchgear, lines, readable grid/export connections |
| Roads and fences | Kenney Roads, existing fence geometry | Snapping, continuity, collision and service access |
| Staff and movement | KayKit rig/animation proof, existing in-game staff | Appropriate uniforms, distinctive silhouettes, job-specific actions |
| Vehicles | Quaternius Cars, Kenney Car Kit | Utility pickup/repair van and convincing worksite animations |
| Dry valley | Kenney Nature, Quaternius, ambientCG, Poly Haven | Consistent palette, composition, biome-specific dressing |
| UI symbols | Current Phosphor, Kenney optional | Coherent navy/light components, not pack-driven redesign |
| Staff profile illustrations | Curated illustration, current authored art as comparison | Unique approved portraits; consistent professional quality |
| Research cards | Curated illustrations/diagram assets | Legible research content and coherent illustrations |
| Audio | Kenney SFX, carefully licensed ambience | Balanced mix, responsive feedback, scene-specific sound |

## H. Codex asset selection procedure
1. **Inventory first:** read `Docs/ASSET_REGISTER.md`, `Docs/UI_ASSET_PROVENANCE.md` (candidate branch), `src/game/assets.ts`, `src/three/models.ts`, current `public/assets/sourced/` and Git LFS manifests. Avoid duplicate downloads or replacement of approved assets.
2. **Build an asset candidate sheet:** gameplay role, publisher, pack/version, original page, exact file, format, polycount/texture memory where measurable, licence URL, date verified, visual fit score 1–5, adaptation effort, screenshot, decision.
3. **Shortlist only 2–3 coherent art families:** choose one dominant environmental/architectural style; reuse materials/palette/lighting to unify secondary sources.
4. **Proof-of-fit before mass import:** import 1 solar model, 1 building, 2–3 environment props, 1 staff character, 1 vehicle; render in the **actual 3D scene** at 1920×1080 and 1366×768 and compare with issue #13.
5. **Optimize:** prefer glTF/GLB for Three.js, deduplicate materials, compress textures, inspect triangle count, use instancing for repeated panels/foliage, preserve original source/license files outside the shipping payload when appropriate.
6. **Audit licences:** store downloaded publisher licence, source URL, pack version, original author, modification notes, and required credits. Never assume CC0 from a third-party mirror.
7. **Acceptance:** screenshot and interactive runtime evidence, no broken load paths, offline Windows build, visual consistency, no regression in simulation or saves.
8. **Don't churn assets for novelty:** replace only an identified visual weakness. Keep gameplay, road placement, UI controls and save schema stable.

## I. Smallest next asset session (after current playtest)
**Asset audit + one controlled solar-environment proof, not an entire art rewrite.**
- Compare already-used Kenney City Kit Industrial files to publisher **v2.0** and identify newly useful solar models.
- Inventory source assets actually used in runtime and record licence/version/provenance gaps.
- Create a *non-destructive* proof-of-fit scene or screenshot with one better solar array model and a cohesive terrain/industrial material treatment.
- Compare against current screenshot and Concept v1; report image quality, performance, licensing and integration costs.
- Do not merge changes or replace portrait art before Rapha reviews actual screenshots.
- Continue PR #11's playtest/acceptance first; this research index is a resource, not a competing development track.

## J. Source and licensing verification notes
Primary pages checked on 9 Oct 2026: Kenney City Kit Industrial/Roads/Nature/Factory/Building/UI/Interface Sounds, Quaternius Nature/FAQ/Cars/Farm Buildings, KayKit Character Animations/Adventurers, Poly Haven licence. Free and paid tiers may coexist; verify the **free download** before use. Counts and updates are publisher listings at research time, not audited download manifests. Third-party catalogs are supplemental only.

**Approved product reference:** GitHub issue #13, `Docs/VISUAL_QUALITY_AND_WORLD_CHARACTER.md` §15, and `Docs/CODEX_UI_UX_READ_FIRST.md` on the 3D candidate branch.
