# Megawatt Valley — ChatGPT Review State

## Latest review
**Review date:** 2026-09-30

**Repository state reviewed:** main after the 29 September Phaser pivot, plus open PR #7.

**Alignment status:** Healthy major rebaseline. Phaser / TypeScript is now the approved primary path; the Unity build is archived. PR #7 contains a substantial autonomous Level 1 implementation and now needs product-owner acceptance rather than more feature expansion.

## Meaningful changes
- Pixel-isometric autonomous development was promoted from experiment to the official production direction.
- The Unity implementation was preserved on `archive/unity-prototype-2026-09-29`.
- Current status, primary build spec, architecture, visual direction and roadmap were rebaselined for Phaser + TypeScript + Vite.
- `SESSION_GOALS.md` is now explicitly an archived Unity-era tracker.
- Issue #6 became the primary Level 1 production tracker.
- PR #7 reports a playable Level 1 including isometric world/building, solar/economy, staff operations, Radio Dispatch and Cleaning Kit capabilities, events, stars, hail climax and save/load, plus automated tests and repeated visual QA.

## Alignment review
**Game vision:** aligned. The renewable-energy tycoon loop and “realism in cause and effect, abstraction in execution” remain intact.

**Progression:** aligned. The Management Abstraction Ladder remains central, and PR #7 reports the Level 1 manual-to-automation proof systems.

**Visual direction:** aligned conceptually. The active target is polished high-resolution pixel-isometric / illustrated pixel art with a crisp modern UI. Cursor's self-reported visual score is useful internal QA, but not product acceptance.

**Architecture:** aligned. Browser-first Phaser/TypeScript, simulation separated from presentation, data-driven content, versioned local saves, no required backend and minimal dependencies fit the autonomy requirement well.

## Drift / risks
- The old recommendation to implement Unity E1-06 is obsolete after Rapha's explicit production pivot.
- Fast autonomous batching is now intentional, but human acceptance gates still matter.
- Do not treat PR #7's self-scored 9.5/10 as proof that the visual or gameplay target has been met.
- Old Unity-era issues/PRs are historical context, not active instructions. PR #4 is obsolete against the new primary direction.
- Do not expand into wind, BESS or the broader campaign before the solar Level 1 is accepted.

## Blocker
No architecture blocker is visible. The practical gate is Rapha playing the PR #7 build from a fresh start and judging fun, pacing, clarity, visual quality and progression.

## Recommended next smallest useful goal
**Acceptance pass for PR #7 — first complete autonomous Level 1 build.**

1. Make the PR build straightforward to launch/play.
2. Play fresh new game through at least 1★.
3. Pay particular attention to the first 15–20 minutes.
4. Record confusing UI, dead time, weak rewards, visual inconsistencies and bugs.
5. Fix only the issues exposed by that acceptance pass.
6. Re-run tests/build/playthrough.
7. Merge once the experience is genuinely acceptable.

After acceptance, choose the next roadmap item from playtest evidence rather than automatically adding future systems.

## Current project question
> Does PR #7 already feel like a coherent, fun, polished first Megawatt Valley level when Rapha plays it, or has implementation moved faster than player experience?


---

## Review update — 2026-09-30 later repository state

Meaningful development occurred after the review above.

### Cursor track
- PR #8 is now the active Level 1 steam-finish/release candidate stacked on PR #7.
- It reports scenario/boot/SFX/deploy preparation plus a deliberate world-map declutter pass.
- The latest PR notes report 16/16 tests passing and a refreshed gh-pages playtest build.
- Site A/B readability was improved by reducing forests, props, fences, vehicles and ambient effects.

### Parallel Codex track
Issue #9 records a separate `codex/solar-release-hardening` branch with changes to Level 1 progression/economy, staff, saves, browser/offline packaging, site-kit buildables and weather/interaction behaviour. It also reports that the Solar release checks failed and that this branch currently has no PR.

### Alignment
The Phaser + TypeScript + Vite architecture, pixel-isometric visual direction and Solar Level 1 goal remain aligned. Cursor's declutter pass is directionally healthy because management readability matters more than ambient density.

### Main risk
There are now two branches changing overlapping Level 1 gameplay. This conflicts with the current collaboration model in which Cursor is the primary implementation lane. Economy thresholds, capabilities, staff behaviour, saves and simulation rules should not develop into two competing sources of truth.

### Current blockers / gates
1. Product-owner playtest of the current Cursor Level 1 remains the key acceptance gate.
2. The parallel Codex branch needs a review surface and its failed release checks understood before adoption.
3. Public Pages deployment may still require repository-owner enablement.

### Next smallest useful goal
**Freeze feature expansion and run one controlled Level 1 acceptance/comparison pass.**

Treat PR #8 as the primary candidate, play fresh through at least 1 star, record concrete pacing/UI/visual/gameplay friction, fix only those issues, and retest. Separately make the Codex branch reviewable and compare its changes selectively after the primary baseline is accepted.

Do not start wind, BESS or another scenario yet.

Until Rapha explicitly changes ownership, Cursor should remain the authoritative Level 1 implementation lane and Codex should be treated as an experimental hardening/proposal lane rather than a second source of truth.


---

## Review update — 2026-10-02

Meaningful development occurred after the previous review.

### New Codex review surface
- Draft PR #10 is now open from `codex/solar-release-hardening`, stacked on PR #7 rather than merged into Cursor PR #8.
- PR #10 has moved well beyond packaging-only hardening: it now includes progression/economy corrections, staff controls, save portability/restart cleanup, capability presentation, site-kit buildables, browser/offline packaging, and a substantial shared isometric-layout rewrite.
- Latest PR description reports 22 automated tests, TypeScript/Vite build, offline packaging and Chrome interaction checks passing, plus a normal-budget 1★ and 3★ continuation validation.
- The layout rewrite introduces shared map/layout data for roads, fences, bridge, placement, minimap and staff routes, addressing concrete isometric-coherence problems.

### Cursor track
- PR #8 remains the authoritative Cursor steam-finish candidate at `f097e5a8`.
- Its world declutter/readability pass remains directionally aligned and its Pages playtest surface is available.
- No newer Cursor gameplay commit was identified in this review window.

### Alignment
**Game vision:** both tracks remain broadly aligned with the solar Level 1 product goal and Management Abstraction Ladder.

**Visual direction:** PR #10's connected-layout work addresses genuine pixel-isometric coherence requirements (shared projection/anchors, connected roads/fences/bridge, placement/minimap/pathing agreement). PR #8's declutter pass addresses a different valid concern: readability and visual breathing room. These should be compared by play/visual inspection rather than merged mechanically.

**Architecture:** Phaser + TypeScript + Vite remains intact. PR #10's shared layout data is conceptually compatible with the architecture, but its large `WorldView` rewrite makes it a competing implementation, not a small hardening patch.

### Drift / risks
- The main risk has escalated from “parallel branch exists” to **two competing Level 1 world implementations**. `WorldView` is now a direct conflict surface.
- PR #10 is no longer safely classifiable as packaging/proposal-only work; it owns meaningful gameplay and visual architecture.
- Main-branch `CURRENT_STATUS.md` and `ACTIVITY_LOG.md` do not yet reflect PR #8/#10 accurately; branch-local status also has reported drift. Do not use stale test counts/status text as acceptance evidence.
- Automated tests and scripted playthroughs prove completion paths, not fun, pacing or visual quality. PR #10's reported ~54.4 minutes to 1★ at 1x is within the original 30–60 minute target, but still needs human pacing judgment.

### Blocker / decision gate
The immediate blocker is now a **product-owner track comparison**, not missing implementation.

Do not merge PR #10 into PR #8 wholesale and do not continue two teams independently rewriting the same Level 1 systems.

### Recommended next smallest useful goal
**Run one controlled A/B acceptance pass between PR #8 and PR #10.**

For each candidate:
1. Start from a fresh game.
2. Play the first 15–20 minutes and, where practical, continue to 1★.
3. Compare visual coherence/readability, build interaction, objective cadence, staff visibility, automation payoff, event/weather pacing, bugs and overall fun.
4. Choose one implementation as the authoritative Level 1 baseline.
5. Cherry-pick/reimplement only clearly superior isolated ideas from the losing branch after that choice.
6. Then fix concrete acceptance issues and merge the selected baseline.

No wind, BESS, Scenario 2 implementation or additional feature expansion until this track decision and Level 1 acceptance are complete.

### Current project question
> Which candidate actually feels better to play: Cursor PR #8's decluttered steam-finish, or Codex PR #10's connected-layout/hardened release?
