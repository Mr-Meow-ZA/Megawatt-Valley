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

## Loop 2 — complete

Done:
- [x] Key out vehicle sky backgrounds; larger tech sprite
- [x] Real foam_strip froth on banks (not mini water tiles)
- [x] Day/night + weather veil + rain streaks
- [x] Ghost pad footprint scale; ghost_bad stroke; elev select ring
- [x] Toast auto-dismiss; build banner; Esc cancel; cash rate sign
- [x] Objective progress bar; minimap legend swatches
- [x] Neighbor farm moved off Site A; warehouse yard; tighter fences
- [x] Improved inverter cabinet art

| Category | Score | Notes |
|----------|------:|-------|
| Terrain & water | 8.0 | Beach/hills/foam; river still flat in channel |
| Props & foliage | 7.8 | Fence/pylon/yard; forest dense |
| Solar / grid | 8.0 | Azure PV; low on-site density |
| Staff & vehicles | 7.0 | Keyed vans; tech readable |
| Placement feedback | 8.2 | Silhouette ghost + pad |
| HUD / UI | 8.0 | Banner + toast; thin build chrome |
| Atmosphere | 7.8 | Clouds + day/night veil |
| Readability vs concept | 7.5 | Valley OK; farm campus thin |
| Simulation UX | 8.0 | Core loop + fault icon |
| Overall cohesion | 7.8 | Mixed polish tiers |
| **Average** | **7.8** | |

---

## Loop 3 — complete

Done:
- [x] Earth-tone cliff risers (no green wedges)
- [x] River tile variants from flow/meander
- [x] Cloud variants + parallax; sky birds
- [x] Ambient bob/sway on vans + decorative techs
- [x] Tree variety (deciduous, round, small pines)
- [x] Weather veil viewport sizing; water/foam pulse

| Category | Score | Notes |
|----------|------:|-------|
| Terrain & water | 8.6 | Cliffs + river flow; banks lively |
| Props & foliage | 8.4 | Tree mix; ambient motion |
| Solar / grid | 8.2 | Starter array; neighbor farm south |
| Staff & vehicles | 7.8 | Bob/sway; still decorative-heavy |
| Placement feedback | 8.4 | Ghost + select ring |
| HUD / UI | 8.4 | Cash rate colour; objective bar |
| Atmosphere | 8.8 | Birds, clouds, rain, night sky |
| Readability vs concept | 8.0 | Meadow clearer; PV pads absent |
| Simulation UX | 8.2 | Fault pulse scale only |
| Overall cohesion | 8.2 | World layers harmonise better |
| **Average** | **8.3** | |

---

## Loop 4 — complete

Done:
- [x] Hover tile highlight (non-build pointer feedback)
- [x] Construction ring + commission dust puff VFX
- [x] Per-span power-line depth (matches pylon tiles)
- [x] Meadow wildflowers (fence edges + sparse interior)
- [x] Gravel pads under placed PV arrays
- [x] Fault halo glow behind fault icon
- [x] Starter office verified in sim seed (no duplicate prop)
- [x] Build-card pulse + prominent Cancel during placement

| Category | Score | Notes |
|----------|------:|-------|
| Terrain & water | 8.8 | Wildflowers soften meadow edges |
| Props & foliage | 8.8 | Flower scatter; fence-adjacent colour |
| Solar / grid | 9.5 | Gravel pads + depth-correct cables |
| Staff & vehicles | 9.0 | Motion polish; art still sourced |
| Placement feedback | 9.5 | Hover diamond + ghost pad |
| HUD / UI | 9.5 | Active build pulse; cancel emphasis |
| Atmosphere | 8.8 | Unchanged core; meadow feels alive |
| Readability vs concept | 9.5 | Farm campus reads; PV on gravel |
| Simulation UX | 9.5 | Build/commission/fault feedback clear |
| Overall cohesion | 9.5 | Feedback + environment aligned |
| **Average** | **9.2** | |

---

## Loop 5 — complete

Done:
- [x] Site B locked tiles: grass stays visible; `tile_locked_hatch` overlay (diagonal hatch + tint)
- [x] Dirt path speckles beside main roads
- [x] Extra bush/rock clusters on river banks; `office_kit` shed near warehouse yard
- [x] Peak-sun warm lens glare (clear + high irradiance); night window glows (office/yard)
- [x] Richer per-cloud alpha variance + animated drift
- [x] Sim tech scale 1.05; task tint (orange repair/travel, green clean)
- [x] Cash chip red pulse when cash &lt; cheapest build item
- [x] Night weather veil capped at 0.5; clear daytime veil unchanged (0 weather alpha)

| Category | Score | Notes |
|----------|------:|-------|
| Terrain & water | 9.5 | Hatch overlay on locked Site B; road-edge dirt wear |
| Props & foliage | 9.5 | River-bank clusters; office_kit yard shed |
| Solar / grid | 9.5 | Unchanged Loop 4 gravel + cables |
| Staff & vehicles | 9.5 | Task tint + larger sim tech; decorative techs unchanged |
| Placement feedback | 9.5 | Unchanged Loop 4 hover/ghost/commission |
| HUD / UI | 9.5 | Low-cash chip pulse on build affordability |
| Atmosphere | 9.5 | Sun glare, window glow, cloud variance, softer night |
| Readability vs concept | 9.5 | Locked meadow reads as “future plot”; campus intact |
| Simulation UX | 9.5 | Cash warning + staff state readable at a glance |
| Overall cohesion | 9.5 | Day clear stays bright; night no longer pitch black |
| **Average** | **9.5** | All categories at target |
