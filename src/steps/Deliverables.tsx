import { useState } from 'react';
import { acknowledgements, deliverablesCopy } from '../config/copy';
import { deliverableOffers } from '../config/pricing';
import { Button } from '../components/Button';
import { CheckCard } from '../components/Choice';
import { Icon } from '../components/Icon';
import { StepShell } from '../components/StepShell';
import { recommend } from '../lib/recommend';
import { useDraft } from '../state/store';
import type { DeliverableId } from '../state/types';

const ALL: DeliverableId[] = ['resume', 'linkedin'];

export function Deliverables() {
  const { draft, update } = useDraft();
  const [showHelp, setShowHelp] = useState(false);
  const recs = recommend(draft.goal);
  const suggested = recs.filter((r) => r.recommended);
  const suggestedLabel = suggested.map((r) => deliverableOffers[r.id].name).join(' + ');

  // A change after the demo checkout means the order no longer matches, so it must be confirmed again.
  const setDeliverables = (next: DeliverableId[], usedRecommendation: boolean) => {
    const changed = next.join() !== draft.deliverables.join();
    update({
      deliverables: next,
      usedRecommendation,
      ...(changed ? { order: { ...draft.order, confirmedAt: null }, generated: null } : {}),
    });
  };

  const toggle = (id: DeliverableId, on: boolean) => {
    const set = new Set(draft.deliverables);
    if (on) set.add(id);
    else set.delete(id);
    setDeliverables(ALL.filter((x) => set.has(x)), false);
  };

  return (
    <StepShell
      step="deliverables"
      ack={acknowledgements.deliverables(draft.targetRole.trim())}
      title={deliverablesCopy.title}
      intro={deliverablesCopy.intro}
      onBack={() => update({ step: 'role' })}
      onContinue={() => update({ step: 'checkout' })}
      continueDisabled={draft.deliverables.length === 0}
      blockedReason="Choose at least one to continue, or tap “Help me decide”."
    >
      <div className="deliverable-grid">
        {ALL.map((id) => (
          <CheckCard
            key={id}
            checked={draft.deliverables.includes(id)}
            onChange={(on) => toggle(id, on)}
            label={deliverableOffers[id].name}
            hint={deliverableOffers[id].shortDescription}
          />
        ))}
        <button
          type="button"
          className={`choice choice--help ${showHelp ? 'is-open' : ''}`}
          aria-expanded={showHelp}
          aria-controls="recs"
          onClick={() => setShowHelp((v) => !v)}
        >
          <span className="choice__mark choice__mark--help" aria-hidden="true"><Icon name="info" size={14} /></span>
          <span className="choice__text">
            <span className="choice__label">{deliverablesCopy.helpLabel}</span>
            <span className="choice__hint">{deliverablesCopy.helpHint}</span>
          </span>
        </button>
      </div>

      {showHelp && (
        <section id="recs" className="rec-panel reveal" aria-labelledby="recs-title">
          <div className="rec-panel__head">
            <h2 id="recs-title" className="eyebrow">{deliverablesCopy.recTitle}</h2>
            <p className="rec-panel__answer">{suggestedLabel}</p>
          </div>
          <div>
            <h3 className="rec-panel__why">{deliverablesCopy.whyTitle}</h3>
            <ul className="rec-list">
              {recs.map((r) => (
                <li key={r.id} className="rec">
                  <span className={`badge ${r.recommended ? 'badge--yes' : 'badge--maybe'}`}>{r.recommended ? 'Suggested' : 'Optional'}</span>
                  <p className="rec__body"><strong>{deliverableOffers[r.id].name}.</strong> {r.reason}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="row">
            <Button
              variant="primary"
              icon="check"
              onClick={() => {
                setDeliverables(suggested.map((r) => r.id), true);
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
        <p className="muted small" role="status">{deliverablesCopy.usingRec}</p>
      )}
    </StepShell>
  );
}
