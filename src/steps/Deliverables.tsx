import { useState } from 'react';
import { deliverablesCopy } from '../config/copy';
import { deliverableOffers } from '../config/pricing';
import { Button } from '../components/Button';
import { CheckCard } from '../components/Choice';
import { Icon } from '../components/Icon';
import { StepShell } from '../components/StepShell';
import { recommend } from '../lib/recommend';
import { useDraft } from '../state/store';
import type { DeliverableId } from '../state/types';

export function Deliverables() {
  const { draft, update } = useDraft();
  const [showHelp, setShowHelp] = useState(false);
  const recs = recommend(draft.goal);

  const toggle = (id: DeliverableId, on: boolean) => {
    const set = new Set(draft.deliverables);
    if (on) set.add(id);
    else set.delete(id);
    setDeliverables((['resume', 'linkedin'] as DeliverableId[]).filter((x) => set.has(x)), false);
  };

  // A change after the demo checkout means the order no longer matches, so it must be confirmed again.
  const setDeliverables = (next: DeliverableId[], usedRecommendation: boolean) => {
    const changed = next.join() !== draft.deliverables.join();
    update({
      deliverables: next,
      usedRecommendation,
      ...(changed ? { order: { ...draft.order, confirmedAt: null }, generated: null } : {}),
    });
  };

  return (
    <StepShell
      step="deliverables"
      title={deliverablesCopy.title}
      intro={deliverablesCopy.intro}
      onBack={() => update({ step: 'role' })}
      onContinue={() => update({ step: 'checkout' })}
      continueDisabled={draft.deliverables.length === 0}
      blockedReason="Choose at least one to continue, or tap “Help me decide”."
    >
      <div className="stack">
        {(['resume', 'linkedin'] as DeliverableId[]).map((id) => (
          <CheckCard
            key={id}
            checked={draft.deliverables.includes(id)}
            onChange={(on) => toggle(id, on)}
            label={deliverableOffers[id].name}
            hint={deliverableOffers[id].shortDescription}
          />
        ))}
        <button type="button" className={`choice choice--help ${showHelp ? 'is-selected' : ''}`} aria-expanded={showHelp} aria-controls="recs" onClick={() => setShowHelp((v) => !v)}>
          <span className="choice__mark choice__mark--help" aria-hidden="true"><Icon name="info" size={16} /></span>
          <span className="choice__text">
            <span className="choice__label">{deliverablesCopy.helpLabel}</span>
            <span className="choice__hint">{deliverablesCopy.helpHint}</span>
          </span>
        </button>
      </div>

      {showHelp && (
        <section id="recs" className="panel panel--wisteria" aria-labelledby="recs-title">
          <h2 id="recs-title" className="h3">{deliverablesCopy.recTitle}</h2>
          <ul className="rec-list">
            {recs.map((r) => (
              <li key={r.id} className="rec">
                <span className={`badge ${r.recommended ? 'badge--yes' : 'badge--maybe'}`}>{r.recommended ? 'Suggested' : 'Optional'}</span>
                <div>
                  <p className="rec__title">{deliverableOffers[r.id].name}</p>
                  <p className="rec__body">{r.reason}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="row">
            <Button
              variant="primary"
              icon="check"
              onClick={() => {
                setDeliverables(recs.filter((r) => r.recommended).map((r) => r.id), true);
                setShowHelp(false);
              }}
            >
              {deliverablesCopy.accept}
            </Button>
            <Button variant="ghost" onClick={() => setShowHelp(false)}>{deliverablesCopy.change}</Button>
          </div>
        </section>
      )}
      {draft.usedRecommendation && !showHelp && (
        <p className="muted small" role="status">Using our suggestion. You can tick or untick either option above.</p>
      )}
    </StepShell>
  );
}
