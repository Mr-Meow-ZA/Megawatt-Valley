# Play Megawatt Valley — autonomous Level 1
Open the latest successful [Solar release workflow](https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/workflows/solar-release.yml), download **PLAY-MEGAWATT-VALLEY**, unzip, and open **PLAY-MEGAWATT-VALLEY.html** in desktop Chrome or Edge. No install, editor, server, or network is needed after download. GitHub requires login to download private artifacts; artifacts expire after 30 days and the workflow can rebuild them.

## Playing
Follow the top-right objectives. Build another array on Site A, add inverter capacity
as needed, select faulty equipment and dispatch your technician. Radio Dispatch
automates later repairs. Order panel cleaning, expand across the river and choose
your first operational capability. Prepare for the hail warning. One star completes
Here Comes the Sun; two and three stars remain available.

Drag the world to pan, use the mouse wheel to zoom, and choose speed at top right.
Select an object for details/actions; × closes its inspector. The compact bottom
bar opens **Build, Staff, Upgrades, Finance, Events, Operations or Contracts**, one drawer at a time.
Tools start closed. Click the active tool again, or the arrow, to close it.
**B** toggles Build; **T** toggles Staff. Build has large equipment cards, search,
category filters and arrows to browse the nine implemented items.

Click a worker in the park, or **Inspect** in Staff, to open their character
profile. The portrait appears only in that selected profile. It shows the actual
role, skill, task, trait and wage, with Find, Train and Dismiss actions. Training costs $800 and takes four park hours after the current job. Work zone and Duty controls assign sites and suitable jobs. Energy recovers while idle; tired crew finish their job, then rest.
Staff management provides hiring, search, role filters and name/skill/task sorting.
**Esc** cancels placement first, then clears selection, then closes tools.
Switching away from Build cancels placement. Events shows actual weather/notices;
urgent faults and event decisions appear when they need attention.
Click a fault/dust alert to select and find the equipment. Click the minimap to
centre the camera. Its home button, or Enter/Home while the map is focused,
returns home. **H** restores the home view; **F** finds the selected object.
**Shift-click** a valid tile to place equipment and keep building the same kind.

**Upgrades → Open tech tree** (or **U**) opens nine working research upgrades.
Choose a branch and pay to start one project. It advances with park time; pausing
or an event pauses research. Available idle engineers assist; assigning an engineer to Office research doubles their assistance. Training and breaks interrupt assistance.
**Esc** closes the tree. Finance shows clipping, capacity and exact star requirements.

The top-right gear menu provides save/load, restart, portable saves and sound.
Loaded/imported companies start paused so you can inspect before pressing Play.

For faster experimentation, open **Finance → Playtest cheats** for cash grants
or a positive event. Ctrl+Shift+M adds $25,000; Ctrl+Shift+G triggers a grant.

Saves are automatic and browser-local. Keep the HTML at the same path, and use
**Export save** for a durable portable backup. **Import save** restores that JSON
in another browser or newer build. Private browsing may discard local saves.

## Operations and progression

**Operations** shows active and queued jobs. Busy crew retain orders; Cancel removes
unstarted manual orders. Queue all dirty arrays or worn arrays, or select equipment
for individual orders. Service costs $450 when a crew starts and restores condition.
Scheduled Cleaning offers 20/35/50% dust thresholds. Predictive Diagnostics unlocks
preventive service below 85% condition while retaining a $1,500 reserve.

Road access within 2.5 tiles of the front service edge makes travel faster. Workshops
within eight tiles on the same site speed repairs. Bridge journeys take longer;
local crew and grouped arrays make River Bench easier to operate.

**Contracts** offers optional supply deliveries. Check the deadline, deposit and
quality requirements before accepting. Only actual qualifying exports count; sales
continue normally. Nights use deadline time; pausing and event decisions freeze it.
Success returns your deposit and pays a bonus. Expiry/cancellation loses only the
deposit. There is a 12-park-hour renewal break.

The objective guide suggests your next useful decision. **Finance** lists every
award requirement; **Operations** tracks stable daylight operation. Two stars need
six stable daylight hours; three need twelve, 85% fleet condition, two researched
technologies and a crew member at skill 2, alongside the output/tool/storm goals.
Nights pause stability; daytime outages or excessive dust/curtailment reset it.
Skipping hail preparation can be recovered through repairs and service.

## Development
This branch extends the independent Phaser/TypeScript implementation from PR #7.
Unity is untouched. `npm ci`, `npm test`, `npm run build`, and
`node scripts/package-playable.mjs` reproduce the build.
See [release log](Docs/AUTONOMOUS_RELEASE_LOG.md) for scope, test evidence and limitations.
