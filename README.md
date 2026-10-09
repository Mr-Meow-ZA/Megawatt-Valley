# Megawatt Valley

**Current direction — 9 October 2026:** a **Unity-first, timeboxed visual-quality evaluation** for our stylised 3D renewable-energy management game. **This is NOT approval for a full Unity migration yet.** The goal is to demonstrate actual running-game visual quality before investing in a rewrite.

## Start here
- **Active Codex coordination board:** [GitHub issue #19](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/19).
- **Build/evaluation brief:** [Unity visual proof plan](Docs/UNITY_VISUAL_PROOF_PLAN.md).
- **Current decision and quality gate:** [Engine decision](Docs/ENGINE_DECISION_2026-10-09.md).
- **Assets:** [Free asset sourcing guidelines](Docs/FREE_ASSET_SOURCES.md).
- **Approved visual targets:** [rich 3D world, issue #12](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/12), [game UI concept, issue #13](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13), and [local reference copy](Docs/References/approved-ui-concept-v1.jpg).
- **Agent rules:** [AGENTS.md](AGENTS.md). **Codex alone implements; Cursor is retired.**

## What is playable?
This clean `main` branch is a **planning/baseline repository** for the Unity proof, **not yet a runnable Unity game**. Codex should create the Unity editor project and prototype in an isolated development branch and attach working Windows build / screenshot evidence. Do not substitute a rendered mockup for actual game footage.

## The existing game is archived, not destroyed
The former Three.js + TypeScript + Electron Solar game — including gameplay simulation, desktop packaging, assets, tests and save code — is preserved at [archive/threejs-solar-candidate-2026-10-09](https://github.com/Mr-Meow-ZA/Megawatt-Valley/tree/archive/threejs-solar-candidate-2026-10-09) (pinned commit `98cfc2c32a92321c70cfd1a1d196ec9fbe602163`). The previous main is preserved at `archive/pre-unity-rebaseline-main-2026-10-09`. Details: [Archive index](Docs/ARCHIVE_INDEX.md).

**Do not continue Three.js, Phaser or old Unity experiments as competing production tracks.** The historical Unity project is *not* the new pilot: make a fresh Unity scene, with a disciplined art pipeline.

## Product scope
Megawatt Valley is a single-player, characterful 3D isometric renewable-energy business/tycoon. First level: **Here Comes the Sun** (solar **only**), with an eventual target of roughly 30–60 minutes to first milestone, optional mastery, growing equipment, staff, repairs, research, finances and a lively company world. Wind and other technologies are future levels, not part of the visual prototype.

## The approval gate
The first deliverable is a small polished **solar-park environment plus one compelling HUD/build interaction**. Compare real running Unity screenshots with #12/#13 at 1920×1080 and 1366×768; supply recorded performance and an actual Windows executable. Rapha decides **go/no-go**. Only after affirmative approval should Codex plan staged migration of the archived gameplay systems.
