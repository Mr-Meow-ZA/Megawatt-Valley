# Megawatt Valley — Current Status

## Status

**PRIMARY DIRECTION — Phaser Level 1 steam-finish pass — 30 September 2026**

Megawatt Valley is an **AI-autonomous Phaser / TypeScript production project**.

## Archive

Full pre-pivot Unity state preserved on:

**archive/unity-prototype-2026-09-29**

Unity folders remain on the working tree for history; do not continue Unity implementation unless Rapha explicitly changes direction.

## Active goal

Build and release:

# Megawatt Valley: Solar — Level 1: Here Comes the Sun

Tracked by GitHub issue **#6**. Implementation plan: `Docs/PHASER_IMPLEMENTATION_PLAN.md`.  
Active PR: **#8** (`cursor/level1-steam-finish-5938`).

## Progress

| Milestone | Status |
|-----------|--------|
| M0 Rebaseline (Phaser+Vite+TS) | Done |
| M1 Visual proof + HUD/build | Done |
| M2 Core solar loop | Done |
| M3 Ops / staff / automation | Done |
| M4 Full Level 1 scenario | Done |
| M5–M6 Polish / deploy | Local polish + Pages workflow ready; **live URL** needs Pages enable (Vercel create still 403). Honest: ~92% / **5.9** paid-slice |

## How to run

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 15 tests
npm run build && npm run preview
```

Title → Start → **Place on Site A** → auto midday nudge → First Power ceremony → R repair / C clean → Site B → Ops Surge → hail → stars.

Honest scores: `Docs/HONEST_QUALITY_REVIEW.md` (do not trust Loop 21 “all 9.5”).

## Product owner involvement

Rapha should primarily set vision, review major decisions, play builds, and give feedback. Next owner step: connect free static hosting + play PR #8.

## Source of truth

1. Docs/CURSOR_PRIMARY_BUILD_SPEC.md
2. Docs/CURRENT_STATUS.md
3. Docs/VISUAL_DIRECTION.md
4. Docs/TECHNICAL_ARCHITECTURE.md
5. Docs/ROADMAP.md
6. Rapha's most recent explicit decision
