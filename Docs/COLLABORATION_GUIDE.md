# Megawatt Valley — Cursor + ChatGPT Collaboration Guide

## Purpose

Megawatt Valley is being developed with three active roles:

- **Rapha** — Product Owner / Creative Director
- **Cursor** — Primary Unity implementation partner
- **ChatGPT** — Design, planning, review, architecture and systems partner

GitHub is the shared handoff layer between those roles.

The purpose of this guide is to make sure work done in Cursor is always understandable to ChatGPT, and that design / review decisions made with ChatGPT are always understandable to Cursor.

The system should remain lightweight. Documentation exists to preserve alignment, not to create bureaucracy.

---

# 1. Source-of-truth hierarchy

When information conflicts, use this order:

1. Rapha's most recent explicit decision.
2. Approved living documents in `Docs/`.
3. `Docs/CURRENT_STATUS.md`.
4. The active item in `Docs/SESSION_GOALS.md`.
5. Recent accepted Git commits / merged pull requests.
6. `Docs/ACTIVITY_LOG.md`.
7. Old chat context, abandoned prototypes, or assumptions.

Important design decisions should not remain only inside a Cursor or ChatGPT conversation. They must be reflected in GitHub when they materially affect the project.

---

# 2. Required shared documents

Cursor and ChatGPT should treat these as the core shared context:

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
- `Docs/DEVELOPMENT_WORKFLOW.md`
- `Docs/COLLABORATION_GUIDE.md`

Cursor should read the relevant files before significant implementation work.

ChatGPT should inspect these files plus recent commits / PRs when reviewing current state.

---

# 3. Cursor responsibilities after a work session

After any meaningful implementation session, Cursor must leave a concise GitHub handoff.

A session is considered meaningful if it does any of the following:

- completes or materially advances a session goal;
- adds / changes player-facing behaviour;
- changes architecture;
- adds a package or dependency;
- modifies project structure;
- fixes an important bug;
- changes art / visual assumptions;
- changes balancing or game rules;
- creates a new known issue or technical constraint.

## Required end-of-session handoff

### A. Commit the work

Prefer a focused commit or small set of focused commits with clear messages.

Recommended commit prefixes:

- `feat:` new player-facing feature
- `fix:` bug fix
- `refactor:` internal change with no intended behaviour change
- `docs:` documentation only
- `art:` art / visual asset work
- `ui:` UI / UX work
- `test:` tests / test tooling
- `chore:` project / build / package housekeeping

Examples:

- `feat: add smooth tycoon camera pan`
- `feat: place first solar array placeholder`
- `fix: prevent placement outside owned plot`
- `docs: complete session goal S1-02`

### B. Update `Docs/ACTIVITY_LOG.md`

Append one short entry using the standard template in that file.

The log should say:

- date;
- active session goal;
- what changed;
- what was tested;
- known issues / limitations;
- design or architecture decisions made;
- files / systems affected;
- suggested next step;
- relevant commit / branch / PR where available.

Do not write a novel. The log exists so another agent can understand the session in a few minutes.

### C. Update `Docs/SESSION_GOALS.md`

If a goal is complete, change `[ ]` to `[x]`.

If the goal is only partly complete, leave it unchecked and record the remaining work in the activity log.

Do not invent a new major roadmap direction merely to have a next task.

### D. Update `Docs/CURRENT_STATUS.md` when necessary

Update current status only if the project state meaningfully changed, for example:

- project phase changed;
- next active session goal changed;
- a previously open decision became locked;
- a new blocker appeared;
- a major technical or design constraint changed.

The current-status file is a concise snapshot, not a diary.

### E. Update authoritative design / architecture docs when necessary

If implementation changes a documented decision, update or flag the relevant document.

Examples:

- architecture change → `TECHNICAL_ARCHITECTURE.md`
- level behaviour change → `LEVEL_01_DESIGN.md`
- visual-direction change → `VISUAL_DIRECTION.md`
- roadmap / sequencing change → `ROADMAP.md`

Cursor must not silently change product direction through code.

---

# 4. Cursor handoff format

Each activity-log entry should answer this in practical terms:

> **What would ChatGPT need to know if it had not watched this session?**

Use this compact structure:

```markdown
## YYYY-MM-DD — Sx-xx — Short session title

**Status:** Complete / Partial / Blocked

**Changed**
- ...

**Tested**
- ...

**Known issues / limitations**
- ...

**Decisions / assumptions**
- ...

**Next recommended step**
- ...

**Git**
- Commit: `<sha or pending>`
- Branch / PR: `<if relevant>`
```

For a tiny session, some sections may contain only one bullet.

---

# 5. ChatGPT review responsibilities

ChatGPT acts as an independent design / architecture / scope review layer rather than a second implementation agent.

When reviewing the project, ChatGPT should check:

1. `Docs/CURRENT_STATUS.md`
2. the latest entries in `Docs/ACTIVITY_LOG.md`
3. `Docs/SESSION_GOALS.md`
4. recent commits and meaningful diffs
5. open PRs / issues where relevant
6. authoritative design / architecture docs affected by the changes

ChatGPT should answer five questions:

1. **What changed since the previous review?**
2. **Does it match the active session goal?**
3. **Does it still match the game vision and architecture?**
4. **Did Cursor introduce unnecessary scope, complexity, or technical debt?**
5. **What is the next smallest useful goal?**

If everything is aligned, say so. Review does not need to manufacture criticism.

---

# 6. `Docs/CHATGPT_REVIEW.md`

After a meaningful review, ChatGPT should update this file when practical with:

- review date;
- latest commit / state reviewed;
- summary of changes reviewed;
- alignment status;
- concerns / follow-ups;
- decisions needed from Rapha;
- recommended next session goal.

This gives Cursor a direct way to see what ChatGPT last reviewed and what guidance resulted from that review.

Cursor should read this file before beginning a new meaningful session if it has changed since Cursor's previous session.

---

# 7. Daily alignment check

A daily ChatGPT check should inspect the Megawatt Valley GitHub repository for changes since the previous review.

The daily check should focus on:

- new commits;
- new / updated activity-log entries;
- completed session goals;
- current-status changes;
- open or updated PRs / issues;
- architecture / design drift;
- blockers requiring Rapha's decision.

If no meaningful changes occurred, no detailed report is necessary.

If meaningful changes occurred, ChatGPT should produce a concise summary and, when practical, update `Docs/CHATGPT_REVIEW.md`.

The daily check is a safety net. It does not replace Rapha asking ChatGPT for an immediate review after an important session.

---

# 8. Anti-drift rules

Cursor and ChatGPT should both guard against these failure modes:

### Scope drift

Do not implement future systems because they seem convenient while working on a small session goal.

### Architecture drift

Do not introduce frameworks, packages, global systems, or patterns without a current need.

### Design drift

Do not silently change how the game is supposed to work because implementation is easier another way.

### Visual drift

Do not mistake placeholder visuals for the final target, and do not prematurely spend large effort polishing temporary systems.

### Documentation drift

If code behaviour and documentation disagree, flag and reconcile the difference rather than allowing both versions to remain indefinitely.

---

# 9. When Cursor should explicitly ask for review

Cursor should flag a change for Rapha / ChatGPT review before proceeding when it involves:

- a core gameplay-loop change;
- a new major manager / service / architecture pattern;
- changing the save-data model;
- adding a significant third-party package;
- changing rendering pipeline or major graphics architecture;
- changing the intended scale of the world;
- changing player controls / camera philosophy materially;
- changing Level 1 objectives or progression materially;
- adding a system that was explicitly deferred;
- a trade-off between visual quality and simulation performance with long-term consequences;
- a change that invalidates an approved design document.

If the task is reversible and local, Cursor should normally make the smallest reasonable implementation and record the assumption rather than stopping work unnecessarily.

---

# 10. Preferred rhythm

The default rhythm is:

**Rapha + ChatGPT define → Cursor builds → Cursor tests → Cursor commits + logs → Rapha plays → ChatGPT reviews → docs align → next session goal**

For very small goals, several steps can happen rapidly in one evening.

The objective is not process for its own sake. The objective is that no matter whether Rapha opens Cursor or ChatGPT, both assistants can reconstruct the current project state from GitHub and continue in the same direction.
