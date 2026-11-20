import { acknowledgements, fields, goalCopy, goals } from '../config/copy';
import { ChoiceGroup } from '../components/Choice';
import { TextField } from '../components/Field';
import { StepShell } from '../components/StepShell';
import { useDraft, useStore } from '../state/store';

export function Goal() {
  const { draft, update } = useDraft();
  const { goHome } = useStore();
  const needsOther = draft.field === 'other';
  const ready = draft.goal && draft.field && (!needsOther || draft.fieldDetail.trim());

  return (
    <StepShell
      step="goal"
      title={goalCopy.title}
      intro={goalCopy.intro}
      onBack={goHome}
      onContinue={() => update({ step: 'role' })}
      continueDisabled={!ready}
      blockedReason={!draft.goal ? 'Choose what you’re working toward to continue.' : !draft.field ? 'Choose a field to continue.' : 'Tell us the field to continue.'}
    >
      <ChoiceGroup
        legend={<span className="sr-only">{goalCopy.title}</span>}
        options={goals.map((g) => ({ id: g.id, label: g.label, hint: g.hint }))}
        value={draft.goal}
        onChange={(goal) => update({ goal })}
        columns={3}
      />

      {draft.goal && (
        // Revealed once a goal is chosen, so the page asks one thing at a time.
        <section className="stack-lg reveal" aria-labelledby="field-ack">
          <p className="ack-line" id="field-ack" aria-live="polite">{acknowledgements.field(draft.goal)}</p>
          <ChoiceGroup
            legend={goalCopy.fieldTitle}
            legendClassName="h2"
            options={fields.map((f) => ({ id: f.id, label: f.label }))}
            value={draft.field}
            onChange={(field) => update({ field })}
            columns={4}
          />
          {draft.field && (
            <TextField
              className="field--narrow reveal"
              label={needsOther ? goalCopy.fieldOtherLabel : goalCopy.fieldDetailLabel}
              placeholder={needsOther ? goalCopy.fieldOtherPlaceholder : goalCopy.fieldDetailPlaceholder}
              value={draft.fieldDetail}
              onChange={(fieldDetail) => update({ fieldDetail })}
              maxLength={80}
            />
          )}
        </section>
      )}
    </StepShell>
  );
}
