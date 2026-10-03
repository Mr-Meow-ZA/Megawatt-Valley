# Megawatt Valley — Technical Architecture v2.0

## Status

**Approved primary architecture — 29 September 2026**

The previous Unity architecture is archived with the Unity prototype.

The active production architecture is browser-first and designed for maximum Cursor autonomy.

## Primary stack

- Phaser 4, latest stable unless a verified blocker requires Phaser 3
- TypeScript with strict type checking
- Vite
- HTML/CSS for shell and management UI where appropriate
- Git + GitHub
- IndexedDB / browser-local persistence
- JSON / TypeScript data definitions
- Vitest for logic tests where useful
- Playwright and/or Cursor browser tooling for end-to-end validation
- free static web hosting for release

## Architecture objective

Optimise for:

1. AI maintainability;
2. rapid autonomous implementation;
3. easy automated/browser testing;
4. zero paid runtime dependency;
5. a finished playable game;
6. future extensibility only where current gameplay justifies it.

Avoid building a generic game-engine framework inside Phaser.

## Suggested source structure

src/
- main.ts
- game/
  - scenes/
  - world/
  - camera/
  - input/
  - rendering/
- simulation/
  - time/
  - energy/
  - economy/
  - equipment/
  - maintenance/
  - staff/
  - weather/
  - events/
  - objectives/
  - progression/
- content/
  - equipment/
  - buildables/
  - events/
  - capabilities/
  - scenarios/
  - weather/
- ui/
- persistence/
- audio/
- assets/
- tests/

The exact structure may evolve, but responsibilities must stay clear.

## Core principles

### Simulation separate from presentation

Simulation state must not depend on decorative world sprites.

Visual systems consume simulation state and display it.

This supports large solar fields without making every visible panel an expensive simulation object.

### Data-driven content

Balancing and content should be configurable without rewriting core systems.

Use stable IDs for equipment, events, objectives, capabilities and save-relevant entities.

### Explicit game state

Maintain an understandable authoritative game-state model.

Avoid hidden state spread across unrelated Phaser objects.

### Deterministic or testable calculations

Generation, revenue, degradation, event outcomes where deterministic, objective checks and capability requirements should be testable outside the rendering layer.

### Minimal dependencies

Every dependency increases autonomous-maintenance risk.

Use a third-party library only when it clearly saves substantial work and has a suitable licence.

### No backend for v1

The first release should function fully as a static web application.

No user accounts, cloud database or paid service is required.

### Save system

Use browser-local persistence.

Save data must include a schema/version field.

Provide reset/new-game capability.

Handle missing or invalid saves gracefully.

### Performance

Prefer:

- lower-frequency simulation ticks;
- object pooling where useful;
- sprite batching/atlases;
- culling/off-screen inactivity;
- efficient tile / isometric rendering;
- cached derived values.

Profile before optimising.

## Isometric representation

Use a fixed 2:1 isometric projection.

World objects must share:

- common projection;
- common scale rules;
- common lighting direction;
- common ground-contact convention;
- stable depth sorting.

Camera rotation is not required.

Pan and zoom are required.

## UI architecture

Management UI may use DOM/CSS or Phaser-native UI depending on what produces the most reliable result.

Requirements matter more than implementation purity:

- crisp at common resolutions;
- readable;
- responsive;
- accessible through mouse/touch where practical;
- no broken overlap at ordinary desktop sizes;
- consistent component language.

## Build and release commands

The repository should converge on predictable commands such as:

- npm install
- npm run dev
- npm run build
- npm test
- npm run test:e2e

Cursor may adjust exact scripts, but setup must remain conventional.

## Architecture change rule

Cursor may make ordinary reversible technical decisions autonomously.

Escalate before introducing:

- a paid dependency;
- a required backend;
- a different engine/framework;
- an irreversible save-format change near release;
- a major architecture that materially increases complexity;
- a change that conflicts with the primary build specification.

The product requirements own the architecture, not the other way around.


## Implemented gameplay modules — 3 October 2026

`src/content/contracts.ts` owns validated frozen contract terms;
`src/content/progression.ts` derives readiness-based next decisions;
`src/simulation/operations.ts` shares weighted metrics, service access, travel and
crew eligibility across simulation/UI. `src/ui/gameplayPanels.ts` renders contextual
operations/contracts/assignment controls. GameSimulation remains the authoritative
state owner; gameplay timers advance from park time and pause with events.

Version-1 saves gain optional contracts/history/renewal fields, crew energy/duty/
zone/training, work orders, policies, stability and daily reports. Validation runs
before load mutates the company; old saves initialise defaults. Already completed
awards remain earned, while objective descriptions use current definitions.
Reports represent operations rather than full accounting. Road access and staff
break recovery are documented abstractions; no path network or physical rest-room
simulation is claimed.
