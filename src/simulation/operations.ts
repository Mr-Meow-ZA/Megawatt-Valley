import { EQUIPMENT } from '../content/equipment';
import { ROAD_TILES, staffRoute } from '../content/valleyLayout';
import type { PlacedEquipment, StaffMember, WorkOrder, WorkKind } from './types';

export function isSolar(e: PlacedEquipment): boolean { return e.kind === 'bargain_pv' || e.kind === 'premium_pv'; }
export function parkMetrics(equipment: PlacedEquipment[]) {
  const panels = equipment.filter(e => isSolar(e) && e.commissioned);
  const capacity = panels.reduce((n,e) => n + EQUIPMENT[e.kind].nameplateKw, 0);
  const available = panels.filter(e => !e.faulted).reduce((n,e) => n + EQUIPMENT[e.kind].nameplateKw, 0);
  return {
    availability: capacity ? available / capacity : 1,
    cleanliness: capacity ? panels.reduce((n,e) => n + (1-e.soiling)*EQUIPMENT[e.kind].nameplateKw,0) / capacity : 1,
    condition: capacity ? panels.reduce((n,e) => n + e.condition*EQUIPMENT[e.kind].nameplateKw,0) / capacity : 1,
  };
}
export function nearbyWorkshop(equipment: PlacedEquipment[], target: PlacedEquipment): boolean {
  return equipment.some(e => e.kind === 'workshop' && e.commissioned && e.plotId === target.plotId && Math.hypot(e.tile.x-target.tile.x,e.tile.y-target.tile.y)<=8);
}
export function hasServiceAccess(equipment: PlacedEquipment[], target: PlacedEquipment): boolean {
  const front = { x:target.tile.x+(EQUIPMENT[target.kind].footprint.x-1)/2, y:target.tile.y+EQUIPMENT[target.kind].footprint.y-.65 };
  return ROAD_TILES.some(p => Math.hypot(p.x-front.x,p.y-front.y)<=2.5) || equipment.some(e => e.kind==='road' && e.commissioned && Math.hypot(e.tile.x-front.x,e.tile.y-front.y)<=2.5);
}
export function travelHours(member: StaffMember, target: PlacedEquipment, equipment: PlacedEquipment[]): number {
  const end={x:target.tile.x+(EQUIPMENT[target.kind].footprint.x-1)/2,y:target.tile.y+EQUIPMENT[target.kind].footprint.y-.65};
  const path=staffRoute(member.tile,end);
  const distance=path.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-path[i].x,p.y-path[i].y),0);
  return Math.max(.15, (.12+distance*.035) * (hasServiceAccess(equipment,target) ? .75 : 1));
}
export function workerCanDo(member: StaffMember, order: WorkOrder, target: PlacedEquipment): boolean {
  if (member.role==='manager' || member.preference==='research' || member.onBreak || (member.trainingHoursLeft ?? 0)>0) return false;
  if (member.workZone && member.workZone!=='all' && member.workZone!==target.plotId) return false;
  if (order.kind!=='clean' && member.role==='cleaner') return false;
  if (member.preference==='repair' && order.kind==='clean') return false;
  if (member.preference==='clean' && order.kind!=='clean') return false;
  return true;
}
export function taskLabel(member: StaffMember): string {
  if((member.trainingHoursLeft ?? 0)>0 && member.task.type==='idle') return 'Training · '+member.trainingHoursLeft!.toFixed(1)+' h left';
  if(member.onBreak && member.task.type==='idle') return 'Taking a break';
  const kind=member.task.type;
  if(kind==='idle') return member.preference==='research' ? 'Office research' : 'Ready for a job';
  return kind==='travel' ? 'Travelling' : kind==='repair' ? 'Repairing' : kind==='service' ? 'Servicing' : 'Cleaning';
}
export const WORK_LABEL: Record<WorkKind,string> = { repair:'Repair', clean:'Clean', service:'Preventive service' };
