# Unity visual proof of quality — scoped Codex brief

**Status:** planned / not yet implemented. **Starting platform:** current Unity version with URP, C#, standalone Windows target. **Timebox:** about 2–3 focused working days as an initial *feasibility experiment*, not a guarantee of commercial-studio quality.

## Objective
Prove that Codex and a scene-editor-first pipeline can produce an **appealing, coherent, running 3D solar-park vignette** closer to [world #12](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/12) and [UI #13](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13) than the rejected Three.js screenshots. This is **not** a full Megawatt Valley game or engine port. Preserve Three.js snapshot `archive/threejs-solar-candidate-2026-10-09`.

## Deliverables — one good scene, not dozens of features
1. **Camera and scene:** orthographic/isometric interactive orbit-free pan/zoom, well-composed terrain, slopes or cliff, water/river where appropriate, layered vegetation, daylight and believable stylised shadows.
2. **Recognisable solar operation:** repeated solar arrays with real mounts and spacing, a compact office/workshop, a detailed but readable substation, connected service roads, fences, gates and a few props showing scale and purpose.
3. **Life and activity:** at least one coherent stylised worker with an appropriate walking/working animation; optionally one moving service vehicle. No portrait/low-poly style mismatch.
4. **Gameplay-touch:** select a solar model, inspect a *compact*, well-art-directed in-game panel with key trade-offs, see a world-aligned placement ghost and place/cancel it. This can use prototype data, clearly marked. Don't implement financial or research systems.
5. **HUD:** one concise, attractive, game-style overlay that respects the world composition. No gigantic white spreadsheet windows; avoid static concept art in place of working UI.
6. **Evidence:** raw 1920×1080 and 1366×768 screenshots from the actual Unity executable, a short video of camera/build/staff movement when feasible, FPS/frame-time on specified hardware, a zipped portable Windows build, asset/licence list and brief honest quality review.

## Practical production sequence
- **First work session:** establish Unity project under e.g. `UnityPrototype/`; pin editor version `ProjectSettings/ProjectVersion.txt`; choose URP and a **single coherent asset family**; get source models importing cleanly. Use scene/prefabs rather than writing every object entirely from code.
- **Second work session:** make the *world* look inviting (materials, scene composition, decals, natural terrain and building silhouettes, sensible scale), working camera and purposeful human motion. Use Blender only to adapt or convert models.
- **Third work session:** implement one compact HUD/build interface, capture actual reference-matched evidence, profile representative hardware, and package Windows playable sample. Stop for product review.

## Quality gate / comparison rubric
Evaluate **side by side** with #12/#13:
- **World:** attractive composition, believable solar scale, recognizable infrastructure, varied depth, non-empty environment, natural shadows/lighting, readable building purpose.
- **Coherence:** consistent stylisation and material detail across characters/props/terrain/UI; professionally sourced characters must fit the world (not photoreal cutouts).
- **Gameplay identity:** scene communicates a functioning solar business; visible worker/vehicle activity and satisfying placement feedback.
- **HUD:** stylised game presentation with compact hierarchy; main game world remains the visual focus; clear readable typography, interaction feedback, no oversized dashboards.
- **Tech:** Windows executable actually launches; camera/placement works; images load offline; no console/runtime errors; record memory usage, frame rate and hardware. Aspirational ~60 FPS at 1080p on a defined mid-range target; report observed values, never invent them.
- **Traceability:** exact commit, Unity/editor/render-pipeline versions, legal third-party asset licences, complete scripts/assets, raw captures.

An honest fail or partial success is a valid experimental outcome; do **not** scale or port the full game without Rapha's explicit affirmative visual approval.

## Continuity after a GO decision (future only)
Only then design a staged C# port of the archived TypeScript rules (equipment/economy, staff/jobs, roads, events/weather, research, contracts, objectives), with simulation fixture equivalence tests and a deliberate save import/migration plan. Reuse game/design rules and permitted 3D models, not the rejected HTML/CSS UI. Keep archived original as reference, not an active delivery pipeline.

## Constraints
Codex only; no Cursor; no paid assets/tools by default; Level 1 solar only; game-native Windows desktop (no Electron requirement); always read [active issue #19](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/19) for new instructions.
