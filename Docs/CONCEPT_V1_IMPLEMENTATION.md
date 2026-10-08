# Concept v1 — clean-sheet implementation
8 October 2026. Governing direction: [read first](CODEX_UI_UX_READ_FIRST.md), [quality standard §15](VISUAL_QUALITY_AND_WORLD_CHARACTER.md), latest [product decision](CHATGPT_REVIEW.md).

## Source review
All three direction documents read. The approved JPG was absent from main at the specified path on inspection; the written approved concept governs this implementation. Do not claim a visual match to an unseen image. Recheck for the image before final acceptance.

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
| Staff | name, role, trait, skill 1–5, energy, task, destination, site/duty, salary, training hours | Large original 3D role portrait, real operational information; no fictional experience/morale histories. |
| Research | nine nodes, three branches, prerequisites, cash cost, park-hour duration, live progress, engineer assistance | Cash/time economy; no fabricated research-point currency. Future campaign concepts labelled future. |
| Capabilities | manual repair/clean rewards, expansion choice, scheduled cleaning | Explain how each removes repetition, actual unlock reasons and purchase costs. |

## Verification
Test adapters against simulation-derived values. Run all existing scenario/save tests. Replace obsolete layout-specific UI tests with meaningful new flows: compare before placement; right-click/road gestures; staff portrait/assignment/training; graph dependency and purchase; event choices; contracts/policies; keyboard and laptop reachability; save/import/export/new/resume. Retain packaged Windows checks and record actual screenshots.

## Current phase
Data inventory complete. Building the clean interface system and four anchors. No new UI runtime has passed validation yet.
