# Megawatt Valley — Technical Architecture v0.1

## Purpose

This document records the initial technical direction for Megawatt Valley. It is intentionally conservative. The project should optimise for a maintainable playable game, not architectural cleverness.

## Engine and tools

Planned baseline:

- Unity **6000.6.0f1** (Unity 6.6) — locked at project creation from the locally installed editor
- Universal Render Pipeline (URP)
- C#
- GameObject / MonoBehaviour-based implementation initially
- ScriptableObjects for configurable game definitions where appropriate
- UI Toolkit for management UI (built-in `modules.uielements` + `com.unity.ugui`) — OnGUI is acceptable only as a temporary prototype HUD
- Cinemachine **6.6.0** (Unity 6.6 builtin) for tycoon camera behaviour
- Unity Input System **1.20.0** (project Active Input Handling = Input System Package)
- ProBuilder **6.1.2** for grey-box / level-blockout modelling
- NavMesh for staff movement where appropriate
- Git + GitHub + Git LFS
- Cursor as the primary implementation assistant / IDE
- Unity MCP integration may be used if stable and useful (Unity 6 AI open beta; project already Cloud-linked), but the project must not depend on it to function
- EditMode tests (Unity Test Framework) for generation / revenue / degradation math once S6-05 is active
- Optional small runtime assembly definition when introducing those tests — not a full Clean Architecture / DI stack

## Asset pipeline stance

Hybrid (see `Docs/PRACTICES_AND_PLANNING.md` §4 until formally locked):

- grey-box / ProBuilder first;
- commercial-safe free or paid kits only for readability / hero experiments, logged and replaceable;
- custom modular kits after V1 hero corner;
- no proprietary reference-game art; no competing tycoon/RTS system templates.

## Architectural principles

### 1. Build the playable loop before the framework

Do not generate a large generic architecture for systems that do not yet exist.

Every major abstraction should justify itself through a real gameplay requirement.

The preferred sequence is:

1. implement the smallest working version;
2. test whether the gameplay is useful / enjoyable;
3. identify repeated patterns;
4. refactor deliberately;
5. document significant architectural changes.

### 2. Separate simulation from presentation

Where practical, game simulation should not depend on individual visible scene objects.

Example:

`SolarPlantSimulation` owns production, availability, condition, constraints, and operating state.

`SolarPlantView` represents that state through prefabs, animation, materials, particles, UI, and staff activity.

This separation should make it possible to simulate larger portfolios without requiring every panel or prop to run meaningful simulation logic every frame.

### 3. Data-driven game content

Equipment, events, staff definitions, research, level parameters, and similar content should be configurable without rewriting core systems.

Examples of data-driven definitions:

- EquipmentDefinition
- StaffRoleDefinition
- TraitDefinition
- EventDefinition
- ResearchDefinition
- SiteDefinition
- ScenarioDefinition
- ObjectiveDefinition
- WeatherProfile
- MaintenanceProfile

ScriptableObjects are the likely first implementation for much of this content, but the project should not force every type of data into ScriptableObjects if another representation is cleaner.

### 4. Avoid premature DOTS / ECS

Do not introduce DOTS / ECS because the final vision may eventually include many entities.

The initial solar vertical slice does not require it. Optimisation decisions should be driven by profiler evidence and actual scale problems.

### 5. Keep systems testable

Important calculations should be separable from scene behaviour where practical.

Examples:

- generation calculations;
- revenue calculations;
- degradation;
- maintenance scheduling;
- event outcome logic;
- objectives;
- research unlock requirements.

Pure C# domain logic is preferred for calculations that do not require Unity-specific behaviour.

### 6. No giant manager classes

Avoid one `GameManager` accumulating unrelated responsibilities.

Systems should have clear ownership. Cross-system communication should be understandable and documented.

Do not introduce dependency-injection frameworks, service locators, event buses, or complex messaging infrastructure until there is a clear project need.

### 7. Stable save-data boundary

Save systems will be introduced after the first gameplay loop is working, but runtime state should not become unnecessarily tied to scene references.

Persistent IDs and serialisable state models should be considered when systems begin requiring saving.

## Suggested project structure

```text
Assets/
└── _MegawattValley/
    ├── Art/
    ├── Audio/
    ├── Materials/
    ├── Prefabs/
    ├── Scenes/
    ├── UI/
    ├── Data/
    │   ├── Equipment/
    │   ├── Staff/
    │   ├── Events/
    │   ├── Research/
    │   ├── Scenarios/
    │   └── Weather/
    └── Scripts/
        ├── Core/
        ├── Simulation/
        ├── Economy/
        ├── Construction/
        ├── Energy/
        ├── Staff/
        ├── Weather/
        ├── Events/
        ├── Objectives/
        ├── Progression/
        ├── Camera/
        └── UI/

Docs/
.cursor/
ProjectSettings/
Packages/
```

The exact structure may evolve as packages and first scenes are added. As of S0-02, this tree exists under `Assets/_MegawattValley/` with tracked placeholders so Git and the Project window share the same layout.

## Early domain model

The first playable game will probably require concepts broadly equivalent to:

### Time

- game clock;
- pause;
- normal / faster simulation speeds;
- day / night progression;
- simulation tick independent of visual frame rate where appropriate.

### Site

- buildable boundary;
- site attributes;
- solar resource;
- grid connection point;
- construction restrictions;
- later: hidden risks revealed by studies.

### Construction

- buildable definitions;
- placement preview;
- placement validation;
- build cost;
- construction state;
- remove / move rules.

### Energy

Initial chain:

`Solar generation → inverter / conversion → transformer / connection → grid → revenue`

The first implementation may simplify this further to prove the loop before introducing detailed electrical topology.

### Economy

- available cash;
- purchase costs;
- operating costs;
- generation revenue;
- later: salaries, maintenance, finance, contracts, insurance, etc.

### Equipment health

- condition;
- reliability;
- failure state;
- maintenance requirements;
- repair state;
- impact on generation.

### Staff

- role;
- skill;
- salary;
- current assignment;
- workload;
- traits;
- navigation / visual state.

### Events

Events should be data-driven where possible and support:

- triggers;
- conditions;
- text;
- choices;
- costs;
- effects;
- weighted / probabilistic outcomes;
- follow-up events where needed later.

### Objectives

Scenarios should support multiple objective tiers, broadly corresponding to 1-star, 2-star, and 3-star completion.

### Progression / capabilities

Progression design is governed by `Docs/PROGRESSION_AND_ENGAGEMENT.md`.

For the E1 proof, keep implementation deliberately small:

- data-driven capability definitions / IDs where useful;
- runtime / save state recording which capabilities are unlocked;
- simple prerequisite metadata only when an active feature needs it;
- gameplay systems query capability state to enable behaviour;
- effects remain owned by the relevant gameplay system rather than building a generic reflection / modifier framework.

Example first use:

`Manual technician dispatch → unlock Radio Dispatch → enable existing automatic technician dispatch behaviour`

Do not build the complete future research tree, research currency, department system, or generic effect engine during E1.

Later research may add staff/time/cash requirements and persistent company-wide unlocks once the campaign needs them.

## Performance philosophy

Optimise based on profiling, not fear.

Likely later optimisation areas include:

- staff pathfinding;
- large numbers of decorative objects;
- world-space UI;
- animation;
- simulation frequency;
- rendering large solar fields;
- multiple off-screen sites.

Large solar arrays should eventually render efficiently without requiring every panel to be a unique expensive runtime entity.

## Version-control principles

- GitHub repository is the source of truth.
- Unity-generated folders such as `Library`, `Temp`, `Logs`, and build outputs must not be committed.
- Large binary assets should use Git LFS where appropriate.
- Project Settings and Packages should be versioned.
- Prefer meaningful commits tied to defined tasks.
- Large or risky work should eventually use branches / pull requests so ChatGPT and Rapha can review changes before they become the new baseline.

## Architecture change rule

If Cursor introduces or materially changes a core architectural pattern, it should update this document or explicitly flag the change for review.

The game design owns the architecture, not the other way around.
