# Megawatt Valley

## Current desktop direction

Start with [the locked quality target](Docs/DESKTOP_QUALITY_TARGET.md) and [resume checkpoint](Docs/RESUME_CHECKPOINT.md). Active autonomous development is the TypeScript / Three.js / Electron desktop build on `codex/3d-isometric` (draft PR #11). It aims for the detailed stylised 3D isometric world in the user's issue #12 references. The approved clean-sheet UI direction is recorded in [UI/UX read first](Docs/CODEX_UI_UX_READ_FIRST.md) and [Concept v1 implementation](Docs/CONCEPT_V1_IMPLEMENTATION.md), using the actual image in issue #13. The active interface is src/ui/studio; src/ui/tycoon is historical scaffolding. The September/browser-first baseline below is historical wherever it conflicts with this target. Unity history remains preserved.


**Megawatt Valley** is a renewable-energy tycoon / management game.

## Primary direction — 29 September 2026

The project has been rebaselined around one overriding objective:

> **Cursor should build a complete, polished, ready-to-play game with minimal ongoing manual work from Rapha and no additional paid development tools or services beyond existing Cursor and ChatGPT subscriptions.**

The previous Unity implementation is **archived**. Its design discoveries remain useful, but Unity is no longer the active production path.

Archived Unity snapshot:
- branch: **archive/unity-prototype-2026-09-29**
- status: historical reference only
- do not resume Unity development unless Rapha explicitly reverses this decision

## Current production stack

Primary implementation target:

- **Phaser** — free/open-source game framework
- **TypeScript**
- **Vite**
- browser-first delivery
- Git + GitHub
- free/open-source dependencies and assets only by default
- local browser storage / IndexedDB for saves
- Cursor as the primary autonomous implementation team
- ChatGPT as product/design/review support

No paid Phaser tooling, Unity licence, Godot editor workflow, paid asset packs, paid AI game builder, backend subscription, or other recurring service is required for the primary build.

## Product target

The first release target is:

# Megawatt Valley: Solar

A polished 30–60 minute first scenario, **Here Comes the Sun**, proving the core game loop:

**DEVELOP → FINANCE → BUILD → OPERATE → IMPROVE → EXPAND**

The release should include:

- isometric building and placement;
- solar generation and grid export;
- economy and revenue;
- time and weather;
- equipment condition and failures;
- maintenance staff;
- panel cleaning / soiling;
- capability unlocks and automation;
- decision events;
- objectives and 1★ / 2★ / 3★ completion;
- save / load;
- tutorialised progression;
- polished UI;
- a complete playable release build.

Wind, BESS, multi-region portfolios and advanced finance remain future expansion systems until the solar release is complete and enjoyable.

## Visual target

The approved direction is **high-resolution pixel-isometric / illustrated pixel art** with:

- a fixed or near-fixed isometric camera;
- a rich scenic valley;
- technically recognisable renewable infrastructure;
- small expressive staff and service vehicles;
- construction and maintenance activity;
- animated weather and environmental effects;
- warm, readable lighting;
- a crisp modern management UI layered over the world.

The quality benchmark is the approved Megawatt Valley pixel-isometric concept from 29 September 2026. See **Docs/VISUAL_DIRECTION.md**.

## Cursor authority

Cursor is expected to own routine implementation rather than wait for step-by-step instructions.

Cursor should:

1. read the primary project documents;
2. maintain its own implementation backlog;
3. implement;
4. build;
5. run automated tests;
6. open and visually inspect the game;
7. play through the affected feature;
8. fix defects;
9. repeat until acceptance criteria pass;
10. commit and push meaningful progress.

Rapha is the product owner / creative director, **not the routine developer or debugger**.

Cursor should only escalate choices that materially affect game design, product scope, paid cost, legal/licensing risk, or an irreversible architectural decision.

## Primary source of truth

Read these first:

1. **Docs/CURSOR_PRIMARY_BUILD_SPEC.md**
2. **Docs/CURRENT_STATUS.md**
3. **Docs/VISUAL_DIRECTION.md**
4. **Docs/TECHNICAL_ARCHITECTURE.md**
5. **Docs/ROADMAP.md**
6. **Docs/GAME_VISION.md**
7. **Docs/PROGRESSION_AND_ENGAGEMENT.md**
8. **Docs/LEVEL_01_DESIGN.md**

Any older document that conflicts with the files above should be treated as archived historical context.

## Development principle

> **Build the game, not the development project.**

The objective is a finished playable Megawatt Valley release, not an endless sequence of prototypes or tooling exercises.

## Run the Phaser build

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

```bash
npm test
npm run build
```
