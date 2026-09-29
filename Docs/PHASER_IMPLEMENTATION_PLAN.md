# Megawatt Valley — Phaser Level 1 Implementation Plan

**Branch:** `cursor/phaser-level1-build-5938`  
**Tracker:** GitHub issue #6  
**Spec:** `Docs/CURSOR_PRIMARY_BUILD_SPEC.md`  
**Constraint:** Do not alter or delete Unity folders on this branch (`Assets/`, `Packages/`, `ProjectSettings/`). Phaser lives alongside them. Archive branch remains historical.

## Goal

Ship a browser-playable **Level 1: Here Comes the Sun** meeting issue #6 acceptance criteria.

## Milestones (execute continuously)

| ID | Milestone | Exit criteria |
|----|-----------|---------------|
| M0 | Rebaseline | `npm install && npm run build && npm run dev` works; shell loads |
| M1 | Visual proof | Isometric valley, pan/zoom, solar/office/substation/tech, HUD |
| M2 | Solar loop | Place PV, spend cash, generate, export, earn, weather, equipment choice |
| M3 | Operations | Faults, manual dispatch → Radio Dispatch, soiling/cleaning |
| M4 | Scenario | Objectives, Site B, 5–8 events, hail climax, 1★/2★/3★, save/load |
| M5+ | Polish/release | UI polish, deployment URL (follow-on if needed) |

## Architecture decisions (locked for this build)

1. **Stack:** Phaser 4.2.x + TypeScript (strict) + Vite.
2. **Simulation ≠ sprites:** Pure TS `GameState` + tick; Phaser/`WorldView` consume snapshots.
3. **Art:** Procedural canvas textures first (consistent iso, free, autonomous). Third-party CC0 later if needed.
4. **UI:** DOM/CSS overlay for crisp management HUD; Phaser for world.
5. **Persistence:** `localStorage` with versioned JSON save schema.
6. **Tests:** Vitest for economy/generation/objectives; browser play for integration.
7. **No paid deps / no backend.**

## Content slice (Level 1)

- Start: $50k, Site A, office, grid point, 1 technician, no automation.
- Buildables: Bargain PV, Premium PV, Inverter (required for export beyond starter).
- Capabilities: Radio Dispatch, Cleaning Kit.
- Expansion: Site B after first power milestone + cash buffer.
- Events: 6 decision events + hail climax.
- Stars: capacity/cash/uptime-style mastery goals.

## Autoloop

`implement → build → test → run → visually inspect → play → fix → continue`

Escalate only for paid cost, licensing risk, or material design/visual direction changes.
