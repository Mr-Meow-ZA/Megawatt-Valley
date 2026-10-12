# AGENTS.md — Megawatt Valley (current coordination baseline, 12 October 2026)

## Overriding user decision
**Codex is the sole developer. Cursor is retired.** The **immediate task is to FINISH THE EXISTING THREE.JS / ELECTRON SOLAR LEVEL 1**, including a complete premium management-game UI/UX overhaul, gameplay, world quality, testing and Windows release. **Unity is ON HOLD until this is accepted and shelved.** This takes precedence over the 9 October Unity-first trial instructions in the older docs.

## Critical: this main branch does not contain the running game
- Select and work on **`codex/threejs-level1-final`**, based on the frozen 3D snapshot. **Do not use main as the game's code branch** and do not edit `archive/threejs-solar-candidate-2026-10-09` or `codex/3d-isometric`.
- Read **the working branch's own `AGENTS.md` and `Docs/LEVEL1_FINALISATION_PLAN_2026-10-12.md`** as the detailed implementation instructions.
- **Primary message board:** [issue #20](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/20). At session start, before major decisions, and at end, read new comments, follow recent Rapha decisions, and report exact commits, tests, build/screenshots and pending issues.
- Unity [issue #19](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/19) is **parked**. Do not start new Unity engine work, migrate TypeScript gameplay, or build a competing game while issue #20 is active.
- Do not require Rapha to install Codex locally. Use cloud development/GitHub CI workflows; honest blockers if cloud access or Windows build isn't available.

## Non-negotiable acceptance
Complete only Solar Level 1 with a rich stylised 3D scene, real functioning management UI matching issue #13's quality direction, gameplay onboarding and 1★/2★/3★ progression, offline Windows distribution, source licences and actual gameplay/screenshot testing. Preserve working simulation and save compatibility. No large enterprise-like overlay redesign by recoloring old cards. Rapha must approve the final game before it is declared complete and archived.

Keep the immutable original archive and future Unity pilot untouched. Don't auto-merge finished Three.js into main or modify unrelated branches.
