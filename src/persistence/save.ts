import { SAVE_KEY, SAVE_VERSION } from '../content/scenario';
import type { SaveData, SerializedGameState } from '../simulation/types';
import { validateState } from './validate';

export function saveGame(state: SerializedGameState): boolean {
  try {
    if (!validateState(state)) return false;
    const payload: SaveData = { version: SAVE_VERSION, savedAt: new Date().toISOString(), state };
    if (typeof window !== 'undefined' && window.megawattDesktop) return window.megawattDesktop.writeSave(JSON.stringify(payload));
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch { return false; }
}

export function loadGame(): SerializedGameState | null {
  try {
    const desktop = typeof window !== 'undefined' ? window.megawattDesktop : undefined;
    const candidates = desktop ? desktop.readSaves() : [localStorage.getItem(SAVE_KEY)];
    for (const raw of candidates) {
      if (!raw) continue;
      try {
        const save = JSON.parse(raw) as SaveData;
        if (save && save.version === SAVE_VERSION && validateState(save.state)) return structuredClone(save.state);
      } catch { /* Try the recovery save if the primary copy is damaged. */ }
    }
    return null;
  } catch { return null; }
}

export function clearSave(): boolean {
  try {
    if (typeof window !== 'undefined' && window.megawattDesktop) return window.megawattDesktop.clearSave();
    localStorage.removeItem(SAVE_KEY); return true;
  } catch { return false; }
}
