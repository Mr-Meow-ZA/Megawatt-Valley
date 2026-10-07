# Campus visual pass — desktop 0.4.1 candidate

Reference: [locked goal](DESKTOP_QUALITY_TARGET.md). Runtime validation pending at this commit.

## Changes
Original procedurally modelled office, open maintenance workshop, solar racks and fenced transformer compound replace generic production building/equipment silhouettes. Windows, door hardware, benches, planters, rooftop equipment, workshop tools, panel cells and supports explain each asset's function. Static geometry is instanced by material to control draw calls. Solar grime materials are independent per array.

The construction catalogue is a horizontal shelf with grouped categories, search, visual thumbnails and a selected-equipment comparison note. Staff and equipment inspectors remain contextual. Correct office and substation thumbnails are now generated.

## Assets
New campus geometry in src/three/models.ts is original project-authored code/art. No new third-party files, textures or licences were introduced. Existing Kenney CC0 source models remain bundled and existing attribution is preserved; vegetation still uses them. User inspiration attachments remain reference material and are not shipped.

## Validation planned
Model footprint/grounding and soiling isolation tests; existing full simulation/scenario tests; production compilation; actual UI gestures/search/laptop layouts and screenshot review; packaged Windows launch/save/resume checks.

## Remaining gaps
Reference-level character detail and animation, landscape depth, vehicle destinations and curated campus approaches still need work. The new assets and catalogue alone do not meet the complete visual target. Record actual evidence and issues in RESUME_CHECKPOINT.md.

## Follow-up
Fence runs now derive straight/corner geometry from adjacent fence/gate tiles; previews and demolition recalculate connections. Gate openings align to vertical runs. The starter apron shares the simulation's reserved-yard bounds; picnic furniture, parking lines and lamps are placed within clear usable areas. Crew gain rounded heads, helmets and bodies with reflective workwear; vans gain glazing, mirrors, handles and roof racks.
