# Megawatt Valley — Current Status

## Status

**PRIMARY DIRECTION — Phaser Level 1 release candidate — updated 2 October 2026**

Megawatt Valley is an **AI-autonomous Phaser / TypeScript production project**.

## Current playable candidate

Active Codex work is on **`codex/solar-release-hardening`**, draft **PR #10**,
stacked on the original Cursor build in PR #7. It is not merged into main.
The separate Cursor PR #8 remains independent.

- Level 1 includes ordinary-budget progression through manual repair/cleaning,
  automation, expansion, decision events, hail and three-star continuation.
- Faster economy: $0.24/kWh. Reference strategy completes 1★ in 1,353 real seconds
  at 1x (22.6 minutes), then mastery after another 347 seconds. This is simulation
  evidence, not a first-player engagement verdict; alternative choices take longer.
- Bottom Build/Team/Upgrades/Finance dock, contextual inspector and top utility menu.
- Dock can collapse; inspector can close; switching away from Build cancels placement.
- Load/import starts paused. Event choices immediately refresh the overlay.
- Staff dismissal, positive grants and optional playtest cash controls are implemented.
- Net-positive supplier/sponsorship rewards work even with zero cash.
- Browser verification uses ordinary visible clicks, without bypassing modal overlays.

Run the [Solar release checks](https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/workflows/solar-release.yml)
and use the latest successful **PLAY-MEGAWATT-VALLEY** artifact. Unzip and open
`PLAY-MEGAWATT-VALLEY.html` in desktop Chrome/Edge; no server or installation needed.
See `AUTONOMOUS-PLAY.md` for controls and `Docs/HANDOVER_2026-10-02_UI_BALANCE.md`
for the current continuation notes.

Remaining: richer scenery/art polish, independent playtesting, later-star pacing,
and a stable hosted release URL. Scenario 2 is an unlock marker, not a playable map.

## Archive

Full pre-pivot Unity state preserved on:

**archive/unity-prototype-2026-09-29**

Unity folders remain on the working tree for history; do not continue Unity implementation unless Rapha explicitly changes direction.

## Active goal

Build and release:

# Megawatt Valley: Solar — Level 1: Here Comes the Sun

Tracked by GitHub issue **#6**. Implementation plan: `Docs/PHASER_IMPLEMENTATION_PLAN.md`.

## Earlier Cursor baseline (PR #7; historical milestone table)

| Milestone | Status |
|-----------|--------|
| M0 Rebaseline (Phaser+Vite+TS) | Done |
| M1 Visual proof + HUD/build | Kenney + procedural polish through Loops 1–11; quality scorecard target ≥9.5/10 |
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
