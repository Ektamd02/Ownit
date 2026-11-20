import { fields, roleCopy } from '../config/copy';
import { Button } from '../components/Button';
import { TextField } from '../components/Field';
import { StepShell } from '../components/StepShell';
import { useDraft } from '../state/store';

export function Role() {
  const { draft, update } = useDraft();
  const examples = fields.find((f) => f.id === draft.field)?.roles ?? [];

  return (
    <StepShell
      step="role"
      title={roleCopy.title}
      intro={roleCopy.intro}
      onBack={() => update({ step: 'goal' })}
      onContinue={() => update({ step: 'deliverables', roleSkipped: !draft.targetRole.trim() })}
      continueLabel={draft.targetRole.trim() ? 'Continue' : 'Continue without a role'}
    >
      <TextField
        className="field--narrow"
        label={roleCopy.label}
        optional
        placeholder={examples[0] ? `e.g. ${examples[0]}` : 'e.g. Project Coordinator'}
        value={draft.targetRole}
        onChange={(targetRole) => update({ targetRole })}
        maxLength={80}
        autoComplete="organization-title"
      />
      {examples.length > 0 && (
        <div className="suggestions">
          <p className="suggestions__label" id="role-ideas">{roleCopy.examplesLabel}</p>
          <ul className="chip-row" aria-labelledby="role-ideas">
            {examples.map((r) => (
              <li key={r}>
                <button type="button" className={`chip ${draft.targetRole === r ? 'is-selected' : ''}`} aria-pressed={draft.targetRole === r} onClick={() => update({ targetRole: draft.targetRole === r ? '' : r })}>
                  {r}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Button variant="ghost" onClick={() => update({ targetRole: '', roleSkipped: true, step: 'deliverables' })}>{roleCopy.skip}</Button>
    </StepShell>
  );
}
