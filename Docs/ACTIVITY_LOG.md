# Megawatt Valley — Activity Log

## Purpose

This is the concise, append-only handoff log for meaningful development and support sessions.

Cursor, ChatGPT and Grok Bot should append an entry after meaningful work so every contributor can quickly reconstruct what changed without rereading the full repository history.

This file is not a replacement for commits, pull requests, `CURRENT_STATUS.md`, or authoritative design documents.

## Entry template

```markdown
## YYYY-MM-DD — Sx-xx / Support Task — Short session title

**Agent:** Cursor / Grok Bot / ChatGPT / Rapha
**Status:** Complete / Partial / Blocked / Recommendation

**Changed / Produced**
- ...

**Tested / Verified**
- ...

**Known issues / limitations**
- ...

**Decisions / assumptions / recommendations**
- ...

**Next recommended step**
- ...

**Git / References**
- Commit: `<sha or pending>`
- Branch / PR / Issue: `<if relevant>`
```

---

## 2026-09-19 — E1-01…E1-05 — Capability unlock chain + soiling + objective beats

**Agent:** Cursor
**Status:** Complete (mechanics); Rapha playtest still required for E1-08

**Changed / Produced**
- E1-01/02: `CompanyCapabilities`, Radio Dispatch SO, HUD Capabilities card; auto-dispatch gated until first manual repair (U debug).
- E1-03/04: array soiling + Clean (C); Basic Cleaning Kit after 2 cleans.
- E1-05: `ObjectiveLadder` + NEXT HUD card.
- Save stub v3 stores unlocked capability ids.
- Playtest checklist rewritten for engagement pass.

**Tested / Verified**
- EnsureAll + CreatePrototypeScene + EditMode: 30 passed.

**Next recommended step**
- Rapha playtest `Docs/PLAYTEST_CHECKLIST.md`; then E1-06/07 or engagement fixes.

**Git / References**
- Commit: pending
- Branch: `main`

---

## 2026-09-19 — Fix — Event modal pause + slower pacing

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- Decision events / climax call `SimulationClock.BeginModalPause` while open; resume prior speed on choice.
- Deck pacing: first event ~90s, gap ~180s sim time (was 25 / 22); supplier SO trigger patched to 90.
- Fast-forwarded ChatGPT engagement / asset-policy docs onto local `main`.

**Tested / Verified**
- Shadow compile check passed.

**Next recommended step**
- E1-01 Radio Dispatch capability unlock (`Docs/CURSOR_ENGAGEMENT_IMPLEMENTATION_BRIEF.md`, issue #5).

**Git / References**
- Commit: `2ba2ca8`
- Branch: `main`

---

## 2026-09-18 — Design — Community-first Level 1 asset policy approved

**Agent:** ChatGPT / Rapha
**Status:** Complete

**Changed / Produced**
- Locked **community-first, custom-by-exception** as the asset strategy for Hero Corner and the full first Level 1.
- Added `Docs/ASSET_POLICY.md` and `Docs/ASSET_REGISTER.md`.
- Updated visual direction, roadmap, current status, Cursor rules and collaboration context.
- Blender / Krita are primarily adaptation, kitbashing and unification tools during Level 1 rather than proof that every asset must be modelled from scratch.

**Decisions / assumptions / recommendations**
- Prefer commercially safe free/community assets.
- Custom production is justified when no good source asset exists, adaptation takes longer than making a simple asset, or a specific identity/readability need requires originality.
- Safe sourced assets may remain in the shipped game; there is no requirement to replace everything later.
- Licensing / provenance must be tracked for durable third-party assets.

**Next recommended step**
- Continue E1 Engagement & Progression Proof. Apply this policy when Hero Corner begins.

**Git / References**
- Policy: `Docs/ASSET_POLICY.md`
- Register: `Docs/ASSET_REGISTER.md`
- Branch: `main`



## 2026-09-18 — Handoff — Cursor E1 implementation brief + issue #5

**Agent:** ChatGPT
**Status:** Complete

**Changed / Produced**
- Added `Docs/CURSOR_ENGAGEMENT_IMPLEMENTATION_BRIEF.md` as the concrete Cursor handoff for the full E1 Engagement & Progression Proof.
- Defined exact non-negotiable progression rules, E1 sequencing, testing / handoff expectations, and explicit out-of-scope systems.
- Wrote detailed implementation / architecture / acceptance criteria for **E1-01 — First capability unlock** using **Radio Dispatch**.
- Opened GitHub issue **#5** as Cursor's active implementation task.
- Added the brief to Cursor's mandatory read list and collaboration context.
- Updated `CURRENT_STATUS.md` to point directly at issue #5.

**Tested / Verified**
- Repo state still shows E1-01 as the next unchecked session goal.
- Brief deliberately reuses the existing technician auto-dispatch behaviour instead of introducing a replacement system.

**Known issues / limitations**
- No Unity code was changed by ChatGPT in this handoff.
- Full research tree, research currency, cleaning, Hero Corner, wind / BESS and generic modifier systems remain explicitly out of scope for E1-01.

**Decisions / assumptions / recommendations**
- E1-01 should prove capability state, UI, save persistence and a real gameplay query.
- E1-02 will wire the unlock to the first successful manual repair; Cursor should stop after E1-01 unless Rapha explicitly asks it to continue.

**Next recommended step**
- Cursor implements GitHub issue **#5 — E1-01 First capability unlock (Radio Dispatch)**.

**Git / References**
- Brief: `Docs/CURSOR_ENGAGEMENT_IMPLEMENTATION_BRIEF.md`
- Issue: #5
- Branch: `main`


## 2026-09-18 — Design — Progression, unlocks and engagement model

**Agent:** ChatGPT
**Status:** Complete / Approved design direction

**Changed / Produced**
- Added `Docs/PROGRESSION_AND_ENGAGEMENT.md` after researching progression patterns from Two Point Hospital / Campus, Planet Zoo, Timberborn, Factorio, Against the Storm and Anno.
- Defined four progression layers: scenario onboarding, persistent company capabilities, project-specific choices, and campaign / star progression.
- Defined the **Management Abstraction Ladder**: manual → assigned staff → schedule / policy → automation → exception management.
- Added future capability examples for cleaning, maintenance, monitoring, vegetation, security, construction, grid / automation and company scale.
- Redesigned Level 1 engagement around progression beats rather than merely increasing level duration.
- Added **E1-01…E1-09 — Engagement & Progression Proof** to `SESSION_GOALS.md`.
- Inserted an Engagement Gate before Hero Corner in `ROADMAP.md`.
- Updated Level 1, Game Vision, Current Status, Cursor rules, collaboration context and technical architecture to match.

**Tested / Verified**
- Cross-checked the design against the existing L1-01…L1-08 implementation and reused current systems instead of proposing a rebuild.
- First implementation proof deliberately reuses existing technician auto-dispatch behind an unlock gate.

**Known issues / limitations**
- The full capability tree is intentionally not implemented or numerically balanced yet.
- Exact Level 1 duration remains a playtest outcome; engagement cadence is more important than stretching playtime.
- Research buildings / staff-time research are future campaign mechanics, not E1 requirements.

**Decisions / assumptions / recommendations**
- Level 1 should briefly teach manual actions before rewarding the player with delegation / automation.
- First proof chain: manual technician dispatch → Radio Dispatch unlock → automatic technician dispatch.
- Second proof chain: panel soiling → manual cleaning → cleaning improvement.
- Hero Corner begins after the Engagement Gate; gameplay and visual development then proceed increasingly in parallel.

**Next recommended step**
- **E1-01 — First capability unlock**

**Git / References**
- Main design file: `Docs/PROGRESSION_AND_ENGAGEMENT.md`
- Branch: `main`

## 2026-09-18 — L1-07 / L1-08 — Star tiers + Site B expansion

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- L1-07: 1★ MW / 2★ repair / 3★ lifetime revenue; fail only if day 10 without 1★; HUD ★★★.
- L1-08: locked Site B pad + second grid pole unlock after 1★; multi-node grid range.
- Save stub v2 (revenue + stars + repairs). Playtest checklist rewritten for this pass.

**Tested / Verified**
- EnsureAll + CreatePrototypeScene + EditMode: 28 passed (shadow Verify-L107).

**Known issues / limitations**
- Old v1 saves will not load (version bump).
- 3★ $350 / day-10 window may need balance after Rapha playtest.

**Next recommended step**
- Rapha playtest via `Docs/PLAYTEST_CHECKLIST.md` (at least 1★ + Site B).

**Git / References**
- Commit: `85f0885`
- Branch: `main`

---

## 2026-09-18 — Support — Session-end handoff (clean tree)

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- Committed incidental ProBuilder editor setting drift (`ShapeComponent.ResetSettings`) left dirty after the L1 thin-slice session.

**Tested / Verified**
- N/A (settings-only). L1-01…L1-06 already verified earlier this session (28 EditMode tests).

**Next recommended step**
- Rapha playtest of the Level 1 thin slice when rested; ChatGPT can refresh review on HEAD.

**Git / References**
- Commit: `bc64835`
- Branch: `main`

---

## 2026-09-18 — L1-06 — Hail climax beat

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- `Event_HailForecast`: protect (cash + condition) vs ride out (penalty + forced faults).
- Fires on day `failAfterDay−2` once any MW is installed; wired as `climaxEvent` on event controller.
- L1 thin-slice goals L1-01…L1-06 marked done; next action = Rapha playtest.

**Tested / Verified**
- EnsureAll + CreatePrototypeScene + EditMode: 28 passed.

**Next recommended step**
- Rapha playtest thin slice when rested; ChatGPT review refresh.

**Git / References**
- Commit: `bc1856e`
- Branch: `main`

---

## 2026-09-18 — L1-05 — One-star clear (success / fail / restart)

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- `ScenarioDefinition.failAfterDay` (default 8); win still = target MW installed.
- Fail pauses sim; HUD shows 1★ / fail + Restart (clears save, reloads scene).
- Objective line shows `day N/failAfterDay`.

**Tested / Verified**
- Shadow verify EnsureAll + CreatePrototypeScene + EditMode: 28 passed.

**Next recommended step**
- L1-06 climax beat.

**Git / References**
- Commit: `ca96acd`
- Branch: `main`

---

## 2026-09-18 — L1-03 / L1-04 — Bargain vs premium + five-event deck

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- Build bar: Premium vs Bargain Lot (keys 1/2) via `BuildModeController` catalog.
- Sequential five-event deck (new SO events + `HumorousEventController` deck wiring).
- HUD dual build buttons; ContentBootstrap / PrototypeSceneBootstrap pack updates.
- Status docs: next action → L1-05.

**Tested / Verified**
- `Verify-UnityBuild.ps1` EnsureAll + CreatePrototypeScene + EditMode tests: 28 passed.
- Unity MCP console: 0 errors.

**Known issues / limitations**
- Rapha light playtest of catalog + deck still optional when rested.

**Next recommended step**
- L1-05 one-star clear (success / fail / restart).

**Git / References**
- Commit: `d9c9633`
- Branch: `main`

---

## 2026-09-18 — Support — Enable Unity MCP for Cursor

**Agent:** Cursor
**Status:** Partial (repo configured; Rapha must Accept in Unity)

**Changed / Produced**
- Added `com.unity.ai.assistant` `2.19.0-pre.2` and `com.unity.ai.inference` `2.6.1` to `Packages/manifest.json`.
- Project `.cursor/mcp.json` launches `relay_win.exe --mcp` with `--project-path` to Megawatt-Valley.
- `Docs/UNITY_MCP_SETUP.md` one-time Accept / smoke-test steps; PRACTICES §3.2 marked in-scope.
- Playtest checklist: grid Focus items marked passed.

**Tested / Verified**
- Relay binary present at `%USERPROFILE%\.unity\relay\relay_win.exe`.
- Live Cursor↔Unity tool call not yet verified (needs Editor open + Pending Connection Accept).

**Next recommended step**
- Rapha: open Unity, wait for packages, Accept Cursor under Project Settings → AI → Unity MCP, then ask Cursor to read the console.

**Git / References**
- Commit: `d9cc7a8`
- Branch: `main`

---

## 2026-09-18 — Fix — Testable grid edge + EXPORT HUD labels

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- Grid sell radius 26 m → 14 m so the **west** side of the green plot sits outside the cyan post circle (NO GRID is testable on-pad).
- POWER card retitled **EXPORT**; big number reads `MW exporting`, subline stays `MW installed`.
- Playtest checklist updated for the smaller radius / west-side test.

**Tested / Verified**
- 28 EditMode tests pass; scene `connectRadius: 14`.

**Next recommended step**
- Optional quick re-check of the two grid checklist items, then **L1-03**.

**Git / References**
- Commit: `2c740d5`
- Branch: `main`

---

## 2026-09-18 — Support — Rapha re-playtest results + checklist clarity

**Agent:** Cursor (handoff) / Rapha (playtest)
**Status:** Complete

**Changed / Produced**
- Rapha filled `Docs/PLAYTEST_CHECKLIST.md`: core loop (except grid items), economy, staff/maintenance, and scenario/win all marked pass.
- Clarified the two open grid items: sell radius = bright cyan cylinder + runtime circle of cyan posts (not a filled “cyan grid”).
- Did **not** commit Unity Editor package churn (`com.unity.ai.assistant` / `com.unity.ai.inference`) or ProBuilder settings noise — reverted as incidental / not an accepted project dependency.

**Tested / Verified**
- Human playtest against the Focus list. Grid inside/outside still unchecked pending clearer understanding of the posts.

**Known issues / limitations**
- Grid sell-radius marking is easy to miss; checklist wording was the confusion, not a failed earn loop (income/tariff items passed).

**Decisions / assumptions / recommendations**
- Treat the S6 fix + Sunny Slope + auto-tech batch as re-playtest accepted for Focus items that passed.
- Next implementation goal remains **L1-03**.

**Next recommended step**
- Start `L1-03` bargain vs premium build choice (extend existing SO defs).

**Git / References**
- Commit: `f5e6f57`
- Branch: `main`

---

## 2026-09-18 — Fix — Technician visibility + playtest checklist

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- Technician was idle most of the time because natural faults are rare (by design after the wear fix). Manual repair also started the 2.5s timer before the walk, so the tech barely moved.
- Repair is now walk-then-pay-on-arrival for both auto-dispatch and F/HUD.
- Healthy-site **inspection walks** every ~10s so the worker is visibly active without forcing faults.
- Floating status label on the tech (Idle / Inspection / Heading to fault / Repairing).
- Added `Docs/PLAYTEST_CHECKLIST.md` — Focus vs Ignore, plus K to force faults.

**Tested / Verified**
- 28 EditMode tests pass.

**Next recommended step**
- Rapha re-playtest using `Docs/PLAYTEST_CHECKLIST.md` only.

**Git / References**
- Commit: `2c18790`
- Branch: `main`

---

## 2026-09-18 — S6-07 + L1-01 + L1-02 — Auto-tech, Sunny Slope, tunable tariff

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- `S6-07`: technician auto-dispatches to the nearest faulted array when idle, walks there, then pays and starts the repair on arrival (skipped when cash is short). Alert banner and staff panel reflect the new behaviour.
- `L1-01`: `Prototype_Valley` rebuilt as Sunny Slope Site A — framing hills, creek bed, access road, office compound + parking + laydown, fenced plot, site name sign. Scale refs stay west of the pad. Technician home is the office parking pad.
- `L1-02`: `ScenarioDefinition` owns `exportTariffPerMwPerSecond`; live arrays earn from the scenario tariff. HUD shows the tariff when there is no income yet. Content bootstrap patches a zero tariff on old assets.
- EditMode tests: 26 → 28 (scenario tariff + payback against tariff).

**Tested / Verified**
- 28 EditMode tests pass; scene regenerates in batchmode with zero compile errors.
- Not yet re-playtested by Rapha.

**Known issues / limitations**
- Auto-dispatch is nearest-fault only (no priority queue).
- Bargain array still only arrives via the supplier event — `L1-03` will make it a build choice.
- `S6-02` ChatGPT review still outstanding.

**Decisions / assumptions / recommendations**
- Scenario tariff is the live $/MW/s for every array on the site; array-definition revenue remains a fallback when no scenario is wired.
- Left `S6-02` for ChatGPT rather than writing the review myself.

**Next recommended step**
- Rapha re-playtest, then ChatGPT `S6-02`, then `L1-03` bargain vs premium build choice.

**Git / References**
- Commit: `08818d8`
- Branch: `main`
- Note: rebased onto ChatGPT's `a491e58` review refresh before push

---

## 2026-09-16 — S6-01 → S6-06 — Playtest fixes, HUD, content pack, tests, save stub

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- Playtest fix batch from Rapha's `S6-01` notes:
  - technician keeps a collider and is selectable with a details panel;
  - wear dropped from 1.2 to 0.1 per generating second, worn output floor raised from 0.2× to 0.55×, fault chance reduced — arrays no longer die within a minute;
  - day starts at solar noon, daylight is 80% of the cycle and night fast-forwards, so a new site earns immediately;
  - grid radius 18 m → 26 m with a visible ring of posts, and `SolarArrayUnit` re-checks its grid connection each tick instead of once at spawn;
  - revenue per MW-second 4 → 8, and the objective now tracks installed MW (target 0.75) rather than instantaneous output.
- `S6-03` UI Toolkit HUD replaces every `OnGUI` block: cash + income rate, export/installed MW, day + clock + sun factor, objective, build bar with prices, selection panel, alert banner, event modal, save bar. `UiInputGuard` stops HUD clicks reaching the world.
- `S6-04` balance moved into ScriptableObjects (`SolarArrayDefinition`, `DecisionEventDefinition`, `ScenarioDefinition`) created idempotently by `ContentBootstrap`; `SolarArrayFactory` is now the single way an array is assembled.
- `S6-05` `SolarMath` extracted as pure maths with EditMode tests, plus content-pack and save-file tests (26 total).
- `S6-06` `SaveGameService` persists cash, clock, objective and placed arrays with condition (F5 / F9 or HUD buttons).
- `Tools/Verify-UnityBuild.ps1` runs compile checks, scene generation and the test suite in a shadow project, so verification works while Rapha's editor is open.
- Self-review fixes: no ground marker when clicking an array or staff; scale blocks moved off the buildable plot and the fake solar table recoloured grey; `Scale_Building` renamed `SiteOffice`; staff traits now actually affect walk speed, repair condition and repair cost, and repair/service buttons disable when cash is short.

**Tested / Verified**
- 26 EditMode tests pass in batchmode; `Prototype_Valley` regenerates with zero compile errors.
- Not yet re-playtested by Rapha — the fixes above are unconfirmed in the editor.

**Known issues / limitations**
- Selection still raycasts per-object per-click; fine at prototype scale, worth centralising later.
- Scene regeneration rewrites Unity's internal file IDs, so `Prototype_Valley.unity` diffs look far larger than the semantic change.
- Camera zoom is not blocked while the pointer is over the HUD.

**Decisions / assumptions / recommendations**
- Balance values live in ScriptableObjects from now on; gameplay code reads definitions with serialized fallbacks.
- `ScenarioObjective` intentionally measures installed capacity so the win state is not hostage to weather or condition.

**Next recommended step**
- Rapha re-playtests the fix batch, then `S6-02` ChatGPT design review before starting the `L1` thin slice.

**Git / References**
- Commits: `6fb7b7d` (HUD), `2a22248` (content pack), `0b52a91` (tests), `e4291cb` (save stub), `2571ef3` (self-review)
- Branch: `main`

---

## 2026-09-15 — Support — Cursor + Blender + Krita research

**Agent:** Cursor
**Status:** Recommendation

**Changed / Produced**
- Added `Docs/CURSOR_BLENDER_KRITA.md` — MCP vs scripts, Unity handoff checklists, Krita plugin-first vs typed MCP, security/scope guards, future A0 session ideas.
- Linked from PRACTICES §10, VISUAL_DIRECTION production note, COLLABORATION_GUIDE shared docs.

**Tested / Verified**
- Research against current Blender MCP community stacks, Krita LibKis scripting, dcc-mcp-krita / PaintBridge-style bridges, Unity FBX/GLB handoff practice.
- No DCC software installed or Unity art imported this session.

**Known issues / limitations**
- Cloud agents cannot drive home-PC Blender/Krita; recommendations are for local Cursor on the art/playtest machine.
- MCP packages evolve quickly — pin versions and re-verify before first hero-corner session.

**Decisions / assumptions / recommendations**
- Defer Blender/Krita MCP until after grey-box playtest acceptance; scripts + export checklists are enough until then.
- Prefer Blender MCP for interactive blockout/export; Krita scripts-first; typed Krita MCP if automation grows.
- FBX default into URP; stage exports before `Assets/`.

**Next recommended step**
- Rapha playtest; later accept/amend CURSOR_BLENDER_KRITA §7 when art tooling starts.

**Git / References**
- Commit: `617a171`
- Branch / PR / Issue: `cursor/plan-research-enrichment-5b47` / [#3](https://github.com/Mr-Meow-ZA/Megawatt-Valley/pull/3)

## 2026-09-15 — Support — Plan enrichment research (Cursor + Unity + agents + assets)

**Agent:** Cursor
**Status:** Complete (recommendations; awaiting Rapha/ChatGPT acceptance)

**Changed / Produced**
- Added `Docs/PRACTICES_AND_PLANNING.md` — Cursor↔Unity loop, optional Unity MCP rules, hybrid asset policy, ChatGPT/Grok high-leverage patterns, Unity tips, playtest checklist, open decisions.
- ROADMAP v0.4: phase↔session crosswalk; Level 1 thin-slice build order.
- SESSION_GOALS: proposed S6 harden track + L1-01…L1-06 thin slice.
- COLLABORATION_GUIDE / DEVELOPMENT_WORKFLOW / TECHNICAL_ARCHITECTURE / LEVEL_01_DESIGN / CURRENT_STATUS updated to reference practices and next goals.

**Tested / Verified**
- Doc consistency pass against ACTIVITY_LOG (S0–S5 complete) and GitHub issue #2 proposals.
- No Unity code changes this session.

**Known issues / limitations**
- `CHATGPT_REVIEW.md` remains stale (still pre-Unity / S0-01) — owned by ChatGPT refresh (`S6-02`).
- Asset policy / S6 order / L1 IDs / MCP enablement / pitch tone still need Rapha or ChatGPT acceptance.

**Decisions / assumptions / recommendations**
- Hybrid assets (grey-box → curated kits for experiments → custom after hero corner).
- Do not buy tycoon/RTS system templates; do not treat Unity Cloud as remote Play Mode.
- Extend existing S3 economy/energy loop rather than restarting ROADMAP Phase 3/4 frameworks.

**Next recommended step**
- Rapha playtest (`S6-01`), then ChatGPT review + accept/amend S6/L1 proposals.

**Git / References**
- Commit: `890e658`
- Branch / PR / Issue: `cursor/plan-research-enrichment-5b47` / [#3](https://github.com/Mr-Meow-ZA/Megawatt-Valley/pull/3) / relates to #2

## 2026-09-15 — Overnight — Living plant + Tiny Tycoon (S4-01 → S5-05)

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- Equipment condition %, wear, faults, repair (F), preventive maintenance (M), force-fault (K).
- Named technician **Jordan Watts** with SpeedyBoots trait; walks to repair targets.
- Humorous supplier event with two choices (keys 8/9).
- Zoom-in joke sign: "DO NOT LICK THE INVERTERS".
- Objective `0.50 MW` + on-screen Tiny Tycoon win state.
- Rebuilt `Prototype_Valley` scene via editor bootstrap.

**Tested / Verified**
- Unity batchmode compiled and recreated the prototype scene successfully (return code 0).
- Scene contains Technician/StaffIdentity, HumorousEventController, ScenarioObjective, joke sign.

**Known issues / limitations**
- Still grey-box / OnGUI; not UI Toolkit.
- Event/objective balancing is prototype-only.
- No Rapha playtest yet.
- Bargain-panel event path spawns a primitive array without full build validation.

**Decisions / assumptions / recommendations**
- Overnight mandate was to advance as far as possible; S0–S5 grey-box miniature scenario is now the playtest target.
- Next should be human playtest + ChatGPT design review before expanding systems.

**Next recommended step**
- Rapha Play mode on `Prototype_Valley`, then ChatGPT review.

**Git / References**
- Commit: `feat: add faults, staff, events and tiny win state (S4-S5)` on `main`
- Branch / PR / Issue: `main`

## 2026-09-15 — Overnight — Grey-box solar tycoon loop (S0-04 → S3-05)

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- Proved Cursor → Unity compile loop (`BuildLoopMarker`, package smoke check).
- Created playable scene `Assets/_MegawattValley/Scenes/Prototype_Valley.unity` (startup scene).
- Tycoon camera: WASD/arrow pan, scroll zoom, Q/E + RMB rotate, Shift fast pan, bounds.
- Scale reference blocks (human / vehicle / road / solar / fence / building).
- Interaction: ground click marker, selectable plot, Build Solar button + B key, ghost, R rotate, validation, X demolish.
- Economy/energy: cash HUD, solar MW with day factor, grid export radius node, revenue over time, sim speeds 0/1/2/3.
- Marked session goals **S0-04 through S3-05** complete.

**Tested / Verified**
- Unity batchmode compiled scripts and ran `PrototypeSceneBootstrap.CreatePrototypeScene` successfully (return code 0).
- Scene contains TycoonCamera, OwnedPlot, GridExportNode, MegawattValleySign, GameSystems.

**Known issues / limitations**
- Grey-box primitives only; OnGUI HUD instead of UI Toolkit screens.
- Grid connection is proximity to a single export node, not cabling UX.
- No Rapha playtest yet — overnight unattended build.
- Materials created at runtime (not saved assets).
- Placement validation is intentionally simple.

**Decisions / assumptions / recommendations**
- Namespace `MegawattValley.Cameras` (not `.Camera`) to avoid clashing with `UnityEngine.Camera`.
- Simulation speed uses unscaled delta multipliers so pause does not freeze input.
- Next: Living Plant track starting at **S4-01**.

**Next recommended step**
- Rapha presses Play on `Prototype_Valley`, then **S4-01 — Equipment has condition**.

**Git / References**
- Commit: `feat: grey-box solar tycoon loop through first revenue (S0-04..S3-05)` on `main`
- Branch / PR / Issue: `main`

## 2026-09-15 — S0-03 — Core packages ready

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- Added `com.unity.cinemachine` (resolved to Unity 6.6 builtin **6.6.0**) and `com.unity.probuilder` **6.1.2**.
- Confirmed Input System **1.20.0** already present with Active Input Handling = Input System Package.
- Confirmed UI Toolkit baseline via built-in `modules.uielements` + `com.unity.ugui` **2.6.0**.
- Added `CorePackagesSmokeCheck.cs` so Input System, UI Toolkit, and Cinemachine types must resolve at compile time.

**Tested / Verified**
- Unity batchmode opened the project, resolved packages, and exited with return code 0.
- No `error CS` / script compilation failures in the editor log.
- `packages-lock.json` lists cinemachine 6.6.0 (builtin) and probuilder 6.1.2.

**Known issues / limitations**
- Requesting Cinemachine 3.1.7 is remapped by Unity 6.6 to the builtin 6.6.0 package; manifest now pins `6.6.0`.
- No gameplay camera or UI screens yet — that comes with later session goals.
- ProBuilder is available as a package; no grey-box meshes authored yet.

**Decisions / assumptions / recommendations**
- Use the Unity 6.6 builtin Cinemachine rather than fighting the remap to registry 3.x.
- Keep the smoke-check script until real camera/UI systems replace it (or delete in a later cleanup).

**Next recommended step**
- **S0-04 — Cursor can safely build**

**Git / References**
- Commit: `chore: add Cinemachine and ProBuilder core packages (S0-03)` on `main`
- Branch / PR / Issue: `main`

## 2026-09-15 — S0-02 — Clean project skeleton

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- Created `Assets/_MegawattValley/` with the agreed Art, Audio, Materials, Prefabs, Scenes, UI, Data/*, and Scripts/* folders.
- Added Unity folder `.meta` files and leaf `.gitkeep` placeholders so Git tracks empty folders with stable GUIDs.

**Tested / Verified**
- Folder tree matches `Docs/TECHNICAL_ARCHITECTURE.md` suggested structure.
- Confirmed expected `.meta` files exist for root, nested folders, and placeholders.

**Known issues / limitations**
- URP template assets (`Assets/Scenes/SampleScene`, `TutorialInfo`, root `Settings`) remain; dedicated Megawatt Valley scene is S0-05.
- Folders are empty placeholders only — no scripts, prefabs, or data assets yet.

**Decisions / assumptions / recommendations**
- Keep game content under `Assets/_MegawattValley/`; leave template/settings assets at the Assets root for now.
- Do not expand into packages (S0-03) or a prototype scene (S0-05) in this session.

**Next recommended step**
- **S0-03 — Core packages ready**

**Git / References**
- Commit: `feat: add Megawatt Valley Assets folder skeleton (S0-02)` on `main`
- Branch / PR / Issue: `main`

## 2026-09-15 — S0-01 — Unity lives in GitHub

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- Created a Unity **6000.6.0f1** (Unity 6.6) **URP blank** project and connected it to this repository.
- Added `Assets/`, `Packages/`, `ProjectSettings/`, `.vsconfig`, Unity-aware `.gitignore`, and `.gitattributes` with Git LFS for binary assets.
- Locked engine version in `README.md`, `Docs/TECHNICAL_ARCHITECTURE.md`, and `Docs/CURRENT_STATUS.md`.
- Marked **S0-01** complete; next goal is **S0-02 — Clean project skeleton**.

**Tested / Verified**
- Unity batchmode created the URP project from the bundled template.
- Unity batchmode opened `C:\Users\rapha\Documents\Megawatt-Valley` and exited successfully (return code 0).
- Product name set to **Megawatt Valley** in `ProjectSettings`.

**Known issues / limitations**
- Project still uses the default URP blank template scene and tutorial assets; S0-02 will replace that with the agreed folder skeleton.
- Cinemachine, UI Toolkit baseline, and ProBuilder are deferred to S0-03.
- Rapha should open the project once in the Unity Editor GUI to confirm licensing and first-run experience on this machine.

**Decisions / assumptions / recommendations**
- Unity **6000.6.0f1** is the locked editor for now (matches the locally installed Hub editor).
- S0-01 stays deliberately small: no gameplay systems, no `_MegawattValley/` skeleton yet.

**Next recommended step**
- **S0-02 — Clean project skeleton**

**Git / References**
- Commit: `feat: add Unity 6 URP project (S0-01)` on `main`
- Branch / PR / Issue: `main`

## 2026-09-15 — Support Task — Grok Bot added to collaboration model

**Agent:** ChatGPT
**Status:** Complete

**Changed / Produced**
- Updated `Docs/COLLABORATION_GUIDE.md` to add Grok Bot as a supporting AI contributor.
- Defined Cursor as the primary Unity implementation partner, ChatGPT as the cross-cutting design / review / architecture partner, and Grok Bot as a supporting research / critique / QA / ideation / documentation partner.
- Added role boundaries, AI-to-AI alignment rules, Grok handoff expectations, commit-identification guidance, conflict handling and daily-review coverage.
- Updated this activity-log template so every contributor identifies the agent responsible for an entry.

**Tested / Verified**
- Collaboration guide updated successfully on `main`.
- Grok Bot responsibilities are explicitly separated from Cursor's default Unity implementation lane.

**Known issues / limitations**
- Grok Bot's practical GitHub capabilities will depend on the permissions granted through its personal access token and its own integration behaviour.
- Grok Bot is not required in every session and should not become an additional approval bottleneck.

**Decisions / assumptions / recommendations**
- Grok Bot should mainly add value through research, alternative ideas, QA / edge-case thinking, issue drafting and documentation support.
- Grok recommendations are proposals until accepted through the normal source-of-truth hierarchy.
- If AI contributors materially disagree, record the trade-offs and escalate product / scope / visual / architecture choices to Rapha.

**Next recommended step**
- Once Grok Bot is connected, have it read `Docs/COLLABORATION_GUIDE.md`, `Docs/CURRENT_STATUS.md`, `Docs/SESSION_GOALS.md` and `Docs/CHATGPT_REVIEW.md` before doing project work.

**Git / References**
- Commit: `72eb8167c517e840a1d73aa1d7d9e1e9aa58e36c`
- Branch / PR / Issue: `main`

## 2026-09-15 — Pre-production — Cursor GitHub + Polaris sync automation

**Agent:** Cursor
**Status:** Complete

**Changed / Produced**
- Added Cursor project hooks that fetch GitHub at session start, fast-forward a clean `main`, and stamp the Polaris Megawatt Valley note.
- Added a stop-hook follow-up when the working tree is dirty or `main` has unpushed commits, so the collaboration handoff is not skipped.
- Added `Tools/Sync-PolarisMegawattValley.ps1` to update the vault note from current HEAD without copying design docs.

**Tested / Verified**
- Ran the Polaris sync script against the vault note.
- Validated hook scripts emit JSON on stdout.

**Known issues / limitations**
- Unity project still not created; wait for Rapha before S0-01.
- Hooks cannot write GitHub themselves; Cursor must still commit and push.
- Polaris sync no-ops if `E:\Obsidian Vaults\Polaris_Vault` is unavailable.

**Decisions / assumptions / recommendations**
- Rapha's standing instruction to keep GitHub and Polaris updated applies to meaningful Megawatt Valley sessions (commit + push, then vault stamp).
- Automation is local Cursor hooks + a vault stamp script, not a GitHub Action, because the vault lives on disk.

**Next recommended step**
- Complete S0-01 when Rapha says Unity is ready.

**Git / References**
- Commit: `chore: add GitHub and Polaris session sync automation` on `main`
- Branch / PR / Issue: `main`

## 2026-09-15 — Pre-production — Collaboration system established

**Agent:** ChatGPT
**Status:** Complete

**Changed / Produced**
- Added the shared Cursor + ChatGPT collaboration protocol.
- Added this append-only development activity log.
- Added a ChatGPT review-state document for two-way handoff.
- Added a daily repository review workflow.

**Tested / Verified**
- GitHub repository access confirmed.
- Documentation structure verified.

**Known issues / limitations**
- Unity project has not yet been committed; Unity is still being installed locally.

**Decisions / assumptions / recommendations**
- GitHub is the handoff layer between Cursor and ChatGPT.
- Cursor records meaningful session activity here after implementation sessions.
- ChatGPT reviews this log together with commits, status, session goals, and relevant design documents.

**Next recommended step**
- Complete S0-01: create the Unity project and connect it to this repository.

**Git / References**
- Commit: collaboration-doc commits on `main`
- Branch / PR / Issue: `main`
