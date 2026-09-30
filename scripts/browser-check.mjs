import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
await mkdir('browser-evidence',{recursive:true});
const browser = await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context = await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
const page = await context.newPage();
const errors = [];
page.on('pageerror',(error)=>errors.push(error.message));
page.on('console',(message)=>{if(message.type()==='error')errors.push(message.text());});
page.on('dialog',(dialog)=>dialog.accept());
const url = pathToFileURL(path.resolve('playable/PLAY-MEGAWATT-VALLEY.html')).href;
await page.goto(url);
await page.locator('[data-action="save"]').waitFor({timeout:60000});
await page.locator('[data-speed="0"]').click();
async function saved() {
  await page.locator('[data-action="save"]').click();
  return page.evaluate(()=>JSON.parse(localStorage.getItem('megawatt-valley-solar-v1')).state);
}
const before = await saved();
assert.ok(before.cash<=50000 && before.cash>49990);
assert.equal(before.equipment.length,3);
assert.equal(await page.locator('#game-root canvas').count(),1);
assert.equal(await page.locator('img').evaluateAll((images)=>images.every((img)=>img.complete && img.naturalWidth>0)),true);
await page.screenshot({path:'browser-evidence/opening.png'});
let built = false;
for(const point of [{x:680,y:340},{x:650,y:400},{x:700,y:440},{x:600,y:360},{x:760,y:390},{x:800,y:440}]) {
  await page.locator('[data-build="bargain_pv"]').click();
  await page.mouse.click(point.x,point.y);
  const state = await saved();
  if(state.equipment.length>3){assert.equal(state.cash,before.cash-8000);built=true;break;}
}
assert.ok(built,'A player can place PV through canvas input');
await page.locator('[data-action="cancel-build"]').click();
await page.reload();
await page.locator('[data-action="save"]').waitFor({timeout:60000});
const resumed = await saved();
assert.equal(resumed.equipment.length,4); assert.equal(resumed.cash,before.cash-8000);
await page.locator('[data-action="hire"][data-id="cleaner"]').scrollIntoViewIfNeeded();
await page.locator('[data-action="hire"][data-id="cleaner"]').click();
assert.equal((await saved()).staff.length,2);
await page.locator('[data-action="new"]').click();
assert.equal((await saved()).equipment.length,3);
await page.locator('[data-action="new"]').click();
await page.locator('[data-action="hire"][data-id="cleaner"]').scrollIntoViewIfNeeded();
await page.locator('[data-action="hire"][data-id="cleaner"]').click();
assert.equal((await saved()).staff.length,2);
await page.locator('[data-action="export-save"]').click();
await page.setViewportSize({width:1024,height:768});
await page.locator('[data-action="capability"][data-id="cleaning_rig"]').scrollIntoViewIfNeeded();
assert.ok(await page.locator('[data-action="capability"][data-id="cleaning_rig"]').isVisible());
await page.screenshot({path:'browser-evidence/laptop.png'});
assert.deepEqual(errors,[]);
console.log('BROWSER_CHECK_PASSED: offline launch, assets, placement, reload, hiring, restart, laptop capability access');
const jpeg = await page.screenshot({type:'jpeg',quality:45});
console.log('SCREENSHOT_BASE64:'+jpeg.toString('base64'));
await browser.close();
