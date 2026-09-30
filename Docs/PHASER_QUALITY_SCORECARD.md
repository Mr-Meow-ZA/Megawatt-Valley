# Phaser Level 1 — Quality Scorecard

Target: **every category ≥ 9.5 / 10**. Process: review → score → improve → re-score (minimum 5 full loops).

Scoring rubric (0–10):
- **10** = concept-art ready, no distracting defects
- **9.5** = shippable polish; tiny nits only
- **8** = solid but unfinished edges
- **6** = playable / readable, clear gaps
- **4** = placeholder / inconsistent
- **≤3** = broken or wrong art language

Categories:
1. Terrain & water
2. Props & foliage
3. Solar / grid equipment art
4. Staff & vehicles
5. Placement / selection feedback
6. HUD / UI polish
7. Atmosphere (sky, light, motion)
8. Readability & composition vs concept
9. Simulation UX / feedback clarity
10. Overall cohesion

---

## Baseline (pre–Loop 1) — ~2026-09-30

| Category | Score | Notes |
|----------|------:|-------|
| Terrain & water | 5.5 | Flat water, weak banks, no foam/beach/hills |
| Props & foliage | 6.0 | Dense pines OK; fence/pylon recently fixed |
| Solar / grid | 7.0 | Procedural azure PV better; demo density low |
| Staff & vehicles | 4.5 | Tiny tech; side-view trucks clash |
| Placement feedback | 5.0 | Bare diamond ghost |
| HUD / UI | 7.0 | Icons/minimap OK; hover polish thin |
| Atmosphere | 5.5 | Soft clouds; little life in river |
| Readability vs concept | 5.5 | Valley readable but sparse farm feel |
| Simulation UX | 7.5 | Core loop works |
| Overall cohesion | 5.5 | Mix of good sprites + unfinished world |
| **Average** | **5.9** | |

---

## Loop 1 — complete (code audit)

| Category | Score | Notes |
|----------|------:|-------|
| Terrain & water | 7.0 | Beach/hills/foam wired; foam layer was mini water tiles |
| Props & foliage | 7.0 | Fence/pylon better; gaps + single-dir fence |
| Solar / grid | 7.5 | Demo PV fought Site A placement |
| Staff & vehicles | 5.5 | Tiny tech; vans had sky-blue BG |
| Placement feedback | 7.0 | Silhouette ghost shipped |
| HUD / UI | 7.5 | Sticky toast; thin objective chrome |
| Atmosphere | 6.0 | Clouds only; no day/night |
| Readability vs concept | 6.5 | Mixed art languages |
| Simulation UX | 7.5 | Core loop intact |
| Overall cohesion | 6.5 | Edges improved |
| **Average** | **6.8** | |

---

## Loop 2 — in progress

Done:
- [x] Key out vehicle sky backgrounds; larger tech sprite
- [x] Real foam_strip froth on banks (not mini water tiles)
- [x] Day/night + weather veil + rain streaks
- [x] Ghost pad footprint scale; ghost_bad stroke; elev select ring
- [x] Toast auto-dismiss; build banner; Esc cancel; cash rate sign
- [x] Objective progress bar; minimap legend swatches
- [x] Neighbor farm moved off Site A; warehouse yard; tighter fences
- [x] Improved inverter cabinet art
- [ ] Visual rescore

| Category | Score | Notes |
|----------|------:|-------|
| Terrain & water | — | pending |
| Props & foliage | — | |
| Solar / grid | — | |
| Staff & vehicles | — | |
| Placement feedback | — | |
| HUD / UI | — | |
| Atmosphere | — | |
| Readability vs concept | — | |
| Simulation UX | — | |
| Overall cohesion | — | |
| **Average** | — | |

---

## Loop 3–5

*(filled after each review)*
