# Megawatt Valley — Asset Acquisition & Usage Policy v1.0

## Status

**Approved project policy — 18 September 2026**

For the Hero Corner and the full first production version of Level 1, Megawatt Valley will use **free and community assets as much as practical**.

The objective is to reach a complete, attractive, coherent and playable Level 1 quickly without spending early development time modelling every object from scratch.

Major original / custom asset production is deliberately deferred until the game, Level 1 content, visual language and production needs are better understood.

---

# 1. Core policy

The preferred order for Level 1 assets is:

1. **Commercially safe free / community asset**
2. **Free / community asset modified in Blender / Krita to fit Megawatt Valley**
3. **Kitbash several licensed assets into a coherent game asset**
4. **Low-cost paid asset only when it clearly saves significant time**
5. **Custom / original asset only when no suitable sourced option exists or when a later identity pass justifies it**

Do not spend days modelling an object that can be represented well by a safe, suitable community asset during Level 1 production.

---

# 2. What this means for the Hero Corner

Hero Corner is still required, but its purpose changes slightly.

Hero Corner should prove:

- the target lighting;
- scale and proportions;
- material treatment;
- colour language;
- vegetation density;
- camera composition;
- UI relationship to the world;
- whether mixed-source assets can be unified into a coherent Megawatt Valley look.

Hero Corner **does not require original custom modelling**.

It may use sourced assets for:

- office / workshop;
- solar equipment;
- vehicle;
- vegetation;
- fencing;
- roads;
- industrial props;
- furniture;
- character placeholder / candidate;
- utility equipment.

Blender / Krita may be used to:

- simplify geometry;
- change proportions;
- recolour / retexture;
- combine modules;
- remove unwanted detail;
- create LOD-friendly variants;
- apply consistent bevels / edge treatment;
- adapt pivots / origins;
- standardise scale;
- replace branding;
- create Megawatt Valley signs / decals;
- make separate sourced assets look like one visual family.

The Hero Corner is therefore a **style-unification proof**, not a custom-asset-production test.

---

# 3. Level 1 asset strategy

For the full first Level 1, source community / free assets aggressively for:

## Environment
- trees;
- grass;
- bushes;
- rocks;
- terrain dressing;
- water / creek props;
- distant landscape objects;
- roads / curbs / barriers;
- generic fences / gates.

## Site infrastructure
- containers;
- workshops;
- offices;
- industrial sheds;
- transformers;
- cabinets;
- electrical props;
- cable drums;
- barriers;
- cones;
- pallets;
- crates;
- bins;
- lights;
- security equipment.

## Vehicles
- pickups;
- maintenance vans;
- utility vehicles;
- trailers;
- small plant / machinery where appropriate.

## Office / O&M props
- desks;
- chairs;
- monitors;
- lockers;
- shelving;
- tools;
- workshop props;
- coffee areas;
- noticeboards;
- generic furniture.

## Characters / animation
Community characters and animation libraries may be used for Level 1 if their licences are safe and they can be visually adapted enough to avoid looking like an unrelated asset pack.

## Renewable equipment
Solar panels, trackers, inverters, substations and similar equipment may initially use sourced models.

Technical recognisability matters more than exact manufacturer realism.

Where a sourced model is visually inconsistent, simplify / modify it rather than automatically replacing it with a custom model.

---

# 4. Assets we should avoid

Do not use:

- assets ripped from commercial games;
- copyrighted models redistributed without clear permission;
- assets with unknown / ambiguous licences;
- non-commercial licences for a game intended to become commercial;
- editorial-only assets;
- models whose licences prohibit modification if modification is necessary;
- trademarked branding that would create unnecessary legal / visual dependency;
- asset packs that impose a clearly conflicting art style that cannot reasonably be unified;
- excessively high-detail assets that are difficult to optimise for a management-camera game.

If licence status cannot be established, do not import the asset into the production project.

---

# 5. Preferred licences

Best:

- **CC0 / Public Domain**
- clear licence explicitly allowing commercial game use and modification

Usually acceptable with compliance:

- **CC BY** where attribution requirements can be met;
- marketplace / author licences that explicitly allow commercial games and derivative use.

Use caution / normally reject:

- **CC BY-NC / Non-Commercial**
- **CC BY-ND / No Derivatives** where modifications are needed;
- unclear custom licences;
- “free download” with no actual licence.

“Free” is not the same as “safe to ship.”

---

# 6. Asset provenance register

Every third-party asset that survives beyond temporary experimentation must be recorded.

Create / maintain:

`Docs/ASSET_REGISTER.md`

Each entry should record at least:

- asset / pack name;
- creator;
- source URL;
- licence;
- date obtained;
- whether attribution is required;
- original or modified;
- files / folder where used;
- notes about permitted commercial use;
- planned replacement status if applicable.

If an asset's licence requires attribution, preserve the exact attribution text.

Temporary test assets can initially be marked **TEMP**, but must either be registered or removed before a milestone build is shared externally.

---

# 7. Project folder convention

Third-party source assets should be identifiable.

Suggested pattern:

```
Assets/_MegawattValley/
    Art/
        ThirdParty/
            Environment/
            Vegetation/
            Vehicles/
            Characters/
            Infrastructure/
            Props/
        Modified/
        Original/
```

Do not mix unmodified third-party source files invisibly into original asset folders.

A modified version may live under `Modified/`, while provenance remains recorded in `ASSET_REGISTER.md`.

Exact folder layout may be adjusted by Cursor if current project organisation makes another arrangement cleaner.

---

# 8. Visual consistency pass

A sourced asset is not automatically ready simply because it is technically usable.

Before accepting it into the Level 1 visual set, check:

- scale;
- silhouette readability;
- polygon density;
- material complexity;
- texture resolution;
- colour saturation;
- edge / bevel language;
- pivot / origin;
- collider suitability;
- LOD needs;
- URP compatibility;
- naming;
- branding / logos;
- management-camera readability.

The objective is for players to see **Megawatt Valley**, not a collage of asset packs.

---

# 9. Blender's role

Blender is a production tool even though original modelling is deferred.

Expected Level 1 uses:

- resize / rescale;
- fix pivots;
- clean topology;
- simplify meshes;
- merge / separate meshes;
- alter proportions;
- remove branded details;
- kitbash;
- make simple variants;
- UV cleanup;
- create low-poly / LOD variants;
- adapt material slots;
- create basic custom connectors / adapters when needed;
- prepare exports for Unity.

Cursor may assist with Blender workflows / scripts where useful.

The default question should be:

> “Can we adapt an existing safe asset in 30 minutes instead of modelling this from zero?”

---

# 10. When original / custom assets begin

Major original/custom asset production is intentionally deferred until **after the full Level 1 is built and playable with sourced assets**, unless a specific sourced-asset gap blocks the game.

Later custom work should target the assets with the highest identity / visibility value.

Likely candidates eventually include:

- signature staff characters;
- main HQ / office architecture;
- distinctive O&M buildings;
- key renewable equipment silhouettes;
- hero vehicles;
- fictional manufacturer branding;
- special event props;
- major campaign landmarks;
- UI iconography / branding;
- assets repeatedly used across many levels.

The existing sourced Level 1 then becomes a very useful specification for what is actually worth replacing.

---

# 11. Replacement philosophy

Do not assume every sourced asset will eventually be replaced.

If a community asset:

- looks good;
- fits the visual language;
- has a safe licence;
- performs well;
- is not recognisably tied to another game / brand;

it may remain in the shipped game.

Custom production should be driven by **identity, quality or gameplay need**, not by a rule that every external asset must disappear.

---

# 12. Cost philosophy

Level 1 default budget for assets is:

**R0 wherever practical.**

Paid assets can be considered later when:

- there is no good free alternative;
- the licence is clear;
- it saves substantial development time;
- it can be adapted to the Megawatt Valley style;
- Rapha approves the purchase.

Do not accumulate asset-store purchases speculatively.

---

# 13. Cursor responsibilities

When sourcing or importing assets, Cursor should:

1. prefer free / community assets;
2. verify licence suitability before treating an asset as production content;
3. record durable third-party assets in `Docs/ASSET_REGISTER.md`;
4. keep source attribution / licence information;
5. import only what is needed;
6. avoid enormous packs when only one or two assets are required where practical;
7. standardise scale / materials / naming;
8. flag questionable licence terms to Rapha / ChatGPT;
9. avoid custom modelling unless the active task genuinely needs it;
10. use Blender modification / kitbashing before choosing a from-scratch model where sensible.

---

# 14. Grok / ChatGPT support

Grok Bot can help:

- find candidate free assets;
- research licence terms;
- compare asset options;
- identify missing asset categories;
- create shortlists.

ChatGPT can help:

- review visual fit;
- review licence / provenance documentation;
- decide which assets are worth modifying;
- compare options against `VISUAL_DIRECTION.md`;
- determine when a custom asset is actually justified.

Cursor remains the main implementation / Unity integration owner.

---

# 15. Level 1 success condition

Level 1 does **not** need custom art to be considered a successful first production level.

It needs:

- coherent visual quality;
- readable infrastructure;
- attractive environment;
- consistent style;
- good performance;
- clear licensing;
- enough polish that the experience feels like a real game.

Original/custom asset work becomes the next quality / identity layer once we know exactly what the game needs.
