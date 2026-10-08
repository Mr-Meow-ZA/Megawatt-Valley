# Megawatt Valley — Current Status

**Status as of 8 October 2026: 3D desktop candidate under validation; not yet canonical on main.**

## Actual repository state
- `main`: older Phaser + TypeScript browser-first implementation; its architecture documents are historical pending acceptance/migration.
- **Draft PR #11 / `codex/3d-isometric`**: independent Three.js + Electron true-3D Solar Level 1 candidate, new clean-sheet `src/ui/studio` interface.
- Last reported verified desktop checkpoint: `c7be6d7`, with 81 tests and Windows packaging checks reported in branch `Docs/RESUME_CHECKPOINT.md`. Later fixes must be checked at their own SHA before claiming verification.
- Product-owner decision: retain 3D world as baseline; reject old UI; implement approved Concept v1 four-anchor design. Visual/product acceptance of running implementation still pending.

## Immediate goal
Verify newest PR #11 tests, build, Windows saving/reopening and four UI anchor screens at desktop/laptop sizes; fix real issues; request Rapha playtest. No new feature scope or wind/solar mixing.

## Governance
Read [ACTIVE_DEVELOPMENT.md](ACTIVE_DEVELOPMENT.md), [VISUAL_QUALITY_AND_WORLD_CHARACTER.md](VISUAL_QUALITY_AND_WORLD_CHARACTER.md) §15 and latest [CHATGPT_REVIEW.md](CHATGPT_REVIEW.md). The older Phaser-era `CURSOR_PRIMARY_BUILD_SPEC.md`, `TECHNICAL_ARCHITECTURE.md` and `VISUAL_DIRECTION.md` are not authoritative for the new 3D candidate.

## Next decision gate
After 3D candidate verification and Rapha's acceptance, select canonical implementation, migrate it to main in a reviewed PR, then update architecture/build workflows and retire superseded tracks.
