# Megawatt Valley — Third-Party Asset Register

## Purpose

Record every third-party asset that survives beyond temporary experimentation.

Policy: `Docs/ASSET_POLICY.md`.

## Rules

- Verify commercial-use rights before treating an asset as production content.
- Preserve attribution text where required.
- If licence status is unclear, do not use the asset in a milestone / release build.
- Mark temporary experiments as **TEMP** until accepted or removed.
- Record modified derivatives as well as their original source.

## Register

| Status | Asset / Pack | Creator | Source URL | Licence | Attribution Required | Modified? | Project Location / Use | Date Obtained | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CANDIDATE | Kenney isometric + city/nature/UI packs (batch) | Kenney | https://kenney.nl · https://github.com/KenneyNL | CC0 | No (appreciated) | No | `public/assets/sourced/` — see `INVENTORY.md` | 2026-09-29 | Phaser Level 1 candidate art. Includes iso landscape/city/buildings/roads, nature kit, city-kit industrial (solar GLB+PNG previews), pixel vehicles, characters, game icons. Not yet wired into runtime. |

## Desktop UI asset pass — 9 October 2026

| Status | Asset | Creator | Source | Licence / provenance | Attribution | Modified | Location | Date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INTEGRATED, agent visual review complete; product acceptance pending | Phosphor duotone subset | Phosphor Icons | https://github.com/phosphor-icons/core | MIT | Licence notice included | SVG wrapper only | src/ui/studio/phosphor.ts | 2026-10-09 |
| INTEGRATED, agent visual review complete; product acceptance pending | Five staff portraits and eight menu illustrations | OpenAI image generation for Megawatt Valley | Generated in development session | Original AI-generated project artwork; not a third-party asset pack | Generated provenance retained | Runtime display/cropping only | public/assets/game/portrait_*.png and ui_menu_atlas.png | 2026-10-09 |

Detailed sources, selection decisions and distribution credits: [UI asset provenance](UI_ASSET_PROVENANCE.md).

## Runtime inventory check — 9 October 2026
Kenney City Kit Industrial is already **v2.0**, verified from its vendored CC0 licence. Do not download a duplicate upgrade based on the historical candidate table. The eight-template manifest includes Industrial and Nature meshes, but purchased solar/office/workshop/grid currently use original code-built geometry. See [audit](ASSET_AUDIT_2026-10-09.md) for exact files, provenance distinctions and the proposed controlled comparison. Preserve the detailed legacy PNG/SVG credits when consolidating registers.
