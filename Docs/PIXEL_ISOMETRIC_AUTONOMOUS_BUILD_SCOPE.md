# Megawatt Valley — Pixel-Isometric Autonomous Build Scope v1.0

## Status

**Approved experimental implementation scope — 29 September 2026**

This document defines a parallel implementation target for Megawatt Valley intended for highly autonomous AI development.

It preserves the approved Megawatt Valley game design, progression philosophy, humour, renewable-energy focus and campaign direction while changing the presentation and production assumptions to:

- **pixel-art isometric / pixel-styled isometric visuals**;
- a self-contained game that does **not depend on Unity or Godot**;
- minimal or no manual scene assembly / editor intervention by Rapha;
- aggressive reuse of safe community / free assets where useful;
- autonomous implementation, testing, debugging and content integration by the AI builder.

This is currently an **experimental parallel build path**. It does not erase the existing Unity implementation or its design discoveries.

The purpose is to compare autonomous builders such as Cursor and MiMo on the same clear game target.

---

# 1. Product goal

Build a complete, polished, playable renewable-energy management / tycoon game called:

# MEGAWATT VALLEY

Player fantasy:

> **I built this renewable-energy company from almost nothing.**

The player begins with:

- a small solar site;
- basic technology;
- limited cash;
- a tiny team;
- direct/manual operational work;
- only basic company capabilities.

Across the campaign, the player develops into a sophisticated renewable-energy company managing:

- utility-scale solar;
- battery storage;
- wind;
- hybrid plants;
- grid constraints;
- multiple sites;
- regional O&M;
- advanced automation;
- company departments;
- a portfolio command centre.

Core principle:

> **Realism in cause and effect. Abstraction in execution.**

The game should feel believable to renewable-energy professionals without requiring engineering knowledge from ordinary players.

---

# 2. Why pixel-isometric

Pixel-isometric is the target for this autonomous build because it provides a strong balance of:

- visual personality;
- management-game readability;
- low asset-production burden;
- easy reuse of tiles / sprites;
- straightforward object variation;
- good performance;
- scalable content production;
- strong browser / lightweight-runtime suitability;
- less dependence on complex 3D tooling;
- easier autonomous generation and modification of visual assets.

The target is not intentionally crude retro pixel art.

The desired look is:

> **modern, polished, richly detailed isometric pixel art with warm lighting, expressive small characters, readable infrastructure and a lively miniature-world feel.**

Think:

- crisp isometric terrain;
- rich vegetation;
- charming staff;
- readable roads and fences;
- detailed solar fields;
- small utility vehicles;
- weather effects;
- animated work activity;
- modern management UI layered around the world.

The game should look like a deliberate contemporary indie tycoon, not a 1990s technical limitation.

---

# 3. Visual specification

## 3.1 Camera

Use a fixed or near-fixed isometric viewing angle.

The player should be able to:

- pan;
- zoom;
- inspect the site;
- clearly understand depth and placement.

Rotation is optional for this version.

If rotation adds major asset / complexity cost, do not require it.

A single carefully designed isometric perspective is acceptable and may be preferable.

## 3.2 World scale

The world should read as a miniature living renewable-energy valley.

At normal zoom the player should clearly recognise:

- solar arrays;
- substations;
- offices;
- roads;
- fences;
- vehicles;
- staff;
- cleaning activity;
- faults;
- weather effects.

At close zoom the player should discover:

- staff animation;
- tools;
- props;
- funny signs;
- wildlife;
- equipment details;
- small environmental jokes.

## 3.3 Pixel-art quality

Use consistent:

- pixel density;
- tile scale;
- colour palette;
- lighting direction;
- shadow direction;
- edge treatment;
- object proportions;
- isometric projection.

Avoid mixing obviously incompatible sprite styles.

Prefer reusable modular sprites and tile sets.

## 3.4 Animation

Keep animation economical but expressive.

Priority animations:

- walking;
- technician repair;
- panel cleaning;
- vehicle movement;
- construction stages;
- fault sparks / warning;
- weather;
- UI feedback;
- simple staff idle behaviour.

Do not require dozens of frames per animation.

Small readable animation loops are enough.

## 3.5 Weather presentation

Weather should visibly cross / affect the world.

Examples:

- cloud shadows;
- rain;
- dust;
- wind;
- lightning;
- hail;
- heat shimmer if practical;
- changing sky / ambience.

Gameplay feedback matters more than cinematic effects.

---

# 4. Core game loop

The main gameplay loop remains:

**DEVELOP → FINANCE → BUILD → OPERATE → IMPROVE → EXPAND**

## Develop

The player should eventually:

- assess candidate sites;
- compare solar / wind resource;
- consider grid access;
- investigate land cost;
- reveal environmental / geotechnical / community risks;
- decide whether a project is worth developing.

## Finance

Early finance remains simple:

- cash;
- construction cost;
- revenue;
- maintenance;
- salaries / OpEx.

Later campaign systems may add:

- debt;
- investors;
- PPAs;
- insurance;
- construction finance;
- contingency;
- merchant exposure.

Finance should create strategy rather than accounting work.

## Build

The player constructs:

- solar arrays;
- inverters;
- transformers;
- substations;
- roads;
- fencing;
- operations buildings;
- cleaning infrastructure;
- later BESS / wind / hybrid assets.

Construction should visibly appear in-world.

## Operate

The player manages:

- power generation;
- revenue;
- condition;
- failures;
- maintenance;
- cleaning;
- staff;
- security;
- vegetation;
- weather;
- grid events;
- performance.

## Improve

The player:

- unlocks capabilities;
- improves equipment;
- trains staff;
- adds automation;
- improves operating practices;
- researches new systems.

## Expand

The player:

- opens new plots;
- builds larger plants;
- enters new regions;
- unlocks BESS / wind / hybrids;
- grows headquarters;
- operates multiple projects.

---

# 5. The most important design requirement: progression

Megawatt Valley must constantly make the player feel that their company is becoming more capable.

The core progression model is:

**MANUAL → ASSIGN STAFF → SCHEDULE / POLICY → AUTOMATE → MANAGE EXCEPTIONS**

This is the **Management Abstraction Ladder**.

The player should briefly learn why a task matters by handling it directly.

Then progression should reduce repetitive work and move attention upward to more important decisions.

Examples:

## Fault response

1. Player notices fault.
2. Player manually sends technician.
3. Unlock Radio Dispatch.
4. Technicians auto-dispatch.
5. Unlock remote diagnostics.
6. Later predictive maintenance prevents / prioritises failures.

## Panel cleaning

1. Player orders manual clean.
2. Staff perform the work.
3. Cleaning kit improves speed.
4. Mobile cleaning rig handles larger areas.
5. Scheduled cleaning generates work automatically.
6. Autonomous robots clean routine soiling.
7. Portfolio system prioritises sites by revenue loss / weather.

## Monitoring

1. Local equipment inspection.
2. Alarm panel.
3. Remote monitoring.
4. SCADA.
5. Automated alarm classification.
6. Portfolio command centre.

## Security

1. Fence.
2. Guard patrol.
3. CCTV / sensors.
4. Smart alerts.
5. Drone / automated monitoring.
6. Regional security operations.

Automation should remove stale clicks, not remove meaningful decisions.

---

# 6. Company Capability Tree

Create a visible, satisfying **Company Capability Tree**.

This is not only a technology tree.

Recommended branches:

## Generation Technology

Examples:

- Basic Fixed-Tilt PV
- High-Efficiency Modules
- Bifacial Modules
- Single-Axis Trackers
- Advanced Tracker Controls
- Better Inverters
- Advanced Weather Protection
- BESS
- Wind
- Hybrid Systems

## Operations & Reliability

Examples:

- Manual Repairs
- Better Tools
- Planned Maintenance
- Specialist Technicians
- Spare Parts Management
- Reliability Programme
- Predictive Maintenance

## Digital & Automation

Examples:

- Basic Monitoring
- Alarm Panel
- Remote Monitoring
- Radio Dispatch
- SCADA
- Drone Inspection
- Automatic Work Orders
- Robotic Cleaning
- Predictive Analytics
- Command Centre

## People & Organisation

Examples:

- Technician
- Cleaner
- Engineer
- Site Manager
- Specialist Engineer
- Asset Manager
- Control-Room Operator
- Regional O&M Team
- Department Heads

## Grid & Flexibility

Examples:

- Standard Grid Connection
- Larger Export Capacity
- Curtailment Management
- Battery Storage
- Grid Support
- Hybrid Optimisation
- Ancillary Services

## Development & Commercial

Examples:

- Basic Site Assessment
- Advanced Studies
- Environmental Capability
- Community Management
- Contractor Management
- Better Finance
- PPAs
- Insurance
- Multi-Project Development

Prefer unlocks that create:

- new actions;
- new equipment;
- new staff;
- automation;
- new project types;
- new strategic choices.

Avoid a tree dominated by “+5%” upgrades.

---

# 7. Campaign structure

Use a staged campaign / region map.

A scenario can award up to three stars.

## 1 Star

Complete the main objective.

Reward:
- unlock next scenario / region;
- unlock at least one meaningful capability or content item where appropriate.

## 2 Stars

Demonstrate better operational / financial performance.

Possible rewards:
- capability;
- equipment;
- company reputation;
- specialist staff;
- cosmetic / prestige item.

## 3 Stars

Master the scenario.

Possible requirements:
- high availability;
- stronger profit;
- successful crisis handling;
- optional efficiency challenge;
- staff development;
- limited downtime.

The player should never need 3 stars to continue the main campaign.

---

# 8. Level 1 — Here Comes the Sun

The first complete scenario is:

# HERE COMES THE SUN

It should feel like a proper tycoon level, not a five-minute tutorial.

Target experience:

- approximately 30–60 minutes for first completion;
- optional continuation for 2-star / 3-star mastery;
- no long dead periods;
- steady progression and unlock cadence.

---

# 9. Level 1 opening state

The player begins with:

- one small solar development area;
- limited cash;
- basic fixed-tilt panels;
- simple grid connection;
- tiny operations office;
- one technician;
- basic manual operating capability;
- no major automation.

The visual site should already feel alive:

- office;
- access road;
- fences;
- substation / grid point;
- initial equipment;
- staff;
- small vehicle;
- vegetation;
- surrounding valley.

---

# 10. Level 1 progression beats

## Beat 1 — First Power

Teach:

- build;
- placement;
- grid connection;
- generation;
- revenue.

Reward:
- procurement options unlock.

## Beat 2 — Cheap or Good?

Offer:

### Bargain PV

- lower cost;
- lower reliability;
- lower output / weaker performance;
- higher maintenance risk.

### Premium PV

- higher cost;
- stronger output;
- better reliability;
- greater upfront pressure.

The choice must be readable in seconds.

## Beat 3 — First Failure

Trigger a fault.

The player must:

- identify the failed equipment;
- manually dispatch the technician;
- wait for visible repair.

Reward:

**RADIO DISPATCH UNLOCKED**

Routine future faults can now automatically dispatch the technician.

This should feel like a real company upgrade.

## Beat 4 — Dust Happens

Introduce panel soiling.

Effects:

- visible dirty-panel state;
- reduced output;
- clear financial impact.

Teach:

- manual cleaning;
- staff assignment.

Reward:

**BASIC CLEANING KIT**

Later locked progression should visibly tease:

- Mobile Cleaning Rig;
- Scheduled Cleaning;
- Autonomous Cleaning Robots.

## Beat 5 — Site Expansion

Reach a capacity / revenue milestone.

Unlock:

- second buildable plot;
- new grid area;
- additional infrastructure needs.

## Beat 6 — First Capability Choice

Offer two useful upgrades.

Example:

**Cleaning Rig**

versus

**Remote Monitoring**

The player chooses which to unlock first.

The other remains available later.

## Beat 7 — Growing Pains

Two-site operation creates overlapping demands:

- faults;
- cleaning;
- money;
- procurement;
- events;
- expansion;
- grid considerations.

The point is not difficulty for its own sake.

The player should start to appreciate automation and organisation.

## Beat 8 — Automation Payoff

At least one early manual responsibility is now mostly handled automatically.

The player should think:

> “I used to have to do that myself.”

## Beat 9 — Hail / Severe Weather Climax

Provide warning.

Possible choices:

- prepare / protect equipment;
- spend money on mitigation;
- accept reduced generation;
- continue operating and take risk.

Previous equipment and capability choices should influence the outcome.

## Beat 10 — Complete or Continue

1 star unlocks next campaign scenario.

2 and 3 stars remain available for mastery.

---

# 11. Level 1 content target

Initial full Level 1 should aim for roughly:

- 8–12 contextual objectives;
- 5–8 decision events;
- 2+ equipment choices;
- 2–3 staff / operations concepts;
- 3–5 capability unlock moments;
- 1 site expansion;
- 1 clear automation payoff;
- 1 major climax;
- 1-star / 2-star / 3-star progression.

These are design targets, not rigid quotas.

---

# 12. Player objectives and momentum

The game should avoid:

- “build 30 identical things and wait”;
- extended idle periods;
- progression only through bigger numbers.

At most points the player should have a combination of:

- immediate concern;
- current short objective;
- upcoming unlock;
- optional mastery target.

If the player is waiting for money, there should usually be something else worth doing:

- staff;
- cleaning;
- maintenance;
- layout;
- event choice;
- capability selection;
- expansion planning;
- research / upgrade review.

---

# 13. Staff system

Staff are visible characters, not only spreadsheet modifiers.

Initial roles:

- Technician
- Cleaner
- Engineer
- Site Manager

Later roles:

- Security
- Vegetation Crew
- Community Liaison
- Environmental Specialist
- Finance / Commercial
- Asset Manager
- Control-Room Operator

Each staff member should support:

- name;
- role;
- salary;
- skill;
- current job;
- workload;
- traits;
- training / progression.

Example traits:

- Panel Whisperer
- Just One More Coffee
- Improvises
- Weather Worrier
- Bargain Hunter
- Safety First-ish
- Spreadsheet Enthusiast

Traits should sometimes create minor gameplay effects.

Visible staff actions matter:

- walk;
- inspect;
- repair;
- clean;
- use vehicles;
- enter buildings;
- idle;
- react to events.

---

# 14. Events

Events should create choices rather than simply removing money.

Each event should support:

- title;
- situation;
- 2–3 choices;
- clear cost / risk;
- consequences;
- optional follow-up;
- humour where appropriate.

Example event categories:

- weather;
- equipment;
- staff;
- grid;
- security;
- contractor;
- supplier;
- community;
- environmental;
- funny low-stakes incidents.

Examples:

### Grid Connection Update

“Your application has successfully progressed from Awaiting Review to Awaiting Further Review.”

### Spare Part Delay

“Your replacement inverter is on a ship. Somewhere.”

### Consultant Report

“The investigation has concluded that further investigation is recommended.”

### Wildlife

Animal wanders into the site.

### Vendor Discount

Cheap equipment offer with suspicious warranty conditions.

Events must remain understandable despite humour.

---

# 15. Equipment system

Equipment should use fictional manufacturers / brands.

Equipment options may differ by:

- cost;
- output;
- reliability;
- maintenance;
- lead time;
- warranty;
- weather resistance;
- expected life.

Do not overwhelm players with technical specifications.

Translate engineering differences into clear management choices.

---

# 16. Economy

Level 1 economy should include:

- cash;
- purchase costs;
- generation revenue;
- repair costs;
- maintenance costs;
- basic salaries / operating cost where useful.

Later campaign systems may add:

- contractors;
- insurance;
- debt;
- investors;
- PPAs;
- construction finance;
- contingency;
- merchant exposure.

The opening economy should be easy to understand but hard enough to make procurement choices matter.

---

# 17. Weather and environment

Weather should affect:

- generation;
- equipment risk;
- cleaning;
- staff tasks;
- events.

Level 1 weather examples:

- clear;
- clouds;
- rain;
- dust;
- heat;
- wind;
- hail / storm.

Severe weather should usually be telegraphed.

The player should have time to respond.

---

# 18. Construction presentation

Building should visually progress.

At minimum:

1. placement / planned footprint;
2. under construction;
3. completed operational asset.

For large items, use small visible changes:

- foundations;
- workers;
- construction vehicle;
- partially completed object;
- completion effect.

Do not require complex realistic construction simulation.

---

# 19. Build system

Level 1 build categories should include enough content to feel like a management game.

Suggested categories:

## Generation

- Bargain Solar Array
- Premium Solar Array
- later upgraded PV

## Grid

- Grid Connection
- Transformer
- Substation / export point

## Operations

- Small O&M Office
- Maintenance Workshop
- Cleaning equipment

## Site

- Road
- Fence
- Gate
- Parking / yard

## Decoration / landscaping

- trees;
- shrubs;
- signs;
- benches / small props.

Later campaign:

- BESS;
- wind;
- larger substations;
- command-centre systems.

---

# 20. Interface

UI should be modern and readable even though the world is pixel-art.

Do not make the UI intentionally pixelated if that hurts readability.

A clean modern management UI is preferred.

Top bar should show key information such as:

- cash;
- income / profit indicator;
- current generation / export;
- time / day;
- weather;
- staff count;
- simulation speed;
- alerts.

Primary navigation may include:

- Build
- Staff
- Operations
- Finance
- Capabilities / Research
- Objectives / Reports

## Build panel

Show:

- icon;
- item name;
- price;
- important differences;
- locked / unlocked state.

## Staff panel

Show:

- name;
- role;
- skill;
- trait;
- task;
- workload.

## Equipment panel

Show:

- equipment;
- output;
- condition;
- cleanliness;
- fault state;
- grid status;
- actions.

## Capability tree

Show:

- branches;
- locked nodes;
- completed nodes;
- prerequisite relationships;
- exciting future capabilities.

## Objectives

Show:

- current objective;
- progress;
- completed tasks;
- star progress;
- reward / unlock.

## Events

Show:

- clear event card;
- choices;
- cost / risk;
- optional image / pixel illustration.

---

# 21. Isometric interaction rules

The isometric presentation must remain easy to use.

Required:

- reliable world-to-grid placement;
- clear valid / invalid build feedback;
- clear object selection;
- depth sorting;
- visible selected state;
- readable staff / object overlap;
- reliable pathfinding;
- no frequent clicking ambiguity.

Potential techniques are implementation choices for the builder.

The end result matters:

> the player should never feel they are fighting the isometric perspective.

---

# 22. Asset strategy

Use:

**COMMUNITY-FIRST, CUSTOM-BY-EXCEPTION**

Prefer:

- commercially safe free/community isometric assets;
- pixel / sprite packs;
- vegetation packs;
- buildings;
- vehicles;
- generic characters;
- UI icons.

Modify / recolour / combine assets as needed so they look coherent.

For missing renewable-energy content, create or generate new sprite assets.

Do not let the game look like a collage of unrelated packs.

## Licensing

Only use assets with clear rights for commercial game use.

Preferred:

- CC0 / public domain;
- clear commercial-use licences;
- licences allowing derivative work.

Avoid:

- unclear licences;
- non-commercial assets;
- ripped game assets;
- copyrighted proprietary sprites.

Maintain asset provenance.

---

# 23. Audio

Use simple but satisfying audio.

Priority sounds:

- building placement;
- construction;
- cash / objective reward;
- faults;
- repair completion;
- cleaning;
- vehicle;
- rain / storm;
- UI click;
- unlock.

Music should support a warm optimistic management-game tone.

Do not let audio production block gameplay completion.

---

# 24. Save / load

The game must reliably save:

- player cash;
- built objects;
- staff;
- unlocked capabilities;
- objectives;
- stars;
- equipment state;
- relevant site state;
- scenario progression.

A player should be able to close and resume without losing the scenario.

---

# 25. Autonomous development requirement

This build is specifically intended to test autonomous AI development.

The AI builder should:

- make routine implementation decisions itself;
- create required files / structure;
- create or source safe assets;
- integrate assets;
- debug;
- test;
- fix issues;
- tune basic values;
- continue through milestones without requiring constant supervision.

Do not repeatedly ask Rapha to:

- assemble scenes;
- configure ordinary project settings;
- place assets manually;
- wire UI;
- debug;
- create routine art;
- approve minor implementation choices.

Ask only when there is a genuinely major product decision with materially different player experiences.

When uncertain:

1. choose the option most consistent with this document;
2. implement the smallest good version;
3. test it;
4. improve it;
5. document meaningful assumptions.

---

# 26. Build quality requirement

Do not claim success because:

- the game launches;
- a button works;
- a panel can be placed;
- a number increases.

A successful build must feel like a game.

The player should experience:

- meaningful choices;
- clear feedback;
- objectives;
- rewards;
- staff;
- operational problems;
- unlocks;
- automation;
- expansion;
- humour;
- failure / recovery;
- satisfying visual activity.

---

# 27. First delivery target

The first major autonomous delivery is **not the full future campaign**.

It is a complete, self-contained, polished version of:

# LEVEL 1 — HERE COMES THE SUN

It must demonstrate:

- isometric building;
- solar generation;
- grid export;
- economy;
- bargain vs premium equipment;
- visible staff;
- manual fault response;
- Radio Dispatch unlock / automation;
- soiling;
- manual cleaning;
- cleaning upgrade;
- contextual objective progression;
- capability unlocks;
- site expansion;
- decision events;
- severe weather climax;
- 1-star completion;
- optional 2-star / 3-star goals;
- save/load.

This is the benchmark used to compare autonomous builders.

---

# 28. Level 1 acceptance test

A first-time player should be able to:

1. start a new game;
2. understand the first objective;
3. place a solar array;
4. connect generation to the grid;
5. earn revenue;
6. compare bargain / premium procurement;
7. experience a fault;
8. manually dispatch a technician;
9. unlock automatic dispatch;
10. experience soiling;
11. clean panels;
12. unlock a cleaning improvement;
13. expand to a second area;
14. make at least one capability choice;
15. respond to multiple events;
16. prepare for / survive the climax;
17. earn 1 star;
18. understand how to pursue 2 and 3 stars;
19. save and resume;
20. want to continue.

---

# 29. Engagement acceptance test

Level 1 fails if the player frequently has nothing meaningful to do except wait.

The AI builder should self-review:

- Are objectives arriving at a useful cadence?
- Is there always a visible next reward?
- Are repeated chores becoming easier?
- Are choices understandable?
- Do staff and equipment visibly react?
- Does expansion change what the player manages?
- Does the climax test previous choices?
- Does the game feel alive at normal zoom?
- Is the UI clear without reading a manual?
- Does the player want the next unlock?

If not, iterate.

---

# 30. Performance / scale expectation

The Level 1 world should support:

- dozens to hundreds of placed visual objects;
- multiple staff;
- multiple vehicles;
- animated weather;
- active UI;
- smooth normal gameplay on a typical modern consumer computer.

Do not optimise prematurely, but do not create an architecture where every decorative solar panel runs expensive simulation logic.

The simulation should operate on logical assets / systems while the visual world may contain many sprites.

---

# 31. Technical freedom

This specification intentionally does **not prescribe a game engine, framework or programming stack**.

Constraints:

- do not use Unity;
- do not use Godot;
- do not require Rapha to use a visual scene editor;
- the finished build must be easy for Rapha to launch and play;
- routine development must be automated by the builder.

Choose whatever implementation approach best achieves the product requirements.

---

# 32. Parallel experiment rules

Cursor and MiMo may implement this independently.

They should not be expected to share code.

Both should be judged against the same outcome.

Evaluate each build on:

- autonomy;
- time to playable result;
- visual quality;
- gameplay depth;
- UI;
- performance;
- bugs;
- progression quality;
- code / project maintainability;
- ease of future expansion;
- amount of manual work requested from Rapha.

The best result is not necessarily the one with the most code.

The best result is the one that most convincingly delivers Megawatt Valley with the least ongoing manual intervention.

---

# 33. Future scope after Level 1

Only after Level 1 succeeds, expand toward:

## Scenario 2 — Larger Solar / Grid Pressure

Add:
- larger site;
- more staff;
- grid constraint;
- better monitoring;
- more serious OpEx.

## Scenario 3 — Battery Storage

Add:
- BESS;
- charging / discharging;
- peak shifting;
- storage reliability;
- battery-specific events.

## Scenario 4 — Wind

Add:
- wind resource;
- turbine placement;
- maintenance;
- variable output;
- larger component failures.

## Scenario 5 — Hybrid

Combine:
- solar;
- wind;
- storage;
- shared grid;
- hybrid optimisation.

## Later campaign

Add:
- multiple simultaneous sites;
- regional teams;
- company HQ growth;
- finance / commercial systems;
- portfolio command centre;
- grid services;
- advanced automation.

---

# 34. Final design statement

Megawatt Valley should eventually feel like:

> **a living pixel-isometric renewable-energy company where the player begins by manually fixing and cleaning a small solar site and eventually runs a sophisticated automated clean-energy portfolio.**

The game succeeds when:

- the world is charming;
- the systems are understandable;
- the management is deep;
- progression is satisfying;
- automation changes the player's responsibilities;
- the player can see the company growing;
- the next unlock is always tempting;
- the player wants to build “just one more thing”.
