# Megawatt Valley — Practices & Planning Enrichment

**Status:** Research synthesis / recommendations — **not** automatic design law.  
**Date:** 2026-09-15  
**Agent:** Cursor  
**Purpose:** Add practical detail to how we plan, build with Cursor + Unity, source assets, and use ChatGPT / Grok Bot after the S0–S5 grey-box slice.

Accepted items should be promoted into the authoritative docs (`ROADMAP`, `SESSION_GOALS`, `TECHNICAL_ARCHITECTURE`, `VISUAL_DIRECTION`, `COLLABORATION_GUIDE`). Until Rapha / ChatGPT accept a recommendation, treat it as optional guidance.

Related GitHub context: issue [#2](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/2) (Grok plan-watch notes). Overnight work already completed the thin grey-box kill-gate Grok proposed for early phases; the remaining value is **Level 1 thin-slicing**, **doc sync**, and **production practices**.

---

## 1. Where the plan is strong

Keep these; do not “improve” them away:

| Strength | Why it matters |
| --- | --- |
| Session goals S0–S5 with victory moments | Prevents endless infrastructure work |
| Solar-only first vertical slice | Honest kill-gate before wind / BESS / finance sprawl |
| Sim ↔ view separation | Supports later scale without rewriting content |
| Visual sequence prove-game → hero corner → kits → polish | Avoids premature art spend |
| Role hierarchy Rapha > living docs > Cursor implementation | Stops AI role drift |
| GitHub + ACTIVITY_LOG handoff | ChatGPT / Grok can work without watching Cursor |

---

## 2. Plan gaps to close next

### 2.1 Doc drift (urgent process, not code)

`CHATGPT_REVIEW.md` still describes a pre-Unity baseline and recommends S0-01, while `CURRENT_STATUS` / `SESSION_GOALS` / `ACTIVITY_LOG` show S0–S5 complete. Grok already flagged this.

**Recommendation:** ChatGPT refreshes `CHATGPT_REVIEW.md` against HEAD after Rapha’s first playtest notes (or immediately from ACTIVITY_LOG if playtest is delayed). Cursor should not silently rewrite ChatGPT’s review file.

### 2.2 ROADMAP phase ↔ SESSION_GOALS crosswalk

Phases 3 (Energy) and 4 (Economy) both map onto the already-completed `S3-01…S3-05` miniature loop. Without an explicit crosswalk, a future “do Phase 4” prompt risks a second economy framework.

| ROADMAP phase | Session coverage (current) | Notes |
| --- | --- | --- |
| Phase 0 Foundation | S0-01…S0-05 ✅ | Done |
| Phase 1 World & Camera | S1-01…S1-05 ✅ | Done |
| Phase 2 Building Placement | S2-01…S2-08 ✅ | Done |
| Phase 3 Energy Loop | **Partial via S3-02…S3-03** | Irradiance / weather / conversion topology still Phase 5+ |
| Phase 4 Economy | **Partial via S3-01, S3-04** | OpEx, bankruptcy, salaries still later |
| Phase 5 Time & Weather | S3-05 partial (speeds); day factor stub | Full weather / curve still open |
| Phase 6 Maintenance | S4-01…S4-05 ✅ miniature | Expand later with real O&M depth |
| Phase 7 Staff | S4-04, S5-02 miniature | Hire / salary / multi-role still open |
| Phase 8 Events | S5-01 miniature | Framework + 5–10 events before 10–20 |
| Phase 9 Objectives | S5-04…S5-05 miniature | Stars / research still open |
| Phase 10 Level 1 | **Not started as content** | Needs thin-slice SESSION track (below) |

**Rule:** Completing a miniature session badge does **not** close the whole ROADMAP phase. It closes the *first playable proof* of that phase. Remaining phase tasks become later session goals.

### 2.3 Level 1 thin-slice track (before Phase 10 balloons)

Level 1 design currently lists three sites, equipment tiers, staff, events, climax, and 1–3★. That is correct as a **destination**, wrong as the **next** build order.

Recommended Level 1 session track (proposed IDs for ChatGPT to ratify):

| ID | Goal | Victory moment |
| --- | --- | --- |
| L1-01 | Single grey-box valley map with office + one buildable plot family | Looks like a scenario map, not a sandbox pad |
| L1-02 | Starting cash + tariff ScriptableObject tuning | Economy knobs editable without code |
| L1-03 | Two equipment options (bargain vs premium) with different MW / fault risk | Procurement feels like a choice |
| L1-04 | Five data-driven decision events (reuse S5 event shell) | Personality without a novel |
| L1-05 | One-star objective only + clear fail / restart | Completable scenario |
| L1-06 | Scripted climax beat (one timed pressure event) | Memorable ending |
| L1-stretch | Second / third site modifiers | Only after L1-01…L1-05 fun |

2★ / 3★, full 10–20 event deck, and multi-site picker stay **post-pass**.

### 2.4 Immediate post-playtest engineering track (S6)

After Rapha accepts the grey-box loop, prefer this order over diving into Level 1 art:

1. **S6-01 — Playtest acceptance notes** (Rapha; Cursor only logs outcomes).
2. **S6-02 — ChatGPT overnight-slice review** (refresh `CHATGPT_REVIEW.md`).
3. **S6-03 — UI Toolkit HUD v1** replace OnGUI cash / MW / speed / build affordances.
4. **S6-04 — First ScriptableObject content pack** (SolarArrayDefinition, EventDefinition, ObjectiveDefinition).
5. **S6-05 — EditMode tests for generation + revenue math**.
6. **S6-06 — Save / load stub** for cash, placed buildings, objective state.
7. Then enter **L1-01…**.

Stretch only if primary goal is done: joke-prop kit, radio one-liner, or camera edge polish.

---

## 3. Cursor + Unity — best working practices

### 3.1 Default loop (no MCP required)

The overnight slice already proved this path:

1. Cursor edits C# / docs on a focused session goal.
2. Prefer **Editor bootstrap / menu scripts** when scene YAML is painful for agents.
3. Compile via batchmode or Editor when available; otherwise Rapha confirms console on PC.
4. Playtest on the **home PC** Unity Editor (`Prototype_Valley`).
5. Commit + ACTIVITY_LOG + push so ChatGPT / Grok see HEAD.

Unity Cloud project linking (org / project id) does **not** replace GitHub and does not enable remote Play Mode on another machine. Keep **GitHub as SoT**; use Cloud for dashboard / optional services only.

### 3.2 Unity MCP (optional accelerator)

Official Unity MCP (Unity 6 AI open beta) can let Cursor read console, hierarchy, and apply Editor actions while Unity is running on the PC.

Prerequisites (Unity docs, May 2026):

- Unity 6+ with AI Assistant package;
- project linked to Unity Cloud (already true);
- AI tools beta trial / subscription;
- explicit Accept of the Cursor connection in **Project Settings → AI → Unity MCP**.

**Project rules if MCP is enabled:**

- Optional — never block progress if MCP is unavailable.
- First session: read-only tools only (console, hierarchy inspect).
- Write tools (create/delete GameObjects, script edits via MCP) only on a feature branch with Rapha nearby.
- Prefer Cursor file edits for C#; use MCP for verification (console clear? hierarchy correct?).
- Do not commit secrets; pin package versions; treat `.cursor/mcp.json` like infra.
- After MCP write sessions, Rapha spot-checks Play Mode before merge.

**Decision for Rapha:** Unity MCP is **in scope** for Megawatt Valley on the home PC. Setup steps: `Docs/UNITY_MCP_SETUP.md`. Keep the default file-edit + verify script loop as fallback when the bridge is unavailable.

### 3.3 Cursor session discipline (Megawatt-specific)

- One primary session goal from `SESSION_GOALS.md`.
- Do not buy / import asset packs mid-session unless the goal is explicitly art-pipeline.
- Prefer regenerating prototype scenes via bootstrap over hand-editing huge `.unity` YAML.
- Preserve `.meta` GUIDs; never regenerate metas casually.
- Avoid introducing VContainer, MessagePipe, UniRx, Addressables, DOTS, or full RTS kits — they fight the approved “simple MonoBehaviour + ScriptableObject” baseline.
- When both a fix and speculative framework appear in a prompt, ship the fix only.

### 3.4 Unity tips that pay off for this game

| Tip | Application |
| --- | --- |
| **ScriptableObjects for definitions** | Equipment, events, scenarios, weather profiles — ChatGPT can propose tables; Cursor implements SO classes |
| **Pure C# sim math** | Generation, revenue, degradation unit-tested without Play Mode |
| **Assembly definitions when tests arrive** | Small `MegawattValley.Simulation` asmdef + EditMode tests; not a full Clean Architecture stack |
| **UI Toolkit + runtime data binding** | HUD / build menu after OnGUI acceptance; bind to plain C# / SO data sources |
| **Prefab variants** | Bargain vs premium solar without duplicate prefab sprawl |
| **Tick / event over per-frame** | Economy and faults on sim tick; presentation follows |
| **NavMesh only when staff pathing matters** | Already enough for one tech; expand carefully |
| **Profiler before optimisation** | No premature LOD / GPU instancing until hero corner |
| **Git LFS for binaries** | First real FBX / textures / audio |
| **Third-party notices file** | When first external asset pack enters the repo |
| **Build Profiles later** | Cloud Build optional; local PC player builds for sharing clips |

Anti-patterns to refuse:

- Full “tycoon / RTS toolkit” packages that ship competing placement / economy systems.
- Photoreal megascan environments before grey-box Level 1 is fun.
- Giant `GameManager` absorbing HUD + economy + events + save.

---

## 4. Asset strategy — make vs buy vs free

### 4.1 Recommended policy (hybrid)

**Decision to lock (recommendation):** Megawatt Valley uses a **hybrid asset pipeline**:

1. **Grey-box / ProBuilder / primitives** until the loop is accepted (current stage).
2. **Curated free or paid kits** for *scale, silhouette, and hero-corner experiments* only — commercial-safe licenses, heavily modified, never shipped as recognizable stock.
3. **Custom / commissioned modular kits** for production identity after V1 hero corner approval.
4. **Never** clone Two Point (or any reference) proprietary art, UI, characters, or writing.

### 4.2 Stage matrix

| Stage | Source | Allowed use |
| --- | --- | --- |
| Now → playtest accept | Primitives, ProBuilder, solid colours | Default |
| Pre–Hero Corner (V0 polish) | Optional free stylized props / vegetation (EULA checked) | Readability tests; replaceable |
| V1 Hero Corner | Mix: custom hero pieces + modified kit pieces | Prove style; document what stays |
| V2 Art bible + kits | Mostly custom modular kits | Production language |
| Level 1 presentation | Custom kits + selective purchased modular pieces | Cohesive identity |

### 4.3 License checklist (every pack)

Before import:

- [ ] Standard Unity Asset Store EULA **or** clear commercial- Permissive third-party license (MIT/CC0 with attribution rules understood).
- [ ] Not a Unity **Restricted Asset** (personal/non-commercial only).
- [ ] Not a non-standard EULA that forbids commercial games.
- [ ] May modify for use inside the game; may **not** redistribute as an asset pack.
- [ ] Record package name, URL, license, import date in `Docs/THIRD_PARTY_ASSETS.md` (create when first pack lands).
- [ ] Prefer URP-ready or easy material conversion.

### 4.4 What not to buy early

- Complete tycoon / city-builder / RTS **system** templates.
- Photoreal solar farm scans as the visual target.
- Huge nature packs that dwarf the grey-box site and tempt scope into environment art.

### 4.5 What is worth purchasing later

- Stylized modular buildings / fences / roads compatible with isometric readability.
- Vegetation packs with controlled palette.
- Animation packs only after character proportions are locked.
- UI icon sets only after UI Toolkit language exists.

Rapha can stay on free + custom as long as hero corner remains achievable; paid kits are acceleration, not identity.

---

## 5. How ChatGPT should assist (high leverage)

ChatGPT’s highest value is **design coherence + scope control**, not competing with Cursor in the Editor.

### Best standing jobs

1. **Post-session review** — refresh `CHATGPT_REVIEW.md` against ACTIVITY_LOG + commits.
2. **Next session goal writing** — Purpose / Behaviour / Acceptance / Constraints / Out of scope / Docs impact.
3. **Balance tables** — starting cash, MW targets, fault rates, repair costs as editable data proposals.
4. **Level 1 thin-slice ratification** — accept or amend L1-01…L1-06 above.
5. **Event / humour writing** — short choice events with two meaningful outcomes.
6. **Architecture smell checks** — reject framework pile-on; protect sim/view split.
7. **Pitch card** — one sentence + three bullets + forbidden jargon list for README / future store (Grok Web Products suggestion).

### Prompt pattern Rapha can reuse

> Read CURRENT_STATUS, latest ACTIVITY_LOG, SESSION_GOALS, and the last N commits. Update CHATGPT_REVIEW. Confirm alignment with GAME_VISION / LEVEL_01 / TECHNICAL_ARCHITECTURE. Nominate exactly one next session goal with acceptance criteria. Flag any doc drift.

### Avoid asking ChatGPT to

- Author large Unity scenes or package manifests as the primary implementer.
- Expand Level 1 into wind / BESS / corporate finance.
- Treat Grok issues as auto-approved design.

---

## 6. How Grok Bot should assist (high leverage)

Grok is strongest as **watchdog + research + QA**, matching issue #2’s standing watch.

### Best standing jobs

1. **Doc-drift watch** — SESSION_GOALS / CURRENT_STATUS / CHATGPT_REVIEW / ACTIVITY_LOG consistency (weekday cadence).
2. **Industry authenticity research** — O&M practices, soiling, curtailment — distilled into *optional flavour / tooltip* notes, not mandatory systems.
3. **QA checklists** for Rapha playtests (happy path + edge cases).
4. **Alternative ideation** — event setups, vendor names, joke signs — as option lists with trade-offs.
5. **Second-opinion critiques** on ChatGPT proposals before Cursor builds.
6. **Issue hygiene** — bounded issues only; no speculative backlog flood.

### Preferred Grok outputs

- GitHub issues titled `[Grok] …` marked Recommendation.
- Short `Docs/` research notes with Facts / Interpretation / Ideas / Open questions.
- ACTIVITY_LOG entries when writing to the repo.

### Avoid

- Silent architecture or visual-direction rewrites.
- Implementing Unity gameplay by default.
- Turning every research rabbit-hole into a session goal.

---

## 7. Playtest protocol (Rapha, home PC)

Until playtest happens, engineering should prefer docs / HUD / data hardening over new systems.

Suggested 20–30 minute checklist (Grok can expand later):

1. Open `Prototype_Valley`, press Play.
2. Pan / zoom / rotate — camera feel.
3. Select plot → Build solar → place / rotate / invalid feedback → demolish.
4. Confirm cash deduction and MW / revenue over time; try pause and speeds.
5. Force or wait for fault → repair (F) → preventive (M) → watch Jordan Watts.
6. Trigger humorous event (8/9) — both choices once if practical.
7. Zoom into joke sign.
8. Reach 0.50 MW objective — win banner.
9. Note: what’s fun, what’s confusing, what’s broken, what’s “too spreadsheet”.

Capture 3–5 bullets in chat or ACTIVITY_LOG; ChatGPT turns them into the next session goal.

---

## 8. Competitive / reference discipline

Keep **Two Point** as the UX / humour / campaign accessibility north star.

Keep **one** energy-systems mood reference active for mechanics language (README already lists *Power to the People*). Park the rest as mood-board only until First Playable is accepted and Level 1 thin-slice exists — reduces “comp pile-on” scope risk flagged by Grok.

---

## 9. Acceptance path for this document

Rapha / ChatGPT should explicitly accept or amend:

1. Hybrid asset policy (§4.1).
2. Post-playtest S6 order (§2.4).
3. Level 1 thin-slice IDs L1-01…L1-06 (§2.3).
4. Whether Unity MCP is in-scope for the next local tooling session (§3.2).
5. Pitch tone: Two Point–style management humour in renewables vs serious tycoon with light humour (open from issue #2).

Until then, Cursor continues: **no major art pass; no Phase 10 balloon; GitHub SoT; one session goal at a time.**

---

## 10. Cursor + Blender + Krita (summary)

Full research: `Docs/CURSOR_BLENDER_KRITA.md`.

| Tool | Cursor’s best role | When |
| --- | --- | --- |
| **Blender** | MCP or headless Python for blockout, naming, scale checks, FBX export; Unity camera QA remains the gate | After playtest; toward V0/V1 hero corner |
| **Krita** | Write export plugins + layer templates first; optional typed MCP for doc/layer/export chores | When textures/decals start — not for unsupervised final illustration |
| **Neither** | Do not block S6 on DCC tooling; cloud agents cannot drive home-PC Blender/Krita | Now |

**Default recommendation:** scripts + checklists first; Blender MCP for interactive blockout when hero corner begins; Krita MCP only if export friction justifies it. Prefer FBX into URP; log licences; stage exports before Unity `Assets/`.
