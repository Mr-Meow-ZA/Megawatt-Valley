# Megawatt Valley — finalise Three.js Solar Level 1 before shelving

**Decided by Rapha: 12 October 2026.** The Unity visual test is paused temporarily. Codex will finish the existing true-3D **Three.js + TypeScript + Electron** game for a **complete, polished, single-player Windows Solar Level 1**, then package and archive that accepted version. **Not a full restart; not another incremental dashboard reskin.**

## Where we are
- Starting point: complete 3D candidate snapshot `98cfc2c32a92321c70cfd1a1d196ec9fbe602163`, safely frozen in `archive/threejs-solar-candidate-2026-10-09`.
- **Only active work branch:** `codex/threejs-level1-final`. **Board:** [issue #20](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/20).
- The previously accepted technical foundation includes simulation, research, equipment, crew/jobs, road service access, weather/events, contracts, saving, automated gameplay and offline Windows packaging. The **entire recent visual design was rejected** by Rapha.
- Reference world: [GitHub issue #12](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/12); UI: [issue #13](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13) and `Docs/References/megawatt-valley-ui-ux-approved-concept-v1.jpg`.
- **Remote-only developer reality:** Rapha cannot run Codex locally. Codex must use a cloud workspace and GitHub Actions to build, capture, test and distribute results. Don't ask user to set up local development.

## The failure to correct — not simply bad colors
Rapha's 9 October real screenshots show:
- Oversized white/grey full-screen panels; business-dashboard cards replacing the world.
- Research nine simple grey rectangles and a largely static right inspector; not a rewarding connected, layered tech tree.
- Objectives as dense paperwork/checklists; contracts as three equally flat text columns with enormous blank space; no game-like storytelling/feedback.
- Huge realistic generated Tess image disconnected from simple in-world worker models; inconsistent high-detail art vs low-poly valley and decorative icon atlas.
- Low-detail site/minimap and navigation without the richness/character of the approved concept.
**Do not** re-skin the current CSS grid and call it finished. Design a coherent, visually directed game HUD/screen system and corresponding world art style from scratch, while retaining core simulation.

## Development stages and evidence

### Stage 0 — Baseline, scope and architecture
- Read board, current UX, code dependencies and recent tests; run clean-clone `npm ci`, `npm test`, `npm run build`, browser interaction/visual capture, Windows native packaging.
- Document actual screenshots at typical and laptop sizes; distinguish automated passing tests from player fun/visual quality.
- Confirm simulation and save v1 fixtures are protected with regression tests. Remove/disable retired Cursor agent configs from this work branch; do not delete imported historical files until import audit proves safe.
- Maintain `Docs/RESUME_CHECKPOINT.md` with exact tested head and honest blockers.

### Stage 1 — Vertical slice: world + main HUD + solar build
**This is the mandatory design gate before propagating new UI components.**
- Make the **solar park actually look like a miniature living energy company** using consistent sourced assets, correct scale, materials, composition, roads/gates/fences, solar racks, office/workshop and substation, workers, vehicles, vegetation, lighting/weather, coherent shadows. Improve performance without sacrificing atmosphere.
- Create a game-like persistent HUD, navigation, next objective, contextual build catalogue, visually substantial equipment previews, accurate live solar trade-offs, and working placement feedback. Avoid giant blocking dialogs/white cards; player should see world while managing.
- Solve world-vs-portrait inconsistency. Source a coherent character style; no photoreal cutouts pretending to be in-world staff.
- Capture unmodified real running UI and world at **1920×1080 and 1366×768**, plus 1024×768 for reachability; near/far captures, representative day/weather and basic short video if feasible.
- Compare with #12/#13 openly (hierarchy, sense of scale, saturation, density, narrative, art consistency); post review evidence to #20 and invite Rapha's visual feedback. If it fails, acknowledge and revise the *single* slice, not the full UI.

### Stage 2 — Complete UI/UX re-architecture
Implement all real screens consistently; every interaction must work with the real simulation:
- **HUD / navigation / minimap** — readable resources, energy, time/weather, crew, objective, responsive camera tools, zoom/pan, feedback and site view.
- **Solar build / compare** — procurement choice, visual models, footprint, real output and export limitations, price and cash effects, preview, valid/invalid placement, repeated place, removal, road/fence drag and cancel.
- **People** — coherent stylised roster/portraits, roles, stats/traits, salary, stamina, work orders, recruitment, assignment, training and dismissal; highlight staff actively doing things.
- **Research and capabilities** — convincing connected technology tree with explicit prerequisites, actionable states, progress/timing/cost/engineer support and clear distinction from company capabilities.
- **Operations** — fleet status, current issues, accessible repairs, cleaning, preventive policy, staff job queue, dispatch and site coverage, no stale/hidden buttons.
- **Company/finance/supply agreements** — at-a-glance financial decisions, contract options with real consequences/risks/reward/progress and completed history; avoid tall empty white layouts.
- **Objectives** — legible narrative milestone journey, earned rewards, star progression, conditional unlocks, next sensible action; 1★ / 2★ / 3★ clear and celebratory.
- **Events, onboarding, settings** — weather/hail decisions, non-disruptive toasts, help/contextual instruction, accessible modals, keyboard focus, save/load/import/export, new company and sound; not overbearing or text-only.
- Test all surfaces at desktop and laptop resolutions, including scroll/reachability, buttons, state changes and keyboard/mouse.

### Stage 3 — Complete Level 1 gameplay
**Finish rather than endlessly expand** the existing scenario:
- Starting instructions teach build/generation/export and cash economics without a wall of text. Player can discover, plan, make wrong decisions and recover.
- Validate cheap vs premium panels and real procurement tradeoffs, repair/cleaning and Radio Dispatch, team/training, site B expansion, contracts, research and weather preparation/hail recovery.
- First star around **30–60 minutes for a normal new-player run** (not a hardcoded timer), with optional meaningful 2★ and 3★ mastery; prevent the 2★/3★ award immediately after 1★ just because stored metrics already satisfy them unless clearly designed.
- Audit possible bankruptcy or empty-cash dead ends, corrupted/imported save paths, pausing/reloading progress, event choice timing, accessibility, failure/recovery and persistent achievement states.
- Automated successful scenario paths are necessary but insufficient: request actual first-time player feedback and capture observed confusion/pacing. If no independent player is available, mark human testing outstanding, never invent it.
- **No claims of playable Scenario 2.** Future chapters can be teased honestly as future content.

### Stage 4 — Production polish
- Cohesive asset sourcing from `Docs/FREE_ASSET_RESOURCE_INDEX.md`; note Industrial v2.0 is already bundled. Verify commercial-use licences, modifications and credits in release.
- Improve rich visual environment and animations: visible workers travelling/working, roads, fencing/service yards, construction and damage/cleaning states, vehicle routes, animation, lighting, foreground/background, wind/water weather as *ambient effects*, not technology.
- Music/SFX and UI feedback; typography, hierarchy, transitions, satisfying 1★ win celebration. Avoid performance regressions: measured FPS/frame time, triangles/draw calls and memory on recorded machine specs.
- Native Windows reliability and package size checks; no backend or CDN needed.

### Stage 5 — Release & final archiving gate
- On exact **final commit**, pass simulation tests, browser integration and screenshot capture, clean-clone/LFS asset loading, offline HTML review, native Windows save/close/recovery, fresh install/reinstall where possible.
- Provide GitHub Actions artifact with **Windows portable ZIP and installer**, exact run link, README/controls, credits and licences, realistic min-spec estimate or measured hardware results.
- Publish **`Docs/LEVEL1_RELEASE_ACCEPTANCE_REPORT.md`** including objective verification matrix, screenshots, known limitations, technical/dependency evidence, playtest methodology and user feedback status.
- Ask Rapha to play/approve final build. **Do not declare shipping or shelving until his explicit acceptance.** Only then create a second immutable final Three.js archive and release Unity hold (#19).

## Sequencing and scope controls
- Stage 1 is a hard **visual go/no-go**; before approval Codex can still fix objective gameplay bugs, update tests and credits, but must not mass-implement unreviewed UI.
- No Unity migration while this job is active. No Phaser resurrection, no Level 2, wind arrays, storage gameplay, multi-site portfolio beyond existing Site B, backend, cloud account or paid tool dependencies.
- Keep changes small, continuous and reviewable; record exact code/test/Windows proof, not subjective claims of a complete game.
- Work based on actual GitHub access; if remote Windows runner or Git LFS blocks a step, report accurately with a concrete mitigation.
