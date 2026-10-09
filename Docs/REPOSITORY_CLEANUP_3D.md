# Repository cleanup — 9 October 2026

## Why this is a real cleanup
Previous rebaseline PR #14 corrected docs on main but **left the old Unity/Phaser source and historical instructions intact on the active 3D branch**. This cleanup starts from the actual 3D candidate and deletes obsolete material, with a full snapshot retained on `archive/3d-before-legacy-purge-2026-10-09`.

## Deleted in this cleanup
- Unity engine project directories: `Assets/`, `Packages/`, `ProjectSettings/` and obsolete Unity verification script.
- Old Phaser/Unity implementation plans, pixel-isometric art direction and obsolete handovers/review documents.
- Old `solar-release.yml` and `resolve-3d.yml` workflows. Retain `three-isometric.yml` and `desktop-release.yml`.
- Replaced root README, current status, session goals, roadmap and technical architecture with current 3D-only guidance.

## Explicitly not yet deleted (requires code-level dependency audit)
- `src/game/`, `src/main-2d.ts`, `src/ui/tycoon/`, old UI/stylesheet variants and Phaser dependency/lockfile. They are historical, but their imports, tests and packaging dependencies must be checked before removal. They are **not the active product direction**.
- Existing Kenney assets and other source models; don't delete until referenced-file and licensing inventory is complete.
- Active PR #11 and its stack (#7/#10), pending safe retargeting. Closing or merging them blindly can lose the active 3D work.

## Verification / merge gate
This branch is a proposal against `codex/3d-isometric`. CI must pass on the exact cleanup SHA, including LFS, tests, Vite build, screenshots and packaged Windows save/recovery. Verify no scripts or documentation depend on deleted Unity/Phaser paths. Only then merge into the active candidate; promote the accepted 3D game to main through a separate controlled operation.

## Archives
- `archive/3d-before-legacy-purge-2026-10-09` preserves the entire pre-cleanup candidate.
- `archive/unity-prototype-2026-09-29` preserves original Unity work.
- Git history retains all deleted files.

## Future work
Remove unused 2D/Phaser runtime code and dependency with regenerated lockfile and import/test audit; simplify stacked PR topology and CI triggers; review and close obsolete PRs only after the 3D candidate is safely promoted.
