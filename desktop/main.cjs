const {app,BrowserWindow,Menu,ipcMain,protocol,dialog,shell}=require('electron');
const fs=require('node:fs');
const path=require('node:path');
const {createSaveStore}=require('./save-store.cjs');
const {validateState}=require('./validate.cjs');

protocol.registerSchemesAsPrivileged([{scheme:'valley',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
if(process.argv.includes('--smoke-test')&&process.env.MW_TEST_USER_DATA)app.setPath('userData',process.env.MW_TEST_USER_DATA);
app.setName('Megawatt Valley');
let win,store,allowClose=false,closeTimer;
let prefs={width:1440,height:900,fullscreen:false,fps:60,pauseOnBlur:true};
const prefsFile=()=>path.join(app.getPath('userData'),'preferences.json');
function persistPrefs(){try{fs.writeFileSync(prefsFile(),JSON.stringify(prefs));}catch{}}
function command(value){if(win&&!win.isDestroyed())win.webContents.send('game:command',value);}
function senderOk(event){return win&&!win.isDestroyed()&&event.sender===win.webContents&&event.senderFrame===win.webContents.mainFrame&&event.senderFrame.url==='valley://game/index.html';}
function saveReply(event,operation,fallback){try{event.returnValue=senderOk(event)?operation():fallback;}catch{event.returnValue=fallback;}}
ipcMain.on('save:read',e=>saveReply(e,()=>store.candidates(),[]));
ipcMain.on('save:write',(e,raw)=>saveReply(e,()=>store.save(raw),false));
ipcMain.on('save:clear',e=>saveReply(e,()=>store.clear(),false));
ipcMain.on('preferences:read',e=>saveReply(e,()=>prefs,{fps:60}));
ipcMain.on('save:close-result',(e,ok)=>{
  if(!senderOk(e)||!closeTimer)return;
  clearTimeout(closeTimer);closeTimer=undefined;
  if(ok===true){allowClose=true;win.close();}
  else closeFailure();
});
async function closeFailure(){
  const result=await dialog.showMessageBox(win,{type:'warning',title:'Company could not be saved',
    message:'Your latest progress could not be written to disk.',
    detail:'Keep playing to export a copy, or quit and keep the last successful save.',
    buttons:['Keep playing','Quit without saving'],defaultId:0,cancelId:0});
  if(result.response===1){allowClose=true;win.close();}
}
async function screenshot(){
  const result=await dialog.showSaveDialog(win,{title:'Save valley screenshot',defaultPath:'Megawatt-Valley.png',filters:[{name:'PNG image',extensions:['png']}]});
  if(result.canceled||!result.filePath)return;
  try{const image=await win.webContents.capturePage();fs.writeFileSync(result.filePath,image.toPNG());}
  catch{dialog.showErrorBox('Screenshot not saved','The selected file could not be written.');}
}
function menus(){
  const template=[
    {label:'Company',submenu:[
      {label:'Save company',accelerator:'CmdOrCtrl+S',click:()=>command('save')},
      {label:'Load company',accelerator:'CmdOrCtrl+O',click:()=>command('load')},
      {type:'separator'},
      {label:'Open save folder',click:()=>shell.openPath(path.join(app.getPath('userData'),'saves'))},
      {label:'Save screenshot…',accelerator:'F12',click:screenshot},
      {type:'separator'},{label:'Quit',accelerator:'Alt+F4',click:()=>win.close()}
    ]},
    {label:'Display',submenu:[
      {label:'Fullscreen',type:'checkbox',checked:win.isFullScreen(),accelerator:'F11',click:item=>{win.setFullScreen(item.checked);prefs.fullscreen=item.checked;persistPrefs();}},
      {label:'Frame limit — applies next launch',submenu:[30,60].map(fps=>({label:fps+' FPS',type:'radio',checked:prefs.fps===fps,click:()=>{prefs.fps=fps;persistPrefs();}}))},
      {label:'Pause when unfocused',type:'checkbox',checked:prefs.pauseOnBlur,click:item=>{prefs.pauseOnBlur=item.checked;persistPrefs();}},
      {label:'Reset window size',click:()=>{win.setFullScreen(false);win.setSize(1440,900);win.center();}}
    ]},
    {label:'Help',submenu:[
      {label:'Controls & playing guide',click:()=>dialog.showMessageBox(win,{title:'Megawatt Valley controls',message:'Here Comes the Sun',
        detail:'Drag: pan · Wheel: zoom · Space: pause\nB: Build · T: Staff · U: research · H: home · F: selected\nR: repair · C: clean · Shift-click: repeat placement\nCtrl+S: save · F11: fullscreen · F12: screenshot\n\nFollow the next-decision guide. The bottom toolbar opens management tools. The gear menu contains portable save import/export. Closing the window saves your company. Saves stay available after installing a newer version.\n\nDesktop 0.3.1 · True 3D isometric rendering with Three.js and Electron. Scenario 2 remains future content.'})},
      {label:'About Megawatt Valley',click:()=>dialog.showMessageBox(win,{title:'Megawatt Valley',message:'Megawatt Valley · Desktop 0.3.1',detail:'Here Comes the Sun\nIndependent desktop development build.\nOriginal game code and licensed CC0 art. Credits and licenses are included in the application package.'})}
    ]}
  ];
  if(process.platform==='darwin')template.unshift({role:'appMenu'});
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
app.whenReady().then(async()=>{
  try{const saved=JSON.parse(fs.readFileSync(prefsFile(),'utf8'));prefs={
    width:Math.max(1024,Math.min(3840,Number(saved.width)||1440)),
    height:Math.max(720,Math.min(2160,Number(saved.height)||900)),
    fullscreen:saved.fullscreen===true,fps:saved.fps===30?30:60,pauseOnBlur:saved.pauseOnBlur!==false};}catch{}
  store=createSaveStore(path.join(app.getPath('userData'),'saves'),validateState);
  const files={'/index.html':['text/html','index.html'],'/game.js':['text/javascript','game.js'],'/assets.js':['text/javascript','assets.js'],'/game.css':['text/css','game.css']};
  protocol.handle('valley',request=>{
    const url=new URL(request.url),entry=url.hostname==='game'?files[url.pathname]:undefined;
    if(!entry)return new Response('Not found',{status:404});
    return new Response(fs.readFileSync(path.join(__dirname,'game',entry[1])),{headers:{
      'Content-Type':entry[0], 'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src data: blob:; font-src 'self' data:; connect-src blob:; object-src 'none'; base-uri 'none'; frame-src 'none';"
    }});
  });
  win=new BrowserWindow({width:prefs.width,height:prefs.height,minWidth:1024,minHeight:720,show:false,
    title:'Megawatt Valley',icon:path.join(__dirname,'icon.png'),backgroundColor:'#263f37',fullscreen:prefs.fullscreen,
    webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',e=>e.preventDefault());
  win.webContents.session.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
  win.webContents.on('page-title-updated',e=>e.preventDefault());
  win.on('blur',()=>{if(prefs.pauseOnBlur)command('pause');});
  win.on('resize',()=>{if(!win.isFullScreen()&&!win.isMaximized()){const [width,height]=win.getSize();prefs.width=width;prefs.height=height;persistPrefs();}});
  win.on('close',e=>{
    if(allowClose)return;e.preventDefault();
    if(closeTimer)return;
    command('save-close');
    closeTimer=setTimeout(()=>{closeTimer=undefined;closeFailure();},5000);
  });
  win.once('ready-to-show',()=>win.show());
  win.webContents.on('render-process-gone',()=>dialog.showErrorBox('The game stopped unexpectedly','Your last successful save and recovery backup are kept in the save folder. Please restart Megawatt Valley.'));
  menus();await win.loadURL('valley://game/index.html');
});
app.on('window-all-closed',()=>app.quit());
