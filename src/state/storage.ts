/**
 * Local persistence. Drafts live only in this browser's localStorage.
 * Nothing here logs or transmits draft contents.
 */
import type { Draft } from './types';

const STORAGE_KEY = 'ownit:drafts:v1';

export interface StoredState {
  drafts: Draft[];
  activeId: string | null;
}

export type StorageStatus = 'ok' | 'unavailable' | 'error';

export function storageAvailable(): boolean {
  try {
    const k = '__ownit_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadState(): StoredState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { drafts: [], activeId: null };
    const parsed = JSON.parse(raw) as StoredState;
    if (!Array.isArray(parsed.drafts)) return { drafts: [], activeId: null };
    return parsed;
  } catch {
    return { drafts: [], activeId: null };
  }
}

export function saveState(state: StoredState): StorageStatus {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return 'ok';
  } catch {
    // Quota exceeded or storage blocked. Deliberately not logging draft contents.
    return 'error';
  }
}

export function clearState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable — nothing to clear */
  }
}
