import { CONTRACTS, contractOffer, type ContractId } from '../content/contracts';
import { EQUIPMENT } from '../content/equipment';
import { parkMetrics, taskLabel, WORK_LABEL, workerCanDo } from '../simulation/operations';
import type { GameSnapshot, StaffMember } from '../simulation/types';
const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const cash=(n:number)=>'$'+Math.round(n).toLocaleString('en-US');
const pct=(n:number)=>Math.round(n*100)+'%';

export function contractsHtml(s:GameSnapshot, blocked:(id:ContractId)=>string|null):string {
  const metrics=parkMetrics(s.equipment), c=s.contract;
  let active='';
  if(c) {
    const eligible=metrics.availability+1e-8>=c.minimumAvailability && metrics.condition+1e-8>=c.minimumCondition;
    active=`<section class="active-contract"><div><small>ACTIVE SUPPLY CONTRACT</small><h3>${escape(c.title)}</h3><p>${Math.floor(c.deliveredKwh).toLocaleString()} / ${c.energyKwh.toLocaleString()} kWh delivered · ${Math.max(0,c.hours-c.elapsedHours).toFixed(1)} park hours left</p><div class="contract-progress"><i style="width:${Math.min(100,c.deliveredKwh/c.energyKwh*100)}%"></i></div><p class="${eligible?'contract-ready':'contract-held'}">${eligible?'Exports count toward this delivery.':'Delivery on hold: restore the required availability / condition. Electricity sales continue.'}</p></div><div><b>${cash(c.reward)} bonus</b><small>${cash(c.deposit)} deposit returned on success</small><button type="button" data-action="cancel-contract">Cancel · forfeit ${cash(c.deposit)}</button></div></section>`;
  }
  const offers=(Object.keys(CONTRACTS) as ContractId[]).map(id=>{
    const offer=contractOffer(id,s.contractRenewals), reason=blocked(id);
    return `<article class="contract-card"><small>${id==='school'?'STARTER SUPPLY':id==='grid'?'RELIABILITY CHALLENGE':'EXPANSION CHALLENGE'}</small><h3>${escape(offer.title)}</h3><p>${escape(offer.description)}</p><div class="contract-terms"><span>Delivery <b>${offer.energyKwh.toLocaleString()} kWh</b></span><span>Deadline <b>${offer.hours} park hours</b></span><span>Bonus <b>${cash(offer.reward)}</b></span><span>Deposit <b>${cash(offer.deposit)}</b></span></div><button type="button" data-action="accept-contract" data-id="${id}" ${reason?'disabled':''}>${reason ? escape(reason) : 'Accept supply contract'}</button></article>`;
  }).join('');
  return active+`<div class="contracts-summary">${s.contractsCompleted} completed · ${c?'Current delivery in progress; ordinary energy sales continue.':s.contractCooldown>0?`Renewal break: ${s.contractCooldown.toFixed(1)} park hours`:'Choose one offer; ordinary energy sales continue.'}</div><div class="contract-offers">${offers}</div><p class="gameplay-footnote">Deadlines use park time and pause with the game and decision events. Completion pays the bonus and returns the deposit. Expiry or cancellation loses only the deposit. New offers arrive after a 12-hour renewal break.</p>`+(s.contractHistory.length?'<div class="contract-history">'+s.contractHistory.slice(-3).reverse().map(c=>`<span>${escape(c.title)} · ${c.outcome} · Day ${c.day}${c.reward?' · '+cash(c.reward):''}</span>`).join('')+'</div>':'');
}

export function operationsHtml(s:GameSnapshot):string {
  const metrics=parkMetrics(s.equipment);
  const cards=[['Solar availability',pct(metrics.availability)],['Panel cleanliness',pct(metrics.cleanliness)],['Fleet condition',pct(metrics.condition)],['Stable daylight',s.stabilityHours.toFixed(1)+' / 12 h']];
  const jobs=s.staff.filter(m=>m.task.type!=='idle').map(m=>{
    if(m.task.type==='idle') return '';
    const targetId=m.task.targetId; const eq=s.equipment.find(e=>e.id===targetId);
    return `<div class="work-order"><span class="job-state">IN PROGRESS</span><b>${escape(m.name)}</b><span>${taskLabel(m)} · ${eq?EQUIPMENT[eq.kind].name:'Equipment'} · ${m.plotId==='site_a'?'Sunny Meadow':'River Bench'}</span><button type="button" data-action="locate" data-id="${m.id}">Find crew</button></div>`;
  });
  const queue=s.workOrders.map(o=>{
    const eq=s.equipment.find(e=>e.id===o.targetId); if(!eq) return '';
    const eligible=s.staff.some(m=>workerCanDo(m,o,eq));
    return `<div class="work-order"><span class="job-state">QUEUED</span><b>${WORK_LABEL[o.kind]}</b><span>${EQUIPMENT[eq.kind].name} · ${eq.plotId==='site_a'?'Sunny Meadow':'River Bench'} · ${!eligible?'No crew assigned to this duty/site':o.kind==='service' && s.cash<(o.manual?450:1950)?(o.manual?'Needs $450 funding':'Keeping $1,500 reserve'):'Waiting for an eligible crew'}${o.kind==='service'?' · $450 when started':''}</span><button type="button" data-action="locate" data-id="${eq.id}">Find</button>${o.manual?`<button type="button" data-action="cancel-job" data-id="${eq.id}" data-kind="${o.kind}">Cancel</button>`:''}</div>`;
  });
  const report=[s.currentReport,...s.dailyReports.slice(-3).reverse()];
  return `<div class="operations-metrics">${cards.map(([label,value])=>`<div><span>${label}</span><b>${value}</b></div>`).join('')}</div><p class="gameplay-footnote">Stable operation: at least 90% available capacity, 75% cleanliness and no more than 15% curtailment. Daylight counts; nights pause the counter. A failed criterion during daylight resets it.</p><h3 class="gameplay-heading">Work orders · ${jobs.length} active / ${queue.length} queued</h3><div class="work-order-list">${[...jobs,...queue].join('') || '<p class="gameplay-footnote">No outstanding jobs. Select a damaged array for a $450 preventive service, or queue cleaning above 15% dust. Staff assignments are in each worker profile.</p>'}</div><h3 class="gameplay-heading">Daily operating review</h3><div class="daily-review"><table><thead><tr><th>Day</th><th>Energy sold</th><th>Sales</th><th>Costs / deposits</th><th>Bonuses / refunds</th><th>Net</th><th>Jobs</th></tr></thead><tbody>${report.map(r=>`<tr><td>${r.day===s.day?'Today':r.day}</td><td>${Math.round(r.energyKwh).toLocaleString()} kWh</td><td>${cash(r.revenue)}</td><td>${cash(r.expenses)}</td><td>${cash(r.bonuses)}</td><td>${cash(r.revenue-r.expenses+r.bonuses)}</td><td>${r.jobs}</td></tr>`).join('')}</tbody></table></div><p class="gameplay-footnote">This review covers sales, payroll, equipment running costs, service fees, contract deposits/bonuses and first field-training rewards. Construction, hiring, research and scenario grants are excluded. Today is a partial day.</p>`;
}

export function assignmentHtml(member:StaffMember,s:GameSnapshot):string {
  if(member.role==='manager') return '<p class="gameplay-footnote">Management supports field work throughout the park.</p>';
  const zone=member.workZone ?? 'all', pref=member.preference ?? 'auto';
  const options=[['auto','All suitable duties'],...(member.role!=='cleaner'?[['repair','Repair & service']]:[]),['clean','Cleaning only'],...(member.role==='engineer'?[['research','Office research']]:[])];
  return `<div class="worker-assignment"><label>Work zone<select data-k="worker-zone" aria-label="Worker work zone"><option value="all" ${zone==='all'?'selected':''}>Both sites</option><option value="site_a" ${zone==='site_a'?'selected':''}>Sunny Meadow</option><option value="site_b" ${zone==='site_b'?'selected':''} ${s.plots[1].unlocked?'':'disabled'}>River Bench</option></select></label><label>Duty<select data-k="worker-duty" aria-label="Worker duty">${options.map(([id,label])=>`<option value="${id}" ${pref===id?'selected':''}>${label}</option>`).join('')}</select></label><small>Current jobs finish before changes apply.</small></div>`;
}
