# UI production asset provenance
Updated 9 October 2026.

## Product direction
Rapha rejected the procedural portrait busts and basic menu artwork on 9 October. The earlier implementation was functional scaffolding, not accepted art. Source suitable commercially usable assets first; generate coherent production artwork when a suitable free source is unavailable. Do not replace character art with hand-built spheres/capsules or improvised SVG figures. Normal layout controls and data visualisations remain code.

## Runtime assets
| Asset | Source / creator | Rights / provenance | Location |
| --- | --- | --- | --- |
| Phosphor duotone interface icons, 29 unique symbols | [Phosphor Icons](https://github.com/phosphor-icons/core), Helena Zhang and Tobias Fried | MIT, copyright 2023 Phosphor Icons; exact licence retained and included in offline/Windows distributions. Vendored from commit `2b75f3ad12b420c9504ef05df8d2564a28f8500e`. Paths unchanged; SVG wrapper adds accessibility/class attributes. | `src/ui/studio/phosphor.ts`, `public/assets/ui-licenses/Phosphor-MIT.txt` |
| Tess, Amir, Nia, Morgan, Sam portraits | Generated for this project with OpenAI image generation on 9 October 2026 | AI-generated original project artwork, not claimed to be commissioned human illustration or third-party CC0. No commercial-game characters, brands or reference-image pixels used. | `public/assets/game/portrait_*.png` |
| Eight menu/research illustrations | Generated for this project with OpenAI image generation on 9 October 2026 | Original AI-generated atlas: solar, PPE/team, engineering, maintenance, office, achievement, survey, resilience. Decorative illustrations, not promises of extra equipment or mechanics. | `public/assets/game/ui_menu_atlas.png` |
| Equipment placement previews | Existing game model library | Existing Kenney CC0 and original model provenance unchanged. Previews continue to show the actual equipment placed in the world. | Existing catalogue renderer |
| Minimap | Shared world layout and live simulation state | Original data-driven visualisation, not artwork substitution. | `src/ui/studio/minimap.ts` |

The Phosphor notice and this document ship in `licenses/`; the native desktop packager copies that folder. Assets are local; no art CDN or runtime internet dependency. Five individual portrait PNGs avoid sprite-sheet overlap. Images are decoded once and represented by short blob URLs to avoid embedding megabytes in every live DOM update. The small authored UI PNG set uses a narrowly scoped Git attribute exception; existing model/texture LFS rules remain unchanged.

## Sources researched, not imported
- [Aivopiru Pixel Portraits](https://aivopiru.itch.io/pixelart-portrait-bases): commercial use permitted, redistribution restricted. Fantasy pixel portraits do not match the current illustrated contemporary worker target.
- [CharCrafter free sample](https://ayuo-dev.itch.io/charcrafter-free-stylized-character-sample-pack): commercial use permitted, redistribution restricted; five low-poly male sample roles do not cover the company cast. No assets copied.
- [Game-icons](https://github.com/game-icons/icons): considered for game-specific symbols; selected the coherent Phosphor family for small UI controls instead.

## Art direction used for generation
Individual waist-up contemporary solar-company staff; distinct adult faces, expressive eyes, role-specific PPE/tools, detailed cloth and materials, warm key light, navy/teal/gold palette. Tess: yellow hardhat, braids, reflective vest, folded arms. Amir: orange hardhat/vest and multimeter. Nia: teal cap/shirt and cleaning belt. Morgan: auburn hair, glasses, tablet and white helmet. Sam: salt-and-pepper beard, radio and clipboard.
Menu atlas: exactly four columns/two rows, eight isolated detailed inventory-style illustrations on navy, no lettering or logos, consistent lighting, navy/teal/cobalt/gold.

## Reference and historical assets
Rapha's issue #13 reference is for product direction only. The archived JPEG is not runtime art and is not licensed as distributable game content. The old `portraitModels.ts` remains historical source but is no longer imported or executed. The generated ensemble drafts were reviewed and rejected for overlap/cropping; only individual final portraits ship. Typography uses locally available system fonts.
