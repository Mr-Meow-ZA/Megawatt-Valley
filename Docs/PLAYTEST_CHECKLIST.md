# Megawatt Valley — Playtest Checklist

Use this when Cursor asks you to playtest. **Only check the Focus list.**  
Everything under Ignore is known grey-box debt — skip it.

Scene: `Assets/_MegawattValley/Scenes/Prototype_Valley.unity`  
Suggested length: ~10–15 minutes (chase at least 1★ + Site B; 3★ if you have time).

---

## Focus now (please report these)

### Core loop

- [x] Place **Premium** (key **1**) and **Bargain** (key **2**) arrays on the green **Site A** plot; cash matches HUD costs
- [x] Cyan pole + post ring (~14 m): arrays inside export in daylight; **west** of Site A outside the ring shows `NO GRID` / no income
- [x] Demolish refunds some cash
- [x] Day/night readable; sim speeds **1/2/3** + **Space** pause work



### Stars (L1-07)

- [x] HUD shows `☆☆☆` → fills as you progress; objective text swaps to the next star goal
- [x] **1★:** install **0.75 MW** before day **10** (three premium arrays, or mix with bargain)
- [x] After 1★ the run **does not** hard-stop — you can keep playing; Restart appears
- [x] **2★:** force a fault (**select array → K**), let tech repair (or **F** / Repair) — star flips when repair finishes
- [x] **3★:** keep exporting until lifetime revenue hits **$350** (HUD shows `$earned / $350`) — sim pauses on 3★
- [x] **Fail path (optional):** if you reach day 10 with under 0.75 MW → FAILED + Restart



### Site B (L1-08)

- [x] Before 1★: brown pad east of Site A (**Site B**) rejects placement (ghost red / won’t place)
- [x] After 1★: Site B turns green / buildable; second cyan pole covers that pad
- [x] Can place at least one array on Site B that exports (inside its ring)



### Events / climax

- [ ] Decision events pop with two choices (**8** / **9** or buttons); **sim pauses** while the modal is open and resumes after you choose
- [ ] Events feel occasional (~one per sim day after the first), not a rapid-fire queue
- [ ] Near day **8** (failAfterDay−2), with arrays built: **Severe Hail Forecast** — protect vs ride out



### Staff / save

- [x] Tech auto-walks to faults; inspection walks still happen
- [x] **F5** save / **F9** load restore cash, arrays, stars roughly correctly (old v1 saves won’t load — start fresh)



### Feel / confusion (only if it blocks understanding)

- [ ] Something important missing from the HUD
- [ ] A control did nothing / wrong thing
- [ ] Could not tell Site A from Site B, or locked vs unlocked

---



## Ignore for now

- Grey cubes, flat materials, missing animations, ugly UI chrome
- No music / SFX / particles
- Capsule technician
- Hills / creek / fence blockout quality
- Tech walks in straight lines (no NavMesh)
- Exact balance numbers unless something feels *broken* (never earns / always bankrupt / 3★ impossible)
- Hiring UI, salaries, wind, storage

---



## Quick keys


| Key                             | Action                                |
| ------------------------------- | ------------------------------------- |
| **1 / 2**                       | Premium / Bargain build               |
| **R**                           | Rotate ghost                          |
| **Esc**                         | Cancel place                          |
| **F**                           | Repair selected fault (dispatch tech) |
| **M**                           | Service selected healthy array        |
| **K**                           | Force fault on selected array         |
| **8 / 9**                       | Event choice A / B                    |
| **1–3** (speed row) / **Space** | Sim speed / pause                     |
| **F5 / F9**                     | Save / Load                           |


---



## How to reply

1. **Pass / Fail** on Focus items that mattered
2. **Bugs only** — unexpected behaviour
3. **Confusion** — anything unclear without asking

Skip grey-box looks unless they made the loop unreadable.