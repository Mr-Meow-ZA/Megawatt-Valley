# Megawatt Valley — Current Status

## Status

**Grey-box miniature vertical slice is playable.**

Unity **6000.6.0f1** / URP. Session goals **S0-01 through S6-07** and **L1-01…L1-02** are done.

Open and Play: `Assets/_MegawattValley/Scenes/Prototype_Valley.unity`

Playtest focus list (what to check vs ignore): `Docs/PLAYTEST_CHECKLIST.md`  
Unity MCP (Cursor ↔ Editor): `Docs/UNITY_MCP_SETUP.md`

Includes: Sunny Slope Site A grey-box valley (hills, creek, access road, office compound, fenced plot), tycoon camera, solar build/place/demolish, cash + scenario tariff + MW + grid radius, day/night clock, sim speeds, equipment condition/faults, technician who auto-seeks faults, humorous event, joke sign, MW objective, UI Toolkit HUD, ScriptableObject balance data, save/load stub, and 28 EditMode tests.

Rapha accepted the grey-box loop on 2026-09-16 with a fix list. **2026-09-18 re-playtest** (via `Docs/PLAYTEST_CHECKLIST.md`): Focus list fully passed, including west-side `NO GRID` after the 14 m radius shrink. Feel/confusion items not flagged.

Badges earned: Foundation Online, Valley Explorer, First Foundations, First Megawatt Earned, Keeping the Lights On, Tiny Tycoon (and related celebration markers in `SESSION_GOALS.md`).

## Locked decisions so far

- Working game title: **Megawatt Valley**.
- Engine: **Unity 6000.6.0f1** (Unity 6.6) with **URP**.
- Primary implementation environment: **Cursor**.
- GitHub is the source of truth for project code and living project documents.
- ChatGPT remains actively involved in design, planning, review, balancing, research, architecture review, visual-direction review, and milestone definition.
- Strongest gameplay / tonal reference: the **Two Point** series, used as inspiration rather than something to copy.
- Game identity: humorous, character-driven renewable-energy tycoon / management game.
- Core loop: **DEVELOP → FINANCE → BUILD → OPERATE → EXPAND**.
- First major playable target: a **solar-only vertical slice**.
- Architecture should be data-driven where useful and keep simulation separate from visual presentation where practical.
- Avoid premature DOTS / ECS and avoid large speculative frameworks.
- The first complete scenario is currently called **Level 1 — Here Comes the Sun** as a working title.
- Long-term visual benchmark: a premium, colourful, stylised 3D isometric management-game presentation with warm scenic landscapes, readable renewable infrastructure, expressive staff, visible world activity, clean modern UI, humour, and strong screenshot-level polish.
- `Docs/VISUAL_DIRECTION.md` is the authoritative visual-direction document.
- The approved concept-art direction is a **long-term quality target**, not the required quality of the first playable prototypes.
- Development should follow: **prove the game → prove the visual language → build reusable art systems → scale content → polish**.
- Session-sized development goals are tracked in `Docs/SESSION_GOALS.md`.
- The normal work rhythm is: **choose one small goal → build it → play/test it → commit it → celebrate it → choose the next goal**.
- Cross-agent handoff lives in `Docs/COLLABORATION_GUIDE.md`. Cursor records meaningful sessions in `Docs/ACTIVITY_LOG.md` and keeps GitHub plus the Polaris project note current via local session hooks.

## Current Session-sized progress strategy

The project should never depend only on distant phase completion for a sense of progress.

Current first goals:

1. Finish Unity MCP connection on the home PC (`Docs/UNITY_MCP_SETUP.md` — Accept pending client in Unity)
2. `L1-03` bargain vs premium equipment as a meaningful build choice (extend existing SO defs — do not rebuild procurement)
3. Then `L1-04…L1-06` events / one-star clear / climax
4. ChatGPT can refresh review again after L1-03 if needed

Planning enrichment (Cursor, 2026-09-15): `Docs/PRACTICES_AND_PLANNING.md` — Cursor↔Unity practices, hybrid asset policy, ChatGPT/Grok assist patterns, ROADMAP crosswalk, proposed S6/L1 goals. Awaiting Rapha/ChatGPT acceptance of locked decisions listed there.

## Visual quality strategy

The project should not postpone every visual decision until late development, but it also must not spend months polishing art before the core game loop works.

The planned sequence is:

1. **Grey-box readability** — establish camera, zoom range, scale, roads, building footprints, solar-array readability, selection feedback, and UI composition.
2. **Style prototype / hero corner** — once the basic game loop is proven, create one small representative scene at roughly 60–70% of the intended final visual quality.
3. **Art bible and modular kits** — lock material language, scale guide, asset proportions, character direction, vegetation, UI language, and reusable environment kits.
4. **Level 1 art pass** — progressively replace grey-box content with production-quality terrain, infrastructure, buildings, props, vegetation, and vehicles.
5. **Characters and world activity** — add role-specific staff, animations, maintenance actions, vehicles, construction activity, and visual humour.
6. **UI / weather / VFX / audio integration** — bring the presentation layers together.
7. **Final polish benchmark** — Level 1 should eventually produce screenshots broadly comparable in warmth, readability, density, polish, and charm to the approved concept direction.

## Not yet locked

- Whether to stay on Unity 6.6 or move to a Unity 6 LTS label later.
- Final character design and exact character proportions.
- Exact colour palette and material specifications.
- Final asset-production pipeline and whether final assets are mainly custom, commissioned, purchased, kitbashed, or a mix.
- Exact first-map layout.
- Starting cash and detailed economy values.
- Exact solar project scale.
- Equipment catalogue and fictional brands.
- Final staff-stat model.
- Final event list.
- Final Level 1 climax.
- Exact star objectives and balancing values.
- Music / radio / audio direction.
- Final campaign geography and world structure.

## Next action

**Rapha:** finish Unity MCP Accept (`Docs/UNITY_MCP_SETUP.md`), then **L1-03** — bargain vs premium as a real build choice using existing ScriptableObject defs.

Do not start a major art pass until the grey-box loop feels fun.

## Review habit

After each meaningful session goal:

1. Rapha playtests / verifies the result.
2. Cursor records / commits what changed.
3. The completed session goal is marked `[x]` in `Docs/SESSION_GOALS.md`.
4. ChatGPT reviews the implementation or diff where useful.
5. Game-design, architecture, and visual-direction documents are updated if decisions changed.
6. The next smallest useful session goal is nominated.
