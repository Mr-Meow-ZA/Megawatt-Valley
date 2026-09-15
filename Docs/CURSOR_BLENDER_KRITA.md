# Megawatt Valley — Cursor + Blender + Krita

**Status:** Research / recommendations — **not** locked pipeline law.  
**Date:** 2026-09-15  
**Agent:** Cursor  
**Audience:** Rapha (home PC art tools), Cursor sessions that touch art export, ChatGPT / Grok reviewing art-process scope.

Parent policy: hybrid assets in `Docs/PRACTICES_AND_PLANNING.md` §4 and `Docs/VISUAL_DIRECTION.md` (custom Blender + kits after hero corner). **Do not start this tooling track before Rapha accepts the grey-box loop and hero-corner timing.**

---

## 1. Verdict (short)

| Tool | Best Cursor use | Avoid |
| --- | --- | --- |
| **Blender** | MCP for blockout, naming, materials, export automation, viewport QA; Cursor also authors `.py` exporters checked into `Tools/` | Letting the agent freestyle final hero art without scale bible / poly budgets |
| **Krita** | Scripts/plugins for texture export & layer conventions; optional MCP for doc/layer/export; Cursor writes the Python | Expecting MCP to replace hand-painted style work or concept painting judgment |
| **Unity** | Import QA scene + URP materials remain the acceptance gate | Treating Blender/Krita preview as “done” |

**Recommended order for Megawatt Valley**

1. Keep grey-box / ProBuilder until S6 playtest acceptance.  
2. When V0→V1 starts: **Blender MCP (read + export tools first)** on the home PC.  
3. **Krita** for hand-painted / stylised albedo + simple packed maps via **scripts Cursor writes**, MCP only if export/layer chores dominate.  
4. Standardise **FBX (animated/staff) + optional GLB (static props)** into `Assets/_MegawattValley/Art/` with LFS.

---

## 2. Cursor ↔ Blender

### 2.1 How the bridge works

Community **Blender MCP** stacks (widely used: [ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp); forks / expansions exist) typically include:

1. A **Blender addon** that listens on localhost.  
2. An **MCP server** process (`uv` / `uvx` or a local venv).  
3. Cursor config in **user** or **project** `.cursor/mcp.json`.  
4. Blender sidebar **Connect** while both Editor and Cursor are running.

Capabilities commonly exposed:

- create / transform / delete objects;  
- materials and basic lighting;  
- scene introspection;  
- execute Blender Python;  
- viewport / render snapshots for agent self-check;  
- optional Poly Haven / Sketchfab / generative-mesh helpers (use carefully — licence + style drift).

### 2.2 Best practices for this project

**Do**

- Run Blender + MCP only on the **home PC** art machine (same as Unity playtest).  
- Prefer a **minimal / skill profile** if the MCP pack supports tool budgets — Cursor has practical limits on concurrent tools.  
- First sessions: **inspect + snapshot + export**, not mass delete.  
- Keep a Cursor-owned **export script** under `Tools/Blender/` (or `Assets/.../Editor` companion docs) that enforces: meters, applied scale, origin at base, −Y or Unity-forward convention documented once, UVs present, single root empty named `MWV_<AssetId>`.  
- Export into a staging folder, then copy into Unity with `.meta` discipline (never regenerate metas casually).  
- Use MCP to **batch rename, apply scale, check polycount, pack UVs, export FBX** against a checklist.  
- After export, open Unity import QA scene under the management camera — that is the real acceptance test.

**Don’t**

- Commit Blender MCP servers or `Library`-like caches into GitHub.  
- Point Cursor at Poly Haven / Sketchfab downloads as final Megawatt Valley identity without licence log + style pass (`Docs/THIRD_PARTY_ASSETS.md` when first pack lands).  
- Let generative 3D (Rodin / Hunyuan-style hooks) become the production source before the art bible exists — ideation only, same rule as VISUAL_DIRECTION.  
- Run two MCP clients against one Blender instance (Cursor + Claude Desktop) — connection conflicts are common.  
- Autopilot destructive ops (`delete all`, uncontrolled `execute_blender_code`) without Rapha watching the first sessions.

### 2.3 Unity handoff checklist (Blender → URP)

Before an asset is “done”:

| Check | Target |
| --- | --- |
| Units | 1 Blender unit = 1 meter |
| Pivot | Base centre / logical footprint centre for buildings |
| Forward | Document once and stick to it (Unity typically +Z forward for characters) |
| Tris budget | Placeholder until art bible; start conservative for solar tables / props |
| Materials | Slot names stable; URP Lit / simple stylised shader in Unity |
| Textures | Power-of-two; sRGB vs linear correct; no embedded megascans surprise |
| Colliders | Convex / box proxies in Unity, not dense mesh colliders |
| Format | **FBX** default for anything that may animate; **GLB** only if glTFast (or chosen importer) is an accepted package later |
| LFS | Track binary sources (`.blend` optional; exported FBX/PNG required) |

### 2.4 High-value Cursor prompts (Blender connected)

- “List scene roots, flag objects without applied scale, report tri counts.”  
- “Create a grey-box solar table matching our scale ref (human 1.8 m); name `MWV_SolarTable_Grey`.”  
- “Export selected as FBX to `ArtStaging/SolarTable/` with applied transforms.”  
- “Snapshot viewport from isometric-ish angle similar to our tycoon camera; summarise silhouette readability.”

### 2.5 Without MCP (still valid)

Cursor can:

- write Blender Python operators / export addons you paste or install once;  
- maintain scale / naming docs;  
- review `.blend` text extras / JSON sidecars if you add them;  
- drive **headless** `blender -b file.blend -P export.py` from a local shell on the PC.

MCP is faster for interactive blockout; scripts are more reproducible for CI-like export.

---

## 3. Cursor ↔ Krita

### 3.1 Reality check

Krita’s strength is **painting + layer structure**. Cursor’s strength is **Python plugins, naming conventions, and export automation**. Brush-skill art direction stays with Rapha (and later artists).

Two integration tiers:

| Tier | Mechanism | Best for |
| --- | --- | --- |
| **A — Scripts / plugins (recommended first)** | Cursor writes Krita Python (`from krita import *`), extensions, dockers; you run via Scripter or Plugin Manager | Texture export, layer templates, batch PNG, sprite sheets |
| **B — MCP bridge (optional)** | e.g. [dcc-mcp-krita](https://github.com/dcc-mcp/dcc-mcp-krita) (typed, no arbitrary Python exec) or community PaintBridge-style bridges | Doc create, layer tree ops, filters, export, canvas snapshot loops |

`dcc-mcp-krita` is notable for **safety**: fixed command catalog, localhost auth token, allowed file roots — better fit for a disciplined game pipeline than “run any Python.”

### 3.2 Best practices for this project

**Do**

- Define a **layer template** early (when textures start): e.g. `BaseColor`, `Mask_Wear`, `Overlay_JokeDecal`, optional packed `ORM` groups.  
- Prefer **hand-painted / flat stylised** maps over photoreal PBR until VISUAL_DIRECTION materials are locked.  
- Let Cursor generate a small **export plugin** that writes PNG (and later packed masks) into `ArtStaging/Textures/<AssetId>/`.  
- Keep master `.kra` in LFS or external art drive; commit exported PNG/TGA that Unity actually imports.  
- Use MCP later for repetitive “create doc at 2048, add layers, export” chores — not for inventing the visual identity.

**Don’t**

- Expect Cursor+MCP to produce final character illustrations unsupervised.  
- Mix unrestricted “execute Python” Krita bridges into the same trust level as Unity MCP without Rapha approval.  
- Export straight over Unity `Assets/` from Krita — stage first, then import, so `.meta` stays stable.

### 3.3 Texture → Unity checklist

| Check | Target |
| --- | --- |
| Colour space | Albedo sRGB; masks linear |
| Size | Start 512–1024 for props; hero up to 2K only when needed |
| Naming | `MWV_<Asset>_<Map>.png` |
| Atlas | Delay atlasing until modular kits exist |
| UI | Prefer UI Toolkit vector/USS later; Krita for icons only when language locked |

### 3.4 High-value Cursor prompts (Krita)

- “Write a Krita plugin that creates our MWV texture layer template and exports BaseColor PNG to a chosen folder.”  
- “Given this layer naming scheme, generate an export checklist markdown for artists.”  
- (With MCP) “Open staging template, verify layer names, export BaseColor, return file hash.”

### 3.5 Without MCP

Fully viable path for Megawatt Valley:

1. Rapha paints in Krita.  
2. Cursor maintains export scripts + naming docs in GitHub.  
3. Rapha runs export → drops files into Unity.  
4. Cursor wires materials / prefabs.

Adopt MCP only when export friction wastes sessions.

---

## 4. Combined art loop (target)

```text
VISUAL_DIRECTION / scale bible
        ↓
Blender grey-box or hero mesh  ←→  Cursor (MCP or -P scripts)
        ↓ export FBX/GLB
ArtStaging/  (not always in git)
        ↓
Unity import QA scene (tycoon camera)
        ↓
Krita textures / decals / signs  ←→  Cursor (plugin / optional MCP)
        ↓ PNG
Unity materials + prefab variant
        ↓
GitHub commit (meshes, textures, metas) + ACTIVITY_LOG
```

ChatGPT: style / readability review from screenshots.  
Grok: licence / third-party pack watch; QA checklists.  
Rapha: taste and acceptance.

---

## 5. Security & scope guards

- All DCC MCP bridges must stay on **127.0.0.1**.  
- Do not put secrets in repo MCP config.  
- Prefer **typed** Krita adapters over arbitrary code execution.  
- Blender `execute_blender_code` is powerful — treat like shell: approve carefully.  
- Cloud agents **cannot** drive your home Blender/Krita; this research is for **local Cursor on the PC**.  
- Do not add Blender/Krita MCP to the Unity cloud agent environment as a substitute for local art.

---

## 6. Suggested future session goals (only after playtest + art timing)

Unchecked ideas for ChatGPT to schedule later — **not** active now:

- **A0-01** — Install Blender MCP locally; read-only scene inspect + snapshot smoke test.  
- **A0-02** — Commit `Tools/Blender/export_mwv_fbx.py` with scale/naming rules.  
- **A0-03** — First hero-corner mesh (solar table or office) through Unity QA camera.  
- **A0-04** — Krita layer template + export plugin for BaseColor.  
- **A0-05** — Optional Krita MCP with allowed roots limited to `ArtStaging/`.

---

## 7. Open decisions for Rapha

1. Adopt Blender MCP at hero-corner time, or scripts-only first?  
2. FBX-only vs FBX + glTFast later?  
3. Krita scripts-first vs early MCP (`dcc-mcp-krita` vs PaintBridge-style)?  
4. Where do `.blend` / `.kra` masters live (repo LFS vs external art drive)?

Until decided, Cursor should not install DCC MCP into the Unity project or expand art scope past grey-box.
