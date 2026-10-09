# Resume checkpoint — 9 October 2026
Active branch: `codex/3d-isometric`; draft PR #11. Preserve Unity history and true-3D world/simulation.

## Read first
Rapha's latest direction rejects procedural character/menu artwork and the implemented UI quality. See [read first](CODEX_UI_UX_READ_FIRST.md), visual-quality §15, latest ChatGPT review and [asset provenance](UI_ASSET_PROVENANCE.md). Reference issue #13 remains authoritative; never treat a previous self-assessment as product approval.

## Current work
Asset-led replacement: five individual generated illustrated staff portraits, eight generated menu/research illustrations, 29 professionally designed MIT Phosphor control symbols. Runtime portrait meshes removed from startup. Profile composition now gives artwork its own full-height stage, roster and information have independent scrolling. Main destinations/research/capabilities have painted illustrations. Actual placement previews still use actual world models. Small-viewport comparison spacing corrected; early laptop assertion added. Assets are decoded locally once to short blob URLs and embedded in offline/native builds. Licences ship with the game. All changes preserve simulation and version-1 saves.

## Verification status at this commit
Candidate has not yet run CI. Must run and inspect the exact pushed SHA before describing it as tested or offering its download as verified. Existing suite: 81 simulation/data tests, full browser interaction/save/scenario checks, native Windows executable save/import/fullscreen/close/resume/recovery checks.
Previous HEAD 87ed5ad passed 81 tests/build/native but FAILED the 1024×768 comparison-row visibility assertion; that remains a required gate.
Last fully verified old-art runtime: 80712d0ddfbe716ed1f99d1f52ffc0ccc1ae5cd6.
Old-art Windows: https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/runs/37804723021

## Next actions
1. Check current commit's True 3D and Windows workflows; fix any failures.
2. Inspect actual HUD, recruitment, staff, research and laptop captures for art scale/cropping/readability, missing assets, footer reachability.
3. Update this checkpoint with exact passing SHA/run links and honest remaining quality work.
4. Continue toward Concept v1. Do not resume modelling primitive portrait busts. UI/UX still requires product-owner playtest, not a declaration of final acceptance.
