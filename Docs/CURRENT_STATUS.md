# Megawatt Valley — Current Status

## Status

**Phase 0: Pre-production / Foundation**

The GitHub repository has been created and seeded with the initial game vision, architecture, development roadmap, Level 1 vertical-slice concept, and AI-assisted development workflow.

## Locked decisions so far

- Working game title: **Megawatt Valley**.
- Engine: **Unity**.
- Primary implementation environment: **Cursor**.
- GitHub is the source of truth for project code and living project documents.
- ChatGPT remains actively involved in design, planning, review, balancing, research, architecture review, and milestone definition.
- Strongest gameplay / tonal reference: the **Two Point** series, used as inspiration rather than something to copy.
- Game identity: humorous, character-driven renewable-energy tycoon / management game.
- Core loop: **DEVELOP → FINANCE → BUILD → OPERATE → EXPAND**.
- First major playable target: a **solar-only vertical slice**.
- Architecture should be data-driven where useful and keep simulation separate from visual presentation where practical.
- Avoid premature DOTS / ECS and avoid large speculative frameworks.
- The first complete scenario is currently called **Level 1 — Here Comes the Sun** as a working title.

## Not yet locked

- Exact Unity 6 LTS minor version.
- Final art direction and character design.
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

Create the Unity project locally and connect it to this repository.

Then complete **Phase 0 — Foundation** from `Docs/ROADMAP.md` before beginning the first playable world / camera work.

The first implementation milestone after setup should remain extremely small:

> Open a grey-box Unity scene and establish a clean, comfortable tycoon-style camera and selectable test site.

Do not begin building the full solar simulation until the project foundation and basic world interaction are stable.

## Review habit

After each meaningful milestone:

1. Rapha playtests the Unity build.
2. Cursor records / commits what changed.
3. ChatGPT reviews the implementation or diff where useful.
4. Design and architecture documents are updated if decisions changed.
5. The next smallest useful milestone is defined.
