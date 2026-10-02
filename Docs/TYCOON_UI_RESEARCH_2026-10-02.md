# Megawatt Valley — simulator UI research and implementation

2 October 2026 · Codex · Phaser branch `codex/solar-release-hardening`, PR #10

Rapha clarified that the supplied isometric/low-poly images are references, and
that a worker's character should appear when selected rather than permanently
in the bottom bar. The earlier three-panel poster layout was too literal and
consumed play space. Research was completed before this implementation.

## What was researched

The evidence is published guides and interface descriptions, plus Rapha's two
reference images. These benchmark games were not installed or playtested here.
No game art was copied. A community guide describes behaviour; it does not
establish usability or enjoyment by itself.

| Game and source | Observed interaction | Decision for our game |
| --- | --- | --- |
| [Two Point Campus — Staff Fundamentals](https://gamefaqs.gamespot.com/pc/323032-two-point-campus/faqs/82357/staff-fundamentals) and [Interface Grand Tour](https://gamefaqs.gamespot.com/pc/323032-two-point-campus/faqs/82357/game-interface-grand-tour) | Worker selection opens an individual information panel; Personnel Management has a separate staff list. | Keep comparing/hiring in Staff; clicking a worker or roster entry opens their profile. |
| [Planet Zoo — official Frontier staff guide](https://www.planetzoogame.com/help-centre/player-guides/staff-and-guests) | Hiring uses the Staff page in Zoo Management; training and employment actions are accessible through individual staff information as well as management. | Put skill, wage, task and training in the selected profile; use real game state. |
| [Parkitect — illustrated community interface guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2374206320) | Separate management tabs and a selected staff window with info/tasks/stats and train/fire/find controls. | Compact permanent toolbar; optional management drawers; contextual Find/Train/Dismiss. |
| [Planet Coaster — UI and controls guide](https://www.gameskinny.com/tips/planet-coaster-beginners-guide-getting-started-ui-and-controls/) | Park management contains finance/research/staff; selecting people or objects opens a selection panel. | Persistent park KPIs, focused tools, and a selected-object inspector. |

The design inference is to separate three jobs: observing the park, managing a
company-wide list, and inspecting one person/object. This is a pattern adapted
to our mechanics, not a claim that all benchmark games use identical layouts.

## Implemented

- Closed tools by default: a 42px toolbar replaces the permanent Staff/Events/Build
  dashboard. One management drawer is visible at a time, above the toolbar.
- Build: larger horizontal equipment cards with actual images, prices and unlock
  state; search, category filters and previous/next browse controls. Existing nine
  build items and their costs are preserved.
- Staff: hiring, searchable roster, role filter, name/skill/task sorting, actual
  wages and total payroll. Role markers replace permanent character portraits.
- World/roster worker selection: close the management drawer and open a portrait
  profile with name, role, task, skill, wage and trait. Find/Train/Dismiss work.
  Training updates the profile immediately, costs $800 and respects the skill cap;
  insufficient funds disable it. The last worker cannot be dismissed.
- Events: weather illustration and current park notices appear only on request.
  Urgent equipment alerts and decision dialogs retain their existing behaviours.
- B/T toggle Build/Staff; U/H/F retain research/home/find. Typing in search does
  not trigger pause, repair or cleaning. Escape cancels placement, clears selected
  objects, then closes management tools; research retains its own Escape handling.
- Navy headers, pale cards, green status, smooth world art and original portraits
  retain a consistent art direction. No unrelated art packs were added.

## Verification and remaining work

34 simulation/layout/research/release/playthrough tests, TypeScript/Vite build,
standalone packaging and offline Chromium interaction checks. Browser coverage
includes default empty toolbar, one visible drawer, search and browse, map/drawer
separation, world worker selection, contextual portrait, real training cost and
profile refresh, staff filters/sort, roster inspection, existing placement/saves/
research/events, and 1440×900 / 1024×768 layouts. Screenshots are captured in the
workflow browser-evidence artifact and visually inspected during development.

The profile uses the existing original role illustration rather than a generated
likeness of each employee. The park is still a 2D isometric Phaser world, not a
production 3D campus. Terrain composition, more convincing lighting, expressive
staff animation and richer equipment/facilities remain the next visual priorities.
No happiness, needs, productivity score, work zone or unimplemented building is
presented as a working feature. Enjoyment requires independent playtesting.
