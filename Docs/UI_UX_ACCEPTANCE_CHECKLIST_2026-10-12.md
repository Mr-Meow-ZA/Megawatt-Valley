# Player-facing UI/UX acceptance checklist — Solar Level 1 (12 October 2026)

**Decision owner:** Rapha. **Implementation:** Codex. This checklist is subordinate to user feedback on [active board #20](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/20), world inspiration [#12](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/12) and approved 4-screen concept [#13](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13). Passing a programmatic assertion **cannot** override owner rejection of actual visual quality.

## What was rejected
On 9 October Rapha provided seven screenshots of the actual game (Goals, Research, Staff/Tess, Supply Contracts, objective prompt, minimap, bottom navigation). They looked like an internal administrative dashboard, not a polished management/tycoon game. The wrong direction is **the structure, not just CSS**: big pale full-screen forms, flat repeated boxes, tiny subdued text, large empty areas, inconsistent decorative image icons, ultrareal staff portrait pasted over a primitive 3D world, featureless minimap and research grey boxes.

**Non-negotiable**: one visually coherent game identity across the actual valley, buildings, characters, world overlays, UI iconography, textures, lighting, typography, card/interaction hierarchy and screen transitions. The world is the star; player decisions are contextually layered over it.

## Mandatory evidence for each component
| Surface | Quality / gameplay acceptance | Evidence |
|---|---|---|
| **World & main HUD** | Characterful layered 3D environment, clear facilities/panel scale, functioning roads, staff and vehicles, readable compact resources/time/weather, objective guidance without hiding the world | 1920×1080 full gameplay, zoomed-out and close world screenshot, weather and actively staffed scene |
| **Build & solar purchase** | Coherent illustrated/model previews showing exact in-game asset; clearly distinguish bargain/premium/output/reliability/price/export; easy preview/drag/place/cancel, cost feedback, collision, cash and persistent selection | Pre/post placing, selected equipment/context and test of invalid purchase |
| **Technicians, recruitment, assignment, training** | Staff art stylistically matches in-world characters; clear role/stats/energy/traits and visual work activity; readable roster and actual task flow | Profile+roster, hire, job assignment, in-world work and training state |
| **Research & technology** | Attractive connected 3-family tech tree, clear dependencies/levels, progress/cost/timing, available/locked/completed hierarchy, accurate engineering help; not nine generic grey rectangles | New game and mid-research screenshots + mouse/keyboard actions |
| **Operations & service** | Readable equipment condition, repair/clean/site coverage, queues, policy control, crew assignments; spatial relation to valley | Fault and cleaning walkthrough + operation actions and before/after |
| **Company finance and supply contracts** | Decisions prominent, costs/risks/rewards easy to compare; enough illustration/storytelling; relevant progress/history. No giant blank white contract screen | Offer, accept, in-progress, success/failure states, readable cash/export |
| **Goals / objectives / 1★–3★** | Sense of growth and milestones, next sensible action, meaningful goals and celebration; not an overwhelming 12-card admin checklist | Early game, mid progression, 1★ celebration, 2★ and 3★ proof |
| **Map, site views, navigation** | Recognisable and useful representation of playable valley and site B, clear selection/focus, intuitive game controls; icon family looks coherent | Zoom, navigation, minimap and selected site overlay |
| **Events, help, settings, save** | Pleasant feedback and concise copy, modal accessibility, keyboard and game state restore; no stale/cut-off buttons | Hail event, pause menu, save/load/import/export, new game and error case |

## Global acceptance constraints
- **1920×1080, 1366×768, 1024×768** where relevant: game not obscured, font/buttons legible, scroll/keyboard navigation works, no overlays covering purchase/confirm actions.
- Show **real running-game screenshot output** directly (or linked to accessible repo image files, not artifacts whose links cannot be accessed), tagged with exact tested commit; no concept images falsely presented as game output.
- Use a **single coherent illustrated/low-poly/stylised design system**, purposeful panel sizes and composition; use reference concept *language* without copying unlicensed assets or fake stat systems.
- Assets are sourced commercially safely, with credits/licences; unify palette, material, lighting and style across mixed packs; runtime/offline packages contain every required asset. Do not compensate for low-quality scene with photorealistic portrait overlays.
- All visible primary controls *perform* genuine sim actions with honest data; no mock buttons, fabricated XP/research currency/warranty/staff-happiness, duplicate settings or fake future levels.
- UI effects, transitions and audio must be pleasant and reasonably responsive; meaningful confirmation/cancellation for destructive actions; keyboard focus and screen reader labels as technically applicable.
- Player can consistently identify what to do next, how to earn money, why equipment is failing, which worker is on which task, what research does and how to recover. An unfamiliar player should be able to progress without a developer explaining the screens.
- Photo comparison and **owner sign-off** needed for the visual slice **before** replicating UI, and for the completed game before shelving. Codex should rate each area as not started / implementing / test-pass / **owner-approved**, never mark owner-approved from internal review.

## Integration contract
Preserve current game/simulation/save rules, world controls, placement/cancellation and Windows support while rebuilding `src/ui/studio` or replacing it. Keep automated click/keyboard/layout tests but update them to reflect new functionality, not old CSS selectors. Test representative scenario saves and native Windows packaging at exact new HEAD. Avoid a second app-shaped UI rewrite under different names.
