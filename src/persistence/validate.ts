import { RESEARCH, type ResearchId } from '../content/research';
import { EQUIPMENT } from '../content/equipment';
import { EVENTS } from '../content/events';
import { CAPABILITY_INFO, createInitialObjectives } from '../content/scenario';
import type { SerializedGameState } from '../simulation/types';

type Obj = Record<string, unknown>;
const object = (x: unknown): x is Obj => !!x && typeof x === 'object' && !Array.isArray(x);
const num = (x: unknown, min = 0, max = 1e12): x is number => typeof x === 'number' && Number.isFinite(x) && x >= min && x <= max;
const text = (x: unknown): x is string => typeof x === 'string' && x.length < 500 && !/[<>]/.test(x);
const vector = (x: unknown): boolean => object(x) && num(x.x, -100, 100) && num(x.y, -100, 100);
const enumValue = (x: unknown, values: readonly unknown[]) => values.includes(x);
const keys = Object.keys;
const requiredNumbers = ['cash','day','hour','weatherTimer','tariffPerKwh','nextEntityId','totalEnergyKwh','faultsRepaired','cleansCompleted','tickAccumulator','nextFaultCheck','nextSoilTick','lifetimeRevenue','peakExportKw'];
const optionalNumbers = ['curtailmentFactor','curtailmentTimer','eventClock','rngState','totalExpenses','manualRepairs','manualCleans'];
const requiredBooleans = ['hailPrepared','hailSurvived','scenarioComplete','scriptedFirstFault'];
const allowed = new Set([...requiredNumbers,...optionalNumbers,...requiredBooleans,'completionAcknowledged','researched','activeResearch','speed','speedBeforeEvent','weather','plots','equipment','staff','capabilities','objectives','stars','triggeredEvents','pendingEventQueue','activeEvent','selectedId','buildMode','message','revenuePerHour','eventDelays']);
const plots = ['site_a','site_b'];

/** Validate before state enters the simulation; never trust a cast after JSON.parse. */
export function validateState(value: unknown): value is SerializedGameState {
  if (!object(value) || keys(value).some((k) => !allowed.has(k))) return false;
  if (requiredNumbers.some((k) => !num(value[k], k === 'nextFaultCheck' || k === 'nextSoilTick' ? -1 : 0))) return false;
  if (optionalNumbers.some((k) => value[k] !== undefined && !num(value[k], k === 'curtailmentTimer' ? -1 : 0))) return false;
  if (!num(value.revenuePerHour, -1e9) || requiredBooleans.some((k) => typeof value[k] !== 'boolean')) return false;
  if (value.completionAcknowledged !== undefined && typeof value.completionAcknowledged !== 'boolean') return false;
  if (!enumValue(value.speed,[0,1,2,4]) || (value.speedBeforeEvent !== undefined && !enumValue(value.speedBeforeEvent,[0,1,2,4]))) return false;
  if (!enumValue(value.weather,['clear','partly_cloudy','overcast','rain','hail']) || !enumValue(value.stars,[0,1,2,3])) return false;
  if (value.curtailmentFactor !== undefined && !num(value.curtailmentFactor,0,1)) return false;
  if (!num(value.hour,0,24) || !Number.isInteger(value.day) || !Number.isInteger(value.nextEntityId)) return false;
  if (value.selectedId !== null && !text(value.selectedId)) return false;
  if (value.message !== null && !text(value.message)) return false;
  if (value.buildMode !== null && !enumValue(value.buildMode,keys(EQUIPMENT))) return false;
  if (!Array.isArray(value.plots) || value.plots.length !== 2 || new Set(value.plots.map((p) => object(p) ? p.id : null)).size !== 2) return false;
  if (!value.plots.every((p) => object(p) && enumValue(p.id,plots) && text(p.name) && vector(p.origin) && vector(p.size) && num(p.solarResource,0,2) && typeof p.unlocked === 'boolean' && typeof p.gridConnected === 'boolean')) return false;
  if (!Array.isArray(value.equipment) || value.equipment.length > 500) return false;
  if (!value.equipment.every((e) => object(e) && text(e.id) && /^eq_[0-9]+$/.test(e.id) && enumValue(e.kind,keys(EQUIPMENT)) && enumValue(e.plotId,plots) && vector(e.tile) && object(e.tile) && Number.isInteger(e.tile.x) && Number.isInteger(e.tile.y) && num(e.condition,0,1) && num(e.soiling,0,1) && num(e.constructionProgress,0,1) && typeof e.faulted === 'boolean' && typeof e.commissioned === 'boolean')) return false;
  const equipmentIds = new Set(value.equipment.map((e) => (e as Obj).id));
  if (equipmentIds.size !== value.equipment.length) return false;
  if (!Array.isArray(value.staff) || value.staff.length < 1 || value.staff.length > 20) return false;
  if (!value.staff.every((s) => {
    if (!object(s) || !text(s.id) || !/^staff_[0-9]+$/.test(s.id) || !text(s.name) || !enumValue(s.role,['technician','cleaner','engineer','manager']) || !enumValue(s.plotId,plots) || !vector(s.tile) || !object(s.task)) return false;
    if ((s.skill !== undefined && !num(s.skill,1,5)) || (s.salary !== undefined && !num(s.salary,0,100)) || (s.trait !== undefined && !text(s.trait))) return false;
    if (s._intent !== undefined && !enumValue(s._intent,['clean','repair'])) return false;
    const t = s.task;
    return t.type === 'idle' || (enumValue(t.type,['travel','repair','clean']) && equipmentIds.has(t.targetId) && num(t.progress,0,2) && (t.type !== 'travel' || vector(t.from)));
  })) return false;
  for (const key of ['capabilities','triggeredEvents','pendingEventQueue']) {
    const a = value[key];
    if (!Array.isArray(a) || a.length > 30 || !a.every((id) => enumValue(id, keys(key === 'capabilities' ? CAPABILITY_INFO : EVENTS))) || new Set(a).size !== a.length) return false;
  }
  if (value.researched !== undefined) {
    if (!Array.isArray(value.researched) || value.researched.length > keys(RESEARCH).length || new Set(value.researched).size !== value.researched.length || !value.researched.every(id => enumValue(id, keys(RESEARCH)))) return false;
    const completed = value.researched as ResearchId[];
    if (completed.some(id => RESEARCH[id].prerequisite && !completed.includes(RESEARCH[id].prerequisite as ResearchId))) return false;
  }
  if (value.activeResearch !== undefined && value.activeResearch !== null) {
    const project = value.activeResearch;
    if (!object(project) || keys(project).some(k => !['id','progress'].includes(k)) || !enumValue(project.id, keys(RESEARCH)) || !num(project.progress,0,1)) return false;
    const completed = (value.researched ?? []) as ResearchId[];
    const id = project.id as ResearchId;
    if (completed.includes(id) || (RESEARCH[id].prerequisite && !completed.includes(RESEARCH[id].prerequisite as ResearchId))) return false;
  }
  const objectives = createInitialObjectives();
  if (!Array.isArray(value.objectives) || value.objectives.length !== objectives.length || new Set(value.objectives.map((o) => object(o) ? o.id : null)).size !== objectives.length) return false;
  if (!value.objectives.every((o) => object(o) && objectives.some((d) => d.id === o.id) && text(o.title) && text(o.description) && typeof o.complete === 'boolean' && typeof o.active === 'boolean')) return false;
  if (value.activeEvent !== null) {
    const e = value.activeEvent;
    if (!object(e) || !enumValue(e.id,keys(EVENTS)) || !text(e.title) || !text(e.body) || !Array.isArray(e.choices) || e.choices.length < 1 || e.choices.length > 3) return false;
    const def = EVENTS[e.id as keyof typeof EVENTS];
    if (!e.choices.every((c) => object(c) && text(c.label) && text(c.description) && def.choices.some((d) => d.id === c.id))) return false;
  }
  if (value.eventDelays !== undefined && (!object(value.eventDelays) || keys(value.eventDelays).some((k) => !enumValue(k,keys(EVENTS)) || !num((value.eventDelays as Obj)[k])))) return false;
  return true;
}
