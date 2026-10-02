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
- Three-star continuation test added; its result is reported in the latest CI run.
- Opening, completed-site and laptop screenshots are retained in browser-evidence.

## Scope and remaining work
This is a playable Level 1 release candidate, not a claim of commercial polish.
Scenario 2 is an unlock marker, not a playable map. Future capabilities are clearly
labelled. Audio is basic synthesized feedback/music. The art combines licensed
isometric sprites with pixel infrastructure and procedural terrain; a dedicated
art pass and independent first-player engagement testing remain useful.
The tested strategy meets target pacing; other purchasing choices can take longer.
No changes have been merged into main or the separate Cursor PR #8.

## Visual layout revision — 2026-10-01
The previous screenshots failed the requested visual standard. Replaced the old
scatter-based renderer with a shared, connected map layout after reading upstream
Tiled terrain/object/automapping documentation and Phaser projection code.
See ISOMETRIC_LAYOUT_REVIEW.md for findings, sources and the optional Tiled recommendation.

Implemented matching 2:1 terrain/road/fence geometry; real boundary openings;
a bank-to-bank bridge; separate public and service roads; reserved access/parking;
consistent art anchors; original coherent infrastructure; grouped vegetation;
shared minimap geometry; bridge-based staff routing; and visible service positions.
Fixed raised-sprite selection and camera-scaled weather overlays.
Gameplay economy/progression and Unity files remain unchanged.

Validation at 715a915: 22 tests, production build, offline packaging and Chrome
interaction checks passed. One-star pacing remains 3,264 seconds at 1x; the same
company reaches three stars after another 350 seconds. The final service-position
and sprite-picking refinements run through the same workflow. Browser evidence
now includes clean valley overview and infrastructure detail captures.
Tiled authoring integration is a documented recommendation, not a shipped feature.

## Living-valley pass — 2026-10-02
Added original meadow/forest texture, flower drifts, reeds, ducks, insects, birds,
office details, coffee furniture and supplies. Introduced evening entrance lighting,
lit office windows, dirt overlays, construction reveal and completion feedback.
Placement explains invalid locations; staff are selectable in front of equipment.
Procurement shows the workshop lock. Warmer UI and quick panel navigation improve
readability. Indie reference principles and provenance are in INDIE_ART_DIRECTION.md.

Verification at d744dc3: 22 tests and complete offline Chrome flow passed.
One-star pacing remains 3,264 seconds at 1x. Day/night screenshot comparison caught
and fixed a transparent dimming layer; measured luminance fell from 146.3 to 108.5.
Final browser checks also exercise staff picking and the coffee-table inspection.
Existing Unity files and concurrent implementation branches remain untouched.
