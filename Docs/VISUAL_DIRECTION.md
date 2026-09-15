# Megawatt Valley — Visual Direction v0.1

## Status

**Approved long-term visual benchmark — 15 September 2026**

The concept-art direction reviewed during pre-production is now the long-term quality and presentation target for Megawatt Valley.

This is a destination, not the required quality of the first prototypes. Grey-box and placeholder stages are expected during development.

## North-star visual statement

Megawatt Valley should ultimately look like a premium, colourful, stylised 3D management / tycoon game viewed from an isometric-style freely navigable camera.

The world should feel warm, alive, optimistic, readable, humorous, and highly polished while keeping renewable-energy infrastructure recognisable and credible.

The visual target combines:

- colourful stylised 3D environments;
- strong readability from a management-game camera;
- warm natural lighting and attractive valleys / landscapes;
- slightly exaggerated but believable buildings and renewable-energy equipment;
- expressive small staff characters with readable silhouettes;
- miniature service vehicles, maintenance activity, construction activity, and environmental storytelling;
- clean modern management UI layered over the 3D world;
- renewable infrastructure that is technically recognisable without becoming visually industrial or sterile;
- scenic solar fields, substations, roads, offices, O&M workshops, transmission infrastructure, and eventually wind / BESS / hybrid assets;
- small humorous details and visual jokes that reward zooming in.

The player should be able to zoom out and understand the site immediately, then zoom in and discover character, activity, humour, and detail.

## Inspiration boundary

The Two Point series remains the strongest reference for accessibility, charm, humour, readability, and the feeling of watching a busy management world operate.

Megawatt Valley must not copy Two Point character designs, proportions, UI, buildings, props, animations, logos, writing, or other proprietary visual elements.

The objective is an original visual identity with similar strengths:

- approachable rather than intimidating;
- readable rather than cluttered;
- expressive rather than photorealistic;
- charming rather than sterile;
- detailed enough to feel premium without losing the toy-like management-game clarity.

## Target presentation characteristics

### Camera and composition

- Elevated isometric / three-quarter management camera.
- Smooth pan, zoom, and rotation.
- Readable silhouettes at normal gameplay zoom.
- Attractive screenshot composition should emerge naturally from ordinary gameplay.
- Camera distance, building scale, road width, character scale, and equipment exaggeration should be designed together.
- Avoid true-to-life scale where it damages gameplay readability.

### Environment

- Scenic valleys and regional landscapes form a major part of the game's identity.
- Terrain should feel crafted rather than like generic flat simulation terrain.
- Strong use of vegetation, rocks, water, hills, mountains, farms, roads, and local environmental details.
- Renewable assets should sit convincingly inside the landscape rather than feeling pasted onto a board.
- Different campaign regions should eventually have recognisable visual personalities.

### Renewable infrastructure

Infrastructure should be recognisable to people familiar with renewable energy while simplified enough for a broad audience.

Examples:

- solar arrays should clearly read as solar arrays even when stylised;
- substations should contain recognisable transformers, buswork, insulators, fencing, and gantries, but may use exaggerated spacing / scale;
- offices and O&M buildings should communicate their function visually;
- service roads, gates, fences, laydown areas, stores, workshops, vehicles, vegetation management, and signage should make sites feel operational;
- later wind turbines, BESS, control centres, and hybrid facilities must share the same visual language.

### Characters

Staff are a major visual pillar rather than decorative pedestrians.

Long-term characters should have:

- strong readable silhouettes;
- stylised proportions unique to Megawatt Valley;
- role-identifiable clothing and equipment;
- expressive body language;
- readable actions from normal gameplay zoom;
- humorous idle / task animations where appropriate;
- enough variation to make staff feel individual without requiring photorealistic faces.

Characters should visibly perform the work of the company: inspect equipment, clean panels, repair faults, drive vehicles, work in offices, monitor screens, carry tools, talk to colleagues, and react to events.

### Buildings

Buildings should sit between believable and playful.

The long-term benchmark includes:

- clean modern offices;
- visible interiors where useful;
- O&M workshops / garages;
- maintenance yards;
- research / training / command-centre spaces later;
- rooftop solar and functional site details;
- landscaping and company branding;
- clear visual differentiation between functions.

Company growth should be visible through improving facilities and increasingly busy spaces.

### Lighting and atmosphere

Target look:

- warm, inviting daylight;
- strong but soft readable shadows;
- attractive dawn / late-afternoon conditions where appropriate;
- weather that meaningfully changes the mood of the scene;
- clouds, storms, rain, dust, wind, heat, and other conditions readable from gameplay view;
- visual polish without sacrificing performance or clarity.

The game should still look attractive during adverse weather, not only under perfect blue skies.

### UI

The final UI should feel like part of the same polished product as the 3D world.

Target characteristics:

- clear top-level economy / generation / staff / time information;
- clean build categories and recognisable icons;
- objectives and alerts visible without covering the world;
- modern rounded / friendly forms where appropriate;
- strong typography and hierarchy;
- restrained use of colour for status and interaction;
- renewable-energy flavour without looking like industrial SCADA software;
- scalable presentation from ordinary gameplay to more advanced portfolio management.

The UI shown in concept art is directional only. Exact layout, branding, icons, values, and information architecture are not locked.

## Humour in the world

Humour should also exist visually rather than only in event text.

Possible examples:

- ridiculous safety / motivational signs;
- staff reacting dramatically to mundane faults;
- peculiar vendor equipment branding;
- wildlife appearing around sites;
- an employee using an obviously improvised repair method;
- an over-engineered coffee area at the O&M office;
- a technician staring suspiciously at an inverter;
- landscaping or office decorations that reflect staff personality;
- visual consequences after events.

The world should reward players who pause and zoom in.

## Technical direction for achieving the target

The approved target affects technical decisions from the beginning, even though final art production comes later.

### Rendering baseline

- Unity 6 LTS.
- Universal Render Pipeline (URP) unless a future documented test justifies a change.
- Stylised physically based materials rather than photorealism.
- Consistent art-friendly lighting and post-processing pipeline.
- Avoid rendering architecture that assumes flat grey-box visuals forever.

### Scale standardisation

Before producing large numbers of final assets, create a documented scale reference containing:

- human character;
- car / pickup;
- maintenance van;
- office door;
- road lane;
- fence;
- solar table;
- inverter / container;
- transformer;
- representative building module.

This prevents inconsistent proportions when assets are produced over time or by different tools / artists.

### Modular asset strategy

Final-quality environments should be assembled from reusable kits where practical:

- office modules;
- industrial / O&M modules;
- fences and gates;
- roads and paths;
- solar components;
- substation components;
- vegetation sets;
- landscaping props;
- signs and decals;
- vehicles;
- utility props.

Unique hero assets can then sit on top of those reusable systems.

### Simulation / presentation separation

Simulation remains separate from presentation.

A solar plant may be simulated as a small number of logical systems while being represented visually by many panels, workers, vehicles, effects, and animations.

This is essential for reaching a rich visual target without making gameplay calculations depend on thousands of individual decorative objects.

## Visual production roadmap

### V0 — Grey-box readability

Occurs during early gameplay phases.

Goal:

- prove camera angle;
- prove zoom range;
- establish world scale;
- prove building / road / solar-array readability;
- establish selection feedback and basic UI placement.

Art quality is irrelevant here. Composition and interaction are not.

### V1 — Style prototype / hero corner

Before mass art production, build one small representative scene to approximately 60–70% of the intended final style.

Suggested contents:

- one small office;
- one workshop;
- one solar-array section;
- one simplified substation;
- one service road;
- one vehicle;
- one technician character;
- representative vegetation;
- representative UI panel;
- target lighting.

Purpose:

- validate that the target look is achievable in Unity;
- establish materials, colour language, lighting, proportions, and performance expectations;
- prevent production of dozens of assets in the wrong style.

This is a major visual go / change / rethink checkpoint.

### V2 — Art bible and reusable kits

Once V1 is approved, document:

- colour palette / ranges;
- material rules;
- edge softness / bevel standards;
- texture-density expectations;
- prop-detail levels;
- scale guide;
- character proportion guide;
- vegetation language;
- signage language;
- UI visual system;
- LOD / optimisation rules.

Then produce modular asset kits.

### V3 — Level 1 environment pass

Replace grey-box Level 1 assets progressively:

- terrain and landscape;
- roads and boundaries;
- solar infrastructure;
- electrical infrastructure;
- buildings;
- props;
- vehicles;
- vegetation;
- site dressing.

Do not require every asset to be final before playtesting continues.

### V4 — Characters and world activity

Introduce:

- final character direction;
- role variations;
- navigation polish;
- task animations;
- vehicles in motion;
- construction activity;
- maintenance activity;
- idle behaviour;
- environmental humour.

### V5 — UI / effects / weather / audio integration

Bring presentation systems together:

- polished UI;
- status overlays;
- alerts;
- weather;
- particles / VFX;
- construction effects;
- fault feedback;
- audio feedback;
- music / radio direction;
- camera polish.

### V6 — Final polish benchmark

The Level 1 vertical slice should eventually be able to produce screenshots broadly comparable in quality, clarity, warmth, density, and charm to the approved concept-art benchmark.

This does **not** mean reproducing the concept image literally. The benchmark defines quality and feeling, not exact geometry or UI layout.

## Art acquisition / creation options

The project should remain flexible about how final assets are produced.

Potential sources include:

- custom Blender modelling;
- high-quality commercial Unity / 3D asset packs used as a base;
- commissioned character / environment art;
- procedural or parametric tools;
- AI-assisted concept generation for ideation, not as an uncontrolled source of inconsistent production assets;
- internally modified / kitbashed assets with appropriate licences.

**Tooling note (recommendation):** Cursor can assist Blender (MCP or export scripts) and Krita (Python export plugins; optional typed MCP) on the home PC. See `Docs/CURSOR_BLENDER_KRITA.md`. This does not change the prove-game → hero corner → kits sequence.

A later art-pipeline decision should evaluate time, budget, consistency, licensing, and maintainability before mass production.

## Quality rule

Do not confuse **placeholder quality** with **target quality**.

Early grey-box visuals are an implementation stage only. Conversely, do not spend months polishing art before the core game loop is proven.

The development sequence is:

**prove the game → prove the visual language → build reusable art systems → scale content → polish.**

## Current approved target

The approved visual target is the polished isometric Megawatt Valley concept direction reviewed by Rapha on 15 September 2026: colourful valley setting, stylised renewable infrastructure, busy staff and service activity, clean management UI, warm lighting, attractive landscaping, strong readability, and a premium humorous management-sim finish.

Future visual proposals should be compared against this north star rather than drifting toward photorealism, generic mobile-game art, harsh industrial simulation visuals, or flat low-detail placeholders as a final style.
