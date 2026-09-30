# Autonomous solar release hardening

This branch builds on the existing Phaser implementation in PR #7 (b724ab0).
Unity Assets/, Packages/ and ProjectSettings/ are untouched by these changes.
The archived Unity branch remains untouched. No merge into main has been performed.

## Architecture and delivery
- Existing Phaser 4 / TypeScript / Vite renderer and independent simulation retained.
- Browser-local versioned JSON saves, strict boundary validation, portable export/import.
- GitHub Actions runs unit tests, a normal-budget simulation playthrough, TypeScript,
  Vite production build, offline packaging, and Chromium interaction checks.
- scripts/package-playable.mjs embeds runtime art and game code into one HTML file.
  The PLAY-MEGAWATT-VALLEY artifact requires no editor, npm, server or internet.
- Browser fonts use system fallbacks to remove the previous Google Fonts dependency.
- Original synthesized audio; existing licensed art remains credited in
  Docs/ASSET_REGISTER_PHASER.md and the downloadable build.

## Fixes and additions
- First Power now requires the player to build an additional PV array.
- Normal-economy playthrough replaces tests that granted $200k and forced daylight.
- Site B cash gate lowered to $5,000; first repair/clean each award $2,000.
- First star requires manual repair/clean, Site B expansion, and hail completion.
- Higher stars cannot bypass one-star completion.
- Expansion offers Cleaning Rig or Remote Monitoring first for free; the other
  remains available for $4,000. Scheduled Cleaning requires the rig and $3,000.
- Radio Dispatch no longer silently automates cleaning before its manual lesson.
- Staff hiring, visible tasks, skill/training, traits, payroll, manager coordination
  and engineer reliability effects; duplicate automatic assignments prevented.
- Resale with condition-adjusted refunds and last-PV protection.
- Save/load preserves curtailment, delayed events, RNG, costs and teaching milestones.
- Save validation rejects malformed, non-finite and executable/injected state.
- Storage failures do not crash the game; portable save backup is available.
- Restart removes stale UI handlers; actions fire once per click.
- Autosave, automatic paused resume, export/import, optional synthesized sound.
- Incomplete objectives stay above completed ones; capabilities remain accessible
  on laptop screens; right-hand panels scroll.
- Event choices validate IDs and available cash; free recovery choices remain.
- Curtailment limits export rather than reducing physical sunlight.
- Hail remains visible for two simulated hours after the decision.

## Verification record
- Baseline existing build: 8 tests and production build passed on GitHub Actions.
- First hardening run: 16/17 tests passed; normal-economy one-star completion
  succeeded at 3,888 seconds but exceeded the 3,600-second pacing assertion.
- Revenue target adjusted from $4,500 to $3,500; verification in progress.
- Browser acceptance and standalone packaging are being tested, not yet certified.

## Remaining acceptance scope
The broader brief is not yet fully accepted: rich six-branch capability-tree
presentation, player-built roads/fences/gates, deeper equipment maintenance,
full audio variety, sustained engagement balancing, and final visual review
still need review or expansion. Scenario 2 is an unlock marker, not a playable map.
Avoid equating automated test success with confirmed fun or commercial polish.
