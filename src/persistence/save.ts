import { SAVE_KEY, SAVE_VERSION } from '../content/scenario';
import type { SaveData, SerializedGameState } from '../simulation/types';
import { validateState } from './validate';

export function saveGame(state: SerializedGameState): boolean {
  try {
    if (!validateState(state)) return false;
    const payload: SaveData = { version: SAVE_VERSION, savedAt: new Date().toISOString(), state };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch { return false; }
}

export function loadGame(): SerializedGameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const save = parsed as SaveData;
    if (save.version !== SAVE_VERSION || !validateState(save.state)) return null;
    return structuredClone(save.state);
  } catch { return null; }
}

export function clearSave(): boolean {
  try { localStorage.removeItem(SAVE_KEY); return true; } catch { return false; }
}
