import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Draft } from './types';
import { newDraft } from './defaults';
import { clearState, loadState, saveState, storageAvailable } from './storage';
import { sampleDraft } from './sample';
import { newId } from '../lib/id';

type Updater = Partial<Draft> | ((d: Draft) => Partial<Draft>);

interface StoreValue {
  drafts: Draft[];
  active: Draft | null;
  storageOk: boolean;
  lastSavedAt: Date | null;
  update: (u: Updater) => void;
  updateById: (id: string, patch: Partial<Draft>) => void;
  startNew: () => void;
  startSample: () => void;
  open: (id: string) => void;
  goHome: () => void;
  duplicateForNewRole: (id: string) => void;
  rename: (id: string, label: string) => void;
  remove: (id: string) => void;
  clearAll: () => void;
  saveNow: () => boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [storageOk] = useState(storageAvailable);
  const [state, setState] = useState(() =>
    storageOk ? loadState() : { drafts: [] as Draft[], activeId: null as string | null },
  );
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const firstRender = useRef(true);

  // Autosave (debounced) whenever drafts change.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!storageOk) return;
    const t = window.setTimeout(() => {
      if (saveState(state) === 'ok') setLastSavedAt(new Date());
    }, 350);
    return () => window.clearTimeout(t);
  }, [state, storageOk]);

  const active = state.drafts.find((d) => d.id === state.activeId) ?? null;

  const update = useCallback((u: Updater) => {
    setState((s) => ({
      ...s,
      drafts: s.drafts.map((d) => {
        if (d.id !== s.activeId) return d;
        const patch = typeof u === 'function' ? u(d) : u;
        return { ...d, ...patch, updatedAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const updateById = useCallback((id: string, patch: Partial<Draft>) => {
    setState((s) => ({
      ...s,
      drafts: s.drafts.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)),
    }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      drafts: state.drafts,
      active,
      storageOk,
      lastSavedAt,
      update,
      updateById,
      startNew: () =>
        setState((s) => {
          const label = s.drafts.filter((d) => !d.isSample).length === 0 ? 'My first version' : `Version ${s.drafts.length + 1}`;
          const d = newDraft(label);
          return { drafts: [d, ...s.drafts], activeId: d.id };
        }),
      startSample: () =>
        setState((s) => {
          const d = sampleDraft();
          return { drafts: [d, ...s.drafts], activeId: d.id };
        }),
      open: (id) => setState((s) => ({ ...s, activeId: id })),
      goHome: () => setState((s) => ({ ...s, activeId: null })),
      duplicateForNewRole: (id) =>
        setState((s) => {
          const src = s.drafts.find((d) => d.id === id);
          if (!src) return s;
          const now = new Date().toISOString();
          const copy: Draft = {
            ...structuredClone(src),
            id: newId('draft'),
            label: `${src.label} (new role)`,
            createdAt: now,
            updatedAt: now,
            targetRole: '',
            roleSkipped: false,
            generated: null,
            factsConfirmed: false,
            step: 'role',
          };
          return { drafts: [copy, ...s.drafts], activeId: copy.id };
        }),
      rename: (id, label) =>
        setState((s) => ({ ...s, drafts: s.drafts.map((d) => (d.id === id ? { ...d, label } : d)) })),
      remove: (id) =>
        setState((s) => ({
          drafts: s.drafts.filter((d) => d.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),
      clearAll: () => {
        clearState();
        firstRender.current = true; // skip the autosave that would rewrite an empty list
        setState({ drafts: [], activeId: null });
        setLastSavedAt(null);
      },
      saveNow: () => {
        if (!storageOk) return false;
        const ok = saveState(state) === 'ok';
        if (ok) setLastSavedAt(new Date());
        return ok;
      },
    }),
    [state, active, storageOk, lastSavedAt, update, updateById],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

/** Convenience hook for screens that always have an active draft. */
export function useDraft() {
  const { active, update } = useStore();
  if (!active) throw new Error('No active draft');
  return { draft: active, update };
}
