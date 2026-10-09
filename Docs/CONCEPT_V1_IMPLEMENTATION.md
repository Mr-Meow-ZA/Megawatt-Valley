# Concept v1 — clean-sheet implementation
8 October 2026. Governing direction: [read first](CODEX_UI_UX_READ_FIRST.md), [quality standard §15](VISUAL_QUALITY_AND_WORLD_CHARACTER.md), latest [product decision](CHATGPT_REVIEW.md).

## Source review
All three direction documents read. The actual four-anchor concept image was subsequently located in [issue #13 — New visual inspiration](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13) and visually inspected on 8 October. Attachment: https://github.com/user-attachments/assets/a711aca4-4670-40d3-87e8-0330a4a63c8b . The canonical Docs/References JPG remains absent; issue #13 is the inspected source. Reference extraction was verified by review workflow 37728721669.

Observed visual language: translucent navy HUD/header, cool light content panels, blue navigation, green purchase/actions, substantial previews, roster plus large character presentation, connected research tiers. The reference guides hierarchy and interaction; its example values and artwork are not reused as game content.

The current 3D renderer and simulation stay intact. src/ui/tycoon is historical functional scaffolding. New composition, styling, data adapters and controller live under src/ui/studio; no inheritance from the old HUD or stylesheet. Generic DOM reconciliation may be reused as infrastructure.

## Information architecture
- Persistent HUD: company cash/net, generation/export/headroom, crew, weather/time, next objective and situation alerts. A compact interactive site map connects information to the world.
- Build: browse technologies, inspect a substantial preview, compare real trade-offs, then enter placement with a compact tool strip. Browsing does not spend money.
- People: roster plus character portrait, current work/destination, energy/skill, assignment and development. Hiring and dismissal remain available.
- Research: three connected families with explicit dependencies, complete/current/available/locked states, selected-project detail, cash/time and engineer support. Company capabilities sit alongside research without being confused with timed projects.
- Operations: people/jobs, service policies and equipment context.
- Company: financial results and supply agreements.
- Objectives: scenario progression and mastery.
- Events/settings: focused, keyboard-accessible dialogs.

## Data inventory and honest adaptation
| Surface | Existing data | Presentation decision |
| --- | --- | --- |
| HUD | cash, revenuePerHour, power/export, inverter cap, clipped output, weather, crew, objectives | Read directly from snapshot; net and gross remain distinct. |
| Solar | price, rated kW, efficiency factor, reliability, footprint, research, irradiance | Compare rated and modeled clear-noon output; efficiency is a relative gameplay factor, NOT cell-conversion efficiency. Show cash after purchase and export consequences. |
| Solar maintenance | equal 0.12/park-hour base running cost per array, fault-risk differences, condition | Distinguish routine running cost from repair burden; state actual trade-offs. |
| Lifespan/warranty | No retirement timer or warranty mechanics | No invented years/warranties. Explain condition-based operation in secondary detail. |
| Staff | name, role, trait, skill 1–5, energy, task, destination, site/duty, salary, training hours | Large original 3D character portrait, real operational information; no fictional experience/morale histories. |
| Research | nine nodes, three branches, prerequisites, cash cost, park-hour duration, live progress, engineer assistance | Cash/time economy; no fabricated research-point currency. Future campaign concepts labelled future. |
| Capabilities | manual repair/clean rewards, expansion choice, scheduled cleaning | Explain how each removes repetition, actual unlock reasons and purchase costs. |

## Verification
Test adapters against simulation-derived values. Run all existing scenario/save tests. Replace obsolete layout-specific UI tests with meaningful new flows: compare before placement; right-click/road gestures; staff portrait/assignment/training; graph dependency and purchase; event choices; contracts/policies; keyboard and laptop reachability; save/import/export/new/resume. Retain packaged Windows checks and record actual screenshots.

## Current phase
Clean-sheet implementation is now wired under src/ui/studio. Tokens/components, HUD/minimap, browse/compare/place, profiles/assignments/training, connected research, policies, contracts, finance, objectives, events and saves are implemented. Validation is running; do not claim the visual target or checks have passed until evidence is recorded. Original detailed portrait busts now distinguish Tess and the recruitable roles, with faces, expressions, hair, PPE and folded-arm poses. They are pre-rendered once; the small in-world models and simulation remain unchanged. Further character art refinement remains part of the quality target, not a claim of product acceptance.


## Module boundaries
- `ValleyInterface.ts`: UI selection, navigation, delegated actions, focus management and modal time handling. Calls existing simulation APIs; no progression/economy implementation.
- `anchors.ts`: procurement, staff and research views; `management.ts`: equipment, operations, finance, contracts and objectives.
- `data.ts`: presentation adapters checked against simulation output; `components.ts`, `tokens.css`, `studio.css`: shared UI system.
- `minimap.ts`: shared world geometry + snapshot state, never independent geography.
- `portraitModels.ts` / `portraits.ts`: original detailed character busts, rendered once at startup, then disposed. In-world staff geometry is unchanged.
- `reconcile.ts`: updates live values without replacing stable controls; preserves expanded facts and focused selects.
- `scripts/package-playable.mjs`: embeds the entrypoint's bundled CSS so desktop/offline and development builds share the same interface.

## Interaction decisions
Browsing does not start placement or spend money. Explicit Place returns the world to the foreground; repeated placement, road dragging, Shift bend choice, atomic rejection, right-click and Escape remain intact. Procurement and research keep decision footers visible while details scroll. Staff Find in valley closes the profile so the target is visible. Confirmations pause time, make background controls inert and return the previous speed after the decision. Native save and portable import/export remain available.

## Quality review
The first running four-anchor capture was reviewed against issue #13. The new hierarchy, palette, previews, portraits and connected progression are implemented; it is a functioning design foundation, not a claim of final visual acceptance. Initial below-fold purchase/research buttons were corrected after screenshot review. Continue improving character individuality/motion, research illustration and milestone feedback in the approved direction. No new product decision requires Rapha at this point.

## Superseding artwork pass — 9 October 2026

The procedural portrait and handmade icon choices described above were rejected by Rapha. They are historical implementation details, not the target. The canonical approved reference JPG is now archived in Docs/References and was inspected again during this pass.

Runtime portraits now come from five individual generated PNG illustrations. `artwork.ts` loads and decodes local assets once, supplies short shared blob URLs, and draws eight illustrated navigation/research motifs from a single atlas. `portraits.ts` maps actual staff identities/roles to those images; it performs no geometry rendering. `portraitModels.ts` is historical unused source. `phosphor.ts` vendors a licensed professional icon family for small controls. The native loader decodes packaged base64 directly to respect the desktop's existing restrictive content-security policy.

Profile layout now gives the character a dedicated full-height stage, with independently scrolling roster and operational details. The recruitment view shows all four role portraits. Main destinations and research/capability cards use authored artwork; actual equipment previews remain faithful to the in-world models. Labels, button states, cash/time consequences, simulation contracts and keyboard behavior remain real. The laptop solar comparison retains its visible decision footer and tighter row spacing.

Quality assessment must use actual runtime screenshots, including 1024×768 and native startup. The reference still sets a higher overall world/interaction target; generated artwork and passing checks do not automatically mean the final visual goal has been achieved. Product-owner playtest remains necessary for acceptance, but routine development continues autonomously.
