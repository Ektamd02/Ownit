import { useEffect } from 'react';
import { acknowledgements, previewCopy, templates } from '../config/copy';
import { Button } from '../components/Button';
import { ChoiceGroup } from '../components/Choice';
import { LinkedInPreview } from '../components/LinkedInPreview';
import { Notice } from '../components/Notice';
import { ResumeDocument } from '../components/ResumeDocument';
import { StepShell } from '../components/StepShell';
import { generator } from '../lib/generator';
import { useGeneration } from '../lib/useGeneration';
import { useDraft } from '../state/store';

export function GeneratorNotice() {
  return generator.mode === 'demo' ? (
    <Notice tone="demo" title="Demo writer">
      These drafts were put together by a simple built-in demo writer, not an AI service. It only rearranges and tidies what you entered.
    </Notice>
  ) : null;
}

export function Preview() {
  const { draft, update } = useDraft();
  const { status, error, run } = useGeneration();
  const g = draft.generated;

  useEffect(() => {
    if (!draft.generated && status === 'idle') void run(draft);
    // Only re-run when the draft changes identity or its content was cleared.
  }, [draft.id, draft.generated === null]);

  const loading = !g && status !== 'error';

  return (
    <StepShell
      step="preview"
      ack={acknowledgements.preview}
      title={previewCopy.title}
      intro={previewCopy.intro}
      onBack={() => update({ step: 'factcheck' })}
      onContinue={() => update({ step: 'deliver' })}
      continueLabel={previewCopy.continue}
      continueDisabled={!g}
      blockedReason={loading ? 'Your drafts are still being created.' : 'Your drafts need to be created first.'}
      wide
    >
      {loading && (
        <div className="loading" role="status" aria-live="polite">
          <span className="spinner spinner--lg" aria-hidden="true" />
          <p>{previewCopy.generating}</p>
          <p className="muted small">Using only the details you confirmed.</p>
        </div>
      )}

      {status === 'error' && !g && (
        <Notice tone="error" title="We couldn’t create your drafts" role="alert">
          <p>{error} Your answers are safe and still saved.</p>
          <div className="row">
            <Button variant="primary" icon="refresh" onClick={() => void run(draft)}>Try again</Button>
            <Button variant="ghost" onClick={() => update({ step: 'factcheck' })}>Back to my details</Button>
          </div>
        </Notice>
      )}

      {g && (
        <>
          <GeneratorNotice />
          {g.resume && (
            <section aria-labelledby="resume-preview-title" className="stack-lg">
              <h2 id="resume-preview-title" className="h2">Resume</h2>
              <ChoiceGroup
                legend={previewCopy.templateLabel}
                legendClassName="field__label"
                options={templates.map((t) => ({ id: t.id, label: t.name, hint: t.description }))}
                value={draft.template}
                onChange={(template) => update({ template })}
                columns={3}
              />
              <div className="paper-wrap">
                <ResumeDocument resume={g.resume} template={draft.template} sample={draft.isSample} className="paper" />
              </div>
            </section>
          )}
          {g.linkedin && (
            <section aria-labelledby="li-preview-title" className="stack-lg">
              <h2 id="li-preview-title" className="h2">LinkedIn profile</h2>
              <LinkedInPreview data={g.linkedin} name={draft.profile.fullName} sample={draft.isSample} />
            </section>
          )}
        </>
      )}
    </StepShell>
  );
}
