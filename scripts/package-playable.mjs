import { selfContainedGlb } from './embed-glb.mjs';
import { models as modelFiles } from './model-manifest.mjs';
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
const models = {};
for (const [key,file] of Object.entries(modelFiles)) {
  const bytes=await selfContainedGlb(file);
  models[key]=bytes.toString('base64');
}
const output = await build({
  entryPoints:['src/main.ts'], bundle:true, minify:true, format:'iife', target:'es2022', write:false, outdir:'unused-output',
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
const css = (await readFile('src/three/world.css','utf8')) + '\n' + (await readFile('src/ui/tycoon/tycoon.css','utf8'));
const js = output.outputFiles.find(file=>file.path.endsWith('.js')).text.replace(/<\/script/gi,'<\\/script');
const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Megawatt Valley — Here Comes the Sun</title><style>'+css+'</style></head><body><div id="app"><div id="game-root"></div><div id="ui-root"></div></div><script>window.__MW_ASSETS__='+JSON.stringify(assets)+';window.__MW_VECTOR_ASSETS__='+JSON.stringify(vectorAssets)+';window.__MW_MODELS__='+JSON.stringify(models)+';</script><script>'+js+'</script></body></html>';
await mkdir('playable',{recursive:true});
await writeFile('playable/PLAY-MEGAWATT-VALLEY.html',html);
await copyFile('Docs/ASSET_REGISTER_PHASER.md','playable/ASSET-CREDITS.md');
await mkdir('playable/licenses',{recursive:true});
for (const name of ['three']) {
  const dir = path.join('node_modules',name);
  const licence = (await readdir(dir)).find((file)=>/^licen[sc]e(\.|$)/i.test(file));
  if (!licence) throw new Error('Missing distribution license: '+name);
  await copyFile(path.join(dir,licence),'playable/licenses/'+name+'-LICENSE.txt');
}
for (const [pack,name] of [['kenney-city-kit-industrial','Kenney-Industrial-CC0.txt'],['kenney-nature-kit','Kenney-Nature-CC0.txt']]) {
  await copyFile(path.join('public/assets/sourced',pack,'License.txt'),path.join('playable/licenses',name));
}
await writeFile('playable/licenses/ORIGINAL-ASSETS.txt','Runtime solar/building/nature 3D meshes and legacy catalogue sprites derive from CC0 Kenney City Kit Industrial and Nature Kit meshes; their licenses are included alongside this file. Palette, cell patterns and projection were adapted for Megawatt Valley. Original code-generated landscape, mountains, staff uniforms, meadow, sand, water, road, rock and sign textures, vector staff portraits, weather illustrations and synthesized audio were added for this autonomous build. Existing Kenney and domsson assets retain their CC0 provenance in ASSET-CREDITS.md.\n');

await writeFile('playable/READ-ME.txt',"MEGAWATT VALLEY — DESKTOP TYCOON EDITION 0.4.0\n\nOpen PLAY-MEGAWATT-VALLEY.html in Chrome or Edge, or use the Windows desktop application.\n\nB: Build. T: Staff. U: Company upgrades. H: centre valley. F: focus selection. Space: pause. Wheel: cursor-centred zoom. Drag or middle-drag: pan.\nPlacement repeats until cancelled. Right-click or Esc cancels. Roads: drag, review the total cost, release to build. Shift changes the route bend. A whole invalid or unaffordable stroke is rejected without spending money.\nRoads must join the main access network to improve nearby crew travel. Site views > Road service shows coverage. Isolated roads give no bonus. Workshops speed repairs within eight tiles. Trees, signs, gates and fences are optional decoration.\nSelect equipment or staff directly in the valley. Contextual inspectors show actions, assignments, effects and selling. Company holds upgrades, policies, contracts and operating reports. The scenario card shows your next action; click its stars for the full journal.\nThe pause menu contains Save, Load, Import, Export and New Company. Companies restore paused. Version-1 saves remain compatible. Export a backup before replacing a company.\nFollow first generation, first manual repair, cleaning, expansion, automation and storm preparation to earn one star. Two and three stars reward sustained reliable management. Scenario 2 is unlocked for a future release.\n");
console.log('Packaged standalone playable HTML:',Buffer.byteLength(html),'bytes');
