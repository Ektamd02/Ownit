import { useCallback, useEffect, useRef, useState } from 'react';
import { generator, inputFromDraft } from './generator';
import { useStore } from '../state/store';
import type { Draft } from '../state/types';

export type GenStatus = 'idle' | 'loading' | 'error';

export function useGeneration() {
  const { updateById } = useStore();
  const [status, setStatus] = useState<GenStatus>('idle');
  const [error, setError] = useState('');
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => () => ctrl.current?.abort(), []);

  const run = useCallback(
    async (draft: Draft) => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      setStatus('loading');
      setError('');
      try {
        const generated = await generator.generate(inputFromDraft(draft), c.signal);
        if (c.signal.aborted) return;
        updateById(draft.id, { generated });
        setStatus('idle');
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setStatus('error');
        // Show a friendly message only — never log the person's information.
        setError(e instanceof Error && e.message ? e.message : 'Something went wrong while writing your drafts.');
      }
    },
    [updateById],
  );

  return { status, error, run };
}
