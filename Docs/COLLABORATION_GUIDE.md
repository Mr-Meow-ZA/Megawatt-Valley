# Megawatt Valley — Cursor + ChatGPT + Grok Bot Collaboration Guide

## Purpose

Megawatt Valley is being developed with four active roles:

- **Rapha** — Product Owner / Creative Director
- **Cursor** — Primary Unity implementation partner
- **ChatGPT** — Design, planning, review, architecture and systems partner
- **Grok Bot** — Supporting research, critique, QA, ideation and documentation partner

GitHub is the shared handoff layer between those roles.

The purpose of this guide is to make sure work done by any AI contributor is understandable to the others, that design / review decisions remain aligned, and that Rapha does not have to manually repeat the project state between tools.

The system should remain lightweight. Documentation exists to preserve alignment, not to create bureaucracy.

---

# 1. Role hierarchy and decision authority

The tools do not have equal decision authority.

## Rapha — Product Owner / Creative Director

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

When AI recommendations conflict, Rapha's explicit decision wins.

## Cursor — Primary Unity implementation partner

Cursor is the default owner of day-to-day Unity implementation.

Cursor is expected to:

- implement C# gameplay and editor systems;
- create and modify Unity scenes, prefabs, project settings and test content where practical;
- fix compile errors;
- implement active session goals;
- run relevant tests and inspect Unity console errors;
- maintain the local Unity project structure;
- keep implementation changes small and testable;
- post meaningful development activity to GitHub.

Unless Rapha explicitly assigns otherwise, **Cursor remains the main AI that changes the Unity project itself**.

## ChatGPT — Design, planning, architecture and review partner

ChatGPT owns the cross-cutting design/review layer rather than day-to-day Unity implementation.

Expected responsibilities include:

- game and system design;
- campaign / level planning;
- economy and balancing design;
- progression, equipment, staff and event design;
- UI / UX review;
- architecture review;
- code / commit / PR review through GitHub;
- visual-direction review;
- scope control and roadmap maintenance;
- turning ideas into small Cursor implementation tasks;
- reviewing completed work against the game vision;
- daily repository alignment checks;
- recommending the next smallest useful session goal.

ChatGPT should not compete with Cursor for Unity implementation ownership.

## Grok Bot — Supporting research, critique, QA, ideation and documentation partner

Grok Bot is an additional supporting contributor. It is deliberately not the primary Unity builder.

Good default uses for Grok Bot include:

- researching renewable-energy concepts, industry practices and terminology that can improve game authenticity;
- researching reference games, management mechanics, player expectations and comparable systems;
- generating alternative design ideas for events, staff traits, fictional vendors, equipment brands, achievements, humour, radio material and scenario concepts;
- acting as a second-opinion critic on a design proposal before implementation;
- identifying edge cases, failure modes and test scenarios for systems Cursor is building;
- drafting QA checklists and bug-reproduction steps;
- reviewing documentation for inconsistencies or missing assumptions;
- summarising research into concise repository notes;
- drafting GitHub issues for bugs, research questions or clearly bounded future work;
- helping triage open issues and identify duplicates / outdated tasks;
- reviewing isolated code or diffs when specifically asked, as a secondary opinion rather than implementation owner;
- suggesting questions that Rapha / ChatGPT should resolve before a system is built.

Grok Bot should **not by default**:

- redesign the game independently;
- change core architecture;
- modify Unity scenes / prefabs / gameplay code simply because it can;
- add packages or frameworks;
- implement deferred systems;
- merge large changes;
- overrule the active session goal;
- change approved visual direction;
- rewrite authoritative design documents without clearly flagging the proposal.

If Grok Bot identifies a better direction, it should record a recommendation or issue for review instead of silently changing the project.

---

# 2. Source-of-truth hierarchy

When information conflicts, use this order:

1. Rapha's most recent explicit decision.
2. Approved living documents in `Docs/`.
3. `Docs/CURRENT_STATUS.md`.
4. The active item in `Docs/SESSION_GOALS.md`.
5. Recent accepted Git commits / merged pull requests.
6. `Docs/CHATGPT_REVIEW.md`.
7. `Docs/ACTIVITY_LOG.md`.
8. Research notes / issue discussions / AI suggestions that have not yet been accepted.
9. Old chat context, abandoned prototypes, or assumptions.

Important design decisions should not remain only inside Cursor, ChatGPT or Grok Bot conversations. They must be reflected in GitHub when they materially affect the project.

A Grok suggestion is **not** automatically an approved design decision merely because it appears in GitHub.

---

# 3. Required shared documents

Cursor, ChatGPT and Grok Bot should treat these as the core shared context:

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

### Before Cursor begins meaningful implementation

Cursor should read the relevant project documents plus the latest activity / review state.

### Before Grok Bot begins meaningful project work

Grok Bot should at minimum inspect:

- `Docs/COLLABORATION_GUIDE.md`;
- `Docs/CURRENT_STATUS.md`;
- `Docs/SESSION_GOALS.md`;
- `Docs/CHATGPT_REVIEW.md`;
- the authoritative document relevant to its task.

### Before ChatGPT reviews current state

ChatGPT should inspect these files plus recent commits / PRs / issues as needed.

---

# 4. Cursor responsibilities after a work session

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
- agent / contributor;
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

# 5. Grok Bot responsibilities after meaningful work

Grok Bot should also leave enough context for Cursor and ChatGPT to understand what it contributed.

A Grok task is meaningful when it produces research, recommendations, QA findings, issue triage, documentation changes, or another output that may influence future development.

## Preferred Grok outputs

### Research

Place durable research in a clearly named document or relevant existing document and distinguish:

- verified facts / sources;
- interpretations;
- design ideas;
- unanswered questions.

Research does not become a design requirement until accepted.

### Design alternatives

When Grok proposes alternatives, prefer a short comparison with trade-offs rather than selecting a direction on Rapha's behalf.

### QA / testing

Grok can create:

- test checklists;
- edge-case lists;
- reproduction steps;
- expected vs actual behaviour notes;
- issue drafts.

### Issues

Grok may create or help draft GitHub issues for:

- reproducible bugs;
- research tasks;
- documentation gaps;
- clearly bounded future ideas;
- questions needing a design decision.

Avoid flooding the repository with speculative backlog items.

### Activity log

If Grok writes to the repo or produces a meaningful project artifact, it should add a concise entry to `Docs/ACTIVITY_LOG.md` with:

- **Agent:** Grok Bot
- task / reason;
- output produced;
- important findings;
- whether anything requires Rapha / ChatGPT review;
- links / files / issue numbers involved.

### Commit identification

Where practical, Grok-authored commits should make authorship obvious, for example:

- `docs(grok): research solar O&M event ideas`
- `test(grok): add camera edge-case checklist`
- `docs(grok): summarise inverter failure research`

Because GitHub authentication may technically use Rapha's account token, the activity log is the authoritative way to identify which AI performed the work.

---

# 6. Shared handoff format

Each activity-log entry should answer this in practical terms:

> **What would another contributor need to know if it had not watched this session?**

Use this compact structure:

```markdown
## YYYY-MM-DD — Sx-xx / Support Task — Short title

**Agent:** Cursor / Grok Bot / ChatGPT / Rapha
**Status:** Complete / Partial / Blocked / Recommendation

**Changed / Produced**
- ...

**Tested / Verified**
- ...

**Known issues / limitations**
- ...

**Decisions / assumptions / recommendations**
- ...

**Next recommended step**
- ...

**Git / References**
- Commit: `<sha or pending>`
- Branch / PR / Issue: `<if relevant>`
```

For a tiny session, some sections may contain only one bullet.

---

# 7. ChatGPT review responsibilities

ChatGPT acts as the independent cross-cutting design / architecture / scope review layer rather than a second Unity implementation agent.

When reviewing the project, ChatGPT should check:

1. `Docs/CURRENT_STATUS.md`
2. the latest entries in `Docs/ACTIVITY_LOG.md`
3. `Docs/SESSION_GOALS.md`
4. recent commits and meaningful diffs
5. open / updated PRs and issues where relevant
6. Grok Bot research / recommendations that may affect the active work
7. authoritative design / architecture docs affected by the changes

ChatGPT should answer five questions:

1. **What changed since the previous review?**
2. **Does it match the active session goal?**
3. **Does it still match the game vision, visual direction and architecture?**
4. **Did any contributor introduce unnecessary scope, complexity, conflicting advice or technical debt?**
5. **What is the next smallest useful goal?**

If everything is aligned, say so. Review does not need to manufacture criticism.

Grok Bot recommendations should be evaluated like any other proposal: useful input, not automatic authority.

---

# 8. `Docs/CHATGPT_REVIEW.md`

After a meaningful review, ChatGPT should update this file when practical with:

- review date;
- latest commit / state reviewed;
- summary of changes reviewed;
- relevant Cursor and Grok activity;
- alignment status;
- concerns / follow-ups;
- decisions needed from Rapha;
- recommended next session goal.

This gives Cursor and Grok Bot a direct way to see what ChatGPT last reviewed and what guidance resulted from that review.

Cursor and Grok Bot should read this file before beginning meaningful work if it has changed since their previous session.

---

# 9. Daily alignment check

A daily ChatGPT check should inspect the Megawatt Valley GitHub repository for changes since the previous review.

The daily check should focus on:

- new Cursor commits;
- Grok Bot commits / research / issue activity;
- new / updated activity-log entries;
- completed session goals;
- current-status changes;
- open or updated PRs / issues;
- architecture / design / visual drift;
- conflicting recommendations between contributors;
- blockers requiring Rapha's decision.

If no meaningful changes occurred, no detailed report is necessary.

If meaningful changes occurred, ChatGPT should produce a concise summary and, when practical, update `Docs/CHATGPT_REVIEW.md`.

The daily check is a safety net. It does not replace Rapha asking ChatGPT for an immediate review after an important session.

---

# 10. AI-to-AI alignment rules

The goal is not for the assistants to agree automatically. The goal is for disagreements to be visible and resolvable.

## Cursor should check

Before meaningful implementation, Cursor should check whether:

- ChatGPT's latest review changed the recommended next goal;
- Grok Bot logged research or QA findings relevant to the feature;
- a new issue identifies a blocker or edge case;
- Rapha made a newer explicit decision.

## Grok Bot should check

Before meaningful work, Grok Bot should check whether:

- the topic is already decided in an authoritative document;
- the active session goal makes the research relevant now;
- ChatGPT has already reviewed or rejected a similar proposal;
- the task risks overlapping with Cursor's Unity implementation lane.

## ChatGPT should check

During review, ChatGPT should check whether:

- Cursor followed the approved design;
- Grok research materially changes an assumption;
- Grok and Cursor reached conflicting conclusions;
- documentation still reflects the actual implementation;
- a decision needs Rapha rather than another round of AI debate.

## Conflict rule

If two AI contributors recommend materially different directions:

1. do not silently choose one;
2. record the disagreement and trade-offs;
3. ChatGPT may synthesise the implications;
4. Rapha decides when it is a product / scope / visual / architecture choice.

---

# 11. Anti-drift rules

Cursor, ChatGPT and Grok Bot should all guard against these failure modes:

### Scope drift

Do not implement or promote future systems because they seem interesting while working on a small session goal.

### Architecture drift

Do not introduce frameworks, packages, global systems, or patterns without a current need.

### Design drift

Do not silently change how the game is supposed to work because implementation is easier another way.

### Visual drift

Do not mistake placeholder visuals for the final target, and do not prematurely spend large effort polishing temporary systems.

### Research drift

Do not let interesting research become an ever-growing backlog disconnected from the active game milestone.

### AI role drift

Do not allow Grok Bot to gradually become a second uncontrolled Unity implementation agent, or ChatGPT to become a competing implementation owner, unless Rapha explicitly changes the workflow.

### Documentation drift

If code behaviour and documentation disagree, flag and reconcile the difference rather than allowing both versions to remain indefinitely.

---

# 12. When Cursor should explicitly ask for review

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

# 13. When Grok Bot should explicitly request review

Grok Bot should flag its output for Rapha / ChatGPT review when it proposes:

- a new major gameplay system;
- a change to the core loop;
- a different technical architecture;
- a new paid tool / package / service;
- a change to the visual target;
- a large new content category;
- a realism recommendation that would materially increase complexity;
- a finding that contradicts an existing design assumption;
- a security / licensing / legal concern;
- a change that would materially alter an active Cursor implementation task.

Grok should normally phrase these as **recommendations for review**, not direct project changes.

---

# 14. Preferred rhythm

The default development rhythm is:

**Rapha + ChatGPT define → Grok researches / challenges where useful → Cursor builds → Cursor tests → Cursor commits + logs → Rapha plays → Grok can QA / critique → ChatGPT reviews overall alignment → docs align → next session goal**

Not every session needs Grok Bot. It is an extra capability, not another mandatory approval gate.

For very small goals, several steps can happen rapidly in one evening.

The objective is not process for its own sake. The objective is that no matter whether Rapha opens Cursor, ChatGPT or Grok Bot, every contributor can reconstruct the current project state from GitHub and continue in the same direction.

---

# 15. Local Cursor sync automation

Cursor sessions in this repository run project hooks so GitHub and Rapha's Polaris vault stay aligned without depending on chat memory.

| Event | What happens |
| --- | --- |
| `sessionStart` | `git fetch`; fast-forward `main` when the working tree has no tracked changes; stamp the Polaris project note; inject HEAD / status / ChatGPT next-goal into the session. |
| `stop` | If there are uncommitted changes or unpushed commits, request one follow-up turn to complete this handoff and push. |
| `sessionEnd` | Re-stamp the Polaris Megawatt Valley note from current HEAD. |

Scripts:

- `.cursor/hooks.json`
- `.cursor/hooks/session-start.ps1`
- `.cursor/hooks/session-stop.ps1`
- `.cursor/hooks/session-end.ps1`
- `Tools/Sync-PolarisMegawattValley.ps1`

Rules:

- Hooks **never** auto-commit or auto-push.
- Polaris is a personal index. GitHub remains the shared source of truth for ChatGPT, Cursor and Grok Bot.
- The vault path is `E:\Obsidian Vaults\Polaris_Vault\02 Projects\Technical\Megawatt Valley.md`. If that drive is unavailable, hooks fail open.
