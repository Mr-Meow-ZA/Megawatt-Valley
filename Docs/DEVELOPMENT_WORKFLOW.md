# Megawatt Valley — Development Workflow v0.2

## Purpose

This project is intentionally being developed with a collaborative AI-assisted workflow.

The goal is not to let one tool generate the entire game autonomously. The goal is to combine clear human direction, fast implementation, continuous review, and documented decisions.

The detailed cross-agent handoff protocol is defined in `Docs/COLLABORATION_GUIDE.md`.

## Roles

### Rapha — Product Owner / Creative Director

Rapha has final authority over:

- game vision;
- player experience;
- priorities;
- scope;
- visual direction;
- humour / tone;
- design decisions;
- whether a feature is fun enough to keep;
- whether a milestone is accepted.

Rapha will play builds, give feedback, choose between design options, and decide when the project should expand in scope.

### Cursor — Primary Unity Implementation Partner

Cursor is expected to:

- implement C# systems;
- create and modify Unity project files;
- create scenes, prefabs, editor tooling, and test content where practical;
- fix compile errors;
- write tests for important logic where useful;
- follow the current architecture and game-design documents;
- keep changes focused on the active task;
- flag assumptions rather than silently inventing major design decisions;
- update documentation when a core technical decision changes;
- commit meaningful work clearly;
- maintain the shared activity log and session-goal state after meaningful sessions.

Cursor should not independently redesign the game or introduce large frameworks simply because they might be useful later.

### ChatGPT — Design, Planning, Review and Systems Partner

ChatGPT remains actively involved throughout development.

Expected responsibilities include:

- game design;
- system design;
- campaign and level planning;
- economy and balancing design;
- event writing;
- staff, equipment, research, progression, and scenario design;
- UI / UX review;
- architectural review;
- code / commit / pull-request review through GitHub;
- identifying technical debt or over-engineering;
- researching relevant Unity approaches and game-design references;
- turning gameplay ideas into scoped Cursor implementation tasks;
- reviewing completed work against the intended design;
- maintaining and refining the roadmap;
- helping diagnose bugs using repository changes, logs, screenshots, and build feedback;
- performing periodic repository alignment reviews and recording the latest review state.

ChatGPT should not compete with Cursor for implementation ownership. Cursor builds in Unity; ChatGPT helps determine what should be built, how it should behave, and whether the result still serves the game.

## Source of truth

GitHub is the shared project record and the handoff layer between Cursor and ChatGPT.

Important decisions should exist in the repository rather than only inside an AI chat.

Key documents include:

- `README.md`
- `Docs/GAME_VISION.md`
- `Docs/VISUAL_DIRECTION.md`
- `Docs/TECHNICAL_ARCHITECTURE.md`
- `Docs/ROADMAP.md`
- `Docs/LEVEL_01_DESIGN.md`
- `Docs/SESSION_GOALS.md`
- `Docs/CURRENT_STATUS.md`
- `Docs/ACTIVITY_LOG.md`
- `Docs/CHATGPT_REVIEW.md`
- `Docs/COLLABORATION_GUIDE.md`
- this workflow document

These documents are living documents and should evolve with the project.

## Recommended feature workflow

For meaningful features:

### 1. Define

Rapha + ChatGPT establish:

- player-facing purpose;
- scope;
- expected behaviour;
- constraints;
- acceptance criteria;
- what is explicitly out of scope.

### 2. Implement

Cursor implements the smallest coherent version that satisfies the task.

### 3. Compile and test

Cursor should:

- verify the project compiles;
- run relevant tests;
- inspect obvious Unity console errors;
- confirm the feature works in the intended test scene.

### 4. Commit and hand off

After meaningful work, Cursor should:

- commit the work clearly;
- append a concise entry to `Docs/ACTIVITY_LOG.md`;
- mark the relevant session goal complete if appropriate;
- update current status if the project state materially changed;
- update or flag any design / architecture document that no longer matches implementation.

The exact handoff format is defined in `Docs/COLLABORATION_GUIDE.md`.

### 5. Playtest

Rapha tests the feature in Unity and reports what actually feels right or wrong.

### 6. Review

ChatGPT can review:

- commits;
- diffs;
- pull requests;
- activity-log entries;
- architecture;
- screenshots;
- gameplay recordings;
- test results;
- bug reports.

The review should focus on both technical quality and whether the implementation matches the game design.

When practical, ChatGPT updates `Docs/CHATGPT_REVIEW.md` with the latest reviewed state and next recommendation.

### 7. Refine

Cursor makes targeted revisions.

### 8. Accept and document

Once accepted:

- merge / commit the stable version;
- update relevant docs if behaviour or architecture changed;
- identify the next smallest useful milestone.

## Daily alignment

A daily ChatGPT repository check acts as a safety net for cross-agent alignment.

The check should inspect recent commits, activity-log entries, session-goal changes, current-status changes, and meaningful PR / issue activity.

If no meaningful development occurred, no detailed intervention is required.

If meaningful changes occurred, ChatGPT should summarize the changes, identify any design / architecture drift, and recommend the next smallest useful goal.

This does not replace immediate review after important milestones.

## Branch and review strategy

During the earliest prototype, small low-risk changes may be committed directly while the project structure is being established.

As soon as the Unity project becomes non-trivial, prefer feature branches for meaningful changes, for example:

- `feature/tycoon-camera`
- `feature/build-placement`
- `feature/solar-generation`
- `feature/economy-core`
- `feature/maintenance`

This makes it easier for Rapha and ChatGPT to inspect changes before they become the baseline.

## Task-writing standard

Implementation tasks should generally contain:

1. **Purpose** — why the player needs this.
2. **Required behaviour** — what must happen.
3. **Acceptance criteria** — how we know it works.
4. **Constraints** — architectural or design rules.
5. **Out of scope** — what Cursor should not expand into yet.
6. **Documentation impact** — whether a design / architecture document needs updating.

## Working principle

> **Build small. Play it. Review it. Improve it. Then expand.**

The project should resist the temptation to generate large amounts of code or content before the previous layer has proven useful.
