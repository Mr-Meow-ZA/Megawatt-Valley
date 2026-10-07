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

7 October: screenshot review improved queued-job destination names and Find actions, disabled repeated dispatch buttons for assigned jobs, and made road plans cyan against service coverage. The expanded gesture test found that Pointer Events omit a second pointerdown when right-clicking during a left-button drag; handling mouse-button chords now cancels that plan without spending. Desktop packaging excludes duplicate development dependencies, reducing the combined installer/portable artifact from approximately 608 MB to 274 MB.

7 October: the long UI test exposed clock updates replacing speed-button DOM during pointer interactions. Replaced wholesale DOM updates with incremental patching. Also removed irrelevant repair controls from landscaping, cleared road coverage when selecting other build tools, refreshed overlay cache after changed placements, and corrected the road test's screen coordinates to use unobscured ground.

## Delivery and next work

Desktop 0.4.0 runtime commit `eea87a3cc304a3eeb911afb084b7f945d4973eec` passed all 68 tests, production compilation, the complete UI/gesture/keyboard regression and packaged Windows checks.

- Share/download page: https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/runs/37576925019
- Windows artifact: `MEGAWATT-VALLEY-3D-WINDOWS` (installer and portable ZIP).
- Interface screenshots and offline evidence: https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/runs/37576925023

The tests cover interrupted road gestures without spending, middle-button panning, stable live controls, topmost confirmation focus, repeated placement, scenario fixtures, real-time staff training, contracts, research, queued work, laptop controls, import/export and save/reload. Windows checks additionally cover native saving, fullscreen, normal close/resume and backup recovery. Screenshots were inspected; no runtime or unexpected network errors were reported.

Existing version-1 saves remain compatible. Unconnected roads in old saves now need a connection for their service benefit. The combined Windows artifact is about 274 MB after excluding duplicate development dependencies. The app uses only bundled renderer code, Electron/Node built-ins and local application modules.

Next: player feedback on navigation and catalogue clarity; further scene and character presentation; later campaign content remains a future release.

## Verified desktop candidate — 7 October

Commit 1c8f44e passed 68 tests, the full UI/gesture regression (run 37576370380) and packaged Windows checks (run 37576370398). Right-click during a held left-button drag now cancels without placing or spending. Final follow-up adds explicit topmost-dialog focus and a keyboard regression for confirmations opened above the Company sheet.

Final 7 October result: the keyboard-focus follow-up passed both release workflows. The URLs above point to the tested runtime, independent of later documentation-only commits.
