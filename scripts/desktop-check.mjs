import {_electron as electron} from 'playwright';
import {mkdtemp,readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
const dir=await mkdtemp(path.join(os.tmpdir(),'megawatt-desktop-test-'));
await mkdir('desktop-evidence',{recursive:true});
const executablePath=path.resolve('desktop/release/win-unpacked/Megawatt Valley.exe');
let application;
const errors=[];
async function launch(){
  application=await electron.launch({executablePath,args:['--smoke-test','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env:{...process.env,MW_TEST_USER_DATA:dir},timeout:60000});
  const page=await application.firstWindow();
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.waitForSelector('[data-action="save"]',{state:'attached',timeout:60000});
  await page.waitForFunction(()=>document.querySelector('#game-root canvas'));
  return page;
}
async function state(page){
  await page.evaluate(()=>document.querySelector('[data-action="save"]').click());
  return JSON.parse(await readFile(path.join(dir,'saves/company.json'),'utf8')).state;
}
async function closeNormally(){
  const closed=application.waitForEvent('close',{timeout:15000});
  await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].close());
  await closed;
}
try {
  let page=await launch();
  await page.evaluate(()=>document.querySelector('[data-speed="0"]').click());
  assert.equal(await page.evaluate(()=>typeof window.require),'undefined');
  assert.equal(await page.evaluate(()=>window.megawattDesktop.version),'0.2.0');
  assert.equal(await page.evaluate(()=>window.megawattDesktop.writeSave('{"version":1,"state":{"cash":1}}')),false);
  const start=await state(page);assert.equal(start.equipment.length,3);
  // A native menu command reaches the current game without exposing Node to it.
  await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.send('game:command','save'));
  // Use the shipped portable-import action to transfer an existing real-playthrough company.
  const chooser=page.waitForEvent('filechooser');
  await page.locator('.utility-menu summary').click();
  await page.locator('[data-action="import-save"]').click();
  await (await chooser).setFiles(path.resolve('browser-fixtures/one-star.json'));
  await page.waitForFunction(()=>document.querySelector('[data-k="toast"]')?.textContent.includes('import'));
  const winDialog=page.locator('[data-k="win"]');
  if(await winDialog.isVisible())await page.locator('[data-action="dismiss-win"]').click();
  const menu=page.locator('.utility-menu');if(await menu.getAttribute('open')!==null)await menu.locator('summary').click();
  const progressed=await state(page);
  assert.ok(progressed.stars>=1);assert.ok(progressed.equipment.length>3);
  await page.screenshot({path:'desktop-evidence/windows-company.png'});
  console.log('WINDOWS_BASE64:'+(await page.screenshot({type:'jpeg',quality:45})).toString('base64'));
  // Fullscreen is a real application window mode.
  await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setFullScreen(true));
  await page.waitForTimeout(500);
  assert.equal(await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isFullScreen()),true);
  await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setFullScreen(false));
  await closeNormally();
  page=await launch();
  const resumed=await state(page);
  assert.equal(resumed.stars,progressed.stars);assert.equal(resumed.equipment.length,progressed.equipment.length);assert.equal(resumed.speed,0);
  assert.equal(resumed.cash,progressed.cash);
  await closeNormally();
  // Simulate a damaged primary file; the application must recover its backup.
  await writeFile(path.join(dir,'saves/company.json'),'{truncated');
  page=await launch();
  const recovered=await state(page);
  assert.equal(recovered.stars,progressed.stars);assert.equal(recovered.equipment.length,progressed.equipment.length);
  await page.screenshot({path:'desktop-evidence/windows-recovered.png'});
  assert.deepEqual(errors,[]);
  await closeNormally();
  console.log('DESKTOP_CHECK_PASSED: packaged Windows launch, isolated renderer, native saves, imported campaign, fullscreen, normal close, resume and corrupt-primary recovery');
} finally {
  if(application)await application.close().catch(()=>{});
  await rm(dir,{recursive:true,force:true});
}
