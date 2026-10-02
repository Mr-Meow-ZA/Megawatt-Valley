# Megawatt Valley: honest review and improvement plan

Reviewed 2 October 2026. Baseline: `438a521` on `codex/solar-release-hardening`, PR #10. This is a design assessment of the code, actual standalone game and supplied visual reference, not an independent player study. Scores use a ten-point scale: 5 = promising prototype, 7 = convincing playable slice, 9 = polished commercial-quality experience. Earlier 9.5 targets were aspirations, not demonstrated quality.

## Verdict

**Baseline overall: 5.5/10. After this pass: approximately 6.3/10.** The game has a coherent solar loop and dependable delivery. It is still a prototype, well short of the supplied bright, cozy low-poly target and of the staff-driven depth of Two Point. This pass makes a real start; it does not establish that the game is fun for a first-time player for an hour.

| Area | Before | After this pass | Honest assessment |
|---|---:|---:|---|
| Core solar simulation | 6.5 | 6.5 | Generation, dust, faults, weather and inverter bottlenecks interact. Placement lacks orientation, shading and layout tradeoffs. |
| Visual presentation | 4.5 | 5.5 | Brighter terrain, blue roofs/cells, deeper river, faceted distant mountains, lake and village fill the empty backdrop. It remains small procedural 2D art with limited building detail. |
| World composition and life | 4 | 5.5 | Connected roads, bridge, service yard, trees and ambient wildlife are coherent. The wider landscape now suggests a place. Village and hills are decorative. |
| Staff management | 4 | 4.5 | Role-specific characters and portraits improve readability. Hiring, training, traits and work exist. No morale, fatigue, breaks, facilities or meaningful staffing schedules yet. |
| Research and tech tree | 2 | 6.5 | Replaced a future-feature preview with nine paid, timed, persistent upgrades across three branches. Effects work. This is an initial linear tree, without alternative specialisations or new equipment unlocks. |
| UI and information design | 6 | 7 | Crisp management dock, inspectors and research board; clearer finance and star requirements. The stylesheet still needs consolidation and some crowded layouts remain. |
| Quality of life | 5.5 | 7 | Find-problem alerts, camera home/focus shortcuts, minimap navigation, repeat placement, safe load, dock collapse and completion acknowledgement. Moving equipment, undo and layout templates are missing. |
| Progression and pacing | 5 | 5.5 | Optional research creates another spending decision. Later stars still depend heavily on capacity peaks and reuse lessons. Research benefits need ordinary-budget player testing. |
| Economy and feedback | 6 | 6.5 | Capacity and clipping are visible, with sales, expenses, availability and cleanliness. No day-by-day history, debt, contracts or convincing commercial choices yet. |
| Onboarding | 6 | 6 | Manual repair/clean lessons earn automation. Need a better first five minutes, clear research introduction and less reliance on toast messages. |
| Audio and personality | 3 | 3 | Synthesised feedback exists. No rich ambient soundscape or distinctive character writing. |
| Accessibility | 4 | 5.5 | Research dialog has keyboard close, focus trapping and labelled progress. Camera shortcuts help. Full remapping, contrast audit and text scaling remain. |
| Save/delivery reliability | 8 | 8 | Offline HTML, portable saves and release workflow work. New fields migrate older saves and reject malformed research state. Hosted distribution still pending. |
| Technical maintainability | 7 | 7 | Simulation stays separate from sprites; research definitions are data-driven. Large HUD/simulation classes and layered CSS are debt. |
| Plan quality | 6.5 | 7.5 | Scope and engine choice are sensible. The old plan conflated implementation with quality and left research as a preview. Updated priorities now use observable exit criteria. |

The overall scores are editorial judgments, not an average of test coverage. Passing a test cannot prove visual charm, retention or enjoyment.

## Design direction

The player fantasy is **running a solar park with a visible team**, not merely adding generators until a number rises. The satisfying rhythm should be: spot a problem → choose an investment or management response → watch staff act → see a healthier park → earn a new development opportunity.

Use the reference's warm cream buildings, blue roofs and panels, bright greens, layered mountain/lake landscape and readable staff. Continue the existing isometric Phaser game for this slice. A fully 3D low-poly result would require a separate art/engine decision; that gap must stay explicit.

Keep solar management at the centre. Wind, BESS, contracts and multi-site finance should arrive when they create distinct decisions. They must not appear as operational features before they work.

## Implemented now

- Nine functional research nodes. Generation: precision wiring (+8% all solar output), smart inverters (+20% capacity), advanced cells (+12% premium output). Operations: field toolkits (+20% work speed), crew logistics (+25% travel speed), lean operations (−30% solar equipment operating costs). Resilience: dust-resistant coating (−20% dust), predictive diagnostics (−25% routine fault chance), storm hardening (−25% hail condition damage).
- Cash cost, park-hour duration, lesson/expansion prerequisites, one active project, progress display and persistence. Engineers add 10% speed per skill point, capped at +100%; they retain field duties. Tutorial faults and storm preparation remain meaningful.
- A readable three-column tech tree with completed, available, researching and locked states. Future-feature preview removed.
- Original brighter scenery, distant landscape, blue roofs and richer panel colours; four original staff uniforms with walking poses and roster portraits.
- Clickable fault/dust/clipping alerts, clickable minimap, H home, F find selected, U research, Shift-click repeat placement, disabled impossible staff actions and portable completion acknowledgement.
- Finance cards expose output bottlenecks and current star criteria rather than hiding them in a long sentence.

## Prioritised continuation

| Order | Deliverable | Exit criteria |
|---|---|---|
| 1 | Art slice with a strong first screenshot | Office, workshop, substation, solar and four staff have distinct silhouettes; shadows share one light direction; the camera shows a composed valley; detail remains readable at 1024×768. Compare actual game captures directly with the reference. |
| 2 | Staff as the emotional core | Energy/morale, breaks and an office/service facility affect performance. Clear workload/queue UI. Staff visibly walk to real destinations. At least two staffing choices change outcomes without constant micromanagement. |
| 3 | Better solar layout decisions | Placement previews show predicted output and capacity impact. Moving/selling/duplicating equipment is clear; add a reusable array layout template. Introduce orientation/shading only with understandable feedback. |
| 4 | Distinct two/three-star mastery | Require sustained reliable operation, sensible finances and staff development in addition to capacity. A report explains every unmet condition. Avoid stretching playtime with idle cash waits. |
| 5 | Richer research choices | Unlock one genuinely different solar technology or operational facility; allow a specialisation choice. Balance cost/payback using the real scenario economy. Add a proper research staff/facility loop before claiming one exists. |
| 6 | Scenario personality and audio | Staff names/traits affect memorable moments; weather/build/repair have restrained feedback and ambience. No interruption floods. |
| 7 | Release and first-player validation | Stable hosted link; uninterrupted normal-budget runs, save recovery and laptop checks. Observe first-time players: first meaningful decision within two minutes, a completed maintenance lesson without developer help, and reasons to keep playing beyond 1★. |

Treat 30–60 minutes as an engagement goal, not a timer requirement. The current reference strategy still finishes 1★ in 22.6 minutes at 1× and mastery about 5.8 minutes later. Those numbers describe one automated strategy, not the experience of a new player. Do not claim this pacing goal is solved.

## Validation and remaining limits

34 simulation tests cover normal-budget progression, save integrity/migration, research purchase/prerequisites, pause/resume, engineer assistance and all nine effects. Browser checks exercise the actual offline HTML: placement, staff selection/hiring, events, save/import/reload, lighting, laptop management controls, research purchase and completion, prerequisite access, alerts and camera controls. Captures are published by the release workflow.

No independent enjoyment study, accessibility certification, mobile acceptance or frame-rate benchmark has been performed. Research balance and late-game variety remain provisional. Scenario 2 is still an unlock marker; wind/BESS remain future scope. Unity archives are untouched.
