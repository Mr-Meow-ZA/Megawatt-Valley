# Megawatt Valley — Current Status

## Status

**Functional grey-box Level 1 thin slice is complete; project is entering the Engagement & Progression Proof.**

Unity **6000.6.0f1** / URP. Session goals **S0–S6** and **L1-01…L1-08** are complete.

Open and Play: `Assets/_MegawattValley/Scenes/Prototype_Valley.unity`

Includes: Sunny Slope Sites A+B, premium vs bargain equipment, five-event deck + hail climax, 1★/2★/3★ goals, day deadline, tariff economy, technician behaviour, HUD stars, save stub v2 and EditMode tests.

## Current product finding

The prototype now proves that the major systems can function together.

It does **not yet prove that Level 1 is fun enough as a full management-game experience**.

Rapha's current design direction is to strengthen the first level around:

- constant short / medium-term purpose;
- visible unlocks and rewards;
- capability progression;
- new responsibilities arriving as old chores become easier;
- manual → staff-assigned → scheduled → automated progression;
- a long-term Company Capability Tree covering technology, operations, automation, people, grid and commercial capability.

The authoritative progression design is now:

`Docs/PROGRESSION_AND_ENGAGEMENT.md`

## Locked decisions so far

- Working game title: **Megawatt Valley**.
- Engine: **Unity 6000.6.0f1** with **URP**.
- GitHub is the source of truth; ChatGPT reviews via pushed HEAD.
- Cursor remains the primary Unity implementation AI.
- Solar-only vertical slice first; Two Point is a design / tone reference only.
- `Docs/VISUAL_DIRECTION.md` remains the long-term visual north star.
- The functional Level 1 thin slice is not sufficient by itself to start mass art production.
- Before Hero Corner, complete the **Engagement & Progression Proof**.
- Once the Engagement Gate passes, Hero Corner begins and gameplay/content + visual production can increasingly proceed in parallel.
- Progression should favour capability changes and new management verbs over small percentage-only bonuses.
- Repetitive responsibilities should become easier / delegated / automated before they become boring.

## Current session-sized strategy

New track: **E1 — Engagement & Progression Proof** in `Docs/SESSION_GOALS.md`.

The first proof deliberately stays small:

1. **E1-01 — First capability unlock**
2. **E1-02 — Earn automatic technician dispatch**
3. **E1-03 — Dirt actually matters**
4. **E1-04 — First cleaning upgrade**
5. **E1-05 — Objective ladder**
6. **E1-06 — First capability choice**
7. **E1-07 — Unlocks feel rewarding**
8. **E1-08 — Engagement playtest**
9. **E1-09 — Engagement gate**

## Next action

**Cursor task:** GitHub issue **#5 — E1-01 First capability unlock (Radio Dispatch)**  
**Implementation brief:** `Docs/CURSOR_ENGAGEMENT_IMPLEMENTATION_BRIEF.md`

**E1-01 — First capability unlock**

Implement only the minimum capability-state model and UI needed to show that:

- a capability can be locked;
- the player can see what they are working toward;
- an objective can unlock it;
- the unlocked state can change gameplay.

Do **not** build the complete future research tree yet.

The first practical progression chain should reuse existing systems:

**manual fault dispatch → earn Radio Dispatch → automatic technician fault response**

After that, introduce simple soiling / cleaning progression.

## Visual timing

Do not wait until every mechanic in the game exists before improving visuals.

However, do not launch a broad art-production pass yet.

Sequence:

**functional systems ✅ → engagement/progression proof → Hero Corner → gameplay + visuals continue together**

The Hero Corner remains the first serious visual-quality milestone.
