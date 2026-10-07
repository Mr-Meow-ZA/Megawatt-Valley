import {patchChildren} from './morph';
import type {GameSimulation} from '../../simulation/GameSimulation';
import type {GameSnapshot,EquipmentKind,CapabilityId,StaffMember,Vec2} from '../../simulation/types';
import {EQUIPMENT,BUILD_MENU_ORDER} from '../../content/equipment';
import {CAPABILITY_INFO,SAVE_VERSION} from '../../content/scenario';
import {RESEARCH,RESEARCH_BRANCHES,type ResearchId} from '../../content/research';
import {CONTRACTS,contractOffer,type ContractId} from '../../content/contracts';
import {scenarioBriefing} from '../../content/progression';
import {parkMetrics,hasServiceAccess,nearbyWorkshop,taskLabel} from '../../simulation/operations';
import {connectedRoads,roadKey} from '../../simulation/roads';
import {SITE_ICONS} from '../../game/siteArt';
import {sound} from '../../audio/sound';
import {saveGame,loadGame,clearSave} from '../../persistence/save';
import {validateState} from '../../persistence/validate';
import {CATALOGUE} from './catalogue';
import {esc,money,percent,button,meter,icon} from './format';
export type SiteView='normal'|'access'|'condition'|'dust'|'power';
type Panel='build'|'staff'|'company'|'views'|'journal'|null;
const roles:Record<StaffMember['role'],{title:string;benefit:string}>={
 technician:{title:'Technician',benefit:'Repairs, services and cleans equipment.'},
 cleaner:{title:'Cleaner',benefit:'Keeps panels productive so technicians can focus on faults.'},
 engineer:{title:'Engineer',benefit:'Field work plus research assistance when idle.'},
 manager:{title:'Site manager',benefit:'Supports field productivity across the company.'}
};
export class TycoonHud {
 private destroyed=false;
 private root=document.getElementById('ui-root')!;
 private listeners=new AbortController();
 private panel:Panel=null;
 private category='power';
 private search='';
 private companyTab='overview';
 private view:SiteView='normal';
 private menu=false;
 private menuSpeed:0|1|2|4=1;
 private selected:string|null=null;
 private lastMessage='';
 private toastUntil=0;
 private cache=new Map<string,string>();
 private modalKey='';
 private confirmAction:{title:string;body:string;action:()=>void}|null=null;
 constructor(private sim:GameSimulation,private onNew:()=>void,private onCamera:(tile:Vec2|null)=>void,private onView:(view:SiteView)=>void){
  this.root.innerHTML='<div class="tycoon-ui" data-k="tycoon-ui"><header class="resource-strip" data-slot="resources"></header><div class="top-tools">'+button('menu',icon('menu'),'','title="Pause menu" aria-label="Pause menu"')+'</div><aside class="goal-card" data-slot="goal"></aside><aside class="left-panel paper" data-slot="panel" hidden></aside><aside class="inspector paper" data-slot="inspector" hidden></aside><div class="alert-chip" data-slot="alerts"></div><nav class="tool-rail" data-slot="tools"></nav><div class="time-control" data-slot="time"></div><div class="tool-help" data-slot="help" hidden></div><div class="toast" role="status" data-slot="toast" hidden></div><div class="sheet-backdrop" data-slot="sheet" hidden></div><div class="decision-backdrop" data-slot="decision" hidden></div><div class="menu-backdrop" data-slot="menu" hidden></div></div>';
  this.root.addEventListener('click',e=>this.click(e),{signal:this.listeners.signal});
  this.root.addEventListener('input',e=>{const input=e.target as HTMLInputElement;if(input.dataset.field==='search'){this.search=input.value;this.render(this.sim.snapshot());}},{signal:this.listeners.signal});
  this.root.addEventListener('change',e=>this.change(e),{signal:this.listeners.signal});
  window.addEventListener('keydown',e=>this.key(e),{signal:this.listeners.signal});
  this.render(this.sim.snapshot());
 }
 destroy():void{this.destroyed=true;this.listeners.abort();this.root.replaceChildren();}
 isOverlayOpen():boolean{return this.menu||!!this.confirmAction||!!this.sim.activeEvent||this.sim.scenarioComplete&&!this.sim.completionAcknowledged||this.panel==='company'||this.panel==='journal';}
 isTextEntryFocused():boolean{return ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName??'');}
 cancelTool():void{this.sim.setBuildMode(null);this.sim.selectEntity(null);this.panel=null;this.setView('normal');this.render(this.sim.snapshot());}
 saveCompany():void{this.sim.message=saveGame(this.sim.serialize())?'Company saved.':'Save failed. Export a backup from the pause menu.';}
 loadCompany():void{const saved=loadGame();if(saved){this.sim.load(saved);this.sim.speed=0;this.panel=null;this.sim.message='Company restored. Press Play when ready.';}else this.sim.message='No valid saved company found.';}
 private activeDialog():HTMLElement|null{
  for(const slot of ['decision','menu','sheet']){const el=this.slot(slot);if(!el.hidden)return el;}
  return null;
 }
 private slot(name:string):HTMLElement{return this.root.querySelector('[data-slot="'+name+'"]')!;}
 private put(name:string,html:string):void{
  const slot=this.slot(name);slot.hidden=!html;
  if(this.cache.get(name)===html)return;
  const active=document.activeElement as HTMLInputElement|null;
  if(active?.tagName==='SELECT'&&slot.contains(active))return;
  const field=active&&slot.contains(active)?active.dataset.field:undefined,start=active?.selectionStart,end=active?.selectionEnd;
  const scroll=slot.querySelector('.panel-scroll')?.scrollTop??0;
  const template=document.createElement('template');template.innerHTML=html;patchChildren(slot,template.content);this.cache.set(name,html);
  const scroller=slot.querySelector('.panel-scroll');if(scroller)scroller.scrollTop=scroll;
  if(field){const replacement=slot.querySelector('[data-field="'+field+'"]') as HTMLInputElement|null;replacement?.focus({preventScroll:true});if(replacement?.type==='search'&&start!==null)replacement.setSelectionRange(start??0,end??start??0);}
 }
 private setView(view:SiteView):void{this.view=view;this.onView(view);}
 private open(panel:Panel):void{this.panel=this.panel===panel?null:panel;this.sim.setBuildMode(null);this.sim.selectEntity(null);if(panel!=='views')this.setView('normal');}
 private locate(id:string):void{
  const target=this.sim.equipment.find(e=>e.id===id)??this.sim.staff.find(s=>s.id===id);
  if(target){this.panel=null;this.sim.setBuildMode(null);this.sim.selectEntity(id);this.onCamera(target.tile);}
 }
 private title(kicker:string,title:string):string{return '<header class="panel-head"><div><small>'+kicker+'</small><h2>'+title+'</h2></div>'+button('close',icon('close'),'','class="icon-button" aria-label="Close panel"')+'</header>';}
 private build(s:GameSnapshot):string{
  const groups=[['power','Generation'],['service','Infrastructure'],['landscape','Landscaping']];
  const items=BUILD_MENU_ORDER.filter(id=>CATALOGUE[id].group===this.category&&CATALOGUE[id].name.toLowerCase().includes(this.search.toLowerCase()));
  const header='<header class="panel-head build-head"><div class="build-title"><small>DESIGN YOUR SITE</small><h2>Build</h2></div><nav class="category-tabs" aria-label="Build categories">'+groups.map(([id,name])=>button('category',name,id,'aria-pressed="'+(id===this.category)+'" class="'+(id===this.category?'active':'')+'"')).join('')+'</nav><label class="search-box"><span>Find an item</span><input type="search" data-field="search" aria-label="Find a build item" value="'+esc(this.search)+'" placeholder="Find an item…"></label>'+button('close',icon('close'),'','class="icon-button" aria-label="Close build catalogue"')+'</header>';
  return header+'<div class="panel-scroll"><div class="catalogue-grid" aria-label="Available buildings">'+items.map(id=>{
   const def=EQUIPMENT[id],info=CATALOGUE[id],lock=id==='workshop'&&!s.capabilities.includes('radio_dispatch')?'Complete your first repair':s.cash<def.cost?'Not enough cash':null;
   return '<button class="catalogue-item '+(s.buildMode===id?'active':'')+'" type="button" data-action="build" data-id="'+id+'" aria-pressed="'+(s.buildMode===id)+'" '+(lock?'disabled':'')+' title="'+esc(info.purpose+' '+info.tradeoff+(lock?' · '+lock:''))+'"><img src="'+SITE_ICONS[id]+'" alt=""><b>'+info.name+'</b><span>'+money(def.cost)+'</span><small>'+esc(lock??(info.group==='landscape'?'Decorative':id==='road'?'Drag to build':def.nameplateKw?def.nameplateKw+' kW':'Service support'))+'</small></button>';
  }).join('')+(!items.length?'<p class="catalogue-empty">No matching items in this category. Try another name or category.</p>':'')+'</div><aside class="catalogue-note">'+(s.buildMode?'<span class="eyebrow">SELECTED FOR CONSTRUCTION</span><h3>'+CATALOGUE[s.buildMode].name+'</h3><p>'+CATALOGUE[s.buildMode].purpose+'</p><small>'+CATALOGUE[s.buildMode].tradeoff+'</small>':'<span class="eyebrow">PLAN YOUR NEXT PURCHASE</span><h3>Make room for a brighter future</h3><p>Choose equipment to see its purpose and trade-offs. Your valley stays within reach.</p><small>Right-click cancels · Middle-drag pans</small>')+'</aside></div>';
 }
 private people(s:GameSnapshot):string{
  return this.title('YOUR PEOPLE','Staff')+'<div class="panel-scroll"><p class="section-note">'+s.staff.length+' / 5 positions filled. Select a person to assign duties.</p><div class="crew-list">'+s.staff.map(m=>'<button class="crew-card" data-action="locate" data-id="'+m.id+'"><span class="crew-avatar role-'+m.role+'">'+esc(m.name.split(' ').map(n=>n[0]).join(''))+'</span><span><b>'+esc(m.name)+'</b><small>'+roles[m.role].title+' · '+esc(taskLabel(m))+'</small></span><em>›</em></button>').join('')+'</div><h3>Hire someone</h3>'+Object.entries(roles).map(([id,r])=>'<article class="hire-card"><h4>'+r.title+'</h4><p>'+r.benefit+'</p><footer><small>'+money(id==='engineer'?2:1)+' / park hour</small>'+button('hire','Hire · $1,500',id,(s.staff.length>=5||s.cash<1500?'disabled':'')+' class="primary"')+'</footer></article>').join('')+'</div>';
 }
 private inspect(s:GameSnapshot):string{
  const e=s.equipment.find(e=>e.id===s.selectedId),m=s.staff.find(m=>m.id===s.selectedId);
  if(m){
   const skill=m.skill??1,training=(m.trainingHoursLeft??0)>0;
   return this.title(roles[m.role].title.toUpperCase(),esc(m.name))+'<div class="panel-scroll"><div class="profile-hero"><span class="crew-avatar large role-'+m.role+'">'+esc(m.name.split(' ').map(n=>n[0]).join(''))+'</span><div><b>'+esc(m.trait??'Ready to help')+'</b><p>'+esc(taskLabel(m))+'</p></div></div><div class="stat-pair"><span>Skill <b data-k="worker-skill">'+skill.toFixed(1)+' / 5</b></span><span>Salary <b>'+money(m.salary??1)+'/h</b></span></div><h4>Energy</h4>'+meter(m.energy??1,'Energy')+'<label class="field">Work site<select data-field="zone"><option value="all" '+((m.workZone??'all')==='all'?'selected':'')+'>Both sites</option><option value="site_a" '+(m.workZone==='site_a'?'selected':'')+'>Sunny Meadow</option><option value="site_b" '+(m.workZone==='site_b'?'selected':'')+' '+(!s.plots[1].unlocked?'disabled':'')+'>River Bench</option></select></label><label class="field">Assignment<select data-field="duty">'+[['auto','Suitable duties'],...(m.role!=='cleaner'?[['repair','Repair & service']]:[]),['clean','Cleaning'],...(m.role==='engineer'?[['research','Office research']]:[])].map(([id,label])=>'<option value="'+id+'" '+((m.preference??'auto')===id?'selected':'')+'>'+label+'</option>').join('')+'</select></label><p class="section-note">Current jobs finish before new assignments take effect.</p>'+button('train',training?'Training · '+m.trainingHoursLeft!.toFixed(1)+' h left':'Train · $800',m.id,(training||skill>=5||s.cash<800?'disabled':'')+' class="primary wide"')+'<p class="section-note">Four park hours. Raises skill by one.</p><div class="inspector-footer">'+button('focus','Find in valley',m.id)+button('dismiss','Dismiss',m.id,'class="quiet danger"')+'</div></div>';
  }
  if(!e)return '';
  const info=CATALOGUE[e.kind],pv=e.kind.includes('pv'),road=e.kind==='road',access=hasServiceAccess(s.equipment,e),connected=connectedRoads(s.equipment).has(roadKey(e.tile));
  const assigned=s.staff.find(m=>m.task.type!=='idle'&&m.task.targetId===e.id),queued=s.workOrders.filter(o=>o.targetId===e.id);
  const pending=(kind:string)=>queued.some(o=>o.kind===kind)||!!(assigned&&assigned.task.type!=='idle'&&(assigned.task.type===kind||assigned.task.type==='travel'&&assigned.task.intent===kind));
  const status=!e.commissioned?'Under construction':e.faulted?'Fault · needs a technician':pv&&e.soiling>.35?'Dust is reducing output':'Operational';
  return this.title(e.plotId==='site_a'?'SUNNY MEADOW':'RIVER BENCH',info.name)+'<div class="panel-scroll"><div class="asset-hero"><img src="'+(SITE_ICONS[e.kind]??SITE_ICONS.inverter)+'" alt=""><span class="status-tag '+(e.faulted?'bad':'')+'">'+status+'</span></div><p>'+info.purpose+'</p><small class="muted">'+info.tradeoff+'</small>'+(!e.commissioned?'<h4>Construction · '+percent(e.constructionProgress)+'</h4>'+meter(e.constructionProgress,'Construction'):'')+(pv||e.kind==='inverter'?'<div class="stat-pair"><span>Nameplate <b>'+EQUIPMENT[e.kind].nameplateKw+' kW</b></span><span>Condition <b>'+percent(e.condition)+'</b></span></div>':'')+(pv?'<h4>Cleanliness · '+percent(1-e.soiling)+'</h4>'+meter(1-e.soiling,'Cleanliness'):'')+(road?'<div class="service-note '+(connected?'good':'bad')+'"><b>'+ (connected?'Connected to the access road':'Isolated road')+'</b><p>'+(connected?'Nearby equipment receives faster crew travel.':'Join this tile to the main road to enable its service benefit.')+'</p></div>':info.group!=='landscape'?'<div class="service-note '+(access?'good':'')+'"><b>'+(access?'Road access · 25% shorter travel':'No road service · standard travel')+'</b><p>'+(nearbyWorkshop(s.equipment,e)?'Workshop in range: repairs finish one third sooner.':'A connected road within 2.5 tiles of the service edge improves crew access.')+'</p></div>':'')+(info.group!=='landscape'?button('view','Show service access','access','class="quiet wide"'):'')+(pv||e.kind==='inverter'?'<div class="action-grid">'+button('repair',pending('repair')?'Repair assigned':'Send technician',e.id,(!e.faulted||pending('repair')?'disabled':'')+' class="primary"')+(pv?button('clean',pending('clean')?'Cleaning assigned':'Order cleaning',e.id,(e.soiling<.15||!e.commissioned||pending('clean')?'disabled':'')):'')+button('service',pending('service')?'Service assigned':'Service · $450',e.id,(!e.commissioned||e.faulted||e.condition>=.995||!pv||pending('service')?'disabled':''))+'</div>':'')+'<div class="inspector-footer">'+button('focus','Find in valley',e.id)+(EQUIPMENT[e.kind].buildable?button('sell','Sell · '+money(Math.floor(EQUIPMENT[e.kind].cost*.6*e.condition)),e.id,'class="quiet danger"'):'<small>Permanent infrastructure</small>')+'</div></div>';
 }
 private overview(s:GameSnapshot):string{
  const metrics=parkMetrics(s.equipment);
  return '<div class="summary-grid">'+[['Cash',money(s.cash)],['Current net / h',money(s.revenuePerHour)],['Export',s.exportedKw.toFixed(1)+' kW'],['Grid capacity',s.inverterCapacityKw+' kW'],['Availability',percent(metrics.availability)],['Cleanliness',percent(metrics.cleanliness)]].map(([label,value])=>'<article><small>'+label+'</small><strong>'+value+'</strong></article>').join('')+'<div class="report-columns"><section><h3>Today’s operation</h3>'+[['Electricity sold',Math.round(s.currentReport.energyKwh)+' kWh'],['Electricity revenue',money(s.currentReport.revenue)],['Running costs',money(s.currentReport.expenses)],['Lifetime sales',money(s.lifetimeRevenue)],['Peak export',s.peakExportKw.toFixed(0)+' kW']].map(([k,v])=>'<div class="report-line"><span>'+k+'</span><b>'+v+'</b></div>').join('')+'<p class="section-note">Operating costs include wages, running equipment and service. Construction and research are separate capital purchases.</p></section><section><h3>Where to focus</h3><p>'+esc(scenarioBriefing(s).body)+'</p>'+button('briefing',scenarioBriefing(s).label,'','class="primary"')+(s.clippedKw>0?'<div class="service-note bad">You are losing '+s.clippedKw.toFixed(1)+' kW to your export limit. Consider an inverter.</div>':'<div class="service-note good">Your export connection has room for current generation.</div>')+'</section></div>';
 }
 private upgrades(s:GameSnapshot):string{
  const expanded=s.plots[1].unlocked,hasChoice=s.capabilities.some(c=>c==='cleaning_rig'||c==='remote_monitoring');
  return '<h3>Teach the company to take over</h3><p class="section-note">Manual work introduces a problem. Better tools and policies take over the repetition.</p><div class="upgrade-grid">'+(Object.keys(CAPABILITY_INFO) as CapabilityId[]).map(id=>{
    const def=CAPABILITY_INFO[id],done=s.capabilities.includes(id),earned=id==='radio_dispatch'||id==='cleaning_kit',cost=id==='scheduled_cleaning'?3000:hasChoice?4000:0;
    const blocked=done?'Unlocked':earned?(id==='radio_dispatch'?'Earned by your first repair':'Earned by your first clean'):!expanded?'Open Site B first':id==='scheduled_cleaning'&&!s.capabilities.includes('cleaning_rig')?'Requires Cleaning Rig':s.cash<cost?'Not enough cash':null;
    return '<article class="upgrade-card '+(done?'complete':'')+'"><span class="eyebrow">'+(done?'COMPANY CAPABILITY':'NEXT RESPONSIBILITY')+'</span><h4>'+def.name+'</h4><p>'+def.description+'</p>'+button('capability',blocked??(cost?money(cost):'Choose free upgrade'),id,(blocked?'disabled':'')+' class="primary"')+'</article>';
  }).join('')+'</div><h3>Engineering programmes</h3>'+(s.activeResearch?'<div class="research-progress"><b>'+RESEARCH[s.activeResearch.id].name+' · '+percent(s.activeResearch.progress)+'</b>'+meter(s.activeResearch.progress,'Research')+'</div>':'')+'<div class="research-branches">'+RESEARCH_BRANCHES.map(branch=>'<section><h4>'+branch.name+'</h4>'+Object.entries(RESEARCH).filter(([,r])=>r.branch===branch.id).map(([id,r])=>{
    const reason=this.sim.researchBlockedReason(id as ResearchId);
    return '<article class="research-node '+(s.researched.includes(id as ResearchId)?'complete':'')+'" data-research="'+id+'"><h5>'+r.name+'</h5><p>'+r.effect+'</p><small>'+r.hours+' park hours'+(r.prerequisite?' · Needs '+RESEARCH[r.prerequisite].name:'')+'</small>'+button('research',reason??('Start · '+money(r.cost)),id,reason?'disabled':'')+'</article>';
  }).join('')+'</section>').join('')+'</div>';
 }
 private policies(s:GameSnapshot):string{
  const jobs=s.staff.filter(m=>m.task.type!=='idle');
  const asset=(id:string)=>{const e=s.equipment.find(e=>e.id===id);return e?esc(CATALOGUE[e.kind].name+' · '+(e.plotId==='site_a'?'Site A':'Site B')+' ('+e.tile.x+', '+e.tile.y+')'):'Equipment removed';};
  return '<div class="report-columns"><section><h3>Let the team handle routine work</h3><label class="field">Cleaning threshold<select data-field="cleaning" '+(!s.capabilities.includes('scheduled_cleaning')?'disabled':'')+'>'+[.2,.35,.5].map(n=>'<option value="'+n+'" '+(s.cleaningThreshold===n?'selected':'')+'>'+percent(n)+' dust</option>').join('')+'</select></label><small>'+ (s.capabilities.includes('scheduled_cleaning')?'Eligible crew receive automatic cleaning orders.':'Unlock Scheduled Cleaning to set this policy.')+'</small><label class="check-field"><input type="checkbox" data-field="preventive" '+(s.preventiveMaintenance?'checked':'')+' '+(!s.researched.includes('predictive_diagnostics')?'disabled':'')+'> Automatic preventive service</label><small>Requires Predictive Diagnostics. Services cost $450 and preserve a $1,500 cash reserve.</small><div class="action-grid">'+button('clean-all','Queue dirty arrays')+button('service-all','Queue worn arrays')+'</div></section><section><h3>Field work · '+jobs.length+' active / '+s.workOrders.length+' waiting</h3>'+jobs.map(m=>'<div class="job-card"><span><b>'+esc(m.name)+'</b><small>'+taskLabel(m)+'</small><small>'+(m.task.type!=='idle'?asset(m.task.targetId):'')+'</small></span>'+button('locate','Find',m.id)+'</div>').join('')+s.workOrders.map(o=>'<div class="job-card"><span><b>'+o.kind[0].toUpperCase()+o.kind.slice(1)+'</b><small>'+asset(o.targetId)+'</small><small>'+(o.manual?'Requested by you':'Company policy')+'</small></span>'+button('locate','Find',o.targetId)+button('cancel-job','Cancel',o.targetId,'data-kind="'+o.kind+'"')+'</div>').join('')+(!jobs.length&&!s.workOrders.length?'<div class="empty-state">No outstanding work. Select equipment in the valley to request a job.</div>':'')+'</section></div>';
 }
 private contracts(s:GameSnapshot):string{
  const active=s.contract;
  return (active?'<article class="active-contract"><span class="eyebrow">ACTIVE DELIVERY</span><h3>'+esc(active.title)+'</h3>'+meter(active.deliveredKwh/active.energyKwh,'Delivery')+'<p>'+Math.round(active.deliveredKwh)+' / '+active.energyKwh+' kWh · '+Math.max(0,active.hours-active.elapsedHours).toFixed(1)+' park hours left</p>'+button('cancel-contract','Cancel · forfeit '+money(active.deposit))+'</article>':'<p class="section-note">Optional supply agreements reward dependable operation. Ordinary electricity sales continue.</p>')+'<div class="upgrade-grid">'+(Object.keys(CONTRACTS) as ContractId[]).map(id=>{
   const offer=contractOffer(id,s.contractRenewals),reason=this.sim.contractBlockedReason(id);
   return '<article class="upgrade-card"><span class="eyebrow">SUPPLY AGREEMENT</span><h3>'+offer.title+'</h3><p>'+offer.description+'</p><div class="contract-terms"><b>'+offer.energyKwh.toLocaleString()+' kWh in '+offer.hours+' h</b><span>'+money(offer.reward)+' bonus · '+money(offer.deposit)+' deposit</span><small>Availability '+percent(offer.minimumAvailability)+' · Condition '+percent(offer.minimumCondition)+'</small></div>'+button('contract',reason??'Accept agreement',id,(reason?'disabled':'')+' class="primary"')+'</article>';
  }).join('')+'</div>';
 }
 render(s:GameSnapshot):void{
  if(this.destroyed)return;
  if(s.selectedId!==this.selected){this.selected=s.selectedId;if(s.selectedId){this.panel=null;this.sim.setBuildMode(null);}}
  const metrics=parkMetrics(s.equipment),brief=scenarioBriefing(s),fault=s.equipment.find(e=>e.faulted);
  this.put('resources','<button class="money-pill" data-action="company"><span class="resource-icon">$</span><span><strong>'+money(s.cash)+'</strong><small>'+money(s.revenuePerHour)+' / h net</small></span></button><button class="power-pill" data-action="view" data-id="power">'+icon('power')+'<span><strong>'+s.exportedKw.toFixed(1)+' <small>kW</small></strong><small>of '+s.inverterCapacityKw+' kW export</small></span></button>');
  this.put('tools',(['build','staff','company','views'] as const).map(id=>button('panel',icon(id)+'<span>'+({build:'Build',staff:'Staff',company:'Company',views:'Site views'}[id])+'</span>',id,'class="'+(this.panel===id?'active':'')+'" title="'+({build:'Build catalogue · B',staff:'Staff · T',company:'Company management · U',views:'Service and performance overlays'}[id])+'"')).join('')+button('home',icon('home'),'','class="home-button" title="Centre valley · H" aria-label="Centre valley"'));
  this.put('time','<div class="calendar"><span>'+icon('sun')+s.weather.replaceAll('_',' ')+'</span><b>Day '+s.day+' · '+Math.floor(s.hour).toString().padStart(2,'0')+':'+Math.floor((s.hour%1)*60).toString().padStart(2,'0')+'</b></div><div class="speed-buttons">'+([0,1,2,4] as const).map(speed=>button('speed',speed===0?'Ⅱ':speed+'×',String(speed),'aria-label="'+(speed===0?'Pause':'Play at '+speed+' times speed')+'" class="'+(s.speed===speed?'active':'')+'"')).join('')+'</div>');
  this.put('goal',!s.selectedId?'<div class="goal-heading"><span>'+icon('flag')+' HERE COMES THE SUN</span>'+button('panel','★'.repeat(s.stars)+'☆'.repeat(3-s.stars),'journal','class="stars" title="Scenario awards"')+'</div><h3>'+esc(brief.title.replace(/^\d+ · /,''))+'</h3>'+button('briefing',brief.label+' →','','class="goal-action"'):'');
  this.put('alerts',fault&&!s.selectedId?button('locate',icon('bell')+' '+s.equipment.filter(e=>e.faulted).length+' equipment fault'+(s.equipment.filter(e=>e.faulted).length>1?'s':''),fault.id,'class="fault-alert"'):s.clippedKw>5&&!s.selectedId?button('company',icon('power')+' Export limit reached'):'');
  const panel=this.panel==='build'?this.build(s):this.panel==='staff'?this.people(s):this.panel==='views'?this.title('UNDERSTAND YOUR SITE','Site views')+'<div class="panel-scroll"><p>See the cause of a problem in the valley.</p>'+([['normal','Natural view','Enjoy the site without an overlay.'],['access','Road service','Green: connected service access. Amber: standard crew travel.'],['condition','Equipment condition','Green: healthy. Red: worn or failed.'],['dust','Panel cleanliness','Green: clean. Red: dust is reducing output.'],['power','Generation & export','Solar nameplate and connection status.']] as const).map(([id,title,body])=>button('view','<b>'+title+'</b><small>'+body+'</small>',id,'class="view-card '+(this.view===id?'active':'')+'"')).join('')+'</div>':'';
  this.slot('panel').classList.toggle('build-dock',this.panel==='build');
  this.root.querySelector('.tycoon-ui')!.classList.toggle('building',this.panel==='build');
  this.put('panel',panel);this.put('inspector',this.inspect(s));
  this.put('help',s.buildMode?'<b>'+CATALOGUE[s.buildMode].name+'</b><span>'+(s.buildMode==='road'?'Drag to plan · Release to build · Shift changes bend':'Click to build another')+' · Right-click / Esc cancels · Middle-drag pans</span>':this.view!=='normal'?'<b>'+({access:'Road service',condition:'Condition',dust:'Cleanliness',power:'Generation'}[this.view])+'</b><span>Green is healthy / served · Amber or red needs attention</span>'+button('view','Close view','normal'):'');
  const tabs=[['overview','Overview'],['upgrades','Upgrades'],['policies','Operations'],['contracts','Contracts']];
  const sheet=this.panel==='company'?'<section class="company-sheet paper" role="dialog" aria-modal="true" aria-label="Company management">'+this.title('MEGAWATT VALLEY','Company')+'<nav class="company-tabs">'+tabs.map(([id,label])=>button('tab',label,id,'class="'+(this.companyTab===id?'active':'')+'"')).join('')+'</nav><div class="sheet-scroll">'+(this.companyTab==='overview'?this.overview(s):this.companyTab==='upgrades'?this.upgrades(s):this.companyTab==='policies'?this.policies(s):this.contracts(s))+'</div></section>':this.panel==='journal'?'<section class="company-sheet journal paper" role="dialog" aria-modal="true" aria-label="Scenario objectives">'+this.title('SCENARIO JOURNAL','Here Comes the Sun')+'<div class="sheet-scroll"><div class="award-banner">'+'★'.repeat(s.stars)+'☆'.repeat(3-s.stars)+'</div><p>One star completes the scenario. Continue for operational mastery.</p>'+s.objectives.map(o=>'<article class="objective-row '+(o.complete?'complete':'')+'"><span>'+(o.complete?'✓':'○')+'</span><div><h4>'+esc(o.title)+'</h4><p>'+esc(o.description)+'</p><small>'+esc(o.rewardText??'')+'</small></div></article>').join('')+'<p class="section-note">Scenario 2 is unlocked by the first star and will arrive in a future campaign release.</p></div></section>':'';
  this.put('sheet',sheet);
  const event=s.activeEvent,won=s.scenarioComplete&&!s.completionAcknowledged;
  this.put('decision',this.confirmAction?'<section class="decision paper" role="alertdialog" aria-modal="true"><small>PLEASE CONFIRM</small><h2>'+esc(this.confirmAction.title)+'</h2><p>'+esc(this.confirmAction.body)+'</p><footer>'+button('confirm-no','Keep playing')+button('confirm-yes','Confirm','','class="danger primary"')+'</footer></section>':event?'<section class="decision paper" role="alertdialog" aria-modal="true"><small>MESSAGE FOR THE OWNER</small><h2>'+esc(event.title)+'</h2><p>'+esc(event.body)+'</p><div class="decision-choices">'+event.choices.map(choice=>button('choice','<b>'+esc(choice.label)+'</b><span>'+esc(choice.description)+'</span>',choice.id)).join('')+'</div><small>Park time is paused until you decide.</small></section>':won?'<section class="decision paper" role="dialog" aria-modal="true"><div class="award-banner">★</div><h2>Here comes your future.</h2><p>You built an operating renewable-energy company. Your next campaign chapter is unlocked.</p><p>Keep this valley running to earn two and three stars.</p>'+button('continue','Continue managing','','class="primary wide"')+'</section>':'');
  this.put('menu',this.menu?'<section class="pause-menu paper" role="dialog" aria-modal="true" aria-label="Pause menu"><small>MEGAWATT VALLEY</small><h2>Take a breather.</h2>'+button('menu','Return to valley','','class="primary wide"')+button('save','Save company','','class="wide"')+button('load','Load company','','class="wide"')+'<div class="action-grid">'+button('export','Export save')+button('import','Import save')+'</div>'+button('sound','Sound · '+(sound.enabled?'On':'Off'),'','class="wide"')+button('new','Start a new company','','class="quiet wide"')+'<p class="section-note">Drag: pan · Wheel: zoom · Middle-drag: pan while building · Right-click: cancel · Space: pause · H: home · F: selected</p></section>':'');
  if(s.message&&s.message!==this.lastMessage){this.lastMessage=s.message;this.toastUntil=performance.now()+6500;}
  this.put('toast',performance.now()<this.toastUntil?esc(this.lastMessage):'');
  const dialog=this.activeDialog(),modalKey=dialog?.dataset.slot??'';if(modalKey!==this.modalKey)dialog?.querySelector<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled)')?.focus({preventScroll:true});this.modalKey=modalKey;
  sound.update(s.weather,s.faultsRepaired,s.cleansCompleted,s.stars);void metrics;
 }
 private click(e:Event):void{
  const el=(e.target as Element).closest<HTMLElement>('[data-action]');if(!el||(el as HTMLButtonElement).disabled)return;
  const action=el.dataset.action!,id=el.dataset.id??'';
  switch(action){
   case 'panel':this.open(id as Panel);break;
   case 'close':this.panel=null;this.sim.selectEntity(null);this.sim.setBuildMode(null);break;
   case 'category':this.category=id;this.search='';break;
   case 'build':this.sim.selectEntity(null);this.sim.setBuildMode(id as EquipmentKind);this.setView(id==='road'?'access':'normal');break;
   case 'view':this.setView(id as SiteView);break;
   case 'speed':this.sim.setSpeed(Number(id) as 0|1|2|4);break;
   case 'home':this.onCamera(null);break;
   case 'focus':{const target=this.sim.equipment.find(e=>e.id===id)??this.sim.staff.find(m=>m.id===id);if(target)this.onCamera(target.tile);break;}
   case 'locate':this.locate(id);break;
   case 'company':this.panel='company';this.companyTab='overview';this.sim.setBuildMode(null);this.sim.selectEntity(null);break;
   case 'tab':this.companyTab=id;break;
   case 'hire':this.sim.hireStaff(id as StaffMember['role']);break;
   case 'train':this.sim.trainStaff(id);break;
   case 'repair':this.sim.dispatchRepair(id);break;
   case 'clean':this.sim.dispatchClean(id);break;
   case 'service':this.sim.dispatchService(id);break;
   case 'sell':this.confirmAction={title:'Sell this equipment?',body:'You will receive 60% of its purchase price, adjusted for condition. Assigned jobs are cancelled.',action:()=>{this.sim.demolish(id);}};break;
   case 'dismiss':this.confirmAction={title:'Dismiss this team member?',body:'Their position becomes available for a new hire. At least one repair-capable worker must remain.',action:()=>{this.sim.dismissStaff(id);}};break;
   case 'confirm-no':this.confirmAction=null;break;
   case 'confirm-yes':{const action=this.confirmAction?.action;this.confirmAction=null;action?.();break;}
   case 'capability':this.sim.buyCapability(id as CapabilityId);break;
   case 'research':this.sim.startResearch(id as ResearchId);break;
   case 'contract':this.sim.acceptContract(id as ContractId);break;
   case 'cancel-contract':this.confirmAction={title:'Cancel this delivery?',body:'Any deposit will be forfeited. Electricity sales continue.',action:()=>this.sim.cancelContract()};break;
   case 'cancel-job':this.sim.cancelWorkOrder(id,el.dataset.kind as 'repair'|'clean'|'service');break;
   case 'clean-all':for(const e of this.sim.equipment)if(e.kind.includes('pv')&&e.soiling>=.15)this.sim.dispatchClean(e.id);break;
   case 'service-all':for(const e of this.sim.equipment)if(e.kind.includes('pv')&&e.condition<.995)this.sim.dispatchService(e.id);break;
   case 'choice':this.sim.resolveEventChoice(id);break;
   case 'continue':this.sim.completionAcknowledged=true;break;
   case 'briefing':{const brief=scenarioBriefing(this.sim.snapshot());if(brief.target)this.locate(brief.target);else if(brief.action==='build')this.open('build');else if(brief.action==='finance'){this.panel='journal';}else{this.panel='company';this.companyTab=brief.action==='caps'?'upgrades':brief.action==='operations'?'policies':brief.action==='contracts'?'contracts':'overview';}break;}
   case 'menu':if(!this.menu){this.menuSpeed=this.sim.speed;this.sim.setSpeed(0);}else if(!this.sim.activeEvent)this.sim.setSpeed(this.menuSpeed);this.menu=!this.menu;break;
   case 'save':this.saveCompany();break;
   case 'load':this.loadCompany();this.menuSpeed=0;this.menu=false;break;
   case 'sound':sound.toggle();break;
   case 'new':this.confirmAction={title:'Start a new company?',body:'Your current local save will be replaced. Export it first if you want to keep it.',action:()=>{if(clearSave())this.onNew();else this.sim.message='Could not clear the save. Export a backup first.';}};break;
   case 'export':{const blob=new Blob([JSON.stringify({version:SAVE_VERSION,savedAt:new Date().toISOString(),state:this.sim.serialize()},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Megawatt-Valley-company.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);break;}
   case 'import':{const input=document.createElement('input');input.type='file';input.accept='.json';input.onchange=async()=>{try{const file=input.files?.[0];if(!file)return;if(file.size>5_000_000)throw Error('File too large');const data=JSON.parse(await file.text());if(data.version!==SAVE_VERSION||!validateState(data.state))throw Error('Not a compatible company');this.sim.load(data.state);this.sim.setSpeed(0);this.sim.message='Company imported. Press Play when ready.';this.menu=false;this.menuSpeed=0;this.panel=null;this.render(this.sim.snapshot());}catch(error){this.sim.message='Import failed: '+String(error);}};input.click();break;}
  }
  sound.note(440,.04,.012);this.render(this.sim.snapshot());
 }
 private change(e:Event):void{
  const el=e.target as HTMLSelectElement|HTMLInputElement,m=this.sim.staff.find(m=>m.id===this.sim.selectedId);
  if(el.dataset.field==='zone'&&m)this.sim.setStaffAssignment(m.id,el.value as StaffMember['workZone'],m.preference??'auto');
  if(el.dataset.field==='duty'&&m)this.sim.setStaffAssignment(m.id,m.workZone??'all',el.value as StaffMember['preference']);
  if(el.dataset.field==='cleaning')this.sim.setCleaningThreshold(Number(el.value));
  if(el.dataset.field==='preventive')this.sim.setPreventiveMaintenance((el as HTMLInputElement).checked);
  this.render(this.sim.snapshot());
 }
 private key(e:KeyboardEvent):void{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();this.saveCompany();this.render(this.sim.snapshot());return;}
  if(e.key==='Tab'&&this.isOverlayOpen()){
   const dialog=this.activeDialog();
   const controls=dialog?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled)');if(!controls?.length)return;
   const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;
  }
  if(e.key==='Escape'){e.preventDefault();if(this.confirmAction)this.confirmAction=null;else if(this.sim.activeEvent||this.sim.scenarioComplete&&!this.sim.completionAcknowledged)return;else if(this.menu){this.menu=false;this.sim.setSpeed(this.menuSpeed);}else if(this.panel||this.sim.buildMode||this.sim.selectedId)this.cancelTool();else{this.menuSpeed=this.sim.speed;this.sim.setSpeed(0);this.menu=true;}this.render(this.sim.snapshot());return;}
  if(this.isTextEntryFocused()||this.isOverlayOpen())return;
  if(e.key.toLowerCase()==='b')this.open('build');if(e.key.toLowerCase()==='t')this.open('staff');
  if(e.key.toLowerCase()==='u'){this.panel='company';this.companyTab='upgrades';this.sim.setBuildMode(null);this.sim.selectEntity(null);}
  if(e.key.toLowerCase()==='h')this.onCamera(null);
  if(e.key.toLowerCase()==='f'&&this.sim.selectedId){const entity=this.sim.equipment.find(x=>x.id===this.sim.selectedId)??this.sim.staff.find(x=>x.id===this.sim.selectedId);if(entity)this.onCamera(entity.tile);}
  this.render(this.sim.snapshot());
 }
}
