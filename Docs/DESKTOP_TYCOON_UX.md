# Desktop tycoon interface — autonomous build 0.4.0

This is the independent TypeScript/Three.js/Electron build. The Unity project and earlier interface files remain historical/reference work. The desktop entry point uses only `src/ui/tycoon` and its new stylesheet; it does not import DomHud, styles.css or referenceHud.css.

## Design decisions

The valley is the main workspace. Cash and export headroom stay compact at the top. Build, Staff, Company and Site views occupy a small bottom tool rail. Time controls occupy the opposite corner. The current scenario decision is separate from the detailed award journal.

Build is a vertically scrolling catalogue with recognisable model previews, Generation / Infrastructure / Landscaping categories, prices, search and explicit trade-offs. Equipment and crew actions appear in a contextual inspector. Company management opens a larger sheet for Overview, Upgrades, Operations and Contracts. Event choices and destructive in-game actions use a focused dialog. Save, portable import/export, sound and New Company live in the pause menu.

This is original artwork/layout/code informed by common tycoon interaction conventions:
- Two Point Campus interface walkthrough: https://gamefaqs.gamespot.com/pc/323032-two-point-campus/faqs/82357/game-interface-grand-tour
- Two Point Campus interface reference: https://two-point-campus.fandom.com/wiki/Interface
- SimCity reference manual in Don Hopkins' archive: https://www.donhopkins.com/home/catalog/simcity/manual/reference.html

Useful principles: contextual selection, grouped management tools, information overlaid on the map, clear tool cost, continuous road drawing and direct camera controls. No proprietary game art, interface assets or copied layouts are distributed.

## Controls and actual object purpose

- Right-click or Esc cancels placement. Clicking places another copy until cancelled.
- Hold left mouse and drag a road route. Release commits the whole valid, affordable plan. Shift swaps its cardinal bend. Existing road tiles are skipped, so they are not charged twice.
- Invalid or unaffordable strokes place nothing and spend nothing.
- Middle-drag pans even with a building tool selected. Wheel zoom stays anchored to the cursor.
- B Build; T Staff; U company upgrades; H home camera; F selected object; Space pause; R repair; C clean; Ctrl+S save.

Commissioned roads must connect to the permanent access network. Equipment with a connected road within 2.5 tiles of its service edge receives 25% shorter crew travel time. Crews follow the network when it serves their destination, including the actual river bridge. Unconnected road islands have no service bonus. Road service view exposes coverage. Removing a connecting road removes downstream coverage.

Workshops shorten repairs by one third within eight tiles on the same plot, and help crew recovery. Inverters add export headroom. Bargain and premium arrays retain price, output, reliability and weather trade-offs. Trees, fences, gates and signs are explicitly optional landscaping; this scenario does not claim unimplemented security or morale effects.

## Architecture

- `TycoonHud.ts`: independent interface composition, actions and modal focus.
- `morph.ts`: incremental DOM patching that preserves live buttons, fields and scroll containers while simulation values change.
- `catalogue.ts`: player-facing purposes and trade-offs.
- `tycoon.css`: original cream/green/gold management presentation and laptop layout.
- `roads.ts`: connected road graph, cardinal strokes and crew routes.
- `GameSimulation.roadPlan/placeRoadStroke`: validation and atomic road construction.
- `SiteOverlay.ts`: batched ground information, separate from world selection.
- `main.ts`: canvas input, camera, lifecycle and desktop commands.

Simulation saves retain version 1 compatibility. Connected service access is derived from placed infrastructure; legacy isolated road tiles remain placed but now need a connection to provide their benefit.

## Development log

6 October: implemented the new interface, contextual tools, road drawing, coverage, catalogue descriptions and dedicated desktop input. Added five road tests; all 68 simulation/render-support tests passed, including normal-budget scenario completion and three-star recovery. Windows executable checks passed launch, native saving, imported campaign, fullscreen, normal close, reload and backup recovery.

7 October: the long UI test exposed clock updates replacing speed-button DOM during pointer interactions. Replaced wholesale DOM updates with incremental patching. Also removed irrelevant repair controls from landscaping, cleared road coverage when selecting other build tools, refreshed overlay cache after changed placements, and corrected the road test's screen coordinates to use unobscured ground.

## Remaining validation / next work

The full new-interface regression passed on 7 October (run 37573680105), covering road drawing/rejection/cancellation, repeated construction, new company, persistence, scenario fixtures, timed training, contracts, research, operations and laptop reachability. Actual catalogue, crew, company, road-preview and laptop screenshots were reviewed. Windows verification found a test race reading the previous save before the native command completed; the test now waits for the new persisted save. Final packaged Windows verification is still required. The desktop package excludes bundled node_modules: renderer dependencies are already compiled into game.js, while desktop runtime imports use Electron, Node built-ins and local application files. Continue refining scene presentation and player feedback after this interaction foundation is validated. The next campaign scenario is still a future release.
