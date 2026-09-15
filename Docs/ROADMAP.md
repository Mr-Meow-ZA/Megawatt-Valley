# Megawatt Valley — Development Roadmap v0.4

## Roadmap philosophy

Megawatt Valley will be built in playable layers. Each phase must produce something testable before the next major system is added.

The first strategic goal is not “build the full renewable-energy tycoon.” It is:

> **Prove that placing, operating, maintaining, and growing a small solar project is fun.**

The approved long-term visual target is defined in `Docs/VISUAL_DIRECTION.md`.

The game will not attempt final art quality during early prototypes, but early decisions about camera, scale, world layout, UI composition, simulation / presentation separation, and asset structure must support the eventual visual target.

The visual-production strategy is:

**prove the game → prove the visual language → build reusable art systems → scale content → polish**

## Session-sized progress rule

The larger phases in this roadmap are direction, not the unit of daily work.

Actual development should be driven by the smaller goals in `Docs/SESSION_GOALS.md`.

Each focused work session should normally have **one primary session goal** with a clear finish line and, whenever practical, a visible or playable result. Completing a session goal is a valid success even when the larger phase remains incomplete.

Progress rhythm:

**choose one small goal → build it → play/test it → commit it → celebrate it → choose the next goal**

Do not let a small session goal silently expand into an entire subsystem. Optional stretch work comes after the primary goal is complete.

### Phase ↔ session-goal crosswalk

Session badges prove a *miniature* version of a phase. They do **not** automatically close the full roadmap phase.

| ROADMAP phase | First miniature proof | Still open after miniature |
| --- | --- | --- |
| 0 Foundation | S0-01…S0-05 ✅ | Package / tooling polish as needed |
| 1 World & Camera | S1-01…S1-05 ✅ | Edge scroll, camera presets, bounds polish |
| 2 Building Placement | S2-01…S2-08 ✅ | Snapping rules, multi-tile footprints, construction staging |
| 3 Energy Loop | S3-02…S3-03 (partial) ✅ | Irradiance curves, conversion topology, stats |
| 4 Economy | S3-01…S3-04 (partial) ✅ | OpEx, salaries, bankruptcy boundary, deeper finance |
| 5 Time & Weather | S3-05 + day-factor stub | Full clock, weather variation, visual weather |
| 6 Maintenance | S4-01…S4-05 ✅ | Richer reliability, schedules, costs |
| 7 Staff | S4-04 + S5-02 ✅ | Hire/fire, multi-role, salary, traits depth |
| 8 Events | S5-01 ✅ | Reusable framework + ~5 then ~10–20 events |
| 9 Objectives | S5-04…S5-05 ✅ | Star tiers, unlocks, research |
| 10 Level 1 | Not started | Thin-slice track `L1-01…` in `SESSION_GOALS.md` |

**Anti-duplication rule:** Do not restart Phase 3/4 as a new framework after S3. Extend the existing loop with the next smallest session goal instead.

Practical Cursor / ChatGPT / Grok working practices, asset policy, and post–Tiny Tycoon sequencing live in `Docs/PRACTICES_AND_PLANNING.md` until accepted into this roadmap.

### Cross-cutting visual checkpoints

These checkpoints run alongside gameplay development rather than replacing it:

- **V0 — Grey-box readability:** camera, zoom, scale, silhouettes, building footprints, roads, solar-array readability, and UI composition.
- **V1 — Style prototype / hero corner:** after the core loop is proven, build one small scene at roughly 60–70% of final intended style to validate materials, lighting, proportions, character scale, vegetation, and performance.
- **V2 — Art bible + modular kits:** document and standardise asset scale, material language, colour ranges, bevel / geometry rules, character direction, vegetation, signage, UI language, and optimisation rules before mass production.
- **V3 — Level 1 environment pass:** replace grey-box terrain, roads, buildings, solar assets, substations, props, vehicles, and vegetation progressively.
- **V4 — Characters + world activity:** staff roles, animations, maintenance actions, construction activity, vehicles, idle behaviour, and environmental humour.
- **V5 — UI + weather + VFX + audio integration:** presentation systems come together.
- **V6 — Final polish benchmark:** Level 1 should eventually reach the warmth, readability, density, charm, and screenshot quality of the approved concept direction without copying it literally.

---

## Phase 0 — Foundation

### Goal
Create a stable Unity + Cursor + Git workflow.

### Tasks
- Create Unity project using the agreed Unity 6 LTS / URP baseline.
- Connect project folder to this GitHub repository.
- Add Unity-aware `.gitignore` and Git LFS configuration where appropriate.
- Confirm scene / prefab / script conventions.
- Add basic project folders.
- Configure Input System, Cinemachine, UI Toolkit, and other agreed packages.
- Test Cursor editing and Unity compilation workflow.
- Explore Unity MCP integration if useful.
- Confirm the rendering baseline can support the approved stylised 3D target without introducing premature custom-rendering complexity.

### Session-goal sequence
See `S0-01` through `S0-05` in `Docs/SESSION_GOALS.md`.

### Exit criteria
- Unity project opens cleanly.
- Project is committed to GitHub.
- Cursor can work safely in the project.
- A simple test scene runs without errors.

---

## Phase 1 — World and Camera

### Goal
Create a basic tycoon-game world that feels good to navigate.

### Tasks
- Grey-box terrain / site.
- Pan, zoom, rotate, and edge / mouse navigation as appropriate.
- Selectable ground / plots.
- Basic cursor feedback.
- Simple world-space selection indicator.
- Establish an initial scale reference for a person, vehicle, road, solar table, fence, and representative building.
- Test camera angle and zoom range against the long-term visual target.

### Session-goal sequence
See `S1-01` through `S1-05` in `Docs/SESSION_GOALS.md`.

### Exit criteria
- Player can comfortably inspect and navigate the test site.
- Normal gameplay zoom can clearly distinguish roads, buildings, solar infrastructure, and people-scale placeholders.

---

## Phase 2 — Building Placement

### Goal
Make construction interaction satisfying before adding detailed energy logic.

### Tasks
- Build menu.
- Placement ghost.
- Valid / invalid placement feedback.
- Grid / snapping rules where appropriate.
- Rotation.
- Purchase cost.
- Cancel placement.
- Demolish / remove.
- Initial placeholder solar-array object.
- Confirm placement footprints and spacing are visually compatible with the intended stylised scale rather than blindly using real-world dimensions.

### Session-goal sequence
See `S2-01` through `S2-08` in `Docs/SESSION_GOALS.md`.

### Exit criteria
- Player can spend money to place and remove solar infrastructure reliably.

---

## Phase 3 — Energy Loop

### Goal
Make the first renewable-energy system actually work.

### Initial chain

`SUN → SOLAR ARRAY → POWER CONVERSION → GRID → REVENUE`

### Tasks
- Solar generation model.
- Basic irradiance input.
- Connection state.
- Grid export.
- Current output display.
- Generation statistics.
- Preserve separation between logical plant simulation and visual representation so richer future scenes do not require thousands of individual simulation objects.

### Session-goal sequence
The first end-to-end energy/economy loop is split across `S3-01` through `S3-05` in `Docs/SESSION_GOALS.md`.

### Exit criteria
- A correctly connected solar asset visibly produces power.

---

## Phase 4 — Economy

### Goal
Turn power generation into a tycoon loop.

### Tasks
- Cash balance.
- Build costs.
- Basic operating costs.
- Revenue from exported energy.
- Simple financial feedback.
- Bankruptcy / failure boundary for testing.

### Exit criteria
- Player spends money to build, earns money by operating, and can make financially bad decisions.

---

## Phase 5 — Time and Weather

### Goal
Make generation dynamic rather than constant.

### Tasks
- Game clock.
- Pause / speed controls.
- Day / night cycle.
- Solar resource curve.
- Basic cloud / weather variation.
- Visual relationship between weather and production.
- Keep weather architecture compatible with later atmospheric polish, but use simple prototype visuals first.

### Exit criteria
- Output changes predictably with time and weather, and the player can understand why.

---

## Phase 6 — Equipment Condition and Maintenance

### Goal
Create operational gameplay.

### Tasks
- Equipment condition.
- Reliability / failure logic.
- Preventive maintenance concept.
- Corrective maintenance.
- Failed state affects generation.
- Repair action.
- Maintenance cost.

### Session-goal sequence
Initial operations goals are `S4-01` through `S4-05` in `Docs/SESSION_GOALS.md`.

### Exit criteria
- An operating asset can degrade, fail, lose revenue, and be restored.

---

## Phase 7 — Staff

### Goal
Introduce character-driven management.

### First roles
- Technician
- Engineer
- Site Manager
- Security
- Cleaner / panel-cleaning worker

### Tasks
- Hire / dismiss.
- Salary.
- Role.
- Skill.
- Assignment.
- Basic staff navigation.
- Staff performs at least one meaningful task in-world.
- Initial traits system or placeholder for it.
- Establish staff scale and navigation assumptions that can later support expressive final characters without rewriting core staff logic.

### Exit criteria
- Staff are visibly involved in keeping the project running and materially affect gameplay.

---

## Phase 8 — Decision Events

### Goal
Add uncertainty, humour, and player agency.

### Tasks
- Reusable event framework.
- Trigger / condition support.
- Multiple choices.
- Costs and effects.
- Weighted outcomes where appropriate.
- Event log.
- Approximately 10–20 prototype events.

### Exit criteria
- Events create interesting trade-offs rather than arbitrary punishment.

---

## Phase 9 — Objectives and Progression

### Goal
Turn the sandbox loop into a scenario.

### Tasks
- Objective framework.
- One-star objective set.
- Two-star optional mastery objectives.
- Three-star optional mastery objectives.
- Unlock / reward framework.
- Basic research / capability unlocks.

### Session-goal sequence
Early identity and objective goals appear as `S5-01` through `S5-05` in `Docs/SESSION_GOALS.md`; the sequence will be extended as these phases approach.

### Exit criteria
- The player can complete a defined scenario and understand what they achieved and unlocked.

---

## Phase 10 — Level 1 Functional Vertical Slice

### Goal
Combine the systems into the first coherent 30–60 minute scenario before expensive final-art production.

Working level title:

**Level 1 — Here Comes the Sun**

### Build order (thin slice first)

Do **not** attempt the full Level 1 ingredient list in one pass. Use the `L1-01…` session track in `Docs/SESSION_GOALS.md`:

1. One grey-box scenario map + office presence.
2. Tunable starting cash / tariff data.
3. Two equipment choices.
4. Five decision events (not 10–20).
5. One-star objective + restart clarity.
6. One scripted climax beat.

Only then stretch into multi-site choice, 2★/3★, and a larger event deck.

### Full Level 1 destination ingredients
- one coherent grey-box / early-art test map;
- multiple candidate project sites or site choices (stretch after thin slice);
- small company / office presence;
- starting cash constraint;
- basic staff;
- simple equipment choice;
- construction;
- generation and revenue;
- weather;
- failures and maintenance;
- decision events;
- objectives;
- 1–3 star completion (1★ first);
- one memorable scripted climax / final challenge.

### Exit criteria
- A new player can start, learn, build, operate, make decisions, complete the level, and want to play again.

This is the first major **go / change / rethink** point for the project.

If the gameplay loop passes this checkpoint, begin **V1 — Style Prototype / Hero Corner** before large-scale art production.

---

## Phase 11 — Visual Identity and Production Pipeline

### Goal
Prove that the approved visual target is achievable, then create the reusable art systems needed to scale it.

### Stage A — Style prototype / hero corner

Build one small representative scene at roughly 60–70% of final intended quality containing:

- one small office;
- one O&M workshop;
- one solar-array section;
- one simplified substation;
- one service road;
- one utility vehicle;
- one technician character;
- representative vegetation / landscaping;
- representative UI;
- target lighting and post-processing.

Validate:

- visual identity;
- proportions and scale;
- material style;
- lighting;
- camera composition;
- readability;
- performance;
- whether the art direction remains practical for a small development effort.

### Stage B — Art bible

Document:

- colour language;
- material rules;
- geometry / bevel standards;
- texture approach;
- scale guide;
- character proportion language;
- vegetation language;
- signage / fictional-brand language;
- UI design language;
- LOD and optimisation expectations.

### Stage C — Modular production kits

Develop reusable kits for:

- offices;
- O&M / industrial buildings;
- roads / paths;
- fencing / gates;
- solar components;
- substation components;
- landscaping / vegetation;
- site props;
- vehicles;
- signage / decals.

### Exit criteria
- The hero scene convincingly demonstrates the intended Megawatt Valley visual identity.
- The style is achievable in Unity at acceptable performance.
- Future assets can be produced consistently using a documented pipeline.

---

## Phase 12 — Level 1 Presentation Pass

### Goal
Turn the proven functional vertical slice into a polished Megawatt Valley experience.

### Tasks
- Replace grey-box terrain and environment progressively.
- Production-quality solar / electrical infrastructure.
- Buildings and site facilities.
- Vehicles and props.
- Landscaping / vegetation.
- Character visual pass.
- Task and idle animations.
- Construction animation / staging.
- Weather effects.
- Humorous environmental storytelling.
- Audio feedback.
- Music direction.
- Radio / announcement experiments.
- UI polish.
- Camera polish.
- VFX and feedback.

### Exit criteria
- Screenshots and short clips clearly communicate the intended identity of the game.
- Level 1 can eventually approach the approved concept benchmark in warmth, readability, density, charm, and polish.

---

## Phase 13 — Expansion Systems

Only after the solar vertical slice is proven and its production pipeline is understood.

Potential additions:
- BESS.
- Wind development and operations.
- Hybrid plants.
- More sophisticated grid constraints.
- Company headquarters expansion.
- Department management.
- More complex finance.
- Contractors and vendors.
- Multi-site portfolio operations.
- Command centre.
- Regional campaign map.
- Research tree expansion.
- Company reputation and stakeholder systems.
- Advanced random events / event chains.

## Explicitly deferred for now

These are not first-prototype requirements:

- multiplayer;
- console ports;
- Steam integration;
- procedural world generation at scale;
- detailed electrical power-flow simulation;
- full corporate finance simulation;
- realistic individual-panel electrical modelling;
- DOTS / ECS conversion;
- mod support;
- online services;
- massive content libraries.

## Development rule

If a new feature does not improve or validate the current playable loop, it should normally wait.

If visual polish does not validate a reusable art direction or materially improve the current vertical slice, it should also normally wait.

If a task cannot produce a clear finish line for one working session, split it into smaller entries in `Docs/SESSION_GOALS.md` before implementation.
