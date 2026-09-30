# Megawatt Valley Level 1 — Honest Quality Review

**Date:** 30 September 2026  
**Build:** `cursor/level1-steam-finish-5938` / PR #8  
**Bar:** Steam-quality small-indie **30–60 min Level 1 vertical slice** (not Two Point full campaign)

This document **overrides** optimistic Loop 21 “all 9.5” claims in `PHASER_QUALITY_SCORECARD.md` for product honesty.

---

## Executive verdict

| Lens | Score | One-line |
|------|------:|----------|
| **Design / engagement thesis** | **7.5 / 10** | Strong Level 1 beat structure; ahead of most jam solar toys |
| **Playable systems + UX** | **7.0 / 10** | Core loop works; HUD covers the right channels |
| **Visual / audio identity** | **6.0 / 10** | Kenney + procedural collage; SFX present, music is a soft pad |
| **Steam “recommend a friend for a few dollars”** | **5.5 / 10** | Recommend as **free demo / playtest**, not yet as paid short Steam release |
| **Overall toward final Level 1 goal** | **~88–90%** | Content + shell done; identity, first-five-minutes certainty, live URL, human pacing left |

---

## Visual & asset scores (honest)

Earlier Loop 21 scorecard claimed **9.5 every category**. Harsh audit of `public/assets/game/` + WorldView:

| Category | Claimed | **Honest** | Comment |
|----------|--------:|-----------:|---------|
| Terrain & water | 9.5 | **6.5** | Kenney iso slabs + foam/HD grass; river still tiled |
| Props & foliage | 9.5 | **6.0** | Dense but mixed art languages (trees/bush/rock clash) |
| Solar / grid | 9.5 | **7.0** | Best sprites; still industrial-kit DNA |
| Staff & vehicles | 9.5 | **5.5** | Tiny tech + prism vans; many ambient fakes |
| Placement feedback | 9.5 | **8.0** | Real strength (ghost, dim, Place on Site A) |
| HUD / UI | 9.5 | **7.5** | Solid management chrome; weak mobile |
| Atmosphere | 9.5 | **7.0** | Good VFX garnish over thin world art |
| Concept match | 9.5 | **6.0** | Layout rhyme without concept fidelity |
| Sim UX | 9.5 | **8.0** | Faults, floats, dispatch, objectives — systems polish |
| Cohesion | 9.5 | **5.5** | Defining Steam risk: prototype collage |
| **Average** | **9.5** | **~6.7** | |

**Asset inventory:** ~86 PNGs (~373 KB), mix of Kenney CC0 + rebuilt + runtime procedural overlays. LFS risk if clones skip `git lfs pull`. Dead `textures.ts` generator still in tree.

---

## Gameplay / UX / progression scores

| Dimension | Score | Comment |
|-----------|------:|---------|
| Onboarding / first 5 minutes | **6.0** | Title + coach + Place on Site A help; still not “inevitable product” |
| Core loop (build→export→maintain) | **7.0** | Sound and renewable-specific; mid-game can become “more PV” |
| Progression / unlock cadence | **7.5** | Best relative strength (manual→auto, Site B, capability fork, hail) |
| Level flow / pacing (30–60 min) | **6.0** | Designed on paper; human timing not fully proven |
| Event stakes | **6.5** | Improving (discounts, tariff goodwill, staff busy); still light vs Two Point set-pieces |
| Juice / feedback | **6.5** | Floats/sparks/toasts; soft ambience pad; no memorable music theme |
| Content density (one level) | **7.0** | ~13 objectives, ~9 events, 2 sites, 3★ — filled vs design targets |

---

## Competitive benchmark

| Peer | Fair use | MV vs them |
|------|----------|------------|
| **Two Point Hospital/Campus** | Tone, UX, reward theatre | Aspiration correct; delivery unfinished (~4.5 on first-hour fantasy) |
| **Prison Architect / RimWorld** | Crisis pressure / cause→effect | Shape of ops ladder good; overlapping siege pressure thin |
| **Habitation / small iso builders** | Short-session product shape | MV wins ops progression; they often win charm / place-feel |
| **Solar / energy jam tycoons** | Same fantasy niche | MV design thesis usually **ahead** |
| **Stardew** (feedback only) | Readable warmth | Effects exist; soul/music/consistency missing |
| **Typical itch iso management jam** | Realistic peer | MV smarter systems; many jams cuter / clearer “buy me” identity |

| Steam Level-1 slice bar | Score |
|-------------------------|------:|
| First 5 minutes | 5.5–6.0 |
| Core loop satisfaction | 7.0 |
| Progression cadence | 7.5 |
| Visual identity | 6.0 |
| UX clarity | 6.5–7.0 |
| Content density | 6.5–7.0 |
| Juice | 6.5 |
| **Recommend as short paid slice** | **5.5** |

---

## Top gaps before “Steam-quality Level 1”

1. **Public boot as a product** — live URL (Vercel 403 currently).
2. **Authored visual/audio identity** — one coherent art pass + memorable music.
3. **First-five-minutes certainty** — export + cash feel without bandaids/coach.
4. **Human 30–60 min pacing** — overlapping ops pressure after automation.
5. **Reward theatre** — unlocks/stars/hail should feel Two Point–lite celebrated.

---

## What is already good (keep)

- Engagement ladder: First Power → Cheap/Good → Failure → Dust → Improve → Site B → Hail → Stars  
- Sim ≠ sprites architecture; Vitest coverage including 1★ smoke  
- Placement/dim/ghost UX; fault/clean dispatch readability  
- Save v2, title Continue, onboarding coach, procedural SFX + soft ambience  

---

## Method notes

- Visual scores from code/asset inventory + prior harsh computerUse sessions (not inflated Loop 21 self-score).  
- Competitive scores are judgment against a **short paid Steam Level 1** bar, not against AAA Two Point art budgets.  
- Update this file when a real art pass or live deploy lands — do not bump scores for minor VFX alone.
