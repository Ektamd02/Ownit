import { createApiGenerator } from './apiGenerator';
import { demoGenerator } from './demoGenerator';
import type { DraftGenerator, GenerateInput } from './types';
import type { Draft } from '../../state/types';

const endpoint = import.meta.env.VITE_OWNIT_GENERATOR_URL as string | undefined;

/** Uses the connected backend when configured, otherwise the clearly-labelled local demo. */
export const generator: DraftGenerator = endpoint ? createApiGenerator(endpoint) : demoGenerator;

export function inputFromDraft(d: Draft): GenerateInput {
  return {
    goal: d.goal,
    field: d.field,
    fieldDetail: d.fieldDetail,
    targetRole: d.targetRole,
    deliverables: d.deliverables,
    profile: d.profile,
    prefs: d.prefs,
  };
}

export type { DraftGenerator, GenerateInput };
