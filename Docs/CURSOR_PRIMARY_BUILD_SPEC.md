# Megawatt Valley — Cursor Primary Build Specification v2.0

## Status

**APPROVED PRIMARY PRODUCTION DIRECTION — 29 September 2026**

This document is the highest-priority implementation brief for Cursor.

It supersedes the previous Unity-first production direction and supersedes the earlier framing of the pixel-isometric build as merely a parallel experiment.

The existing Unity project is archived on branch **archive/unity-prototype-2026-09-29** and must be treated as historical reference unless Rapha explicitly reactivates it.

---

# 1. Mission

Build and ship a complete, polished, ready-to-play version of **Megawatt Valley: Solar**.

The game must be playable by a normal player without opening an IDE, installing Unity, configuring a development environment, or performing manual project setup.

The target workflow is:

**Rapha defines product intent → Cursor builds and validates it → Rapha plays the finished result and gives product feedback.**

Rapha is not the routine developer.

---

# 2. Non-negotiable constraints

## 2.1 Minimal Rapha involvement

After initial setup, Cursor must minimise requests for manual intervention.

Do not ask Rapha to:

- write code;
- debug routine errors;
- wire UI;
- assemble scenes;
- organise assets;
- run routine tests;
- copy console logs that Cursor can obtain itself;
- make ordinary reversible technical decisions;
- repeatedly approve small implementation steps;
- manually maintain the development backlog.

Cursor owns those responsibilities.

## 2.2 Zero additional recurring development cost

The approved baseline assumes Rapha already pays for:

- Cursor;
- ChatGPT.

Do not introduce any additional paid requirement without explicit approval.

Default to:

- free/open-source frameworks;
- free/open-source libraries;
- permissively licensed free assets;
- free local tooling;
- free hosting tiers where practical.

If a low-cost paid option would create unusually high value, document it as optional. Never make it required without approval.

## 2.3 Finished game, not prototype

The goal is not a technology demo.

The first release must be a coherent game with:

- a start;
- onboarding;
- progression;
- meaningful decisions;
- failure/recovery pressure;
- satisfying upgrades;
- scenario completion;
- save/load;
- polished presentation;
- no obvious broken controls;
- no developer-only steps required to play.

## 2.4 Preserve history

Do not delete the archived Unity branch.

Reusable design knowledge from the old project may be carried forward. Unity-specific implementation should not be carried forward unless it is useful as a behavioural reference.

---

# 3. Product vision

Megawatt Valley is a character-driven renewable-energy tycoon / management game.

Player fantasy:

> **I built this renewable-energy company from almost nothing.**

Core gameplay loop:

**DEVELOP → FINANCE → BUILD → OPERATE → IMPROVE → EXPAND**

Design principle:

> **Realism in cause and effect. Abstraction in execution.**

Renewable-energy professionals should recognise the logic, but ordinary players should understand the game quickly.

The game should be approachable, humorous, visually charming, readable and strategically satisfying rather than an engineering simulator.

---

# 4. Release target

The first production release is:

# Megawatt Valley: Solar — Level 1: Here Comes the Sun

Target first-completion time:

**approximately 30–60 minutes**

The player should be able to continue after one-star completion to pursue stronger two-star and three-star results.

The first release must prove that the solar management loop is fun before expanding into wind, BESS, multiple regions or deeper corporate systems.

---

# 5. Approved technology direction

## 5.1 Core stack

Use:

- latest stable **Phaser 4** unless a verified blocker requires Phaser 3;
- **TypeScript** with strict type checking;
- **Vite** for development and production builds;
- Git + GitHub;
- standard web platform APIs;
- local persistence using IndexedDB or another no-cost browser-local solution;
- data-driven JSON / TypeScript definitions for balancing and content.

## 5.2 Testing

Use free/open-source testing tools where useful, for example:

- Vitest for unit/system logic;
- Playwright for browser smoke / flow tests;
- Cursor browser tools for visual inspection and interactive validation.

Do not rely only on compilation or unit tests.

Cursor must visually inspect and interact with the running game.

## 5.3 Deployment

The game must build to static web assets.

Preferred final delivery:

- a live browser build on a free static-hosting tier;
- deployment triggered automatically from Git where practical;
- production build also reproducible locally with standard npm commands.

Cloudflare Pages or an already-connected free Vercel deployment are acceptable.

Do not introduce a required paid backend for the first release.

## 5.4 Optional desktop packaging

A desktop build may later be wrapped using a free technology such as Tauri.

Do not make desktop packaging a blocker for the browser release.

---

# 6. Architecture rules

## 6.1 Simulation separate from presentation

The simulation must not depend on individual decorative sprites.

Example:

- a solar plant can be simulated as logical equipment groups;
- the world may visually display many panels;
- each decorative panel does not need independent heavyweight simulation logic.

## 6.2 Data-driven content

Keep content definitions external to core engine logic wherever practical.

Data-driven candidates include:

- equipment;
- buildables;
- staff roles;
- events;
- objectives;
- capability unlocks;
- weather;
- tariffs;
- scenario settings;
- balancing values.

## 6.3 Keep architecture understandable

Avoid:

- speculative framework building;
- giant god objects;
- unnecessary dependency injection;
- complex generic event buses;
- premature ECS;
- unnecessary backend services;
- architecture built for features that do not yet exist.

Prefer conventional readable TypeScript.

## 6.4 Stable save boundary

Save data must be versionable.

Use explicit persistent IDs for content and systems that appear in saves.

A save must survive page refresh and normal browser restarts.

Include a safe migration/version strategy before the public release.

---

# 7. Visual direction

The approved primary visual target is the **29 September 2026 Megawatt Valley pixel-isometric concept**.

Target style:

> **High-resolution pixel-isometric / illustrated pixel-art world with a crisp modern non-pixelated management UI.**

The target is not deliberately crude retro graphics.

## 7.1 Camera

- fixed or near-fixed elevated isometric view;
- 2:1 isometric projection;
- pan and zoom;
- no camera rotation unless it can be added without multiplying asset production;
- world should remain readable at normal gameplay zoom.

## 7.2 World

The player should see a rich living valley containing:

- solar arrays;
- substations;
- transformers;
- inverters;
- offices;
- maintenance facilities;
- roads;
- fences;
- gates;
- staff;
- maintenance vehicles;
- trees;
- rocks;
- water / rivers where appropriate;
- weather;
- site activity.

Renewable infrastructure should be slightly more technically detailed than background scenery.

## 7.3 Characters

Characters should be small, expressive and readable.

Minimum useful animation set:

- idle;
- walk;
- work / repair;
- cleaning;
- simple reaction.

Do not create expensive animation systems when a small readable loop works.

## 7.4 Activity and effects

Use economical effects that make the game feel alive:

- moving vehicles;
- staff walking;
- repair activity;
- construction stages;
- fault warnings;
- sparks / repair effects;
- panel glints;
- cloud shadows;
- rain;
- dust;
- wind;
- simple wildlife / environmental motion.

## 7.5 UI

The UI should be modern, crisp and highly readable.

Priority surfaces:

- cash / revenue;
- power output;
- weather;
- game date/time/speed;
- objectives;
- build menu;
- selected equipment;
- staff / maintenance;
- capability unlocks;
- events;
- scenario progress;
- save/settings.

Do not make the whole interface look like retro pixel art.

---

# 8. Art-production strategy

The art pipeline must support Cursor autonomy.

Priority order:

1. reusable procedural / vector / code-generated graphics where visually suitable;
2. commercially safe CC0 / permissively licensed free assets;
3. modified or recomposed free assets;
4. bespoke AI-assisted or manually generated project assets using tools already available to Rapha;
5. paid assets only after explicit approval.

Rules:

- never use ripped game assets;
- do not copy proprietary art from reference games;
- record third-party asset provenance;
- maintain consistent isometric projection, scale, lighting direction and palette;
- prefer modular asset families over one-off artwork;
- style consistency is more important than raw detail.

---

# 9. Level 1 required gameplay

The first production scenario must include the following.

## 9.1 Starting state

Player starts with:

- limited cash;
- one solar development area;
- basic fixed-tilt solar;
- a basic grid connection;
- a tiny office / operations presence;
- one technician;
- little or no automation.

## 9.2 Build and operate

Player can:

- place solar infrastructure;
- spend cash;
- connect generation to grid;
- generate electricity;
- earn revenue;
- inspect key performance;
- pause / change simulation speed;
- react to changing weather.

## 9.3 Procurement choice

Include at least one clear equipment trade-off such as:

**Bargain PV**
- cheaper;
- lower reliability;
- weaker performance.

**Premium PV**
- higher upfront cost;
- stronger performance;
- better reliability.

Choices should have consequences later in the scenario.

## 9.4 First failure

A fault must teach the player the maintenance loop.

Initially:

- player identifies the issue;
- manually dispatches technician;
- technician visibly travels / works;
- generation recovers.

Reward:

**Radio Dispatch** or equivalent automation capability.

Later routine faults can be automatically assigned.

## 9.5 Soiling and cleaning

Introduce:

- visible panel soiling;
- measurable output impact;
- cleaning action;
- staff involvement;
- a cleaning improvement / capability.

Future automation should be teased without requiring the full future system.

## 9.6 Expansion

Unlock a second plot / area after an appropriate milestone.

This should create enough overlapping responsibilities that the value of delegation and automation becomes obvious.

## 9.7 Capability progression

Use the Management Abstraction Ladder:

**MANUAL → ASSIGN STAFF → SCHEDULE / POLICY → AUTOMATE → MANAGE EXCEPTIONS**

At least one Level 1 responsibility must visibly progress along this ladder.

## 9.8 Events

Include approximately 5–8 meaningful decision events.

Events should:

- present trade-offs;
- affect money / output / reliability / staff / reputation where appropriate;
- sometimes interact with earlier player choices;
- add humour and personality;
- avoid arbitrary punishment.

## 9.9 Weather climax

Level 1 should include a significant severe-weather or hail event.

Give warning.

Allow preparation or mitigation.

Earlier equipment / capability choices should influence the outcome.

## 9.10 Scenario completion

Support:

- 1★ main completion;
- 2★ stronger performance goal;
- 3★ mastery goal.

One star must be enough to progress.

---

# 10. Out of scope until the solar release works

Do not allow these to delay the first release:

- operational wind gameplay;
- operational BESS gameplay;
- deep project finance;
- multiplayer;
- cloud accounts;
- online economy;
- procedural infinite worlds;
- multiple full campaign regions;
- large headquarters simulation;
- advanced portfolio command centre;
- complex mod support.

They may be represented as locked future content if useful.

---

# 11. Cursor autonomous working model

Cursor is expected to operate as the implementation team.

## 11.1 Before implementation

Read:

- README.md;
- this specification;
- Docs/CURRENT_STATUS.md;
- Docs/VISUAL_DIRECTION.md;
- Docs/TECHNICAL_ARCHITECTURE.md;
- Docs/ROADMAP.md;
- Docs/GAME_VISION.md;
- Docs/PROGRESSION_AND_ENGAGEMENT.md;
- Docs/LEVEL_01_DESIGN.md.

Then inspect the repository and create/update the implementation backlog.

## 11.2 Work continuously through approved scope

Do not stop after every tiny feature to ask what to do next.

For reversible implementation details that remain inside this specification:

> **make a sensible decision and continue.**

For each feature:

**implement → build → test → launch → visually inspect → interact/play → fix → retest**

Continue until the active milestone's acceptance criteria pass or a real escalation condition is reached.

## 11.3 Escalate only when necessary

Ask Rapha when a decision:

- materially changes the game design;
- materially changes the approved visual direction;
- significantly expands/reduces product scope;
- requires payment;
- creates material licensing/legal uncertainty;
- destroys or replaces important project history;
- is difficult to reverse and has major long-term consequences.

Do not escalate ordinary coding choices.

## 11.4 Documentation and Git

After meaningful progress:

- commit with clear messages;
- push to GitHub;
- update CURRENT_STATUS when state changes;
- keep this specification aligned if a product decision changes;
- update the activity log where useful;
- do not create documentation bureaucracy that slows delivery.

---

# 12. Quality gates

A feature is not complete because code exists.

A milestone is not complete until Cursor has validated it in the running game.

Minimum release checks:

- clean production build;
- no blocking TypeScript errors;
- no obvious browser console errors during normal play;
- all primary buttons and menus functional;
- Level 1 can be played from new game to 1★ completion;
- 2★ / 3★ conditions track correctly;
- save and reload works;
- objective progression cannot soft-lock under normal play;
- important economic calculations have tests;
- fault / repair / cleaning / automation loops function;
- severe-weather climax functions;
- common viewport sizes remain usable;
- game can recover gracefully from missing/corrupt local save;
- no required developer tools are exposed to the player;
- production build loads from the deployment URL.

---

# 13. Performance target

Optimise for a normal modern desktop browser.

Aim for:

- smooth interaction at normal gameplay zoom;
- no unnecessary per-frame simulation;
- batched / pooled visual objects where appropriate;
- asset sizes appropriate for browser delivery;
- responsive UI;
- no major memory leaks during a full Level 1 session.

Do not spend time on speculative optimisation before profiling identifies a problem.

---

# 14. Definition of release

**Megawatt Valley: Solar v1.0 is released when:**

1. the complete Level 1 experience works;
2. the game looks intentionally designed rather than placeholder-only;
3. the core renewable-energy loop is understandable and enjoyable;
4. progression includes at least one satisfying manual-to-automation payoff;
5. the game saves and resumes;
6. the game is hosted at a playable URL;
7. a new player can launch and play without development tools;
8. there are no known blockers preventing ordinary completion.

The project should then be evaluated before adding wind, BESS or larger campaign scope.

---

# 15. Governing principle

> **Build the game, test the game, finish the game.**

Do not optimise for producing code, documents, frameworks or demos.

Optimise for delivering a Megawatt Valley build Rapha can simply open and play.
