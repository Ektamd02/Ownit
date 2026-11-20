import { optionalReason, recommendationReasons } from '../config/copy';
import type { DeliverableId, GoalId } from '../state/types';

export interface Recommendation {
  id: DeliverableId;
  recommended: boolean;
  reason: string;
}

export function recommend(goal: GoalId | null): Recommendation[] {
  const reasons = recommendationReasons[goal ?? 'exploring'];
  return (['resume', 'linkedin'] as DeliverableId[]).map((id) => {
    const reason = reasons[id];
    return { id, recommended: reason !== null, reason: reason ?? optionalReason[id] };
  });
}
