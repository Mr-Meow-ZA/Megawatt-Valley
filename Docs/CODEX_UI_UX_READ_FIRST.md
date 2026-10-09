# Codex — Read This Before UI/UX Work

**Date:** 2026-10-07  
**Status:** ACTIVE PRODUCT-OWNER INSTRUCTION

Before implementing or substantially modifying player-facing UI/UX, read:

1. `Docs/VISUAL_QUALITY_AND_WORLD_CHARACTER.md` — especially **Section 15: Approved UI/UX concept — v1**.
2. `Docs/CHATGPT_REVIEW.md` — latest 2026-10-07 product-owner decision.
3. `Docs/References/megawatt-valley-ui-ux-approved-concept-v1.jpg` if/when the approved concept image is present in the repository.

## Non-negotiable direction

- Retain the true-3D world as the current rendering/game-world foundation.
- The existing UI is **functional scaffolding, not a design reference**.
- Do **not** incrementally reskin the current UI or preserve its layout because it already exists.
- Rebuild UI/UX from a clean-sheet information architecture based on what the player needs to see, compare, understand and decide.
- The approved concept v1 is the current directional source of truth for visual language and interaction quality.
- Adapt the concept intelligently to real game data and technical constraints; do not reproduce fake mockup values blindly.
- World visibility matters: use progressive disclosure and contextual surfaces rather than permanently covering the 3D scene.
- Player-facing systems should feel like a premium management/tycoon game, not an admin console.

## Four approved anchor surfaces

1. Main gameplay HUD.
2. Solar build selection/comparison/details.
3. Technician/staff profile.
4. Research/technology tree.

Use these anchors to establish a reusable design system before proliferating one-off panels.

## Implementation approach

First inventory what game state/data already exists for each anchor surface. Then define reusable UI primitives/tokens and implement one coherent vertical slice at a time. Preserve simulation behavior unless UI work genuinely requires a data contract change. Keep automated tests and add interaction/regression coverage where practical.

Do not treat the current UI's styling, dimensions or component hierarchy as constraints.

## Product-owner update — 9 October 2026: professional artwork required

Rapha rejected the implemented character/menu artwork and still dislikes the UI/UX. The procedural busts and homemade pictograms are not an accepted quality baseline. For character and menu art, search for suitable commercially safe professional/community resources first; use generated actual artwork where needed. Do not return to low-quality primitive-shape stand-ins. Preserve the approved true-3D world and working simulation while improving the interface. A passing build or a generated asset alone does not establish visual acceptance: inspect the integrated screens and compare against Concept v1.
