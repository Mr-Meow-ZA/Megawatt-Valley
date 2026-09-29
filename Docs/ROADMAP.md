# Megawatt Valley — Production Roadmap v2.0

## Status

**Primary roadmap — 29 September 2026**

This roadmap replaces the Unity phase plan.

The objective is not to complete an engine migration. The objective is to ship **Megawatt Valley: Solar**.

Cursor should progress through the roadmap autonomously and should not stop after every small implementation task unless a true escalation decision is required.

---

# M0 — Rebaseline

## Goal

Turn the repository into the active Phaser / TypeScript production project while preserving the Unity archive.

## Work

- preserve archive branch;
- establish Phaser + TypeScript + Vite;
- establish conventional npm scripts;
- establish core folders;
- establish basic tests;
- create playable browser shell;
- establish current docs/rules as source of truth.

## Exit

- project installs and builds;
- browser opens to Megawatt Valley shell;
- Cursor can inspect/test it;
- no Unity editor is needed for active work.

---

# M1 — Visual proof + first playable site

## Goal

Prove the new visual direction in the real game.

## Work

- isometric projection;
- pan/zoom;
- terrain;
- roads;
- first solar array;
- office;
- substation/grid point;
- a technician;
- core top HUD;
- objective panel;
- build menu;
- selection / hover feedback.

## Exit

A screenshot from the running game clearly resembles the approved pixel-isometric direction rather than a grey developer prototype.

---

# M2 — Core solar tycoon loop

## Goal

Make BUILD → GENERATE → SELL → EXPAND work end to end.

## Work

- placement;
- build costs;
- cash;
- generation;
- grid connection;
- revenue;
- time;
- basic weather;
- equipment choice;
- first expansion target.

## Exit

A player can build a functioning solar site, earn money and make meaningful build choices.

---

# M3 — Operations + staff + automation

## Goal

Make operating the plant interesting.

## Work

- condition/degradation;
- fault states;
- technician dispatch;
- visible repair;
- Radio Dispatch unlock;
- soiling;
- cleaning;
- cleaning improvement;
- staff/task feedback;
- automation payoff.

## Exit

At least one responsibility progresses from manual intervention to automation and feels rewarding.

---

# M4 — Full Level 1 progression

## Goal

Turn the sandbox into **Here Comes the Sun**.

## Work

- contextual objective chain;
- procurement trade-off;
- second plot;
- capability choices;
- 5–8 events;
- severe-weather climax;
- one-star completion;
- two-star and three-star mastery;
- pacing/balance for approximately 30–60 minute first completion.

## Exit

Level 1 can be played from start to completion and feels like a scenario rather than a systems demo.

---

# M5 — Product polish

## Goal

Make the game feel releasable.

## Work

- full UI polish;
- visual effects;
- improved environment density;
- construction stages;
- staff/vehicle animation polish;
- audio/music using free/owned assets;
- onboarding/tooltips;
- settings;
- accessibility/readability pass;
- save/load hardening;
- performance profiling;
- remove developer UI.

## Exit

Normal play no longer feels like testing an internal build.

---

# M6 — Release hardening

## Goal

Ship Megawatt Valley: Solar v1.0.

## Work

- complete automated test suite;
- full new-game-to-1★ playthrough;
- 2★/3★ verification;
- save/reload verification;
- common viewport testing;
- console/error cleanup;
- production build;
- static deployment;
- final README/player instructions;
- known-issues review.

## Exit

A player opens a URL and plays the complete game without development tools.

---

# After v1.0

Do not automatically begin large expansion work.

Review:

- fun;
- retention;
- visual quality;
- technical health;
- how autonomous Cursor development actually was;
- what systems deserve expansion.

Potential future roadmap:

- wind;
- BESS;
- hybrid plants;
- richer project development;
- deeper finance;
- multiple regions;
- headquarters;
- portfolio management / command centre.

Those are future product decisions, not current requirements.
