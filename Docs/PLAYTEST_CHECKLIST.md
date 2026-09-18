# Megawatt Valley — Playtest Checklist

Use this when Cursor asks you to playtest. **Only check the Focus list.**  
Everything under Ignore is known grey-box debt and is not useful feedback yet.

Scene: `Assets/_MegawattValley/Scenes/Prototype_Valley.unity`

---

## Focus now (please report these)

### Core loop
- [ ] Can place a solar array on the green plot; cash drops by the build price shown in the HUD
- [ ] Arrays inside the cyan grid ring show export MW and income climbs in daylight
- [ ] Arrays clearly outside the ring show a NO GRID / off-grid warning and earn nothing
- [ ] Demolish refunds some cash
- [ ] Day/night clock is readable; night does not feel endless compared to day
- [ ] Sim speed 1 / 2 / 3 and pause work

### Economy readability
- [ ] Build bar shows cost before you commit
- [ ] Company card shows cash and either income `/sec` or the tariff when idle
- [ ] You can tell whether you are making money within ~30 seconds of placing in daylight

### Staff / maintenance
- [ ] Yellow technician is clickable; details panel shows name + trait + status
- [ ] Status label above the tech changes (Idle / Inspection walk / Heading to fault / Repairing)
- [ ] With at least one array built, tech eventually leaves the parking pad for an **inspection walk** even with no fault
- [ ] **Force a fault:** select an array → press **K** → tech should walk over and repair (if you can afford ~$80)
- [ ] Repair button / **F** also sends the tech (repair starts when they arrive, not instantly)

### Scenario / win
- [ ] Objective text is visible; installing enough MW completes it
- [ ] Save (F5) / Load (F9) or HUD buttons restore cash + placed arrays roughly correctly

### Feel / confusion (only if it blocks understanding)
- [ ] Something important is missing from the HUD that you needed to decide
- [ ] A control did nothing, or did the wrong thing
- [ ] You could not tell a real array from a prop

---

## Ignore for now (do not spend playtest time on these)

- Grey cubes, flat materials, missing animations, ugly UI chrome
- No music / SFX / particles / polish VFX
- Capsule “person” instead of a character model
- Hills / creek / fence are blockout shapes, not final art
- No NavMesh pathfinding around buildings (tech walks in straight lines)
- Camera zoom still works over the HUD
- Bargain vs premium is not a build-bar choice yet (bargain still comes from the event)
- Star ratings, multiple sites, wind, storage, hiring UI, salaries
- Exact balance numbers (unless something feels *broken*, e.g. never earns / always bankrupt)

---

## Quick repro keys

| Key | What it does |
|-----|----------------|
| **B** (or Build button) | Toggle solar placement |
| **R** | Rotate ghost while placing |
| **Esc** | Cancel placement |
| **F** | Repair selected faulted array (dispatches tech) |
| **M** | Preventive service on selected healthy array |
| **K** | Force a fault on selected array (best way to test the tech) |
| **1 / 2 / 3** | Sim speed |
| **Space** | Pause |
| **F5 / F9** | Save / Load |

---

## How to reply after playtest

One short note is enough:

1. **Pass / Fail** on Focus items that mattered  
2. **Bugs only** — unexpected behaviour, not “looks ugly”  
3. **Confusion** — anything you could not understand without asking  

Skip listing grey-box visuals unless they made the core loop unreadable.
