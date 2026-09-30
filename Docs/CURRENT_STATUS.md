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

## Progress (branch `cursor/level1-steam-finish-5938`)

| Milestone | Status |
|-----------|--------|
| M0 Rebaseline (Phaser+Vite+TS) | Done |
| M1 Visual proof + HUD/build | Done (Loops 1–21 visual polish) |
| M2 Core solar loop | Done |
| M3 Ops / staff / automation | Done (fault→Radio Dispatch, soiling→Cleaning Kit) |
| M4 Full Level 1 scenario | Done (objectives, Site B constraint, events, hail weather, capability fork, Growing Pains, 1★/2★/3★, save v2 + resume) |
| M5–M6 Polish / deploy | In progress (title/onboarding/SFX/CI/Vercel config; live URL pending connect) |

## How to run

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build
npm run preview  # production static build
```

Title screen → Start / Continue. Esc or Cancel exits placement. R repairs, C cleans (no selection required). Mute in footer. Autosave ~45s.

## Product owner involvement

Rapha should primarily set vision, review major decisions, play builds, and give feedback.

## Source of truth

1. Docs/CURSOR_PRIMARY_BUILD_SPEC.md
2. Docs/CURRENT_STATUS.md
3. Docs/VISUAL_DIRECTION.md
4. Docs/TECHNICAL_ARCHITECTURE.md
5. Docs/ROADMAP.md
6. Rapha's most recent explicit decision
