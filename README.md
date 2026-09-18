# Megawatt Valley

**Megawatt Valley** is a character-driven renewable-energy tycoon and management game being built in **Unity** with **Cursor** as the primary implementation assistant.

The player starts small: limited cash, a tiny company, a few staff, and access to basic solar projects. By developing sites, selecting equipment, hiring and training staff, building plants, operating assets, surviving failures and unexpected events, and making increasingly difficult commercial decisions, the player grows into a major renewable-energy company managing solar, wind, storage, hybrid plants, and eventually a multi-site portfolio.

## Design direction

Megawatt Valley takes inspiration from games such as **Two Point Hospital / Campus / Museum**, **Tropico**, **Planet Zoo**, **Parkitect / Megaquarium**, **Power to the People**, **Against the Storm**, **Timberborn**, **Surviving Mars**, and **Cities: Skylines**.

Two Point is the strongest reference for accessibility, personality, visual readability, humour, staff-driven management, and campaign progression. These games are references only; Megawatt Valley will develop its own visual identity, characters, systems, humour, terminology, and world.

The design principle is:

> **Realism in cause and effect. Abstraction in execution.**

Renewable-energy professionals should recognise the underlying logic, while players with no industry knowledge should still be able to understand and enjoy the game.

## Core gameplay loop

**DEVELOP → FINANCE → BUILD → OPERATE → EXPAND**

1. Select and investigate potential project sites.
2. Secure land, approvals, finance, contractors, staff, and equipment.
3. Build the renewable-energy project and manage construction risk.
4. Operate the asset, generate electricity and revenue, maintain equipment, and respond to problems.
5. Grow company capability, reputation, technology, staff, and portfolio size.
6. Complete scenario objectives and unlock new regions, technologies, and challenges.

## Initial scope

Development will start deliberately small. The first target is not the complete game; it is one genuinely enjoyable solar-focused vertical slice.

The early playable build will prove:

- tycoon-style camera and world interaction;
- land / site selection;
- building placement;
- solar generation;
- grid connection;
- costs and revenue;
- time and weather;
- equipment condition and failures;
- maintenance staff;
- decision-based events;
- scenario objectives and progression.

Wind, BESS, advanced financing, multi-region portfolios, and other major systems will be added only after the core solar gameplay loop is fun.

## Technology direction

Current planned stack:

- Unity **6000.6.0f1** (Unity 6.6) with Universal Render Pipeline (URP)
- C# / GameObject-based architecture initially
- ScriptableObjects and other data-driven definitions for game content
- UI Toolkit
- Cinemachine
- Unity Input System
- NavMesh for staff movement where appropriate
- Git + GitHub + Git LFS
- Cursor for implementation and code assistance
- Unity MCP integration where useful, but not as a hard dependency

The simulation layer should remain separate from the visual representation wherever practical so that large portfolios can be simulated efficiently without making every visible object responsible for game logic.

## Development partnership

The project will use complementary roles:

- **Rapha** — product owner / creative director. Sets the vision, makes design decisions, tests builds, and decides priorities.
- **Cursor** — primary Unity implementation environment. Builds code, scenes, tools, editor utilities, tests, and game systems from defined tasks.
- **ChatGPT** — ongoing game-design, planning, review, architecture, balancing, research, and quality partner.
- **Grok Bot** — supporting research, critique, QA, ideation, and doc-drift watch (recommendations, not automatic design authority).

GitHub is the shared source of truth between these roles. Collaboration protocol: `Docs/COLLABORATION_GUIDE.md`. Practical Cursor↔Unity / asset / assist recommendations: `Docs/PRACTICES_AND_PLANNING.md`. Unity MCP setup: `Docs/UNITY_MCP_SETUP.md`.

## Current status

**Grey-box miniature vertical slice playable (S0–S5).**

Open `Assets/_MegawattValley/Scenes/Prototype_Valley.unity` and press Play on the home PC. Next: Rapha playtest (`S6-01`) + ChatGPT review (`S6-02`), then harden HUD/data before Level 1 thin-slice — not a major art pass yet.

See the `Docs/` folder for the current planning documents.

## Playtest controls (grey-box)

Open `Assets/_MegawattValley/Scenes/Prototype_Valley.unity` and press Play.

- **WASD / arrows** pan · **scroll** zoom · **Q/E or RMB drag** rotate · **Shift** fast pan
- **Click plot** to select · **B** or **Build: Solar Array** button · **R** rotate ghost · **LMB** place · **Esc/RMB** cancel · **X** demolish
- **F** repair selected faulted array · **M** preventive maintenance · **K** force fault (debug)
- **Space** pause · **1/2/3** sim speed · Event choices **8/9** when shown
- Objective: reach **0.50 MW** for Tiny Tycoon win

