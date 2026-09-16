# Megawatt Valley — Session Goals

## Purpose

Megawatt Valley is a long-term project, but progress must feel tangible every time we work on it.

The project therefore uses **session goals**: small, concrete outcomes that can normally be completed in one focused working session and end with something visible, playable, testable, committed, or clearly decided.

The goal is to avoid the feeling of working for weeks toward a distant milestone with nothing that feels finished.

## The accomplishment rule

A good Megawatt Valley session should end with at least one of these:

- something new can be **seen**;
- something new can be **clicked / controlled**;
- something new can be **played**;
- a system now **works end-to-end** in a tiny form;
- a meaningful design decision has been **locked and documented**;
- a visible bug or problem has been **removed**;
- a clean commit records a clearly understandable improvement.

Avoid sessions whose only outcome is invisible infrastructure unless that infrastructure is required to unlock the next visible result.

## How session goals work

- Only **one primary session goal** should be active at a time.
- Optional stretch goals are allowed, but the session is successful when the primary goal is done.
- Cursor should not quietly expand a session goal into a much larger framework.
- When a goal is complete, mark it `[x]`, commit the result, and nominate the next smallest useful goal.
- Rapha should be able to launch Unity and notice the difference whenever practical.
- ChatGPT can review the completed goal, update the sequence, and help define the next session.
- The sequence below is a living list. It can be reordered when playtesting reveals a better route.

---

# Current Session Track

## Foundation — "The project exists"

- [x] **S0-01 — Unity lives in GitHub**  
  Create the Unity project locally, connect it to this repository, verify the correct Unity `.gitignore`, and make the first clean Unity project commit.  
  **Victory moment:** clone/open the repo and Unity launches the project successfully.

- [x] **S0-02 — Clean project skeleton**  
  Create the agreed `Assets/_MegawattValley/` folder structure and confirm scenes, scripts, prefabs, art, UI and data have clear homes.  
  **Victory moment:** Project window already looks intentional rather than like a blank Unity dump.

- [x] **S0-03 — Core packages ready**  
  Configure Input System, Cinemachine, UI Toolkit baseline and ProBuilder as appropriate.  
  **Victory moment:** project compiles cleanly with the core toolset ready.

- [x] **S0-04 — Cursor can safely build**  
  Open the repo in Cursor, confirm project rules are loaded, make one harmless code change, compile successfully in Unity, and commit it.  
  **Victory moment:** Cursor → Unity → GitHub loop is proven.

- [x] **S0-05 — First Megawatt Valley scene**  
  Create and save a dedicated prototype scene with a ground plane / simple terrain, basic light, camera, and one obvious Megawatt Valley placeholder object or sign.  
  **Victory moment:** press Play and see the first recognisable project scene rather than Unity's default sample.

### Foundation badge

When S0-01 through S0-05 are complete: **🏁 Foundation Online**

---

## World & Camera — "I can move around Megawatt Valley"

- [x] **S1-01 — Pan around the valley**  
  Implement smooth WASD / keyboard or mouse-driven pan.  
  **Victory moment:** moving around the map feels like a management game.

- [x] **S1-02 — Zoom feels good**  
  Add bounded smooth zoom with sensible near/far limits.  
  **Victory moment:** zoom from site overview to close inspection without losing control.

- [x] **S1-03 — Rotate the world view**  
  Add camera rotation around the viewed area / pivot.  
  **Victory moment:** inspect the same prototype site from multiple useful angles.

- [x] **S1-04 — Camera polish pass 1**  
  Tune movement speed, acceleration, zoom scaling, rotation speed and bounds.  
  **Victory moment:** navigating the empty grey-box scene is already satisfying.

- [x] **S1-05 — First scale test**  
  Place human, vehicle, road, solar-table, fence and building placeholder blocks at a coherent stylised scale.  
  **Victory moment:** zooming in starts to resemble the proportions of the approved visual target.

### Camera badge

When S1-01 through S1-05 are complete: **🗺️ Valley Explorer**

---

## Interaction — "The world reacts to me"

- [x] **S2-01 — Click the ground**  
  Raycast from cursor to world and show a clear test marker where the player clicks.  
  **Victory moment:** the game understands where you are pointing.

- [x] **S2-02 — Select a plot**  
  Create one selectable test plot with visible selected / unselected states.  
  **Victory moment:** click land and see it respond clearly.

- [x] **S2-03 — First build button**  
  Add a tiny prototype Build UI with one item: Solar Array.  
  **Victory moment:** clicking Build → Solar changes the player's mode.

- [x] **S2-04 — Ghost solar array**  
  Show a placement preview that follows the cursor over valid ground.  
  **Victory moment:** a future solar array visibly follows the mouse before placement.

- [x] **S2-05 — Place the first solar array**  
  Click to place a permanent placeholder solar array.  
  **Victory moment:** **the player builds the first object in Megawatt Valley.**

- [x] **S2-06 — Rotate before placement**  
  Add a simple rotation control for the placement ghost.  
  **Victory moment:** orient the solar array before placing it.

- [x] **S2-07 — Valid vs invalid placement**  
  Prevent overlap / out-of-bounds placement and provide clear feedback.  
  **Victory moment:** the build system starts feeling like a real tycoon game rather than an object spawner.

- [x] **S2-08 — Demolish something**  
  Add a simple remove / demolish interaction.  
  **Victory moment:** build something, change your mind, remove it cleanly.

### Builder badge

When S2-01 through S2-08 are complete: **🔨 First Foundations**

---

## First Tycoon Loop — "I built something and it earns money"

- [x] **S3-01 — Money exists**  
  Display a cash balance and make construction deduct a cost.  
  **Victory moment:** placing a solar array visibly changes your bank balance.

- [x] **S3-02 — The sun makes power**  
  Give placed solar arrays a simple logical generation value.  
  **Victory moment:** a live MW / kW output number responds to what you've built.

- [x] **S3-03 — Connect to the grid**  
  Add a minimal grid / export condition so unconnected generation cannot earn revenue.  
  **Victory moment:** the player understands `build → connect → export`.

- [x] **S3-04 — First revenue**  
  Exported energy increases cash over time.  
  **Victory moment:** **Megawatt Valley has its first functioning tycoon loop.**

- [x] **S3-05 — Speed controls**  
  Add pause and basic simulation speed controls.  
  **Victory moment:** watch income change at different game speeds.

### Tycoon badge

When S3-01 through S3-05 are complete: **💰 First Megawatt Earned**

---

## Living Plant — "Things can go wrong"

- [x] **S4-01 — Equipment has condition**  
  Give a solar asset a visible condition percentage.

- [x] **S4-02 — Something breaks**  
  Trigger a simple fault that stops or reduces generation.  
  **Victory moment:** first genuine operational problem.

- [x] **S4-03 — Repair button**  
  Allow the fault to be repaired at a cost / delay.  
  **Victory moment:** output returns after intervention.

- [x] **S4-04 — First technician**  
  Add a placeholder staff character who can be assigned to the repair.  
  **Victory moment:** a little person visibly moves through the site to fix something.

- [x] **S4-05 — Maintenance becomes a decision**  
  Introduce one simple preventive-maintenance choice versus waiting for failure.

### Operations badge

When S4-01 through S4-05 are complete: **🔧 Keeping the Lights On**

---

## First Personality — "This is becoming Megawatt Valley"

- [x] **S5-01 — First humorous event**  
  Create one decision event with two meaningful choices and a funny renewable-energy-industry setup.

- [x] **S5-02 — First staff name and trait**  
  Give the technician a name, role and one gameplay trait.

- [x] **S5-03 — First visual joke**  
  Add one environmental sign / prop / interaction that rewards zooming in.

- [x] **S5-04 — First objective**  
  Add a simple target such as `Reach 100 kW installed` or its balanced equivalent.

- [x] **S5-05 — First win screen**  
  Complete the objective and show a simple success state.  
  **Victory moment:** **Megawatt Valley can now be "won" in miniature.**

### Identity badge

When S5-01 through S5-05 are complete: **⭐ Tiny Tycoon**

---

## After Tiny Tycoon — "Harden the slice, then Level 1"

These goals stay **unchecked** until Rapha playtests and ChatGPT refreshes review. Prefer this order over a major art pass or Phase 10 balloon. Detail and rationale: `Docs/PRACTICES_AND_PLANNING.md`.

### S6 — Harden & handoff

- [x] **S6-01 — Rapha playtest acceptance**  
  Play `Prototype_Valley` on the home PC; capture fun / confusing / broken notes.  
  **Victory moment:** the grey-box loop is accepted, rejected, or given a short fix list.  
  *Accepted 2026-09-16 with a fix list: dead arrays off-grid, condition wearing far too fast, no visible clock, unreadable HUD, hidden build cost / income rate, un-clickable technician.*

- [ ] **S6-02 — ChatGPT overnight-slice review**  
  Refresh `Docs/CHATGPT_REVIEW.md` against HEAD / ACTIVITY_LOG; nominate the next single goal.  
  **Victory moment:** review docs match reality again.

- [x] **S6-03 — UI Toolkit HUD v1**  
  Replace OnGUI cash / MW / speed / build affordances with a minimal UI Toolkit HUD.  
  **Victory moment:** the management bar looks intentional without changing sim rules.

- [x] **S6-04 — First ScriptableObject content pack**  
  Move solar definition, one event, and the MW objective into ScriptableObject (or equivalent data) assets.  
  **Victory moment:** balance values change without rewriting gameplay code.

- [x] **S6-05 — EditMode tests for generation + revenue**  
  Add a small test assembly covering core MW and cash math.  
  **Victory moment:** Cursor can catch economy regressions without Play Mode.

- [x] **S6-06 — Save / load stub**  
  Persist cash, placed buildings, and objective progress for one prototype session.  
  **Victory moment:** quit and resume the miniature scenario.

### L1 — Here Comes the Sun (thin slice)

- [ ] **L1-01 — Scenario map blockout**  
  One grey-box valley map with office presence and a coherent buildable area.  
  **Victory moment:** it feels like a level, not a sandbox pad.

- [ ] **L1-02 — Tunable start economy**  
  Starting cash + tariff (and related knobs) driven from data.  
  **Victory moment:** ChatGPT / Rapha can propose numbers Cursor can drop in.

- [ ] **L1-03 — Bargain vs premium equipment**  
  Two solar procurement options with different cost / yield / risk.  
  **Victory moment:** buying gear is a meaningful choice.

- [ ] **L1-04 — Five decision events**  
  Data-driven events reusing the S5 choice pattern.  
  **Victory moment:** personality without a novel-length deck.

- [ ] **L1-05 — One-star scenario clear**  
  Single primary objective with clear success / fail / restart.  
  **Victory moment:** Level 1 is completable at 1★.

- [ ] **L1-06 — Climax beat**  
  One scripted late-scenario pressure event.  
  **Victory moment:** the ending is memorable.

Stretch after L1-05 is fun: second/third site modifiers, 2★/3★, larger event deck.

---

# Major Celebration Markers

These are deliberately spaced between the larger roadmap phases.

- [x] **🏁 Foundation Online** — Unity, Cursor and GitHub work together.
- [x] **🗺️ Valley Explorer** — moving around the world feels good.
- [x] **🔨 First Foundations** — player can place real infrastructure.
- [x] **☀️ First Solar Farm** — a recognisable small solar site exists.
- [x] **⚡ First Megawatt** — the plant generates power.
- [x] **💰 First Megawatt Earned** — generation produces revenue.
- [x] **🔧 Keeping the Lights On** — faults and maintenance create operational gameplay.
- [x] **👷 Somebody Works Here** — staff visibly perform meaningful tasks.
- [x] **😂 That's Megawatt Valley** — humour appears in gameplay and the world.
- [x] **⭐ Tiny Tycoon** — the first miniature scenario can actually be completed.
- [x] **🎮 First Playable** — a coherent functional vertical slice exists.
- [ ] **🎨 Hero Corner** — the approved long-term visual direction works in real Unity gameplay.
- [ ] **🌄 Here Comes the Sun** — Level 1 reaches its first polished completion.

---

# Session Close-Out Template

At the end of a meaningful session, record:

**Session goal:** Sx-xx — Title  
**Status:** Complete / Partial / Blocked  
**Visible result:** What changed that Rapha can see or play?  
**Key decision:** Any design / architecture decision made?  
**Known issue:** Anything intentionally left imperfect?  
**Commit / PR:** Reference if available.  
**Next goal:** The next smallest useful session goal.

## Rule for adding future goals

A future session goal is probably too large if it contains several unrelated verbs such as:

> build the staff system, pathfinding, traits, hiring UI, salaries and training.

Split it until there is a clear finish line.

Prefer:

> A hired placeholder technician can walk to one failed inverter and repair it.

That is the level of progress granularity Megawatt Valley should aim for.
