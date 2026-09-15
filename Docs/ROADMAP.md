# Megawatt Valley — Development Roadmap v0.1

## Roadmap philosophy

Megawatt Valley will be built in playable layers. Each phase must produce something testable before the next major system is added.

The first strategic goal is not “build the full renewable-energy tycoon.” It is:

> **Prove that placing, operating, maintaining, and growing a small solar project is fun.**

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

### Exit criteria
- Player can comfortably inspect and navigate the test site.

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

### Exit criteria
- The player can complete a defined scenario and understand what they achieved and unlocked.

---

## Phase 10 — Level 1 Vertical Slice

### Goal
Combine the systems into the first coherent 30–60 minute scenario.

Working level title:

**Level 1 — Here Comes the Sun**

Expected ingredients:
- one polished-ish test map;
- multiple candidate project sites or site choices;
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
- 1–3 star completion;
- one memorable scripted climax / final challenge.

### Exit criteria
- A new player can start, learn, build, operate, make decisions, complete the level, and want to play again.

This is the first major **go / change / rethink** point for the project.

---

## Phase 11 — Personality and Presentation

### Goal
Turn the functional vertical slice into something recognisably Megawatt Valley.

### Tasks
- Original stylised art direction.
- Character silhouettes and animation.
- Better solar equipment models.
- Construction animation / staging.
- Weather effects.
- Humorous writing.
- Staff quirks.
- Audio feedback.
- Music direction.
- Radio / announcement experiments.
- UI polish.
- Environmental storytelling and visual jokes.

### Exit criteria
- Screenshots and short clips clearly communicate the intended identity of the game.

---

## Phase 12 — Expansion Systems

Only after the solar vertical slice is proven.

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
