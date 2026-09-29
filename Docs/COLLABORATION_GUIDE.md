# Megawatt Valley — Collaboration Guide v2.0

## Status

**ACTIVE — 29 September 2026**

## Roles

### Rapha — Product Owner / Creative Director

Rapha owns:

- game vision;
- scope;
- player experience;
- major visual direction;
- major feature priorities;
- whether the game is fun;
- acceptance of major product milestones.

Rapha should not be required to perform routine coding, debugging, scene assembly, asset wiring or test execution.

### Cursor — Primary Implementation Team

Cursor owns routine production.

Cursor is expected to:

- inspect the repo;
- maintain its implementation backlog;
- write and refactor code;
- integrate assets;
- build the game;
- run automated tests;
- open the game in a browser;
- visually inspect it;
- interact with/playtest affected features;
- fix defects;
- keep going through the active milestone;
- commit and push meaningful progress;
- update project status when state changes.

Cursor may make ordinary reversible technical decisions without escalation when they remain inside the primary specification.

### ChatGPT — Product / Design / Review Partner

ChatGPT supports:

- game design;
- progression;
- balancing;
- visual target definition;
- architecture review;
- scope control;
- roadmap review;
- repository review;
- acceptance criteria;
- critique of builds and screenshots.

ChatGPT is not required for Cursor to proceed with routine implementation.

## Source-of-truth order

When project information conflicts, use:

1. Rapha's most recent explicit decision.
2. Docs/CURSOR_PRIMARY_BUILD_SPEC.md
3. Docs/CURRENT_STATUS.md
4. Docs/VISUAL_DIRECTION.md
5. Docs/TECHNICAL_ARCHITECTURE.md
6. Docs/ROADMAP.md
7. Docs/GAME_VISION.md
8. Docs/PROGRESSION_AND_ENGAGEMENT.md
9. Docs/LEVEL_01_DESIGN.md
10. older material only as historical context

Any Unity-specific document that conflicts with the above is archived.

## Cursor operating model

The default loop is:

**implement → build → test → run → visually inspect → interact/play → fix → retest → commit → continue**

Cursor should not stop after each tiny feature simply to obtain approval.

Escalate only when a choice:

- materially changes gameplay;
- materially changes the approved visual direction;
- materially changes product scope;
- introduces cost;
- creates licensing/legal uncertainty;
- is strategically significant and difficult to reverse;
- would remove important project history.

## GitHub handoff

GitHub remains the source of truth.

After meaningful work, Cursor should:

- commit with a clear message;
- push to origin;
- update Docs/CURRENT_STATUS.md when project state changes;
- update authoritative docs when a product/architecture decision changes;
- keep notes concise.

The objective is alignment, not documentation bureaucracy.

## Archive

The complete pre-pivot Unity state is preserved on:

**archive/unity-prototype-2026-09-29**

Do not continue Unity implementation from main unless Rapha explicitly reactivates that direction.
