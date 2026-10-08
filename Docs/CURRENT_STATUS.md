# Megawatt Valley — Current Status

## UI reset — 8 October 2026

The true-3D world remains approved as the current foundation. The previous UI direction is rejected. Read [UI/UX read first](CODEX_UI_UX_READ_FIRST.md), [Concept v1 implementation](CONCEPT_V1_IMPLEMENTATION.md), and [resume checkpoint](RESUME_CHECKPOINT.md). The actual approved image in issue #13 has been inspected. The active interface is independently composed in `src/ui/studio`, with a new HUD, solar comparison/placement, character profiles and connected research. Simulation and version-1 saves remain compatible. The checkpoint contains exact verified builds and download links; older status sections below are historical.

## Desktop update — 7 October 2026

Read the [locked desktop quality target](DESKTOP_QUALITY_TARGET.md) and [resume checkpoint](RESUME_CHECKPOINT.md) first. The checkpoint records active work, exact validation and next steps for `codex/3d-isometric`. The earlier browser candidate below is retained as history. Its stack and visual directives do not override the desktop target.


## Current playable candidate — 3 October 2026

Megawatt Valley is an autonomous **Phaser / TypeScript solar park simulator**.
Active Codex work is on `codex/solar-release-hardening`, draft PR #10 stacked on
Cursor PR #7. It is not merged into main; separate Cursor PR #8 remains independent.

### Gameplay and progression pass

The approved visual theme, CC0 solar/building/nature sprites, contextual worker
portraits and one-drawer interface are retained. The latest changes are:

- A next-decision guide introduces generation, repairs, dust, expansion, upgrades,
  storm readiness and operating mastery according to company readiness.
- Operations drawer: persistent repair/clean/service queue, bulk orders, cancellation,
  capacity-weighted health figures, cleaning policies and daily operating reviews.
- Worker profiles: site/duty assignments, energy and breaks; paid training takes four
  park hours. Specialist roles and dedicated engineer research have real effects.
- Travel follows distance and the bridge route. Nearby roads reduce journey time;
  local workshops shorten repairs and site facilities improve idle recovery.
- Three optional supply contracts count actual exported energy, with explicit
  quality criteria, park-time deadlines, deposits, bonuses and renewal breaks.
- Later stars require sustained daylight reliability. Mastery also requires fleet
  condition, research and crew development; skipping hail preparation is recoverable.
- Non-urgent event choices are spaced out; urgent hail decisions bypass the gap.
- Optional new version-1 save fields preserve old companies and already earned stars.

See [GAMEPLAY_RESEARCH_2026-10-03.md](GAMEPLAY_RESEARCH_2026-10-03.md) for the
reference-game comparison, implementation choices, terms and remaining design gaps.
It supersedes earlier candidate pacing figures and the old hail-prepared mastery gate.

### Verification and playing

53 tests pass. Real-budget reference strategy: 1★ in 1,576 seconds at 1x (26.3
minutes), then 3★ another 123 seconds later. A frugal strategy using contracts and
recovering from unprepared hail reaches 3★ in 1,451 seconds (24.2 minutes), with six
contracts and five services. Both keep cash non-negative and exercise save/resume.
These are deterministic simulations, not independent player enjoyment evidence.

Standalone browser verification covers closed tools, build/placement, contextual
portraits, timed training, assignments, contracts, queue cancellation/service fees,
save/load, nine technologies, night lighting and laptop layouts. See release workflow
browser evidence for the latest commit's result. No new enjoyment score is claimed.

Use the latest successful [Solar release checks](https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/workflows/solar-release.yml)
**PLAY-MEGAWATT-VALLEY** artifact. Unzip and open `PLAY-MEGAWATT-VALLEY.html` in
desktop Chrome/Edge. No server or install is needed. See `AUTONOMOUS-PLAY.md`.

Earlier [UI research](TYCOON_UI_RESEARCH_2026-10-02.md),
[visual asset pass](VISUAL_ASSET_PASS_2026-10-02.md) and
[honest visual review](HONEST_REVIEW_2026-10-02.md) remain useful background.

Remaining: independent player tests, stronger post-1★ pacing, another playable
scenario, physical staff facilities, richer solar layout decisions and a stable
hosted release URL. Scenario 2 remains an unlock marker, not a playable map.

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
