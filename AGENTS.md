# AGENTS.md — Megawatt Valley (Codex)

## Developer and boundaries
**Codex is the sole active coding agent. Cursor has been retired.** This repository's sole product direction is a **true-3D stylised isometric Three.js/TypeScript/Vite game, packaged with Electron for Windows**. Level 1, *Here Comes the Sun*, is **solar only**. Do not revive Unity, Phaser, pixel-isometric production or wind in Level 1.

## Protect ongoing Codex work
- Primary Codex work remains on `codex/3d-isometric` / [PR #11](https://github.com/Mr-Meow-ZA/Megawatt-Valley/pull/11). Do not force-push, rebase, retarget, merge or delete that branch without an explicit coordination decision.
- The separate cleanup [PR #18](https://github.com/Mr-Meow-ZA/Megawatt-Valley/pull/18) is **not approved for merge** until Codex reviews its diff and the full Three.js browser + native Windows CI passes. Do not merge it behind another agent's back.
- Preserve save format and gameplay behaviour; remove legacy dependencies only after tracing imports and testing.

## Required reading and message-board check
1. At the start of every session, fetch and read the **latest comments on PR #11** (Conversation tab), particularly the 9 October ChatGPT handover; read any newer comments and links.
2. Read `Docs/RESUME_CHECKPOINT.md`, `Docs/CURRENT_STATUS.md`, `Docs/SESSION_GOALS.md`, `Docs/DESKTOP_QUALITY_TARGET.md`, `Docs/CODEX_UI_UX_READ_FIRST.md` and [approved reference issue #13](https://github.com/Mr-Meow-ZA/Megawatt-Valley/issues/13).
3. Before material design, architecture or asset decisions, recheck the PR #11 board for newer product instructions.
4. Before ending the session, recheck the board, update the checkpoint with exact tested SHA, validation links, and addressed/pending messages. If GitHub is unavailable, disclose that; do not claim a check occurred.
5. Read `Docs/FREE_ASSET_RESOURCE_INDEX.md` on `main` before making new assets; verify commercial licensing and source provenance.

## Verification and acceptance
- Run `npm ci`, `npm test`, `npm run build`, true-3D browser tests/screenshots and Windows desktop packaging/save tests on the **exact proposed commit**.
- Distinguish automated tests from independent human playtesting. Keep PR #11 draft until Rapha accepts the visual/gameplay result.
- Do not silently override newer product-owner decisions; record conflicts and ask.

## Responsibilities
Codex implements, tests, captures actual screenshots and reports evidence. ChatGPT supports review, design direction and separate non-interfering GitHub documentation/cleanup proposals. Rapha approves material product-direction changes and acceptance.
