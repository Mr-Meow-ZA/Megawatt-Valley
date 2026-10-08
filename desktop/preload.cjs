const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('megawattDesktop',{
  version:'0.5.0',
  readSaves:()=>ipcRenderer.sendSync('save:read'),
  writeSave:raw=>ipcRenderer.sendSync('save:write',raw),
  clearSave:()=>ipcRenderer.sendSync('save:clear'),
  preferences:()=>ipcRenderer.sendSync('preferences:read'),
  confirmClose:ok=>ipcRenderer.send('save:close-result',ok===true),
  onCommand:callback=>{
    const handler=(_event,command)=>callback(command);
    ipcRenderer.on('game:command',handler);
    return ()=>ipcRenderer.removeListener('game:command',handler);
  }
});
