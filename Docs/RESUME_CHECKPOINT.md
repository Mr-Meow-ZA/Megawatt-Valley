# Resume checkpoint
Update at meaningful milestones, before risky transitions and at the end of a session. Never wait for a usage limit to save progress.

## Governing instructions
Read [DESKTOP_QUALITY_TARGET.md](DESKTOP_QUALITY_TARGET.md). User authorises autonomous implementation, testing and focused commits. “Continue” means progress toward the reference quality, periodically comparing actual screenshots. Preserve Unity and unrelated changes. Do not silently lower scope or quality.

## Branch and verified baseline
- Active branch: codex/3d-isometric; draft PR #11.
- Latest runtime baseline: eea87a3cc304a3eeb911afb084b7f945d4973eec, desktop 0.4.0.
- Latest reference notes before this checkpoint: 16e408bc744940aeadf486483b002caed853cdf7.
- Windows share/download: https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/runs/37576925019
- Baseline evidence: https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/runs/37576925023
- Baseline passed 68 tests, production build, UI/gesture regression and Windows save/resume checks. Those results do not validate subsequent changes.

## Current session
Locked visual target is being saved with this checkpoint. Earlier write attempts were interrupted before a branch update; do not assume their draft documents exist. Runtime changes in the next commit are pending validation.

In progress: original detailed office/workshop/substation/solar racks with instanced geometry; horizontal construction catalogue, search, comparison note and laptop layout; correct office/substation inspector thumbnails. New geometry-footprint and independent-soiling tests plus catalogue layout regression. Existing road and scenario/save logic retained. Next: run both release workflows, inspect runtime screenshots and fix failures; then review site approaches/alignment and staff detail. No new build is verified yet.

## Resume procedure
1. Inspect branch HEAD and any uncommitted work; read this file and current target.
2. Check newest workflow runs and exact tested SHA before retrying tests or writes.
3. Continue the next unfinished concrete step; do not rebuild completed systems.
4. Save focused commits and record changes, validation, remaining gaps and next steps here.
5. Never claim publication or tests succeeded without confirming results.

## Available tools / pitfalls
This cloud chat has GitHub connector tools but no local shell/browser. Read source through GitHub; batch file edits in a Git tree, create commit, then update branch with expected SHA. Run tests/captures through the existing GitHub Actions workflows. Do not issue a duplicate mutation while an approval is pending. Mandatory platform permission prompts cannot be disabled by project instructions.

## Geometry follow-up
First candidate 66b19d5 failed the new workshop footprint test; roof extended 0.095 tile outside its lot. Fixed in ffe0092. That commit passed all 75 tests, compilation, complete UI/gesture/scenario regression (run 37688174077), and packaged Windows checks (run 37688173824). Its screenshots were reviewed: improved asset detail/catalogue; panel glare in daylight needs correction. Added neighbour-connected fence/gate geometry (including live preview and removal), a shared office-yard reservation, and corrected apron/picnic/parking/lamp placement. Verify latest workflow results before publishing a build.

The current follow-up also adds rounded staff/helmet shapes, detailed van surfaces, reduced panel glare and closer asset captures with a clearly labelled CI software-rendering timing diagnostic. These follow-up changes are not verified until their own workflows pass. Next: inspect new screenshots, resolve any failures/glare, update exact successful build links and remaining gaps here.
