import { SAVE_KEY, SAVE_VERSION } from '../content/scenario';
import type { SaveData, SerializedGameState } from '../simulation/types';

export function saveGame(state: SerializedGameState): void {
  const payload: SaveData = {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    state,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

export function loadGame(): SerializedGameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveData;
    if (!parsed || parsed.version !== SAVE_VERSION || !parsed.state) return null;
    return parsed.state;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
