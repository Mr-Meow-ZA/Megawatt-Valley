# Megawatt Valley — Playtest Checklist

Use this when Cursor asks you to playtest. **Only check the Focus list.**

Scene: `Assets/_MegawattValley/Scenes/Prototype_Valley.unity`  
Suggested length: **15–20 minutes** through Radio Dispatch + cleaning kit + Site B.

---

## Focus now (E1 engagement)

### Capabilities / Radio Dispatch

- [ ] HUD **CAPABILITIES** shows Radio Dispatch **LOCKED** at new game
- [ ] Force a fault (**select array → K**): Jordan does **not** auto-walk to it
- [ ] Select faulted array → **F** / Repair: Jordan walks and repairs
- [ ] After repair completes: Radio Dispatch flips to **UNLOCKED** (or use **U** to debug)
- [ ] Force another fault: Jordan **auto-dispatches** without F
- [ ] Save (F5) / Load (F9) keeps unlock state (fresh save; old v2 saves won’t load)

### Soiling / cleaning

- [ ] In daylight, Dust % climbs on array labels; export drops when dusty
- [ ] **Clean** button or **C** ($15) clears dust after a short wait
- [ ] Second clean unlocks **Basic Cleaning Kit**; later cleans are clearly faster

### NEXT card / stars / Site B

- [ ] **NEXT** card always shows a sensible next beat
- [ ] 1★ still unlocks Site B; 2★/3★ still work
- [ ] Events pause the clock; they do not spam every few seconds

### Feel / confusion

- [ ] Something important missing from the HUD
- [ ] A control did nothing / wrong thing
- [ ] Unlock feedback felt invisible or confusing

---

## Ignore for now

- Grey-box looks, capsule tech, no SFX
- E1-06 choice / fancy unlock VFX (not built yet)
- Exact dust balance unless generation feels broken

---

## Quick keys

| Key | Action |
| --- | --- |
| **1 / 2** | Premium / Bargain |
| **F** | Manual repair dispatch |
| **C** | Clean selected array |
| **K** | Force fault |
| **U** | Debug unlock Radio Dispatch |
| **M** | Service |
| **8 / 9** | Event choices |
| **F5 / F9** | Save / Load |

---

## How to reply

1. Pass/Fail on Focus items  
2. Bugs only  
3. Confusion / boring stretches (feeds E1-08)
