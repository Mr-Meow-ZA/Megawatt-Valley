# Handover — Codex Browser Build UI / Balance Pass

**Date:** 2 October 2026  
**Branch:** `codex/solar-release-hardening`  
**PR:** #10  
**Status:** Implementation changes are committed. Unit tests and production build have been passing; the standalone browser regression harness has been iteratively updated for the new tabbed HUD and should be rechecked on the latest workflow run.

## Continuation in the next session — 2 October 2026

The incoming head was `4f24edb`. Its workflow failed after the storm choice:
the helper queried a stale visible-modal attribute before the next render and
tried to click the choice again after it disappeared. Utility helpers also used
forced clicks through overlays, so their success was weak evidence of usability.

Changes in this continuation:
- Event choices refresh the HUD immediately. Browser utilities wait for dialogs
  to close and use ordinary clicks; they no longer choose event outcomes implicitly.
- Fixture import closes the gear menu before loading the file, avoiding overlay races.
- Imported/restored companies pause, including the speed restored after an event.
- Import resets completion-overlay state so an older company's banner cannot persist.
- Bottom dock collapses to its navigation bar; clicking any tab expands it again.
- Switching away from Build cancels placement. Contextual inspector has a close button.
- Finance scrolls so expanded cheat controls remain reachable on laptop screens.
- Supplier and sponsored-shoot rewards now credit their advertised net $2,500
  without an undisclosed upfront-cash gate; their operational trade-offs remain.
- Play instructions and packaged README describe the actual current controls.

Verification: 24 unit/simulation tests, TypeScript/Vite build and standalone packaging.
The browser regression additionally checks collapse/reopen, inspector close,
storm choice followed by normal save, repeated fixture imports, and laptop cash cheats.
Desktop/laptop screenshots are retained in `browser-evidence` by Actions.
Reference strategy pacing remains 1,353 seconds to 1★ and another 347 to 3★.

Next priorities: user playtest of the verified dock, then richer terrain composition
and meaningful two-/three-star progression. Preserve the quicker cash flow; do not
stretch playtime by reinstating slow earnings. Scenario 2 remains future scope.

## Why this pass happened

Rapha playtested the Codex build and reported:

- income was much too slow;
- staff could not be fired;
- random events did not include enough beneficial outcomes;
- the menu / navigation / build UI was much weaker than the supplied visual references.

The UI references used a much more game-like layout:
- thin KPI bar;
- large world viewport;
- compact objective panel;
- bottom build / management dock;
- contextual information rather than permanent sidebars.

## Economy changes

`src/content/scenario.ts`

- Level 1 tariff changed from **$0.12/kWh to $0.24/kWh**.
- A first attempt at $0.45/kWh was rejected because automated progression became far too fast (~10–11 minutes to 1★).
- At $0.24/kWh the automated balance run was approximately **22.5 minutes at 1x**, versus about 54 minutes previously.
- Existing saves are migrated upward to at least the current tariff when loaded.

## Playtest cheats

`src/simulation/GameSimulation.ts` / `src/ui/DomHud.ts`

Added:
- +$25,000 playtest cash;
- +$100,000 playtest cash;
- trigger positive event;
- keyboard shortcut **Ctrl+Shift+M** = +$25k;
- keyboard shortcut **Ctrl+Shift+G** = positive event.

Cheats live under **Finance → Playtest cheats** in the new management dock.

## Staff dismissal

Added `dismissStaff()`.

- Extra staff can now be dismissed.
- The final remaining employee cannot be dismissed, to avoid invalid saves / operational soft-lock.
- Staff cards have a Dismiss control.
- Selected staff also expose Train / Dismiss context actions.

## Positive event

Added **Green Growth Grant**.

Choices:
- +$7,500 cash; or
- +$4,000 plus +0.5 skill to current staff.

It is scheduled as an early beneficial event after first power conditions are met.

Also clarified wording on some existing positive event options so rewards are obvious.

## Major HUD / menu refactor

Primary files:
- `src/ui/DomHud.ts`
- `src/styles.css`

The old permanent right-side stack of Build / Selection / Capabilities / People / Finance panels was replaced with a more conventional tycoon-game layout.

### New layout

**Top**
- compact Megawatt Valley identity;
- cash KPI;
- power output KPI;
- weather;
- calendar;
- game-speed controls;
- star status;
- small gear menu at top-right for save/load/new/export/import/audio.

**Upper left**
- compact objective panel.

**Right**
- contextual selection inspector appears only when equipment or staff is selected.

**Bottom**
- main management dock with tabs:
  - Build
  - Team
  - Upgrades
  - Finance

**Bottom-right**
- minimap where screen width allows.

### Build dock

Build is now horizontal and card-based instead of a long sidebar.
Categories:
- All
- Generation
- Grid
- Support

The world should receive much more screen area and the HUD should read like a management game rather than a web dashboard.

### Team dock

- hiring controls in header;
- roster cards;
- Train;
- Dismiss.

### Upgrades dock

- owned capabilities;
- buyable capability actions;
- future capability-tree preview.

### Finance dock

- sales / OpEx / energy / peak / staff summary;
- star target note;
- playtest cheats.

## CI / test notes

Normal TypeScript/unit tests and production build have been passing after the gameplay changes.

The UI refactor required changes to `scripts/browser-check.mjs` because:
- Save / Load are now behind the gear menu;
- Team / Upgrades require tab selection;
- scenario event and win overlays intentionally block the HUD;
- fixture import tests previously assumed utility buttons were always visible.

Several workflow failures were therefore **test-harness navigation failures**, not compile failures.

Latest harness change:
- utility / fixture actions use forced clicks where test fixtures intentionally leave event/win overlays active.

Next session should:
1. inspect the newest Actions run on `codex/solar-release-hardening`;
2. if browser check is still red, fix only the remaining harness expectation unless a real UI bug is identified;
3. download the generated standalone artifact once green;
4. visually inspect the opening, 1024×768 laptop view and 1★ view;
5. have Rapha playtest the new HUD before further redesign.

## Important visual direction

Rapha specifically prefers the overall menu organisation shown in the supplied reference mockups:
- game world dominates;
- management dock at bottom;
- concise top status bar;
- objectives readable but not overwhelming;
- information appears contextually;
- navigation feels like a proper tycoon game.

Do **not** revert to the old long permanent right sidebar.

The references are inspiration for information architecture, not artwork to copy.

## Current recommended next step

Get the latest standalone browser artifact green, then give Rapha the playtest link. Do not add more systems before he has evaluated:
- viewport space;
- build navigation;
- Team / Upgrades / Finance tabs;
- selected-object inspector;
- top KPI hierarchy;
- whether the new UI feels closer to a polished management game.
