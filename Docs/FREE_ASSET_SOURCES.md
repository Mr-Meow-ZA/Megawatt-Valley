# Asset-first sourcing for Unity visual proof

Reuse commercially compatible **professional/community assets first**; adapt/kitbash them in Blender as needed, then author bespoke hero content only where no viable source fits. Don't solve this by randomly generating unrelated image atlases and incompatible portraits.

## First places to inspect
| Publisher/source | Link | Candidate role | General licence |
|---|---|---|---|
| Kenney City Kit Industrial v2.0 | https://kenney.nl/assets/city-kit-industrial | Solar panels, industry, buildings | CC0 publisher pack; verify exact download |
| Kenney City Kit Roads | https://kenney.nl/assets/city-kit-roads | Road layout and furnishings | CC0 publisher pack |
| Kenney Factory Kit | https://kenney.nl/assets/factory-kit | Workshop/industrial props | CC0 publisher pack |
| Kenney Nature Kit | https://kenney.nl/assets/nature-kit | Trees, shrubs, rocks | CC0 publisher pack |
| Quaternius Ultimate Stylized Nature | https://quaternius.com/packs/ultimatestylizednature.html | Cohesive foliage/terrain | CC0 pack; verify licence |
| Quaternius Cars Pack | https://quaternius.com/packs/cars.html | Moving staff/visitor vehicle | CC0 pack; verify |
| KayKit Character Animations | https://kaylousberg.itch.io/kaykit-character-animations | Humanoid movement and work animations | CC0 free pack; verify free tier |
| ambientCG | https://ambientcg.com | Metal/soil/stone PBR | CC0 materials |
| Poly Haven | https://polyhaven.com | Outdoor HDRI, materials and selected props | CC0 |
| Kenney Interface Sounds | https://kenney.nl/assets/interface-sounds | Feedback | CC0 |
| Poly Pizza | https://poly.pizza/ | Individual 3D candidate search | Mixed, **per-model verification** |
| OpenGameArt | https://opengameart.org | SFX/music | Mixed, **per-item verification** |

The archived Three.js repo already vendors Kenney City Kit Industrial **v2.0** with several solar-model variants, verified in `Docs/ASSET_AUDIT_2026-10-09.md` on the archived branch. These are a valuable **starting reference**, not a reason to import the entire old project. Confirm original source/licences before including any files.

## Engine file-format caution
Unity imports common formats like FBX directly. **glTF/GLB may require an importer such as glTFast or conversion in Blender**; don't assume that a working Three.js GLB is automatically Unity-ready. Test the licence and format with **one** solar array and **one** staff/animation asset before bulk conversion.

## Mandatory asset register
Record publisher, creator, pack name/version, original URL, specific files, licence text/URL, changes, Unity import settings, visual compatibility and approximate runtime cost. Keep attribution and licence files where required. No copyrighted reference imagery embedded as runtime art, no third-party unlicensed game asset rips, no paid downloads without approval.

The prior larger search index remains preserved on `archive/pre-unity-rebaseline-main-2026-10-09` at `Docs/FREE_ASSET_RESOURCE_INDEX.md`.
