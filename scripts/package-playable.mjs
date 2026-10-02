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
const css = await readFile('src/styles.css','utf8');
const js = output.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Megawatt Valley — Here Comes the Sun</title><style>'+css+'</style></head><body><div id="app"><div id="game-root"></div><div id="ui-root"></div></div><script>window.__MW_ASSETS__='+JSON.stringify(assets)+';</script><script>'+js+'</script></body></html>';
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
await writeFile('playable/licenses/ORIGINAL-ASSETS.txt','Original code-generated meadow, sand, water, road, rock and sign textures and synthesized audio were added for this autonomous build. Existing Kenney and domsson assets retain their CC0 provenance in ASSET-CREDITS.md.\n');

await writeFile('playable/READ-ME.txt','MEGAWATT VALLEY — HERE COMES THE SUN\n\nOpen PLAY-MEGAWATT-VALLEY.html in Chrome or Edge. No install, server or internet required.\nDrag to pan; wheel to zoom. The bottom dock has Build, Team, Upgrades and Finance. Its arrow collapses the panel; any tab reopens it.\nSelect equipment to repair, clean or sell. The inspector × closes selection. Switching away from Build cancels placement.\nThe top-right gear menu provides Save, Load, New Game, portable save import/export and optional sound. Loaded/imported saves start paused.\nKeep the HTML at the same path for reliable local saves; Export save creates a portable backup.\nFinance > Playtest cheats: cash grants or positive event. Ctrl+Shift+M adds $25k; Ctrl+Shift+G triggers a grant.\nThis build is under acceptance testing. Scenario 2 is a future release.\n');
console.log('Packaged standalone playable HTML:',Buffer.byteLength(html),'bytes');
