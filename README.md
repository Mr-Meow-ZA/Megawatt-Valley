# Megawatt Valley — current development priority

**Updated 12 October 2026.** Rapha has requested that Codex **finish the existing Three.js/Electron Megawatt Valley game completely before shelving it**, including a **full game-quality UI/UX overhaul and a finished playable Solar Level 1**. Codex cannot currently be run locally on Rapha's PC, so the implementation is to use remote/cloud Codex work and GitHub Actions for tests, screenshots and Windows release builds.

## ACTIVE NOW — Three.js Level 1 finalisation
- **Codex's working code branch:** [`codex/threejs-level1-final`](https://github.com/Mr-Meow-ZA/Megawatt-Valley/tree/codex/threejs-level1-final) (**start coding from this branch, not from `main`**).
- **Active message board and full acceptance criteria:** [issue #20](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/20).
- **Implementation brief on working branch:** [`Docs/LEVEL1_FINALISATION_PLAN_2026-10-12.md`](https://github.com/Mr-Meow-ZA/Megawatt-Valley/blob/codex/threejs-level1-final/Docs/LEVEL1_FINALISATION_PLAN_2026-10-12.md).
- **Game's branch-specific Codex rules:** [`AGENTS.md`](https://github.com/Mr-Meow-ZA/Megawatt-Valley/blob/codex/threejs-level1-final/AGENTS.md).
- **Approved inspiration:** [#12 — detailed 3D world](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/12), [#13 — premium game UI](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13).

Do not mistake passing old browser tests for UI visual acceptance. The current goals, research, staff, contracts and navigation screens were rejected as business-dashboard-like. Redesign the full presentation, preserve existing simulation/save mechanics, complete the 30–60-minute solar-only scenario and optional 2★/3★ mastery, and provide a proper Windows installer and portable build.

## Important branch layout
**`main` remains documentation/coordination only**, not a runnable game source tree. This is deliberate: the current game and its dependencies are on the dedicated Three.js finalisation branch. **Do not merge that branch into main automatically.** Finish and seek Rapha's acceptance, then make a **new final archive**.

**Original frozen Three.js candidate:** [`archive/threejs-solar-candidate-2026-10-09`](https://github.com/Mr-Meow-ZA/Megawatt-Valley/tree/archive/threejs-solar-candidate-2026-10-09). It must not be changed.

## Unity — NEXT, currently ON HOLD
[Unity visual-proof issue #19](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/19) and `prototype/unity-visual-proof` remain untouched and parked until the Three.js game is finished, accepted and archived. Unity has **not** been approved as the permanent engine. Older 9 October engine-switch instructions are superseded by the 12 October finish-first priority.

**Developer:** Codex only. **Cursor:** retired. **Product owner and final visual acceptance:** Rapha.

See [current priority record](Docs/CURRENT_PRIORITY_2026-10-12.md) and [archive index](Docs/ARCHIVE_INDEX.md).
