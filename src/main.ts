import './three/world.css';
import * as T from 'three';
import { GameSimulation } from './simulation/GameSimulation';
import { DomHud } from './ui/DomHud';
import { loadGame,saveGame } from './persistence/save';
import { ModelLibrary } from './three/models';
import { World3D,renderCatalogue } from './three/World3D';

declare global { interface Window { megawattRenderInfo?:()=>Record<string,unknown>; } }
async function start():Promise<void>{
  const parent=document.getElementById('game-root')!;
  const loading=document.createElement('div');loading.className='world-loading';loading.textContent='Opening Sunmeadow Valley…';parent.append(loading);
  const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance',preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate=false;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const models=new ModelLibrary();await models.load();renderCatalogue(renderer,models);parent.append(renderer.domElement);
  let sim:GameSimulation,world:World3D,hud:DomHud;
  function resize():void{renderer.setSize(innerWidth,innerHeight);world.resize(innerWidth,innerHeight);}
  function newGame():void{
    hud?.destroy();world?.destroy();sim=new GameSimulation();world=new World3D(renderer,models,sim);
    hud=new DomHud(sim,newGame,tile=>world.focus(tile));resize();
  }
  newGame();const saved=loadGame();if(saved){sim!.load(saved);sim!.speed=0;sim!.message='Company restored. Press Play when ready.';}
  loading.remove();
  const desktop=window.megawattDesktop;
  desktop?.onCommand(command=>{
    if(command==='save-close')desktop.confirmClose(saveGame(sim.serialize()));
    else if(command==='pause')sim.setSpeed(0);
    else if(command==='save'||command==='load')(document.querySelector('[data-action="'+command+'"]') as HTMLButtonElement|null)?.click();
  });
  window.addEventListener('resize',resize);window.addEventListener('pagehide',()=>saveGame(sim.serialize()));
  const canvas=renderer.domElement;
  let down:{x:number;y:number;lastX:number;lastY:number;moved:boolean}|null=null;
  canvas.addEventListener('pointerdown',e=>{if(hud.isOverlayOpen()||e.button!==0)return;canvas.setPointerCapture(e.pointerId);down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};});
  canvas.addEventListener('pointermove',e=>{
    world.setPointer(e.clientX,e.clientY,true);
    if(!down||hud.isOverlayOpen())return;
    if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)down.moved=true;
    if(down.moved)world.pan(e.clientX-down.lastX,e.clientY-down.lastY);
    down.lastX=e.clientX;down.lastY=e.clientY;
  });
  canvas.addEventListener('pointerup',e=>{
    if(!down)return;const clicked=!down.moved;down=null;
    if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(!clicked||hud.isOverlayOpen())return;
    const snapshot=sim.snapshot();
    if(snapshot.buildMode){
      const tile=world.tileAt(e.clientX,e.clientY),plot=tile?sim.plotAtTile(tile):null;
      if(tile&&plot){const placed=sim.placeEquipment(snapshot.buildMode,plot,tile);if(placed&&e.shiftKey)sim.setBuildMode(snapshot.buildMode);}
      else sim.message='Choose an unlocked building plot.';return;
    }
    const description=world.inspect(e.clientX,e.clientY);
    if(description){sim.selectEntity(null);sim.message=description;return;}
    sim.selectEntity(world.pick(e.clientX,e.clientY));
  });
  canvas.addEventListener('pointercancel',()=>{down=null;});
  canvas.addEventListener('pointerleave',()=>world.setPointer(-1,-1,false));
  canvas.addEventListener('wheel',e=>{e.preventDefault();if(!hud.isOverlayOpen())world.zoomBy(e.deltaY);},{passive:false});
  window.addEventListener('keydown',e=>{
    if(hud.isOverlayOpen()||hud.isTextEntryFocused())return;
    if(e.code==='Space'){e.preventDefault();sim.setSpeed(sim.speed===0?1:0);}
    else if(e.code==='KeyR'&&sim.selectedId)sim.dispatchRepair(sim.selectedId);
    else if(e.code==='KeyC'&&sim.selectedId)sim.dispatchClean(sim.selectedId);
  });
  let previous=performance.now(),savedAt=previous,hudAt=0;
  const fps=desktop?.preferences().fps??60;
  function tick(now:number):void{
    requestAnimationFrame(tick);
    const raw=(now-previous)/1000;if(raw<1/fps-.002)return;previous=now;
    const delta=Math.min(raw,.25);sim.update(delta);
    if(now-savedAt>30000){savedAt=now;saveGame(sim.serialize());}
    const snapshot=sim.snapshot();world.sync(snapshot,delta,hud.isOverlayOpen());world.render();
    if(now-hudAt>80){hudAt=now;hud.render(snapshot);}
  }
  window.megawattRenderInfo=()=>world.stats();requestAnimationFrame(tick);
}
void start().catch(error=>{
  console.error(error);const parent=document.getElementById('game-root')!;parent.textContent='';
  const message=document.createElement('div');message.className='world-loading';message.textContent='The 3D valley could not start. '+String(error)+' — your company save has not been changed. Please relaunch.';parent.append(message);
});
