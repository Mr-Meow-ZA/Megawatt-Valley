# Play Megawatt Valley — autonomous Level 1
Open the latest successful [Solar release workflow](https://github.com/Mr-Meow-ZA/Megawatt-Valley/actions/workflows/solar-release.yml), download **PLAY-MEGAWATT-VALLEY**, unzip, and open **PLAY-MEGAWATT-VALLEY.html** in desktop Chrome or Edge. No install, editor, server, or network is needed after download. GitHub requires login to download private artifacts; artifacts expire after 30 days and the workflow can rebuild them.

## Playing
Follow the top-left objectives. Build another array on Site A, add inverter capacity
as needed, select faulty equipment and dispatch your technician. Radio Dispatch
automates later repairs. Order panel cleaning, expand across the river and choose
your first operational capability. Prepare for the hail warning. One star completes
Here Comes the Sun; two and three stars remain available.

Drag the world to pan, use the mouse wheel to zoom, and choose speed at top right.
Select an object for details/actions. The right sidebar scrolls to staff, finance
and capabilities. Bottom controls provide save/load, restart and sound.

Saves are automatic and browser-local. Keep the HTML at the same path, and use
**Export save** for a durable portable backup. **Import save** restores that JSON
in another browser or newer build. Private browsing may discard local saves.

## Development
This branch extends the independent Phaser/TypeScript implementation from PR #7.
Unity is untouched. `npm ci`, `npm test`, `npm run build`, and
`node scripts/package-playable.mjs` reproduce the build.
See [release log](Docs/AUTONOMOUS_RELEASE_LOG.md) for scope, test evidence and limitations.
