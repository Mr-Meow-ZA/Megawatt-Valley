# Reference-driven visual pass — 2 October 2026

Rapha rejected the earlier interface as too far from the supplied **Style B — Cozy
Low-Poly** image. That was fair: the old interface was a large, empty dark dock
with tiny thumbnails, objectives on the left and a separate map at the bottom.
The earlier model import improved individual objects without solving that design.

## Implemented

- Build mode now has three separate illustrated panels: **Staff, Events, Build
  Menu**. Blue headers and cream/white cards follow the reference's hierarchy.
- A compact navy top bar leaves more space for the park. Objectives and an
  illustrated valley map form a right sidebar; selection and urgent alerts use
  the opposite side so they do not cover each other.
- All nine existing build items appear initially. Solar, Operations, Grid &
  Utilities and Decorations filter the catalogue. Large, cropped previews show
  the actual park art, with short names, green prices, selection states and
  readable unlock/affordability reasons. Full descriptions remain in tooltips.
- Four original vector crew illustrations represent the four implemented roles.
  Actual hiring counts, selected/lead worker skill, task state and a Manage Team
  action populate the Staff panel. Team management has larger portrait cards,
  skill bars and working training/dismissal controls.
- Events shows an original landscape illustration driven by current weather and
  daylight, actual power/sunlight, the latest park message, storm preparation
  state and current research. It does not promise invented forecasts or bonuses.
- Upgrades, Finance, event dialogs and the game menu use the same light card
  language. The real nine-node research tree retains its working progression.
- The map renders at 3x resolution with trees, river banks, roads, actual array
  footprints and a selected-equipment highlight. Click navigation still uses
  the shared layout. A home button and Enter/Home keyboard action return home.
- The world uses smooth sampling and native-resolution generated textures.
  Warmer meadow/foothill colours and the existing faceted tree/building art in
  the distant village make the landscape more coherent.
- Desktop keeps all three panels. Laptop keeps the same hierarchy with smaller
  portraits and cards. Smaller windows collapse the overview columns so the
  functional management workspace remains usable. The dock still collapses.

The interface stylesheet is `src/ui/referenceHud.css`, loaded after the older
styles and included explicitly in both Vite and the standalone HTML package.
Original SVG illustrations are in `src/ui/referenceArt.ts`; no external fonts,
image requests, assets or model downloads are required while playing.

## Honest assessment

My visual assessment after inspecting actual screenshots: the interface is
around **7/10 as a prototype**, while the scene's fidelity to the supplied image
is still around **5/10**. These are subjective design scores, not test results.

The reference shows polished 3D terrain, mature landscaping, expressive 3D
characters and a developed park. This build is still a 2D isometric game with
simple terrain and small animated workers. The new portraits are original flat
illustrations, not finished 3D character art. Equipment variety and richer world
lighting remain the largest gaps. The opening park also remains small because
its equipment is real and financed by the existing starting budget.

The poster's battery storage, trackers and researcher role are not implemented
here. Showing them as working purchases would misrepresent the game. They need
simulation and art work before they join this catalogue.

## Validation

- TypeScript and production build.
- All 34 simulation/layout/research/release/playthrough tests.
- Offline Chromium checks: three-panel geometry, complete initial catalogue,
  large image previews, right-sidebar separation, collapse/reopen, equipment
  placement/repeat placement, selection, environmental inspection, saves,
  imports, hiring/restart, finance, research purchase/persistence/pause/completion,
  prerequisite gates, keyboard focus, alert navigation and laptop controls.
- Visual inspection of desktop opening, populated park, laptop management,
  technology tree, day/night and placement screenshots.

No economy, research effects, scenario gates, starting equipment, prices or
camera defaults were changed by this visual pass.

## Next art priorities

1. Build a cohesive solar-campus art slice: finished grid station, garage and
   office, matched shadows, planted boundaries and readable workers/vehicles.
2. Rework terrain depth, mountain composition, water and light toward the
   reference; coloured flat polygons cannot provide its full 3D appearance.
3. Expand the catalogue only alongside working layout/solar/storage mechanics.
4. Have Rapha assess the actual playable screenshots before claiming the visual
   target has been met.
