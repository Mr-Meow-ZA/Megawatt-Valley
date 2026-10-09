# Engine strategy decision — 9 October 2026

**Decision owner:** Rapha. **Developer:** Codex. **Reviewer/coordinator:** ChatGPT.

## What changed
Rapha rejected the real production screenshots of the Three.js desktop candidate as a fundamental quality failure: the huge pale dashboard panels, sparse/simple world, incompatible portrait/3D/icon styles, weak research/contract presentation, poor minimap and lack of premium tycoon atmosphere did not resemble the approved reference images. Repeated UI re-skin attempts and passing automated tests did not solve the art-direction/production-workflow problem.

**New plan:** archive all current Three.js work and **evaluate Unity as the leading replacement** by building a tightly scoped real-time visual vertical slice. We have **not** yet approved the complete rewrite. Unity is the recommended *candidate*, subject to real visual results. Godot is the free alternative to reconsider if Unity fails the limited proof. Do not run competing engine projects at once.

## Why Unity for the test
An integrated 3D editor, scene/prefab workflow, URP rendering, terrain/lighting, rigged animation, native-game UI and a large catalogue of free professionally made assets are closer to the production process of a polished characterful management game than the current code-built Three.js/CSS-dashboard approach. **The engine itself will not supply good artwork or design**; the test must prove the full production workflow.

## Approved targets
- [#12 — visual world inspirations](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/12)
- [#13 — four-screen UI/UX inspiration](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13)
- `Docs/References/approved-ui-concept-v1.jpg` (copy from the archived 3D branch)
- Gameplay brief: true 3D isometric, lively solar valley; one solar-only first level; detail and human-scale activity; personality, visual hierarchy, positive feedback; eventually 30–60 minutes to first star.

The images are **art-direction references**; they contain example data and future energy types not necessarily implemented, and their literal artwork is not a licensed shipping asset. The UI should feel like a game, not an enterprise dashboard. Avoid falsely promising pixel-identical replication of concept imagery.

## Scope of approval
✅ Archive old game and previous main; replace main with clean Unity evaluation docs.
✅ Codex to build a tiny Unity proof on a new isolated branch using free licensed assets and show actual running evidence.
⛔ **NOT** yet approved: full migration of TS gameplay/saves, merging an incomplete Unity implementation as production, paid asset spend, third-party subscription spend, broad scenario expansion, revival of the historical Unity project, erasing existing archive branches.

## Gate
The product owner evaluates the screenshot/interactive Windows sample next to the reference. Accept only if the cohesive visual quality and player-facing game feel are a **material** improvement. A compiled build or polished illustration alone is insufficient. On acceptance, approve a staged port plan with feature parity and save migration options; if not, capture what failed and reevaluate alternatives instead of repeating uncontrolled redesign cycles.
