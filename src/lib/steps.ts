import type { Draft, StepId } from '../state/types';

export const flow: StepId[] = ['goal', 'role', 'deliverables', 'checkout', 'context', 'factcheck', 'preview', 'deliver'];

export function stepIndex(step: StepId) {
  return flow.indexOf(step);
}

export function nextStep(step: StepId): StepId {
  return flow[Math.min(stepIndex(step) + 1, flow.length - 1)];
}

export function prevStep(step: StepId): StepId | 'home' {
  const i = stepIndex(step);
  return i <= 0 ? 'home' : flow[i - 1];
}

/** Furthest step a draft can open, so returning users land somewhere valid. */
export function safeStep(d: Draft): StepId {
  if (!d.goal || !d.field) return 'goal';
  if (stepIndex(d.step) > stepIndex('deliverables') && d.deliverables.length === 0) return 'deliverables';
  if (stepIndex(d.step) > stepIndex('checkout') && !d.order.confirmedAt) return 'checkout';
  if (stepIndex(d.step) > stepIndex('factcheck') && !d.generated && !d.factsConfirmed) return 'factcheck';
  if (stepIndex(d.step) > stepIndex('preview') && !d.generated) return 'preview';
  return d.step;
}
