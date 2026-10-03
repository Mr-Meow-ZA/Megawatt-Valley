import { build } from 'esbuild';
import { readFile, readdir, mkdir, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
const assets = {};
for (const file of await readdir('public/assets/game')) {
  if (!file.endsWith('.png')) continue;
  const bytes = await readFile(path.join('public/assets/game',file));
  if (bytes[0] !== 137 || bytes[1] !== 80) throw new Error('Missing LFS image: '+file);
  assets[file.slice(0,-4)] = 'data:image/png;base64,' + bytes.toString('base64');
}
const vectorAssets = {};
for (const file of await readdir('public/assets/low-poly')) {
  if (!file.endsWith('.svg')) continue;
  const svg = await readFile(path.join('public/assets/low-poly',file),'utf8');
  if (!svg.startsWith('<svg ')) throw new Error('Invalid rendered sprite: '+file);
  vectorAssets[file.slice(0,-4)] = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}
const output = await build({
  entryPoints:['src/main.ts'], bundle:true, minify:true, format:'iife', target:'es2022', write:false,
  plugins:[{
    name:'embed-ui-images',
    setup(builder) {
      builder.onLoad({filter:/\.ts$/}, async (args) => {
        if (!args.path.includes(path.sep+'src'+path.sep)) return;
        const source = await readFile(args.path,'utf8');
        return { loader:'ts', contents:source.replace(/\/assets\/game\/([a-zA-Z0-9_]+)\.png/g,(url,key)=>assets[key]??url) };
      });
    }
  }]
});
const css = (await readFile('src/styles.css','utf8')) + '\n' + (await readFile('src/ui/referenceHud.css','utf8'));
const js = output.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Megawatt Valley — Here Comes the Sun</title><style>'+css+'</style></head><body><div id="app"><div id="game-root"></div><div id="ui-root"></div></div><script>window.__MW_ASSETS__='+JSON.stringify(assets)+';window.__MW_VECTOR_ASSETS__='+JSON.stringify(vectorAssets)+';</script><script>'+js+'</script></body></html>';
await mkdir('playable',{recursive:true});
await writeFile('playable/PLAY-MEGAWATT-VALLEY.html',html);
await copyFile('Docs/ASSET_REGISTER_PHASER.md','playable/ASSET-CREDITS.md');
await mkdir('playable/licenses',{recursive:true});
for (const name of ['phaser','eventemitter3']) {
  const dir = path.join('node_modules',name);
  const licence = (await readdir(dir)).find((file)=>/^licen[sc]e(\.|$)/i.test(file));
  if (!licence) throw new Error('Missing distribution license: '+name);
  await copyFile(path.join(dir,licence),'playable/licenses/'+name+'-LICENSE.txt');
}
for (const [pack,name] of [['kenney-city-kit-industrial','Kenney-Industrial-CC0.txt'],['kenney-nature-kit','Kenney-Nature-CC0.txt']]) {
  await copyFile(path.join('public/assets/sourced',pack,'License.txt'),path.join('playable/licenses',name));
}
await writeFile('playable/licenses/ORIGINAL-ASSETS.txt','Rendered solar/building/nature sprites derive from CC0 Kenney City Kit Industrial and Nature Kit meshes; their licenses are included alongside this file. Palette, cell patterns and projection were adapted for Megawatt Valley. Original code-generated landscape, mountains, staff uniforms, meadow, sand, water, road, rock and sign textures, vector staff portraits, weather illustrations and synthesized audio were added for this autonomous build. Existing Kenney and domsson assets retain their CC0 provenance in ASSET-CREDITS.md.\n');

await writeFile('playable/READ-ME.txt',"MEGAWATT VALLEY — HERE COMES THE SUN\n\nOpen PLAY-MEGAWATT-VALLEY.html in Chrome or Edge. No install, server or internet required.\nDrag to pan; wheel to zoom. The bottom toolbar opens Build, Staff, Upgrades, Finance, Events, Operations or Contracts, one tool at a time. Tools start closed.\nB = Build; T = Staff; H = home; F = find selected; U = tech tree. Click alerts/minimap to navigate; Shift-click repeats placement.\nFollow the next-decision guide: generation, repair, cleaning, expansion, operating upgrades, storm and mastery.\nSelect equipment to repair, clean, service ($450 when crew starts) or sell. Busy crews retain work orders. Operations shows queues, cancellation, bulk orders, policies, stability and daily operating figures.\nClick a worker or Inspect in Staff for their character profile. Assign a site and duty there; training costs $800 and takes four park hours after the current job. Tired crew finish work, then recover during a break.\nBridge trips take longer. Local road access speeds travel; nearby workshops speed repair. Dedicated cleaners leave technicians free for repairs; idle engineers assist research, with greater assistance when assigned to Office research.\nResearch has nine real upgrades. Choose one project and keep the park running. Esc closes the tree. Pausing/event choices pause training, research and contracts.\nContracts are optional deliveries: check energy, deadline, deposit and quality terms. Actual exports count and ordinary sales continue. Success returns the deposit and pays a bonus; cancellation/expiry forfeits only the deposit. Nights consume deadline time.\nTwo and three stars require sustained daylight reliability. Finance lists all award criteria. Nights pause stability; daylight faults, excessive dust or curtailment reset it. Service can recover unprepared hail damage, so mastery remains reachable.\nBuild has search/categories/browse arrows. Staff has hiring/search/role filters/sorting. Portraits appear only on selected workers. Esc clears selection/tools; changing tools cancels placement.\nThe gear menu provides Save, Load, New Game, portable import/export and sound. Loaded/imported companies start paused. Existing version-1 saves migrate; earned awards remain earned.\nKeep the HTML at the same path for reliable local saves; Export save creates a portable backup.\nFinance > Playtest cheats provides cash grants or a positive event. Ctrl+Shift+M adds $25k; Ctrl+Shift+G triggers a grant.\nScenario 2 is a future release, not a playable map. Independent player feedback is still needed.\n");
console.log('Packaged standalone playable HTML:',Buffer.byteLength(html),'bytes');
