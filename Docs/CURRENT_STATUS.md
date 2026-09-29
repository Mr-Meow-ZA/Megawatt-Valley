# Megawatt Valley — Current Status

## Status

**PRIMARY DIRECTION — Phaser Level 1 in active autonomous build — 29 September 2026**

Megawatt Valley is an **AI-autonomous Phaser / TypeScript production project**.

## Archive

Full pre-pivot Unity state preserved on:

**archive/unity-prototype-2026-09-29**

Unity folders remain on the working tree for history; do not continue Unity implementation unless Rapha explicitly changes direction.

## Active goal

Build and release:

# Megawatt Valley: Solar — Level 1: Here Comes the Sun

Tracked by GitHub issue **#6**. Implementation plan: `Docs/PHASER_IMPLEMENTATION_PLAN.md`.

## Progress (branch `cursor/phaser-level1-build-5938`, PR #7)

| Milestone | Status |
|-----------|--------|
| M0 Rebaseline (Phaser+Vite+TS) | Done |
| M1 Visual proof + HUD/build | Kenney CC0 sprites integrated; review ~90%+ vs concept; polish continues |
| M2 Core solar loop | Done |
| M3 Ops / staff / automation | Done (fault→Radio Dispatch, soiling→Cleaning Kit) |
| M4 Full Level 1 scenario | In progress (objectives, events, stars, hail; automated 1★ smoke passes) |
| M5–M6 Polish / deploy | Not started |

## How to run

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build
```

## Product owner involvement

Rapha should primarily set vision, review major decisions, play builds, and give feedback.

## Source of truth

1. Docs/CURSOR_PRIMARY_BUILD_SPEC.md
2. Docs/CURRENT_STATUS.md
3. Docs/VISUAL_DIRECTION.md
4. Docs/TECHNICAL_ARCHITECTURE.md
5. Docs/ROADMAP.md
6. Rapha's most recent explicit decision
