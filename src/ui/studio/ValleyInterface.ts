
import type {GameSimulation} from '../../simulation/GameSimulation';
import type {GameSnapshot,EquipmentKind,CapabilityId,StaffMember,Vec2} from '../../simulation/types';
import type {ResearchId} from '../../content/research';
import type {ContractId} from '../../content/contracts';
import {EQUIPMENT,BUILD_MENU_ORDER} from '../../content/equipment';
import {SAVE_VERSION} from '../../content/scenario';
import {scenarioBriefing} from '../../content/progression';
import {sound} from '../../audio/sound';
import {saveGame,loadGame,clearSave} from '../../persistence/save';
import {validateState} from '../../persistence/validate';
import {procurement,people,research} from './anchors';
import {inspector,operations,company,objectives} from './management';
import {PRODUCT,type Page,type SiteView} from './data';
import {esc,money,action,glyph,heading,meter} from './components';
import {minimap} from './minimap';
import {patchChildren} from './reconcile';

export class ValleyInterface {
 private root=document.getElementById('ui-root')!;
 private listeners=new AbortController();
 private page:Page=null;
 private category='solar';
 private product:EquipmentKind='bargain_pv';
 private compare=false;
 private person:string|null=null;
 private staffTab='overview';
 private researchId:ResearchId='precision_wiring';
 private researchTab='engineering';
 private companyTab='finance';
 private view:SiteView='normal';
 private menu=false;
 private menuSpeed:0|1|2|4=1;
 private confirmSpeed:0|1|2|4=0;
 private confirmAction:{title:string;body:string;action:()=>void}|null=null;
 private lastSelection:string|null=null;
 private lastMessage='';
 private toastUntil=0;
 private cache=new Map<string,string>();
 private dialogKey='';
 private lastPage:Page=null;
 private returnFocus:HTMLElement|null=null;
 private destroyed=false;
 constructor(private sim:GameSimulation,private onNew:()=>void,private onCamera:(tile:Vec2|null)=>void,private onView:(view:SiteView)=>void){
  this.root.innerHTML='<div class="mv-interface" data-ui="studio"><header class="mv-top" data-slot="resources"></header><aside class="mv-goal" data-slot="goal"></aside><aside class="mv-alerts" data-slot="alerts"></aside><aside class="mv-workspace" data-slot="workspace" hidden></aside><aside class="mv-inspector" data-slot="inspector" hidden></aside><aside class="mv-minimap" data-slot="map"></aside><nav class="mv-navigation" data-slot="navigation" aria-label="Company workspaces"></nav><div class="mv-placement" data-slot="placement" hidden></div><div class="mv-toast" role="status" data-slot="toast" hidden></div><div class="mv-modal-layer" data-slot="modal" hidden></div></div>';
  this.root.addEventListener('click',e=>this.click(e),{signal:this.listeners.signal});
  this.root.addEventListener('change',e=>this.change(e),{signal:this.listeners.signal});
  window.addEventListener('keydown',e=>this.key(e),{signal:this.listeners.signal});
  this.render(this.sim.snapshot());
 }
 destroy():void{this.destroyed=true;this.listeners.abort();this.root.replaceChildren();}
 isOverlayOpen():boolean{return this.menu||!!this.confirmAction||!!this.sim.activeEvent||this.sim.scenarioComplete&&!this.sim.completionAcknowledged;}
 isTextEntryFocused():boolean{return ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName??'');}
 cancelTool():void{this.sim.setBuildMode(null);this.sim.selectEntity(null);this.page=null;this.setView('normal');this.render(this.sim.snapshot());}
 saveCompany():void{this.sim.message=saveGame(this.sim.serialize())?'Company saved.':'Save failed. Export a backup from the pause menu.';}
 loadCompany():void{const saved=loadGame();if(saved){this.sim.load(saved);this.sim.speed=0;this.page=null;this.lastSelection=null;this.sim.message='Company restored. Press Play when ready.';}else this.sim.message='No valid saved company found.';}
 private confirm(title:string,body:string,action:()=>void):void{this.confirmSpeed=this.sim.speed;this.sim.setSpeed(0);this.confirmAction={title,body,action};}
 private resolveConfirmation(accept:boolean):void{
  const pending=this.confirmAction;this.confirmAction=null;
  if(!this.menu&&!this.sim.activeEvent)this.sim.setSpeed(this.confirmSpeed);
  if(accept)pending?.action();
 }
 private setView(v:SiteView):void{this.view=v;this.onView(v);}
 private open(page:Page):void{this.page=this.page===page?null:page;this.sim.setBuildMode(null);this.sim.selectEntity(null);}
 private locate(id:string):void{const target=this.sim.equipment.find(e=>e.id===id)??this.sim.staff.find(m=>m.id===id);if(target){this.page=null;this.sim.setBuildMode(null);this.sim.selectEntity(id);this.onCamera(target.tile);}}
 private put(name:string,html:string):void{
  const slot=this.root.querySelector<HTMLElement>('[data-slot="'+name+'"]')!;slot.hidden=!html;
  if(this.cache.get(name)===html)return;
  if(document.activeElement?.tagName==='SELECT'&&slot.contains(document.activeElement))return;
  const template=document.createElement('template');template.innerHTML=html;patchChildren(slot,template.content);this.cache.set(name,html);
 }
 render(s:GameSnapshot):void{
  if(this.destroyed)return;
  if(s.selectedId!==this.lastSelection){this.lastSelection=s.selectedId;if(s.staff.some(m=>m.id===s.selectedId)){this.person=s.selectedId;this.staffTab='overview';this.page='people';}else if(s.selectedId)this.page=null;}
  const brief=scenarioBriefing(s),capacity=s.equipment.filter(e=>e.kind.includes('pv')&&e.commissioned).reduce((n,e)=>n+EQUIPMENT[e.kind].nameplateKw,0);
  this.put('resources','<a class="mv-brand" href="#" data-action="home" aria-label="Return camera home">'+glyph('power')+'<span>MEGAWATT<small>VALLEY</small></span></a><button class="mv-resource" data-action="page" data-id="company"><small>COMPANY CASH</small><b>'+money(s.cash)+'</b><span class="'+(s.revenuePerHour<0?'negative':'positive')+'">'+(s.revenuePerHour>=0?'+':'')+money(s.revenuePerHour)+' net / h</span></button><button class="mv-resource" data-action="page" data-id="company"><small>EXPORT / CONNECTION</small><b>'+s.exportedKw.toFixed(1)+' <em>/ '+s.inverterCapacityKw.toFixed(0)+' kW</em></b>'+meter(s.exportedKw/s.inverterCapacityKw,'Grid export')+'</button><div class="mv-resource mv-capacity"><small>INSTALLED SOLAR</small><b>'+capacity+' kW</b><span>'+Math.round(s.totalEnergyKwh).toLocaleString()+' kWh exported</span></div><button class="mv-resource mv-team-stat" data-action="page" data-id="people"><small>YOUR TEAM</small><b>'+s.staff.length+(s.staff.length===1?' person':' people')+'</b><span>'+s.staff.filter(m=>m.task.type!=='idle').length+' in the field</span></button><div class="mv-clock"><span>'+glyph('sun')+esc(s.weather.replaceAll('_',' '))+'</span><b>Day '+s.day+' · '+Math.floor(s.hour).toString().padStart(2,'0')+':'+Math.floor((s.hour%1)*60).toString().padStart(2,'0')+'</b><div class="mv-speed">'+[0,1,2,4].map(n=>action('speed',n===0?'Ⅱ':n===1?'▶':n+'×',String(n),s.speed===n?'selected':'quiet','aria-label="'+(n===0?'Pause':'Play at '+n+' times speed')+'" aria-pressed="'+(s.speed===n)+'"')).join('')+'</div></div>'+action('menu',glyph('menu'),'','icon','aria-label="Pause menu"'));
  this.put('goal',!this.page&&!s.selectedId&&!s.buildMode?'<div class="mv-goal-top"><span>HERE COMES THE SUN</span>'+action('page','★'.repeat(s.stars)+'☆'.repeat(3-s.stars),'objectives','quiet','aria-label="Scenario objectives"')+'</div><h2>'+esc(brief.title.replace(/^\d+ · /,''))+'</h2><p>'+esc(brief.body)+'</p>'+action('briefing',brief.label+' '+glyph('arrow'),'','primary'):'');
  const faults=s.equipment.filter(e=>e.faulted);
  this.put('alerts',!this.page&&faults.length?action('locate',glyph('operations')+faults.length+' equipment fault'+(faults.length>1?'s':''),faults[0].id,'warning'):!this.page&&s.clippedKw>5?action('page',glyph('power')+' Export capacity reached','company','warning'):'');
  let content=this.page==='build'?procurement(s,this.category,this.product,this.compare):this.page==='people'?people(s,this.person,this.staffTab):this.page==='research'?research(s,this.sim,this.researchId,this.researchTab):this.page==='operations'?operations(s):this.page==='company'?company(s,this.sim,this.companyTab):this.page==='objectives'?objectives(s):this.page==='views'?heading('READ THE VALLEY','Site views')+'<div class="mv-view-list">'+[['normal','Natural view','Enjoy the valley'],['access','Service access','Green: connected road access. Amber: standard travel.'],['condition','Condition','Green: healthy. Red: worn or failed.'],['dust','Cleanliness','Green: clean. Red: dusty.'],['power','Generation','Solar capacity and connection state.']].map(([id,title,body])=>action('view','<b>'+title+'</b><span>'+body+'</span>',id,this.view===id?'selected':'secondary')).join('')+'</div>':'';
  this.put('workspace',content);
  if(this.lastPage!==this.page){this.root.querySelector<HTMLElement>('[data-slot="workspace"]')!.scrollTop=0;this.lastPage=this.page;}
  const workspace=this.root.querySelector<HTMLElement>('[data-slot="workspace"]')!;workspace.dataset.page=this.page??'';
  this.put('inspector',!this.page?inspector(s):'');
  this.put('navigation',(['build','people','research','operations','company','objectives','views'] as const).map(id=>action('page',glyph(id)+'<span>'+({build:'Build',people:'People',research:'Research',operations:'Operations',company:'Company',objectives:'Goals',views:'Site views'}[id])+'</span>',id,this.page===id?'selected':'quiet','aria-pressed="'+(this.page===id)+'"')).join(''));
  this.put('map',!this.page&&!s.selectedId?minimap(s):'');
  this.put('placement',s.buildMode?'<div>'+glyph('build')+'<b>'+PRODUCT[s.buildMode].short+'</b><span>'+money(EQUIPMENT[s.buildMode].cost)+(s.buildMode==='road'?' / tile · Drag a route · Shift changes bend':' / item · Click to build')+'</span><small>Right-click / Esc cancels · Middle-drag pans</small></div>'+action('page','Catalogue','build')+action('cancel','Cancel','','quiet'):this.view!=='normal'?'<b>Site view · '+this.view+'</b>'+action('view','Return to natural view','normal'):'');
  const event=s.activeEvent,won=s.scenarioComplete&&!s.completionAcknowledged;
  const key=this.confirmAction?'confirm':event?'event-'+event.id:won?'complete':this.menu?'menu':'';
  const dialog=this.confirmAction?'<section class="mv-dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title"><span class="mv-eyebrow">PLEASE CONFIRM</span><h2 id="dialog-title">'+esc(this.confirmAction.title)+'</h2><p>'+esc(this.confirmAction.body)+'</p><footer>'+action('confirm-no','Keep playing')+action('confirm-yes','Confirm','','primary danger')+'</footer></section>':event?'<section class="mv-dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title"><span class="mv-eyebrow">MESSAGE FOR THE OWNER</span><h2 id="dialog-title">'+esc(event.title)+'</h2><p>'+esc(event.body)+'</p><div class="mv-decision-choices">'+event.choices.map(c=>action('choice','<b>'+esc(c.label)+'</b><span>'+esc(c.description)+'</span>',c.id)).join('')+'</div><small>Park time is paused until you decide.</small></section>':won?'<section class="mv-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="mv-awards">★</div><h2 id="dialog-title">Here comes your future.</h2><p>You built an operating energy company. Stay in this valley for two- and three-star mastery. The next campaign chapter is unlocked for a future release.</p>'+action('continue','Continue managing','','primary')+'</section>':this.menu?'<section class="mv-dialog mv-pause" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><span class="mv-eyebrow">MEGAWATT VALLEY</span><h2 id="dialog-title">Take a breather.</h2>'+action('menu','Return to valley','','primary')+action('save','Save company')+action('load','Load company')+'<div class="mv-inline">'+action('export','Export save')+action('import','Import save')+'</div>'+action('sound','Sound · '+(sound.enabled?'On':'Off'))+action('new','Start a new company','','danger quiet')+'<p>Drag to pan · Wheel to zoom · Space to pause<br>B Build · T People · U Research · H Home<br>Right-click cancels placement · Ctrl S saves</p></section>':'';
  if(key&&!this.dialogKey)this.returnFocus=document.activeElement as HTMLElement;
  this.put('modal',dialog);
  // Make background controls unavailable to keyboard and assistive technology during decisions.
  this.root.querySelectorAll<HTMLElement>('.mv-interface > :not([data-slot="modal"])').forEach(el=>el.inert=!!key);
  if(key!==this.dialogKey){if(key)this.root.querySelector<HTMLElement>('[data-slot="modal"] button:not(:disabled)')?.focus({preventScroll:true});else this.returnFocus?.isConnected&&this.returnFocus.focus({preventScroll:true});this.dialogKey=key;}
  if(s.message&&s.message!==this.lastMessage){this.lastMessage=s.message;this.toastUntil=performance.now()+6500;}
  this.put('toast',performance.now()<this.toastUntil?esc(this.lastMessage):'');
  sound.update(s.weather,s.faultsRepaired,s.cleansCompleted,s.stars);
 }
 private click(e:Event):void{
  const el=(e.target as Element).closest<HTMLElement>('[data-action]');if(!el||(el as HTMLButtonElement).disabled)return;
  e.preventDefault();const action=el.dataset.action!,id=el.dataset.id??'';
  switch(action){
   case 'page':this.open(id as Page);break;
   case 'close':case 'cancel':this.cancelTool();break;
   case 'category':this.category=id;this.product=BUILD_MENU_ORDER.find(k=>PRODUCT[k].group===id)??'bargain_pv';this.page='build';break;
   case 'product':this.product=id as EquipmentKind;break;
   case 'compare':this.compare=!this.compare;break;
   case 'person':this.person=id;this.page='people';this.staffTab='overview';this.sim.selectEntity(null);break;
   case 'staff-tab':this.staffTab=id;break;
   case 'research-select':this.researchId=id as ResearchId;break;
   case 'research-tab':this.researchTab=id;break;
   case 'company-tab':this.companyTab=id;break;
   case 'map-site':{const p=this.sim.plots.find(p=>p.id===id);if(p)this.onCamera({x:p.origin.x+p.size.x/2,y:p.origin.y+p.size.y/2});break;}
   case 'place':this.sim.selectEntity(null);this.page=null;this.sim.setBuildMode(id as EquipmentKind);this.setView(id==='road'?'access':'normal');break;
   case 'view':this.setView(id as SiteView);break;
   case 'speed':this.sim.setSpeed(Number(id) as 0|1|2|4);break;
   case 'home':this.onCamera(null);break;
   case 'focus-person':case 'focus-asset':{const target=this.sim.equipment.find(e=>e.id===id)??this.sim.staff.find(m=>m.id===id);if(target){this.page=null;this.sim.selectEntity(null);this.onCamera(target.tile);}break;}
   case 'locate':this.locate(id);break;
   
   case 'hire':{const before=this.sim.staff.length;this.sim.hireStaff(id as StaffMember['role']);if(this.sim.staff.length>before){this.person=this.sim.staff[this.sim.staff.length-1].id;this.staffTab='overview';}break;}
   case 'train':this.sim.trainStaff(id);break;
   case 'repair':this.sim.dispatchRepair(id);break;
   case 'clean':this.sim.dispatchClean(id);break;
   case 'service':this.sim.dispatchService(id);break;
   case 'sell':this.confirm('Sell this equipment?','You will receive 60% of its purchase price, adjusted for condition. Assigned jobs are cancelled.',()=>{this.sim.demolish(id);});break;
   case 'dismiss':this.confirm('Dismiss this team member?','Their position becomes available for a new hire. At least one repair-capable worker must remain.',()=>{this.sim.dismissStaff(id);});break;
   case 'confirm-no':this.resolveConfirmation(false);break;
   case 'confirm-yes':this.resolveConfirmation(true);break;
   case 'capability':this.sim.buyCapability(id as CapabilityId);break;
   case 'research':this.sim.startResearch(id as ResearchId);break;
   case 'contract':this.sim.acceptContract(id as ContractId);break;
   case 'cancel-contract':this.confirm('Cancel this delivery?','Any deposit will be forfeited. Electricity sales continue.',()=>{this.sim.cancelContract();});break;
   case 'cancel-job':this.sim.cancelWorkOrder(id,el.dataset.kind as 'repair'|'clean'|'service');break;
   case 'clean-all':for(const e of this.sim.equipment)if(e.kind.includes('pv')&&e.soiling>=.15)this.sim.dispatchClean(e.id);break;
   case 'service-all':for(const e of this.sim.equipment)if(e.kind.includes('pv')&&e.condition<.995)this.sim.dispatchService(e.id);break;
   case 'choice':this.sim.resolveEventChoice(id);break;
   case 'continue':this.sim.completionAcknowledged=true;break;
   case 'briefing':{const brief=scenarioBriefing(this.sim.snapshot());if(brief.target)this.locate(brief.target);else{this.page=brief.action==='build'?'build':brief.action==='caps'?'research':brief.action==='operations'?'operations':brief.action==='contracts'?'company':'objectives';if(brief.action==='caps')this.researchTab='capabilities';if(brief.action==='contracts')this.companyTab='contracts';this.sim.setBuildMode(null);this.sim.selectEntity(null);}break;}
   case 'menu':if(!this.menu){this.menuSpeed=this.sim.speed;this.sim.setSpeed(0);}else if(!this.sim.activeEvent)this.sim.setSpeed(this.menuSpeed);this.menu=!this.menu;break;
   case 'save':this.saveCompany();break;
   case 'load':this.loadCompany();this.menuSpeed=0;this.menu=false;break;
   case 'sound':sound.toggle();break;
   case 'new':this.confirm('Start a new company?','Your current local save will be replaced. Export it first if you want to keep it.',()=>{if(clearSave())this.onNew();else this.sim.message='Could not clear the save. Export a backup first.';});break;
   case 'export':{const blob=new Blob([JSON.stringify({version:SAVE_VERSION,savedAt:new Date().toISOString(),state:this.sim.serialize()},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Megawatt-Valley-company.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);break;}
   case 'import':{const input=document.createElement('input');input.type='file';input.accept='.json';input.onchange=async()=>{try{const file=input.files?.[0];if(!file)return;if(file.size>5_000_000)throw Error('File too large');const data=JSON.parse(await file.text());if(data.version!==SAVE_VERSION||!validateState(data.state))throw Error('Not a compatible company');this.sim.load(data.state);this.lastSelection=null;this.sim.setSpeed(0);this.sim.message='Company imported. Press Play when ready.';this.menu=false;this.menuSpeed=0;this.page=null;this.render(this.sim.snapshot());}catch(error){this.sim.message='Import failed: '+String(error);}};input.click();break;}
  }
  sound.note(440,.04,.012);this.render(this.sim.snapshot());
 }

 private change(e:Event):void{
  const el=e.target as HTMLSelectElement|HTMLInputElement,m=this.sim.staff.find(m=>m.id===this.person)??this.sim.staff[0];
  if(el.dataset.field==='zone'&&m)this.sim.setStaffAssignment(m.id,el.value as StaffMember['workZone'],m.preference??'auto');
  if(el.dataset.field==='duty'&&m)this.sim.setStaffAssignment(m.id,m.workZone??'all',el.value as StaffMember['preference']);
  if(el.dataset.field==='cleaning')this.sim.setCleaningThreshold(Number(el.value));
  if(el.dataset.field==='preventive')this.sim.setPreventiveMaintenance((el as HTMLInputElement).checked);
  this.render(this.sim.snapshot());
 }
 private key(e:KeyboardEvent):void{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();this.saveCompany();this.render(this.sim.snapshot());return;}
  if(e.key==='Tab'&&this.isOverlayOpen()){
   const controls=this.root.querySelectorAll<HTMLElement>('[data-slot="modal"] button:not(:disabled),[data-slot="modal"] input:not(:disabled)');
   if(!controls.length)return;const first=controls[0],last=controls[controls.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;
  }
  if((e.key==='Enter'||e.key===' ')&&(document.activeElement as HTMLElement)?.dataset.action==='map-site'){e.preventDefault();(document.activeElement as HTMLElement).dispatchEvent(new MouseEvent('click',{bubbles:true}));return;}
  if(e.key==='Escape'){
   e.preventDefault();if(this.confirmAction)this.resolveConfirmation(false);else if(this.sim.activeEvent||this.sim.scenarioComplete&&!this.sim.completionAcknowledged)return;else if(this.menu){this.menu=false;this.sim.setSpeed(this.menuSpeed);}else if(this.page||this.sim.buildMode||this.sim.selectedId)this.cancelTool();else{this.menuSpeed=this.sim.speed;this.sim.setSpeed(0);this.menu=true;}this.render(this.sim.snapshot());return;
  }
  if(this.isTextEntryFocused()||this.isOverlayOpen())return;
  const k=e.key.toLowerCase();if(k==='b')this.open('build');if(k==='t')this.open('people');if(k==='u')this.open('research');if(k==='h')this.onCamera(null);
  if(k==='f'&&this.sim.selectedId){const entity=this.sim.equipment.find(x=>x.id===this.sim.selectedId)??this.sim.staff.find(x=>x.id===this.sim.selectedId);if(entity)this.onCamera(entity.tile);}
  this.render(this.sim.snapshot());
 }
}
