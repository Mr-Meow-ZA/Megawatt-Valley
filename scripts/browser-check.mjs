import { chromium } from 'playwright';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
await mkdir('browser-evidence',{recursive:true});
const browser = await chromium.launch({...(process.env.BROWSER_CHANNEL === 'chromium' ? {} : {channel:'chrome'}),headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context = await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
const page = await context.newPage();
const errors = [];
page.on('pageerror',(error)=>errors.push(error.message));
page.on('console',(message)=>{if(message.type()==='error')errors.push(message.text());});
page.on('request',(request)=>{if(/^https?:/.test(request.url()))errors.push('Unexpected network dependency: '+request.url());});
page.on('dialog',(dialog)=>dialog.accept());
const url = pathToFileURL(path.resolve('playable/PLAY-MEGAWATT-VALLEY.html')).href;
await page.goto(url);
await page.locator('[data-k="management-dock"]').waitFor({timeout:60000});
await page.locator('[data-speed="0"]').click();
async function openGameMenu() {
  // Utility checks must not silently choose decisions or click through overlays.
  await page.locator('[data-k="modal"]').waitFor({state:'hidden'});
  await page.locator('[data-k="win"]').waitFor({state:'hidden'});
  const menu = page.locator('.utility-menu');
  if ((await menu.getAttribute('open')) === null) await menu.locator('summary').click();
  return menu;
}
async function clickGameAction(action) {
  const menu = await openGameMenu();
  await menu.locator('[data-action="' + action + '"]').click();
  if ((await menu.getAttribute('open')) !== null) await menu.locator('summary').click();
}
async function saved() {
  await clickGameAction('save');
  return page.evaluate(()=>JSON.parse(localStorage.getItem('megawatt-valley-solar-v1')).state);
}
const before = await saved();
assert.ok(Math.abs(before.cash - 50000) < 20);
assert.equal(before.equipment.length,3);
assert.equal(await page.locator('#game-root canvas').count(),1);
assert.equal(await page.locator('img').evaluateAll((images)=>images.every((img)=>img.complete && img.naturalWidth>0)),true);
await page.locator('[data-action="toggle-dock"]').click();
assert.equal(await page.locator('.management-dock').evaluate(el=>el.offsetHeight),42);
await page.locator('[data-action="jump"][data-id="build"]').click();
assert.equal(await page.locator('[data-action="toggle-dock"]').getAttribute('aria-expanded'),'true');
await page.screenshot({path:'browser-evidence/opening.png'});
console.log('OPENING_BASE64:'+(await page.screenshot({type:'jpeg',quality:40})).toString('base64'));
const cleanStyle=await page.addStyleTag({content:'#ui-root { visibility: hidden !important; }'});
await page.screenshot({path:'browser-evidence/valley-overview.png'});
console.log('VALLEY_BASE64:'+(await page.screenshot({type:'jpeg',quality:75})).toString('base64'));
await cleanStyle.evaluate(el=>el.remove());
await page.locator('[data-cat="support"]').click();
assert.equal(await page.locator('[data-build="workshop"]').isDisabled(),true);
await page.locator('[data-cat="generation"]').click();
await page.locator('[data-build="bargain_pv"]').click();
await page.mouse.move(910,520);
await page.screenshot({path:'browser-evidence/placement-feedback.png'});
await page.locator('[data-action="cancel-build"]').click();
let built = false;
for(const point of [{x:450,y:320},{x:550,y:320},{x:650,y:320},{x:750,y:320},{x:450,y:420},{x:550,y:420},{x:650,y:420},{x:750,y:420},{x:850,y:420},{x:550,y:520},{x:650,y:520}]) {
  await page.locator('[data-build="bargain_pv"]').click();
  await page.mouse.click(point.x,point.y);
  const state = await saved();
  if(state.equipment.length>3){assert.equal(state.cash,before.cash-8000);built=true;break;}
}
assert.ok(built,'A player can place PV through canvas input');
await page.locator('[data-action="cancel-build"]').click();
await page.reload();
await page.locator('[data-k="management-dock"]').waitFor({timeout:60000});
const resumed = await saved();
assert.equal(resumed.equipment.length,4); assert.equal(resumed.cash,before.cash-8000);
await clickGameAction('load');
assert.equal((await saved()).speed,0,'Loading lets the player inspect their company before resuming');
await page.locator('[data-action="jump"][data-id="people"]').click();
await page.locator('[data-action="hire"][data-id="cleaner"]').click();
assert.equal((await saved()).staff.length,2);
await clickGameAction('new');
assert.equal((await saved()).equipment.length,3);
await clickGameAction('new');
await page.locator('[data-action="jump"][data-id="people"]').click();
await page.locator('[data-action="hire"][data-id="cleaner"]').scrollIntoViewIfNeeded();
await page.locator('[data-action="hire"][data-id="cleaner"]').click();
assert.equal((await saved()).staff.length,2);
await clickGameAction('export-save');
async function importFixture(name) {
  const chooser = page.waitForEvent('filechooser');
  const menu = await openGameMenu();
  await menu.locator('[data-action="import-save"]').click();
  const input = await chooser;
  await menu.locator('summary').click();
  await input.setFiles('browser-fixtures/'+name+'.json');
  await page.waitForTimeout(300);
}
await importFixture('storm');
await page.locator('[data-action="event-choice"][data-id="prepare"]').waitFor();
await page.locator('[data-action="event-choice"][data-id="prepare"]').click();
await page.locator('[data-k="modal"]').waitFor({state:'hidden'});
assert.equal((await saved()).hailPrepared,true);
await importFixture('one-star');
await page.locator('[data-k="win"]:not([hidden])').waitFor();
await page.locator('[data-action="dismiss-win"]').click();
const inspectionState=await saved();
assert.ok(inspectionState.stars>=1);
const worker=inspectionState.staff[0];
// The default camera centres on (390,650) at 0.62 zoom.
const project=(x,y,z=0)=>({x:720+((x-y)*50-390)*.62,y:450+((x+y)*25-z-650)*.62});
const workerScreen=project(worker.tile.x,worker.tile.y,11);
await page.mouse.click(workerScreen.x,workerScreen.y);
assert.equal((await saved()).selectedId,worker.id,'Visible technician can be selected in front of the rack');
await page.locator('[data-action="close-inspector"]').click();
assert.equal((await saved()).selectedId,null);
const picnicScreen=project(7.35,5.25,10);
await page.mouse.click(picnicScreen.x,picnicScreen.y);
await page.waitForFunction(()=>document.querySelector('[data-k="toast"]')?.textContent.includes('Company headquarters'));
console.log('WORLD_INTERACTION_CHECK_PASSED: visible staff selection and environmental inspection');
await page.screenshot({path:'browser-evidence/one-star.png'});
console.log('COMPLETION_BASE64:'+(await page.screenshot({type:'jpeg',quality:40})).toString('base64'));
const detailStyle=await page.addStyleTag({content:'#ui-root { visibility: hidden !important; }'});
await page.mouse.move(700,420);await page.mouse.wheel(0,-170);await page.waitForTimeout(300);
const dayDetail=await page.screenshot({path:'browser-evidence/infrastructure-detail.png'});
async function brightness(png) {
  return page.evaluate(async (base64)=>{
    const image=new Image();image.src='data:image/png;base64,'+base64;await image.decode();
    const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
    const context=canvas.getContext('2d');context.drawImage(image,0,0);
    const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
    let total=0,count=0;for(let i=0;i<pixels.length;i+=64){total+=pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722;count++;}
    return total/count;
  },png.toString('base64'));
}
const dayBrightness=await brightness(dayDetail);
console.log('DETAIL_BASE64:'+(await page.screenshot({type:'jpeg',quality:75})).toString('base64'));
await page.mouse.wheel(0,170);await page.waitForTimeout(300);
await detailStyle.evaluate(el=>el.remove());
// Render-only lighting fixture. Economic completion above still uses normal time.
const night=JSON.parse(await readFile('browser-fixtures/one-star.json','utf8'));
night.state.hour=22;night.state.speed=0;night.state.weather='clear';
await writeFile('browser-fixtures/night.json',JSON.stringify(night));
await importFixture('night');
await page.locator('[data-action="dismiss-win"]').click();
assert.equal((await saved()).hour,22);
const nightStyle=await page.addStyleTag({content:'#ui-root { visibility: hidden !important; }'});
await page.mouse.move(700,420);await page.mouse.wheel(0,-170);await page.waitForTimeout(300);
const nightDetail=await page.screenshot({path:'browser-evidence/evening-lights.png'});
const nightBrightness=await brightness(nightDetail);
assert.ok(nightBrightness<dayBrightness*.8,'Night must actually darken the world, not only switch on lamps');
console.log('LIGHTING_CHECK_PASSED: day',dayBrightness.toFixed(1),'night',nightBrightness.toFixed(1));
console.log('NIGHT_BASE64:'+(await page.screenshot({type:'jpeg',quality:75})).toString('base64'));
await page.mouse.wheel(0,170);await page.waitForTimeout(300);
await nightStyle.evaluate(el=>el.remove());
await importFixture('one-star');
await page.locator('[data-action="dismiss-win"]').click();
await page.setViewportSize({width:1024,height:768});
await page.locator('[data-action="jump"][data-id="caps"]').click();
await page.locator('[data-action="capability"][data-id="cleaning_rig"]').scrollIntoViewIfNeeded();
assert.ok(await page.locator('[data-action="capability"][data-id="cleaning_rig"]').isVisible());
await page.screenshot({path:'browser-evidence/laptop.png'});
await page.locator('[data-action="jump"][data-id="finance"]').click();
await page.locator('.playtest-tools summary').click();
const cashBeforeCheat=(await saved()).cash;
await page.locator('[data-action="cheat-cash"][data-amount="25000"]').click();
assert.equal((await saved()).cash,cashBeforeCheat+25000);
await page.screenshot({path:'browser-evidence/laptop-finance.png'});
// Research is exercised through the same buttons and import/export controls as a player.
await page.setViewportSize({width:1440,height:900});
await page.locator('[data-action="jump"][data-id="caps"]').click();
await page.locator('[data-action="open-research"]').filter({hasText:'Open tech tree'}).click();
assert.equal(await page.locator('[data-research-node]').count(),9);
const firstProject = page.locator('[data-action="research"][data-id="precision_wiring"]');
assert.equal(await firstProject.isEnabled(),true);
await page.screenshot({path:'browser-evidence/tech-tree.png'});
await firstProject.click();
await page.keyboard.press('Escape');
const researchStarted = await saved();
assert.equal(researchStarted.activeResearch.id,'precision_wiring');
assert.equal(researchStarted.activeResearch.progress,0);
assert.equal(researchStarted.cash,cashBeforeCheat+25000-2000);
await page.reload();
await page.locator('[data-k="management-dock"]').waitFor();
await page.keyboard.press('u');
assert.equal(await page.locator('[data-k="research-modal"]').isVisible(),true);
await page.setViewportSize({width:1024,height:768});
await page.locator('[data-research-node="storm_hardening"]').scrollIntoViewIfNeeded();
await page.screenshot({path:'browser-evidence/laptop-tech-tree.png'});
const paused = (await page.locator('[data-k="research-office"]').textContent());
await page.waitForTimeout(500);
assert.equal(await page.locator('[data-k="research-office"]').textContent(),paused);
await page.keyboard.press('Escape');
// Finish a nearly complete project using a real save import, then advance normal park time.
researchStarted.activeResearch.progress = .999;
researchStarted.speed = 0;
await writeFile('browser-fixtures/research.json',JSON.stringify({version:1,savedAt:new Date().toISOString(),state:researchStarted}));
await importFixture('research');
await page.locator('[data-speed="4"]').click();
await page.waitForTimeout(600);
await page.locator('[data-speed="0"]').click();
const researchFinished = await saved();
assert.equal(researchFinished.activeResearch,null);
assert.ok(researchFinished.researched.includes('precision_wiring'));
await page.keyboard.press('u');
assert.equal(await page.locator('[data-action="research"][data-id="smart_inverters"]').isEnabled(),true);
await page.keyboard.press('Shift+Tab');
assert.equal(await page.locator('[data-k="research-modal"]').evaluate(el=>el.contains(document.activeElement)),true);
await page.keyboard.press('Tab');
assert.equal(await page.locator('[data-action="close-research"]').evaluate(el=>el===document.activeElement),true);
await page.keyboard.press('Escape');
await importFixture('fault');
const faulty = await saved();
const faultId = faulty.equipment.find(e=>e.faulted).id;
await page.locator('[data-k="park-alerts"] [data-action="locate"][data-id="'+faultId+'"]').click();
assert.equal((await saved()).selectedId,faultId);
await page.keyboard.press('h');
await page.keyboard.press('f');
assert.equal((await saved()).selectedId,faultId);
await page.keyboard.press('h');
await page.locator('[data-action="close-inspector"]').click();
await page.setViewportSize({width:1440,height:900});
await page.screenshot({path:'browser-evidence/actionable-alerts.png'});
// Repeat placement keeps the same tool armed, and Escape cancels it.
await clickGameAction('new');
await page.locator('[data-speed="0"]').click();
let repeated = false;
for(const point of [{x:550,y:320},{x:650,y:320},{x:750,y:320},{x:550,y:420},{x:650,y:420},{x:750,y:420}]) {
  await page.locator('[data-build="bargain_pv"]').click();
  await page.keyboard.down('Shift'); await page.mouse.click(point.x,point.y); await page.keyboard.up('Shift');
  const state = await saved();
  if(state.equipment.length>3) { assert.equal(state.buildMode,'bargain_pv'); repeated=true; break; }
}
assert.ok(repeated,'Shift-click repeats placement');
await page.keyboard.press('Escape'); assert.equal((await saved()).buildMode,null);
console.log('RESEARCH_QOL_CHECK_PASSED: 9 real nodes, purchase, reload, pause, completion, prerequisites, laptop scroll, alert navigation, camera shortcuts');
assert.deepEqual(errors,[]);
console.log('BROWSER_CHECK_PASSED: offline launch, assets, placement, reload, hiring, restart, laptop capability access');
const jpeg = await page.screenshot({type:'jpeg',quality:45});
console.log('SCREENSHOT_BASE64:'+jpeg.toString('base64'));
await browser.close();
