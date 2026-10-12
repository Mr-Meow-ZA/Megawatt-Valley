# Current project status — 12 October 2026

## Active instruction
The product owner reversed the 9 October pause: **Codex must finish the EXISTING Three.js/Electron Megawatt Valley Solar Level 1 and perform a full premium game-quality UI/UX overhaul before shelving it.** Codex is the sole coding agent. Cursor is retired and Rapha cannot use Codex locally; work should be done remotely using GitHub and GitHub Actions. Unity issue #19 is on hold.

**Coding branch:** `codex/threejs-level1-final`, copied from the frozen full-game snapshot `98cfc2c32a92321c70cfd1a1d196ec9fbe602163`. **Coordination board:** [issue #20](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/20). **Detailed brief:** [Level 1 finalisation plan](LEVEL1_FINALISATION_PLAN_2026-10-12.md).

## Technical game baseline (what exists)
- Three.js true-3D orthographic/isometric valley, TypeScript/Vite, Electron offline Windows app.
- Solar equipment/building, roads with connection and work accessibility, generation/export/cash, staff/tasks/skills/energy, research, maintenance, cleaning, events/weather/hail, optional supply contracts, one-star + optional mastery goals, version-1 saves.
- Some professionally sourced CC0 3D environment assets and a generated UI illustration/portrait set, but original UI and scene currently **FAIL product-owner visual acceptance**.
- Archived branch review reports `3b7be5eca6b8a1a2dcfb46be90dbffa8e24d5d30` passed 81 existing tests, browser screenshot/interaction checks and Windows packaging, **before** the subsequent documentation commits and current finalisation changes. Do **not** claim new branch or new UI has been tested until exact-SHA CI passes.

## Blocking gaps
1. Player-facing UI fundamentally resembles a business dashboard, not #13's premium management game.
2. World composition, coherent assets, characters/portraits, construction/staff feedback and map richness are too far from #12.
3. Fully independent fresh-player enjoyment, onboarding/pacing and meaningful 2★/3★ progression not proven.
4. Complete Level 1 Windows release with measured performance, source licences, accessible UI, full save/restore and portable/installer artefacts has not been accepted.
5. Active work branch workflows must trigger and validate its exact SHAs; no Rapha local Codex requirement.

## Working plan
- [Stage 1 visual slice](LEVEL1_FINALISATION_PLAN_2026-10-12.md) of HUD + solar build + rich solar valley first; get Rapha's feedback before replicating visual style throughout.
- Continue full UI, one-level gameplay, scene polish and final QA/release once visual direction passes the gate.
- Never blindly remove historical Phaser source referenced by current Three.js imports; retire safely after dependency audit.
- Finalise, seek Rapha's acceptance, create final snapshot, *then* resume Unity issue #19.

## Historical data (not current instructions)
Old documentation below or in Git history may mention Unity, Phaser, Cursor or a paused Three.js direction. **This current decision supersedes all of those.** Current authoritative sources are root `AGENTS.md`, board #20 and this plan.
