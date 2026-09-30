# Megawatt Valley Level 1 — Honest Quality Review

**Date:** 30 September 2026 (updated after reward-theatre / first-5 / ops-pressure pass)  
**Build:** `cursor/level1-steam-finish-5938` / PR #8  
**Bar:** Steam-quality small-indie **30–60 min Level 1 vertical slice** (not Two Point full campaign)

This document **overrides** optimistic Loop 21 “all 9.5” claims in `PHASER_QUALITY_SCORECARD.md` for product honesty.

---

## Executive verdict

| Lens | Score | One-line |
|------|------:|----------|
| **Design / engagement thesis** | **7.8 / 10** | Strong Level 1 beat structure; ops surge + hail keep post-automation pressure |
| **Playable systems + UX** | **7.4 / 10** | Core loop + ceremony banners + cash/sun hints; HUD covers the right channels |
| **Visual / audio identity** | **6.3 / 10** | Cleaner foliage/staff read; motif + weather bed still procedural, not authored |
| **Steam “recommend a friend for a few dollars”** | **5.8 / 10** | Stronger as free demo / playtest; still thin for paid short Steam release |
| **Overall toward final Level 1 goal** | **~91%** | Content + shell + celebration beats; live URL + authored art/music left |

---

## Visual & asset scores (honest)

Earlier Loop 21 scorecard claimed **9.5 every category**. Harsh audit of `public/assets/game/` + WorldView:

| Category | Claimed | **Honest** | Comment |
|----------|--------:|-----------:|---------|
| Terrain & water | 9.5 | **6.5** | Kenney iso slabs + foam/HD grass; river still tiled |
| Props & foliage | 9.5 | **6.3** | Deciduous-led forests; less kit clash than before |
| Solar / grid | 9.5 | **7.0** | Best sprites; still industrial-kit DNA |
| Staff & vehicles | 9.5 | **6.0** | Fake ambient techs removed; vans stay decorative |
| Placement feedback | 9.5 | **8.0** | Real strength (ghost, dim, Place on Site A) |
| HUD / UI | 9.5 | **7.8** | Ceremony banners, Next+reward, sun hint; weak mobile |
| Atmosphere | 9.5 | **7.2** | Hail flash/shake + distinct hail particles |
| Concept match | 9.5 | **6.0** | Layout rhyme without concept fidelity |
| Sim UX | 9.5 | **8.2** | Faults, floats, dispatch, objectives, ceremonies |
| Cohesion | 9.5 | **5.8** | Still prototype collage; less false population |
| **Average** | **9.5** | **~6.9** | |

**Asset inventory:** ~86 PNGs (~373 KB), mix of Kenney CC0 + rebuilt + runtime procedural overlays. LFS risk if clones skip `git lfs pull`. Dead `textures.ts` generator still in tree.

---

## Gameplay / UX / progression scores

| Dimension | Score | Comment |
|-----------|------:|---------|
| Onboarding / first 5 minutes | **6.8** | Auto ▶▶ to midday after commission; sun hint; Place on Site A; cash accrue floats |
| Core loop (build→export→maintain) | **7.2** | Sound and renewable-specific; mid-game still “more PV” with better ops spikes |
| Progression / unlock cadence | **7.8** | Manual→auto, Site B, capability fork, ops surge, hail |
| Level flow / pacing (30–60 min) | **6.5** | Designed + scripted pressure; human timing still unproven |
| Event stakes | **7.2** | Dual-site stretch, ops_surge, tariff/busy, hail damage |
| Juice / feedback | **7.2** | Ceremony banners, first_power stinger, motif, hail shake/flash |
| Content density (one level) | **7.2** | ~13 objectives, ~10 events, 2 sites, 3★ |

---

## Competitive benchmark

| Peer | Fair use | MV vs them |
|------|----------|------------|
| **Two Point Hospital/Campus** | Tone, UX, reward theatre | Aspiration correct; ceremonies are Two Point–lite stubs (~5.5 first-hour fantasy) |
| **Prison Architect / RimWorld** | Crisis pressure / cause→effect | Ops surge + dual faults improve shape; still lighter siege |
| **Habitation / small iso builders** | Short-session product shape | MV wins ops progression; they often win charm / place-feel |
| **Solar / energy jam tycoons** | Same fantasy niche | MV design thesis usually **ahead** |
| **Stardew** (feedback only) | Readable warmth | Motif + stingers help; soul/art consistency still missing |
| **Typical itch iso management jam** | Realistic peer | MV smarter systems; many jams cuter / clearer “buy me” identity |

| Steam Level-1 slice bar | Score |
|-------------------------|------:|
| First 5 minutes | 6.5–6.8 |
| Core loop satisfaction | 7.2 |
| Progression cadence | 7.8 |
| Visual identity | 6.3 |
| UX clarity | 7.0–7.4 |
| Content density | 7.0–7.2 |
| Juice | 7.2 |
| **Recommend as short paid slice** | **5.8** |

---

## Top gaps before “Steam-quality Level 1”

1. **Public boot as a product** — live URL (Vercel project create 403 currently).
2. **Authored visual/audio identity** — one coherent art pass + memorable composed music (motif is still oscillators).
3. **Human 30–60 min pacing** — owner playtest must validate timing after automation.
4. **Deeper reward theatre** — ceremonies exist; still short of Two Point stamp/fireworks polish.
5. **Mobile / small viewport** — HUD density remains desktop-first.

---

## What is already good (keep)

- Engagement ladder: First Power → Cheap/Good → Failure → Dust → Improve → Site B → Ops Surge → Hail → Stars  
- Sim ≠ sprites architecture; Vitest coverage including 1★ smoke + ceremony assert  
- Placement/dim/ghost UX; fault/clean dispatch readability  
- Save v2, title Continue, onboarding coach, procedural SFX + motif ambience  
- Ceremony banners for first power / unlock / Site B / star / hail  

---

## Method notes

- Visual scores from code/asset inventory + prior harsh computerUse sessions (not inflated Loop 21 self-score).  
- Competitive scores are judgment against a **short paid Steam Level 1** bar, not against AAA Two Point art budgets.  
- Score bumps above prior revision are tied to shipped ceremony / cash / ops / foliage work — not VFX garnish alone.  
- Update again after owner playtest or live deploy — do not bump for docs-only changes.
