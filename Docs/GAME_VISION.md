# Megawatt Valley — Game Vision v0.1

## One-sentence pitch

A humorous, character-driven renewable-energy management tycoon where the player grows from a tiny solar developer into a major clean-energy company by developing, building, operating, and expanding increasingly complex renewable assets.

## Player fantasy

The player should feel:

> **I built this renewable-energy company from almost nothing.**

At the beginning, the player has limited cash, a tiny office, basic staff, simple solar technology, and very little room for error. Over time, the player develops larger projects, unlocks better technology, trains staff, gains access to finance, handles increasingly complex operational problems, and eventually manages a major portfolio of renewable assets.

The reward is not merely a larger bank balance. It is seeing the player's organisation, people, projects, capabilities, and world physically grow.

## Core design pillars

### 1. Accessible first, deep underneath

The player should never need an engineering degree to understand the game.

The underlying systems can reflect real renewable-energy relationships — yield, availability, degradation, grid constraints, equipment reliability, financing, maintenance, weather, and operational risk — but they should be expressed through intuitive choices, visual feedback, characters, overlays, and consequences.

**Principle:** Realism in cause and effect. Abstraction in execution.

### 2. Character-driven management

People should matter.

Staff are not only passive percentage bonuses. They have jobs, skills, workloads, traits, training, salaries, strengths, weaknesses, and visible behaviour in the world.

The player should grow attached to recurring employees and recognise how stronger teams improve the company.

Potential roles include:

- Technicians
- Engineers
- Site Managers
- Project Managers
- Security
- Cleaners / panel-cleaning teams
- Community liaison staff
- Environmental staff
- Finance / Commercial staff
- Asset Managers
- Control-room operators

### 3. Humour from the industry and the people

The game should have a warm, playful tone influenced by management games such as the Two Point series and Tropico, without copying their writing or visual identity.

The renewable-energy industry itself provides excellent material for humour:

- permits moving from “Awaiting Review” to “Awaiting Further Review”;
- replacement components being “on a ship somewhere”;
- consultants producing enormous studies that recommend another study;
- unreliable equipment vendors;
- grid connection delays;
- staff personality quirks;
- weather forecasts that create panic;
- construction teams finding problems at exactly the wrong time.

The world remains credible. The humour comes from how people experience it.

### 4. Choices, not arbitrary punishment

Random events should usually create decisions rather than simply remove money.

Example:

**Severe hail forecast**

- Stow trackers now: lose some generation, very low damage risk.
- Keep generating until the storm approaches: higher revenue, moderate risk.
- Ignore the warning: maximum short-term revenue, high equipment risk.

The player should understand why something happened and feel that preparation, investment, staffing, or previous decisions affected the outcome.

### 5. Visible cause and effect

The 3D world should communicate what is happening.

Examples:

- panels visibly track or sit idle;
- clouds cross the site and generation changes;
- technicians travel to failed equipment;
- construction appears in stages;
- turbines yaw and rotate later in the campaign;
- maintenance vehicles move around sites;
- grid overlays show bottlenecks;
- staff occupy and expand the company office;
- the command centre becomes increasingly active as the portfolio grows.

Numbers matter, but the player should be able to *see* the company working.

### 6. Meaningful progression

Progression should unlock new capabilities rather than only percentage bonuses.

Possible technology progression:

- small / fixed-tilt solar;
- utility-scale PV;
- bifacial modules;
- trackers;
- better inverters;
- advanced weather protection;
- automated cleaning;
- smarter monitoring and analytics;
- BESS;
- wind;
- hybrid plants;
- grid services;
- portfolio operations;
- advanced control-room and automation capabilities.

Company capability should progress too, including development, engineering, construction, finance, asset management, O&M, grid, community, environmental, and commercial functions.

A core progression pattern is the **Management Abstraction Ladder**: the player first understands a responsibility through direct action, then delegates it to staff, then manages it through schedules / policy, and eventually automates routine work. As old chores become easier, new strategic responsibilities should appear.

Examples include cleaning, maintenance dispatch, monitoring, vegetation and security. The player should eventually remember doing these jobs manually and feel the company has genuinely matured when systems and people handle them automatically.

Detailed progression and unlock design lives in `Docs/PROGRESSION_AND_ENGAGEMENT.md`.

## Main gameplay loop

**DEVELOP → FINANCE → BUILD → OPERATE → EXPAND**

### Develop

Evaluate candidate sites, spend money to reduce uncertainty, uncover constraints, secure land and approvals, and decide whether a project is worth pursuing.

Possible site attributes include:

- solar resource / wind resource;
- land cost;
- grid proximity and capacity;
- environmental constraints;
- geotechnical conditions;
- community sentiment;
- weather exposure;
- construction difficulty;
- theft / security risk.

### Finance

Early financing should be simple. Complexity increases over time.

Potential systems include:

- cash;
- development budget;
- debt;
- investors;
- PPAs;
- construction budgets;
- contingency;
- insurance;
- debt repayments;
- merchant exposure.

### Build

Construction should be visible rather than represented only by a progress bar.

The player should see roads, fencing, foundations, panels, cables, inverters, substations, and other infrastructure appear as the project progresses.

Contractor selection, budget, schedule, quality, staffing, and unexpected problems can all influence construction.

### Operate

Commissioning is the beginning of a new phase rather than the end of a level.

The player manages:

- generation;
- revenue;
- equipment condition;
- failures;
- preventive maintenance;
- corrective maintenance;
- cleaning;
- vegetation;
- grid outages;
- curtailment;
- security;
- staff workloads;
- performance.

### Expand

Successful operation increases cash, reputation, capability, and access to better staff, technologies, finance, regions, and project sizes.

## Campaign philosophy

The campaign should use staged scenarios / regions with increasing complexity.

A scenario can award up to three stars:

- **1 star:** complete the core objective and unlock the next region.
- **2 stars:** demonstrate stronger operational / financial performance.
- **3 stars:** master the scenario with demanding optional objectives.

One star should be enough to continue the campaign so players are not forced to perfect every map.

## Long-term scale

The intended progression is approximately:

Small solar → commercial / utility solar → storage → wind → hybrid assets → multiple projects → portfolio management → major IPP-scale operations.

Later-game complexity may include:

- regional O&M teams;
- control centres;
- multiple simultaneous developments;
- portfolio-level staffing;
- financing constraints;
- grid congestion and curtailment;
- major component failures;
- extreme weather;
- competing project opportunities;
- reputation and stakeholder relationships.

## The office / headquarters

The company headquarters should be a visible representation of company growth.

The player may begin with a tiny prefab office and gradually unlock areas such as:

- Development
- Engineering
- Construction
- Finance
- Commercial
- Asset Management
- O&M
- Community / ESG
- Environmental
- Control Centre
- Executive offices

The office provides a strong character-management layer and gives company progression a physical presence.

## Visual direction

Target style:

- stylised 3D;
- readable isometric / freely rotating tycoon camera;
- expressive characters;
- exaggerated but recognisable renewable-energy equipment;
- clean, friendly management UI;
- visually readable weather, construction, faults, and energy flow;
- distinct original character silhouettes and visual identity.

Scale can be intentionally exaggerated where necessary for readability.

## Reference games

Primary reference:

- Two Point Hospital / Campus / Museum — accessibility, humour, campaign structure, readable world, staff-driven management.

Supporting references:

- Tropico — personality, announcements, world humour.
- Planet Zoo — staff training, work zones, management depth.
- Parkitect / Megaquarium — staff zoning and behind-the-scenes operations.
- Power to the People — electricity, generation, storage, weather and grid-system inspiration.
- Against the Storm — scenario variation and meta-progression.
- Timberborn — telegraphed hazards and preparation.
- Surviving Mars — research and longer event chains.
- Cities: Skylines — readable infrastructure overlays and capacity bottlenecks.

These are design references only. Megawatt Valley must remain an original game.

## Current design boundary

The first playable target is a solar-only vertical slice.

Do not expand into wind, BESS, complex debt structures, multiplayer, large-scale procedural generation, or extensive content until the fundamental build-operate-maintain-grow loop is enjoyable.
