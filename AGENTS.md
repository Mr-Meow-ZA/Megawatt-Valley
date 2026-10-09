# AGENTS.md — Megawatt Valley (Codex only)

## Governing product decision — 9 October 2026
**Codex is the sole active development agent. Cursor has been retired.** The production candidate being **evaluated** is **Unity (URP, C#)** for a stylised 3D isometric tycoon game. This overrides contradictory Unity/Phaser/Three.js directives in archived documentation. It does **not** authorize a wholesale engine migration until Rapha explicitly approves the Unity visual proof.

## Mandatory start-of-session reading
1. The newest comments on the **active message board [issue #19](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/19)**. This replaces the archived PR #11 message board.
2. `README.md`, `Docs/ENGINE_DECISION_2026-10-09.md`, `Docs/UNITY_VISUAL_PROOF_PLAN.md`, and `Docs/FREE_ASSET_SOURCES.md`.
3. Exact **visual references** [issue #12](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/12), [issue #13](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13), and `Docs/References/approved-ui-concept-v1.jpg`.
4. Before design or engine decisions, recheck #19 for newer user direction. Before session end, recheck the board and record completed, pending and blocked items with exact commits and test evidence.

If GitHub is unavailable, state this explicitly; **do not pretend the board was checked**. There is no continuous monitoring when the agent is not running.

## Branch protection / other agent work
- **Do not touch** the frozen Three.js archive, original `codex/3d-isometric` branch, `archive/pre-unity-rebaseline-main-2026-10-09`, historical Unity/Phaser branches, or cleanup PR #18.
- Work only on a **new Unity-prototype development branch** (suggested `prototype/unity-visual-proof`) based on clean `main`, opening a PR rather than committing prototype experiments straight onto main.
- Do not force-push, rebase, merge or delete another agent's branch. Ask Rapha before merging, changing engine, buying assets or starting a full gameplay port.
- Old game code and assets are **reference material** only, preserved in the archive. Do not inadvertently check out and continue the old Unity project from 2026 September; it was a discarded prototype.

## Immediate scope — visual proof only
- Target **one** appealing, actually playable solar park vignette in a current Unity version + URP with a proper scene/prefab workflow.
- Use **free professionally made commercial-compatible** scenery/buildings/characters/animations wherever possible; adapt in Blender; track licences and provenance. No paid purchase or unapproved AI-art spree.
- A compact, *game-native* HUD and usable solar selection/placement interaction are sufficient. Not a suite of dashboard-like menus. The world remains the focus. Maintain stylistic coherence between characters, terrain, equipment and UI.
- Capture **unmodified screenshots from the running game** at both 1920×1080 and 1366×768, a short clip if feasible, Windows build, and a simple measured performance report. Compare explicitly with reference issues.
- This is a **2–3 focused development day initial feasibility target**, not a contractual deadline. Report actual effort and blockers.
- No migration of archived simulation/economy/research/contracts/saves until Rapha approves the visual proof. If editor execution is not available, provide actual reproducible Unity project evidence and disclose the unverified parts; do not misrepresent renders.

## Decision and acceptance
Rapha alone approves whether the quality is good enough and whether Unity becomes the permanent engine. CI/test success is not visual acceptance. If the prototype cannot approach the reference, report the gap and stop rather than continuing an expensive port.
