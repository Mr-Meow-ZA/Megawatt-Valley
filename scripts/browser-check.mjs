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
assert.equal(await page.locator('.management-dock').evaluate(el=>el.offsetHeight),42,'Management tools start closed so the park stays visible');
assert.equal(await page.locator('.staff-overview, .events-overview, .worker-portrait').count(),0,'No permanent character or events strips');
await page.screenshot({path:'browser-evidence/park-default.png'});
await page.keyboard.press('b');
assert.equal(await page.locator('[data-build]').count(),9,'Build opens the full catalogue');
assert.equal(await page.locator('[data-build="bargain_pv"] img').evaluate(el=>el.getBoundingClientRect().width >= 100),true,'Equipment previews are large enough to recognise');
assert.equal(await page.locator('.dock-content').evaluate(el=>[...el.children].filter(e=>!e.hidden && getComputedStyle(e).display!=='none').length),1,'Only one management panel is visible');
assert.equal(await page.locator('.objectives').evaluate(el=>{
  const o=el.getBoundingClientRect(),m=document.querySelector('.minimap-panel').getBoundingClientRect(),d=document.querySelector('.dock-content').getBoundingClientRect(),t=document.querySelector('.dock-nav').getBoundingClientRect();
  return o.left>innerWidth/2 && o.bottom<m.top && m.bottom<t.top && m.left>d.right;
}),true,'Objectives, map and drawer do not overlap');
await page.locator('[data-action="browse-build"][data-direction="1"]').click();
await page.waitForFunction(()=>document.querySelector('.build-grid').scrollLeft>100);
await page.locator('[data-k="build-search"]').fill('Premium');
assert.equal(await page.locator('[data-build]').count(),1);
await page.locator('[data-k="build-search"]').press('Space');
assert.equal((await saved()).speed,0,'Typing in search does not pause or resume the simulation');
await page.locator('[data-k="build-search"]').fill('no matching equipment');
assert.equal(await page.locator('[data-build]').count(),0);
await page.locator('[data-k="build-search"]').fill('');
await page.keyboard.press('Escape');
assert.equal(await page.locator('.management-dock').evaluate(el=>el.offsetHeight),42,'Escape closes tools while search is focused');
await page.keyboard.press('b');
await page.locator('[data-k="minimap"]').click({position:{x:180,y:80}});
await page.locator('[data-k="minimap"]').focus();
await page.keyboard.press('Enter');
await page.locator('[data-action="map-home"]').click();
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
await page.locator('[data-action="jump"][data-id="events"]').click();
assert.equal(await page.locator('[data-k="weather-scene"]').isVisible(),true,'Weather illustration appears in the requested Events view');
assert.equal(await page.locator('[data-panel="build"]').isHidden(),true);
await page.screenshot({path:'browser-evidence/events-drawer.png'});
await page.locator('[data-action="jump"][data-id="build"]').click();
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
if (await page.locator('[data-panel="people"]').isHidden()) await page.locator('[data-action="jump"][data-id="people"]').click();
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
assert.equal(await page.locator('.worker-portrait').isVisible(),true,'A character portrait opens on worker selection');
assert.equal(await page.locator('.management-dock').evaluate(el=>el.offsetHeight),42,'Selecting a worker closes the management drawer');
assert.equal(await page.locator('.worker-identity h3').textContent(),worker.name);
const profileState=await saved();
await page.locator('[data-k="selection"] [data-action="train"]').click();
const trained=await saved();
assert.equal(trained.cash,profileState.cash-800);
assert.equal(trained.staff.find(s=>s.id===worker.id).skill,worker.skill,'Booking training does not grant instant skill');
assert.equal(trained.staff.find(s=>s.id===worker.id).trainingHoursLeft,4);
assert.equal(await page.locator('[data-action="train"]').isDisabled(),true);
await page.locator('[data-k="worker-zone"]').selectOption('site_a');
await page.locator('[data-k="worker-duty"]').selectOption('repair');
assert.equal((await saved()).staff.find(s=>s.id===worker.id).workZone,'site_a');
await page.locator('[data-speed="4"]').click();
// Software rendering on a two-core Actions runner advances fewer park frames.
// Keep the full course and assert park-time completion, rather than speeding up the save.
try {
  await page.waitForFunction(target=>parseFloat(document.querySelector('.worker-skill b')?.textContent ?? '0')>=target,Number((worker.skill+1).toFixed(1)),{timeout:180000});
} catch(error) {
  console.log('TRAINING_TIMEOUT_DIAGNOSTICS:'+JSON.stringify(await page.evaluate(()=>({
    task:document.querySelector('.worker-status')?.textContent,
    skill:document.querySelector('.worker-skill b')?.textContent,
    calendar:document.querySelector('[data-k="time-clock"]')?.textContent,
    activeSpeed:document.querySelector('[data-speed].active')?.getAttribute('data-speed'),
    event:document.querySelector('[data-k="modal"]')?.hidden===false
  }))));
  await page.screenshot({path:'browser-evidence/training-timeout.png'});
  throw error;
}
await page.locator('[data-speed="0"]').click();
const trainingComplete=await saved();
assert.ok(trainingComplete.staff.find(s=>s.id===worker.id).skill>=worker.skill+1,'Training completes over park time');
assert.ok((trainingComplete.day-trained.day)*24+trainingComplete.hour-trained.hour>=4-1/60,'A complete course uses four park hours');
await page.locator('[data-k="worker-zone"]').selectOption('all');
await page.locator('[data-k="worker-duty"]').selectOption('auto');
await page.locator('[data-k="selection"]').evaluate(el=>el.scrollTop=0);
await page.screenshot({path:'browser-evidence/worker-profile.png'});
await page.setViewportSize({width:1024,height:768});
await page.locator('[data-k="worker-duty"]').scrollIntoViewIfNeeded();
assert.equal(await page.locator('[data-k="worker-duty"]').isVisible(),true,'Laptop users can reach crew assignments');
assert.equal(await page.locator('[data-k="selection"]').evaluate(el=>el.getBoundingClientRect().bottom<document.querySelector('.dock-nav').getBoundingClientRect().top),true,'Laptop inspector avoids toolbar');
assert.equal(await page.locator('[data-k="worker-duty"]').evaluate(el=>{
  const r=el.getBoundingClientRect(); const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return hit===el || el.contains(hit);
}),true,'Alerts and confirmations do not cover laptop assignment controls');
await page.locator('[data-k="worker-duty"]').selectOption('repair');
assert.equal((await saved()).staff.find(s=>s.id===worker.id).preference,'repair');
await page.locator('[data-k="worker-duty"]').selectOption('auto');
await page.screenshot({path:'browser-evidence/laptop-worker-assignment.png'});
await page.setViewportSize({width:1440,height:900});

await page.locator('[data-action="close-inspector"]').click();
assert.equal((await saved()).selectedId,null);
assert.equal(await page.locator('.worker-portrait').isVisible(),false);
await page.keyboard.press('t');
await page.locator('[data-k="staff-role"]').selectOption('technician');
assert.equal(await page.locator('.staff-table-row').count(),trained.staff.filter(s=>s.role==='technician').length);
await page.locator('[data-k="staff-search"]').fill('no such worker');
assert.equal(await page.locator('.staff-table-row').count(),0);
await page.locator('[data-k="staff-search"]').fill('');
await page.locator('[data-k="staff-role"]').selectOption('all');
await page.locator('[data-k="staff-sort"]').selectOption('skill');
await page.screenshot({path:'browser-evidence/staff-management.png'});
await page.locator('.inspect-worker[data-id="'+worker.id+'"]').click();
assert.equal(await page.locator('.worker-portrait').isVisible(),true);
assert.equal(await page.locator('[data-panel="people"]').isHidden(),true);
await page.keyboard.press('Escape');
assert.equal((await saved()).selectedId,null);
console.log('STAFF_SELECTION_CHECK_PASSED: contextual portrait, live training, searchable sortable roster, role filtering and Escape');
await page.locator('[data-action="jump"][data-id="contracts"]').click();
assert.equal(await page.locator('[data-action="accept-contract"][data-id="school"]').isEnabled(),true);
await page.locator('[data-action="accept-contract"][data-id="school"]').click();
const contractState=await saved();
assert.equal(contractState.contract.id,'school');
assert.equal(contractState.contract.deliveredKwh,0);
await page.waitForTimeout(350);
assert.equal((await saved()).contract.deliveredKwh,0,'Paused deliveries do not advance');
await page.screenshot({path:'browser-evidence/gameplay-contracts.png'});
await page.reload();await page.locator('[data-k="management-dock"]').waitFor();
assert.equal((await saved()).contract.id,'school','Accepted contract survives reload');
await page.locator('[data-action="jump"][data-id="contracts"]').click();
await page.locator('[data-action="cancel-contract"]').click();
assert.equal((await saved()).contract,null);
// Worn/dusty equipment isolates queue interactions, not normal-economy progression.
const operations=JSON.parse(await readFile('browser-fixtures/one-star.json','utf8'));
operations.state.completionAcknowledged=true;operations.state.activeEvent=null;operations.state.speed=0;
operations.state.staff.forEach(s=>{s.task={type:'idle'};s.energy=1;s.onBreak=false;s.trainingHoursLeft=0;s.preference='repair';s.workZone='all';});
operations.state.equipment.filter(e=>e.kind.includes('pv')).forEach(e=>{e.soiling=.6;e.condition=.7;e.faulted=false;});
operations.state.workOrders=[];
await writeFile('browser-fixtures/operations.json',JSON.stringify(operations));
await importFixture('operations');
await page.locator('[data-action="jump"][data-id="operations"]').click();
await page.locator('[data-k="cleaning-policy"]').selectOption('0.2');
assert.equal((await saved()).cleaningThreshold,.2);
assert.equal(await page.locator('[data-k="preventive-policy"]').isDisabled(),true);
await page.locator('[data-action="clean-all"]').click();
const queued=await saved();
assert.ok(queued.workOrders.some(o=>o.kind==='clean' && o.manual),'Busy or differently assigned crew leave visible orders');
const cancels=page.locator('[data-action="cancel-job"]');
assert.ok(await cancels.count()>0);
await cancels.first().click();
assert.equal((await saved()).workOrders.filter(o=>o.manual).length,queued.workOrders.filter(o=>o.manual).length-1);
const cashBeforeService=(await saved()).cash;
await page.locator('[data-action="service-all"]').click();
assert.equal((await saved()).cash,cashBeforeService-450,'Only the job that starts immediately is charged');
assert.ok(await page.locator('.work-order').count()>1);
await page.screenshot({path:'browser-evidence/gameplay-operations.png'});
await page.setViewportSize({width:1024,height:768});
assert.equal(await page.locator('[data-panel="operations"]').evaluate(el=>el.getBoundingClientRect().bottom<=document.querySelector('.dock-nav').getBoundingClientRect().top),true);
await page.screenshot({path:'browser-evidence/laptop-operations.png'});
await page.setViewportSize({width:1440,height:900});
await importFixture('one-star');await page.locator('[data-action="dismiss-win"]').click();
console.log('GAMEPLAY_UI_CHECK_PASSED: timed training, crew assignments, paused/saved contracts, queued/cancelled jobs, service charging and laptop operations');

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
const researchOffers=JSON.parse(await readFile('browser-fixtures/one-star.json','utf8'));
researchOffers.state.researched=[];researchOffers.state.activeResearch=null;
await writeFile('browser-fixtures/research-offers.json',JSON.stringify(researchOffers));
await importFixture('research-offers');
await page.locator('[data-action="dismiss-win"]').click();
await page.setViewportSize({width:1024,height:768});
await page.locator('[data-action="jump"][data-id="build"]').click();
assert.equal(await page.locator('[data-panel="build"]').evaluate(el=>el.getBoundingClientRect().bottom<document.querySelector('.dock-nav').getBoundingClientRect().top),true,'Laptop catalogue fits above the toolbar');
assert.equal(await page.locator('[data-build="bargain_pv"] img').evaluate(el=>el.getBoundingClientRect().width>=100),true,'Laptop retains readable equipment previews');
await page.screenshot({path:'browser-evidence/laptop-build.png'});
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
assert.equal(await page.locator('[data-k="park-alerts"]').evaluate(el=>{
  const a=el.getBoundingClientRect(),o=document.querySelector('.objectives').getBoundingClientRect(),s=document.querySelector('[data-k="selection"]');
  return a.right<o.left && (s.hidden || a.top>=s.getBoundingClientRect().bottom);
}),true,'Alerts avoid the objective sidebar and selected inspector');
await page.screenshot({path:'browser-evidence/actionable-alerts.png'});
// Repeat placement keeps the same tool armed, and Escape cancels it.
await clickGameAction('new');
await page.locator('[data-speed="0"]').click();
await page.locator('[data-action="jump"][data-id="build"]').click();
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
const vectors = await page.evaluate(()=>window.__MW_VECTOR_ASSETS__);
assert.equal(Object.keys(vectors).length,9,'Nine rendered assets are embedded for offline play');
const artPage = await context.newPage();
const artNames = {site_pv_basic:'Bargain solar',site_pv_premium:'Premium solar',site_office:'Operations office',site_workshop:'Workshop',site_tree_0:'Broadleaf',site_tree_1:'Conifer',site_tree_2:'Summer broadleaf',site_shrub:'Shrub',site_rock:'Stone'};
await artPage.setViewportSize({width:1100,height:600});
await artPage.setContent('<body style="margin:0;background:#b3ce88;color:#24413c;font:16px system-ui"><h1 style="margin:24px">Megawatt Valley · free asset visual slice</h1><main style="padding:20px;display:grid;grid-template-columns:repeat(5,1fr);gap:20px">'+Object.entries(artNames).map(([key,name])=>'<section style="background:#ffffff33;border-radius:12px;padding:10px;text-align:center"><div style="height:160px;display:grid;place-items:center"><img src="'+vectors[key]+'" style="max-width:190px;max-height:160px"></div><b>'+name+'</b></section>').join('')+'</main><small style="margin:24px">CC0 Kenney models · matching 2:1 projection, palette and light · no 3D runtime</small></body>');
await artPage.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
await artPage.screenshot({path:'browser-evidence/asset-palette.png'});
await artPage.close();
console.log('LOW_POLY_ASSET_CHECK_PASSED: 9 rendered CC0 sprites embedded, decoded and captured');
assert.deepEqual(errors,[]);
console.log('BROWSER_CHECK_PASSED: offline launch, assets, placement, reload, hiring, restart, laptop capability access');
const jpeg = await page.screenshot({type:'jpeg',quality:45});
console.log('SCREENSHOT_BASE64:'+jpeg.toString('base64'));
await browser.close();
