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

## Additional completed features
- Player-built roads, fences, gates, trees, signs and workshop.
- Six-branch capability overview separates usable Level 1 upgrades from future content.
- Original coherent terrain textures; reduced decorative clutter and removed fake workers.
- First commissioned Site B array awards organization funding.
- One- and two-star milestones award $12,000 expansion grants once each.
- Distribution includes runtime library licenses.

## Verification record
- 17 automated tests and production build passed in Actions run 36857733296.
- Normal starting-budget one-star playthrough: 3,264 seconds at 1x (54.4 minutes).
  No cash injection, forced daylight or instant construction. It exercises manual
  repair/cleaning, later automatic dispatch/cleaning, expansion, events, hail and resume.
- Chromium launched the standalone file offline with no external HTTP requests
  or runtime errors; placement, reload, hiring, repeated restart, portable import,
  storm preparation, completion UI and laptop capability access passed.
- Final run 36858376691 (60eda06): all 17 tests, build, licensing package and
  Chromium checks passed. The same company reached three stars 350 seconds after
  one star; mastery save/load preserved stars and capabilities.
- Playable artifact: https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/runs/36858376691/artifacts/11160770502
- Review: https://github.com/Mr-Meow-ZA/Megawatt-Valley/pull/10
- Opening, completed-site and laptop screenshots are retained in browser-evidence.

## Scope and remaining work
This is a playable Level 1 release candidate, not a claim of commercial polish.
Scenario 2 is an unlock marker, not a playable map. Future capabilities are clearly
labelled. Audio is basic synthesized feedback/music. The art combines licensed
isometric sprites with pixel infrastructure and procedural terrain; a dedicated
art pass and independent first-player engagement testing remain useful.
The tested strategy meets target pacing; other purchasing choices can take longer.
No changes have been merged into main or the separate Cursor PR #8.
