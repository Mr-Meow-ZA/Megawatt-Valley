import { SAVE_KEY, SAVE_VERSION } from '../content/scenario';
import type { SaveData, SerializedGameState } from '../simulation/types';

function migrate(state: SerializedGameState, fromVersion: number): SerializedGameState {
  const next = { ...state };
  if (fromVersion < 2) {
    next.eventDelays = next.eventDelays ?? {};
    next.eventClock = next.eventClock ?? 0;
    next.curtailmentFactor = next.curtailmentFactor ?? 1;
    next.curtailmentTimer = next.curtailmentTimer ?? 0;
    next.hailHoldHours = next.hailHoldHours ?? 0;
    next.onboardingStep = next.onboardingStep ?? 4;
    next.pendingCapabilityChoice = next.pendingCapabilityChoice ?? false;
    next.bargainDiscountCharges = next.bargainDiscountCharges ?? 0;
    next.playerPlacedPv =
      next.playerPlacedPv ??
      (next.equipment?.some((e) => e.kind === 'bargain_pv' || e.kind === 'premium_pv') ?? false);
    next.plots = (next.plots ?? []).map((p) => ({
      ...p,
      exportFactor: p.exportFactor ?? (p.id === 'site_b' ? 0.78 : 1),
    }));
    next.staffBusyHours = next.staffBusyHours ?? 0;
    next.tariffBonus = next.tariffBonus ?? 0;
  }
  return next;
}

export function saveGame(state: SerializedGameState): void {
  const payload: SaveData = {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    state,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function loadGame(): SerializedGameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveData;
    if (!parsed?.state) return null;
    const version = typeof parsed.version === 'number' ? parsed.version : 1;
    if (version > SAVE_VERSION) return null;
    return migrate(parsed.state, version);
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  return loadGame() !== null;
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export function getSaveMeta(): { savedAt: string } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveData;
    if (!parsed?.savedAt) return null;
    return { savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}
