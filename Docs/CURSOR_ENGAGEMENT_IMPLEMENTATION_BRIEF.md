# Megawatt Valley — Cursor Engagement & Progression Implementation Brief

## Status

**Active implementation brief — E1 Engagement & Progression Proof**

This brief translates the approved progression design into concrete Cursor work.

Authoritative design:
- `Docs/PROGRESSION_AND_ENGAGEMENT.md`
- `Docs/LEVEL_01_DESIGN.md`
- `Docs/ROADMAP.md`
- `Docs/SESSION_GOALS.md`

Current state:
- Functional Level 1 thin slice through `L1-08` is complete.
- The next project risk is **fun / momentum / progression**, not whether the basic systems work.
- Do not begin Hero Corner yet.
- Do not add wind, BESS, full research departments, a giant tech tree, or another gameplay framework.

---

# 1. What Cursor is trying to prove

The next phase must prove that Megawatt Valley feels like a tycoon game where the player's company becomes more capable during play.

The core progression pattern is:

**manual action → delegated action → scheduled / policy-driven action → automation → exception management**

The first scenario should repeatedly create the feeling:

> “I had to deal with this myself earlier. Now my company has learned how to handle it.”

Automation removes stale clicks; it must not remove meaningful decisions.

---

# 2. Non-negotiable design rules

1. **One session goal at a time.**
2. Reuse existing systems instead of rebuilding them.
3. Prefer capability unlocks / new management verbs over small percentage-only bonuses.
4. Let the player experience a problem briefly before unlocking the better tool.
5. Do not make the level longer by adding waiting or grind.
6. Do not build the complete future Company Capability Tree during E1.
7. Every E1 goal should end with a visible / playable difference.
8. Keep capability data / state simple and saveable.
9. The gameplay system that owns an effect should remain responsible for that effect.
10. Avoid a generic “effect engine”, dependency-injection layer, global event bus, or research framework unless a later real requirement proves it necessary.

---

# 3. E1 sequence

Work through the approved sequence in `Docs/SESSION_GOALS.md`:

## E1-01 — First capability unlock
Minimal capability state + UI.

## E1-02 — Earn automatic technician dispatch
Manual dispatch first; first successful repair unlocks Radio Dispatch; existing auto-dispatch then becomes active.

## E1-03 — Dirt actually matters
Simple soiling reduces generation and can be manually cleaned.

## E1-04 — First cleaning upgrade
A Cleaning Kit / cleaner improvement materially reduces burden.

## E1-05 — Objective ladder
Approximately eight contextual objectives create continuous purpose through the opening scenario.

## E1-06 — First capability choice
Offer two useful upgrades; player chooses which to unlock first.

## E1-07 — Unlocks feel rewarding
Clear grey-box reward / unlock presentation.

## E1-08 — Rapha engagement playtest
Do not code through this checkpoint. Rapha must play.

## E1-09 — Engagement gate fixes
Only fix what the playtest shows is preventing engagement.

**After E1 passes: begin Hero Corner.**

---

# 4. Current task — E1-01 First capability unlock

## Purpose

Create the smallest capability system needed for Level 1 to show:

- a capability can be locked;
- the player can see that it exists;
- it can become unlocked;
- the unlocked state persists;
- gameplay code can query the state.

This is infrastructure only insofar as it produces a visible gameplay-facing result.

## First capability

Use:

**Radio Dispatch**

Player-facing idea:

> “Automatically dispatch an available technician to a fault.”

Do not invent five capabilities yet.

## Required behaviour

### Capability definition

Create the minimum data representation necessary for one capability.

Recommended data fields:

- stable ID, e.g. `radio_dispatch`;
- display name;
- short description;
- locked / unlocked presentation text or icon reference if needed.

A ScriptableObject is appropriate if it fits the existing data pattern.

Do not create a huge inheritance hierarchy.

### Capability state

Create a small runtime owner for unlocked capabilities.

It must support:

- `IsUnlocked(id)`;
- `Unlock(id)`;
- no duplicate unlock effects;
- serialisable state suitable for the existing save stub.

Prefer an explicit, understandable class over clever generic architecture.

### Save / load

Extend the current save stub only enough to persist unlocked capability IDs.

Do not redesign save architecture.

Backward compatibility with current prototype saves should fail safely or default to no unlocked capabilities.

### UI

Add a small **Capabilities** area to the current UI Toolkit HUD / management UI.

For E1-01 it only needs to show Radio Dispatch and its state:

- **LOCKED** — clearly visible;
- **UNLOCKED** — visibly different.

The player should understand that this is something they can earn later.

Do not build the final research-tree screen yet.

### Unlock test path

Provide a temporary developer / test path to unlock Radio Dispatch so the entire capability pipeline can be verified before E1-02 wires it to the first repair.

Acceptable:
- a clearly labelled debug key;
- an editor-only / development action;
- a tiny temporary test button.

It must be easy for Rapha / Cursor to verify and easy to remove or hide in E1-02.

### Gameplay query proof

The existing technician auto-dispatch system must be able to query capability state.

For E1-01, it is acceptable to make auto-dispatch conditional on `Radio Dispatch` **only if doing so does not prematurely implement E1-02's onboarding flow**.

Preferred final state after E1-01:
- capability locked → automatic fault-seeking disabled;
- capability manually/debug-unlocked → existing auto-dispatch behaviour works again;
- manual repair dispatch remains available.

This proves that the unlocked state changes real gameplay while keeping the *earn it through first repair* logic for E1-02.

---

# 5. E1-01 acceptance criteria

E1-01 is complete only when all of these are true:

- [ ] Radio Dispatch has a stable capability definition / ID.
- [ ] New game starts with Radio Dispatch locked.
- [ ] UI clearly shows Radio Dispatch as locked.
- [ ] Existing automatic technician fault dispatch does not run while locked.
- [ ] Manual repair / dispatch still works while Radio Dispatch is locked.
- [ ] Temporary test path can unlock Radio Dispatch.
- [ ] UI changes clearly to unlocked.
- [ ] Existing automatic fault dispatch works once unlocked.
- [ ] Save / load preserves the unlocked state.
- [ ] Existing gameplay still compiles and runs.
- [ ] Relevant EditMode tests are added / updated where practical.
- [ ] No unrelated E1-02+ systems are implemented.
- [ ] `Docs/ACTIVITY_LOG.md`, `Docs/SESSION_GOALS.md`, and `Docs/CURRENT_STATUS.md` are updated when complete.

## Victory moment

Force a fault while Radio Dispatch is locked: Jordan does **not** automatically respond.

Unlock Radio Dispatch.

Force another fault: Jordan automatically heads to it.

That is the first visible proof that the company has gained a new capability.

---

# 6. E1-01 architecture guidance

A reasonable minimal shape could be conceptually equivalent to:

```text
CapabilityDefinition
    id
    displayName
    description

CapabilityState
    unlockedIds
    IsUnlocked(id)
    Unlock(id)

TechnicianController
    if CapabilityState.IsUnlocked("radio_dispatch")
        auto-dispatch logic
```

Names may differ to fit the current codebase.

Important:
- `TechnicianController` should own technician behaviour.
- Capability state answers only whether something is unlocked.
- UI reads capability state.
- Save system serialises capability IDs.
- Do not put technician logic inside the capability system.

---

# 7. E1-02 preview — do not implement yet unless Rapha explicitly asks

Once E1-01 is accepted:

1. New scenario starts with Radio Dispatch locked.
2. First forced / natural fault becomes a guided objective.
3. Player manually dispatches Jordan.
4. Successful repair completes the objective.
5. Radio Dispatch unlock presentation appears.
6. From that point forward, automatic dispatch is enabled.

This is the first full:

**problem → manual learning → reward → automation**

loop.

Do not require a research currency for this.

---

# 8. E1-03 / E1-04 preview — cleaning chain

After Radio Dispatch is proven:

## Soiling
- arrays accumulate simple soiling;
- generation visibly falls;
- selected array shows soiling / cleanliness;
- manual Clean action exists;
- staff time is required.

## First upgrade
Unlock one materially useful improvement, e.g. **Basic Cleaning Kit**:

- substantially reduces cleaning duration; or
- improves how much cleanliness is restored; or
- enables a cleaner role.

Do not implement robots yet.

Future progression may become:

manual clean → cleaning kit → cleaning rig → scheduled cleaning → autonomous robots → portfolio optimisation.

---

# 9. E1-05 objective cadence guidance

The opening Level 1 flow should eventually have around 8 contextual objectives.

Use objectives to reveal systems progressively rather than showing every control immediately.

Working beat sequence:

1. First Power
2. Cheap or Good?
3. First Failure
4. Radio Dispatch reward
5. Dust Happens
6. First Cleaning Improvement
7. Site B / Growing Up
8. First Capability Choice
9. Growing Pains
10. Hail Climax

This is a design sequence, not a rigid requirement to create exactly ten objective objects.

---

# 10. Testing / review standard

For every E1 implementation session:

- compile cleanly;
- run the relevant existing EditMode suite;
- add focused tests where the new logic is testable without scene presentation;
- verify the feature in `Prototype_Valley`;
- avoid unrelated scene regeneration if not needed;
- log the session in `Docs/ACTIVITY_LOG.md`;
- push to GitHub;
- stop after the active session goal is complete.

Rapha is the fun / feel authority.

Cursor may verify mechanics but must not mark **E1-08 Engagement Playtest** or **E1-09 Engagement Gate** complete on Rapha's behalf.

---

# 11. What not to build now

Explicitly out of scope for E1-01 and the early E1 proof:

- full visual node-based tech tree;
- science / research currency;
- R&D department;
- Engineer research jobs;
- wind;
- BESS;
- trackers;
- robotic cleaning;
- drone inspection;
- predictive maintenance;
- command centre;
- generic effect / modifier framework;
- complete campaign-wide research persistence architecture;
- large UI redesign;
- Hero Corner art pass.

Those remain future capability content after the progression pattern itself is proven.

---

# 12. Handoff after each goal

Cursor must follow `Docs/COLLABORATION_GUIDE.md`.

At the end of E1-01, report:

- capability data / state created;
- UI state created;
- save change;
- where technician behaviour checks the capability;
- test method;
- tests run;
- known limitations;
- commit SHA;
- recommendation for E1-02.

Do not automatically begin E1-02 unless Rapha asks to continue or the current session explicitly includes it.
