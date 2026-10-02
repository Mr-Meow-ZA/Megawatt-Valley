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
- Compact Build/Staff/Upgrades/Finance/Events toolbar, contextual inspector and top utility menu.
- Dock can collapse; inspector can close; switching away from Build cancels placement.
- Load/import starts paused. Event choices immediately refresh the overlay.
- Staff dismissal, positive grants and optional playtest cash controls are implemented.
- Net-positive supplier/sponsorship rewards work even with zero cash.
- Browser verification uses ordinary visible clicks, without bypassing modal overlays.

### Research-led tycoon interface pass

The permanent illustrated Staff/Events/Build dashboard is superseded. Reference
images guide palette and art, rather than a fixed screen layout. Research into
Two Point Campus, Planet Zoo, Parkitect and Planet Coaster supports separating
management lists from contextual worker profiles. See
[TYCOON_UI_RESEARCH_2026-10-02.md](TYCOON_UI_RESEARCH_2026-10-02.md) for sources,
interpretation and implemented decisions.

- Tools start closed, leaving a compact toolbar and more visible park.
- One Build/Staff/Upgrades/Finance/Events drawer opens at a time.
- Worker selection in the world or roster opens a character profile; portraits
  appear only there, never in the bottom toolbar or roster.
- Profile actions use real training costs, skill limits and dismissal rules.
- Staff has search, role filters, sorting and actual total payroll.
- Build has larger horizontal equipment cards, search, categories and browse arrows.
- B/T toggle tools; search typing does not trigger simulation shortcuts.
- Objectives, alerts and minimap remain outside management drawers.

34 simulation tests and offline browser checks cover these interactions as well
as existing progression, saving, research and laptop layouts. No new commercial
quality score is claimed from this pass. The world still needs stronger terrain,
lighting, campus assets and expressive character art.

### Visual-first asset pass

Nine solar/building/nature sprites now derive from verified free CC0 Kenney models.
They share the park's 2:1 projection, palette, light and ground anchors. Generated
SVGs rasterise once during preload and are embedded in the offline HTML. This adds
richer geometry while retaining Phaser and existing placement/selection behavior.
Original pack licences ship in the playable package. See
[VISUAL_ASSET_PASS_2026-10-02.md](VISUAL_ASSET_PASS_2026-10-02.md) for the asset
shortlist, selected models and next art priorities. No new score is claimed solely
from asset count; terrain composition and the remaining equipment/staff still need work.

### Latest improvement pass

- Honest evaluation: **5.5/10 baseline → approximately 6.3/10 after this pass**.
  Scores assess a prototype against the supplied cozy low-poly reference; automated
  checks do not establish enjoyment or commercial polish.
- Nine working, paid and timed research upgrades across Generation, Operations and
  Resilience. All have real effects, prerequisites and save support. The former
  future-feature tree preview is removed.
- Brighter original terrain/art, blue roofs/panels, distant mountains/lake/village,
  four role-specific staff uniforms and contextual portraits.
- Click-to-find fault/dust/clipping alerts, minimap navigation, H/F/U camera/research
  controls, Shift-click repeat placement, clearer finance/star progress and persistent
  completion acknowledgement.
- 34 simulation tests plus expanded standalone browser verification.

Read [the honest review and prioritised continuation](HONEST_REVIEW_2026-10-02.md)
for scores, what actually works, remaining gaps and measurable next steps.

Run the [Solar release checks](https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/workflows/solar-release.yml)
and use the latest successful **PLAY-MEGAWATT-VALLEY** artifact. Unzip and open
`PLAY-MEGAWATT-VALLEY.html` in desktop Chrome/Edge; no server or installation needed.
See `AUTONOMOUS-PLAY.md` for controls and `Docs/HANDOVER_2026-10-02_UI_BALANCE.md`
for the current continuation notes.

Remaining: a stronger art slice, staff wellbeing/facilities, solar layout decisions,
independent playtesting, later-star pacing,
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
| M1 Visual proof + HUD/build | Kenney + procedural polish through Loops 1–11; earlier ≥9.5 aspiration was not a validated quality score |
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
