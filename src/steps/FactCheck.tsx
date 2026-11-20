import { useState } from 'react';
import { acknowledgements, factcheckCopy, fields, goals, stageOptions } from '../config/copy';
import { deliverableOffers } from '../config/pricing';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Icon } from '../components/Icon';
import { Notice } from '../components/Notice';
import { StepShell } from '../components/StepShell';
import { canGenerate, findChecks } from '../lib/factcheck';
import { dateRange, joinNonEmpty, lines, splitList } from '../lib/text';
import { useDraft } from '../state/store';
import type { Profile, StepId } from '../state/types';
import { sectionComponents, sectionOrder, sectionTitles } from './context/sections';
import type { SectionId } from './context/sections';

function Missing() {
  return <span className="muted">Not added — will be left out</span>;
}

function Facts({ id, p }: { id: SectionId; p: Profile }) {
  switch (id) {
    case 'basics':
      return (
        <dl className="facts">
          <div><dt>Name</dt><dd>{p.fullName || <Missing />}</dd></div>
          <div><dt>Right now</dt><dd>{stageOptions.find((s) => s.id === p.stage)?.label ?? <Missing />}</dd></div>
          <div><dt>Contact</dt><dd>{joinNonEmpty([p.email, p.phone]) || <Missing />}</dd></div>
          <div><dt>Location</dt><dd>{p.location || <Missing />}</dd></div>
          {(p.linkedinUrl || p.website) && <div><dt>Links</dt><dd>{joinNonEmpty([p.linkedinUrl, p.website])}</dd></div>}
        </dl>
      );
    case 'education':
      return p.education.length ? (
        <ul className="fact-items">
          {p.education.map((e) => (
            <li key={e.id}>
              <p className="fact-items__title">{e.school || <Missing />}</p>
              <p className="fact-items__meta">{joinNonEmpty([joinNonEmpty([e.credential, e.study], ', '), dateRange(e.start, e.end) || 'No dates'])}</p>
              {lines(e.details).length > 0 && <ul className="bullets">{lines(e.details).map((l, i) => <li key={i}>{l}</li>)}</ul>}
            </li>
          ))}
        </ul>
      ) : <p><Missing /></p>;
    case 'experience':
      return p.experience.length ? (
        <ul className="fact-items">
          {p.experience.map((e) => (
            <li key={e.id}>
              <p className="fact-items__title">{joinNonEmpty([e.title, e.org], ' at ') || <Missing />}</p>
              <p className="fact-items__meta">{joinNonEmpty([dateRange(e.start, e.end, e.current) || 'No dates', e.location])}</p>
              {lines(e.highlights).length > 0 ? (
                <ul className="bullets">{lines(e.highlights).map((l, i) => <li key={i}>{l}</li>)}</ul>
              ) : <p className="small"><Missing /></p>}
            </li>
          ))}
        </ul>
      ) : <p><Missing /></p>;
    case 'projects':
      return p.projects.length ? (
        <ul className="fact-items">
          {p.projects.map((x) => (
            <li key={x.id}>
              <p className="fact-items__title">{x.name || <Missing />}</p>
              <p className="fact-items__meta">{joinNonEmpty([x.context, x.date, x.link]) || ' '}</p>
              {lines(x.description).length > 0 && <ul className="bullets">{lines(x.description).map((l, i) => <li key={i}>{l}</li>)}</ul>}
            </li>
          ))}
        </ul>
      ) : <p><Missing /></p>;
    case 'skills':
      return (
        <dl className="facts">
          <div><dt>Skills</dt><dd>{splitList(p.skills).length ? <ul className="chip-row chip-row--static">{splitList(p.skills).map((s) => <li key={s} className="chip chip--static">{s}</li>)}</ul> : <Missing />}</dd></div>
          {p.coursework && <div><dt>Coursework</dt><dd>{p.coursework}</dd></div>}
          {p.certifications && <div><dt>Certifications</dt><dd>{lines(p.certifications).join('; ')}</dd></div>}
          {p.achievements && <div><dt>Achievements</dt><dd>{lines(p.achievements).join('; ')}</dd></div>}
          {p.aboutYou && <div><dt>In your words</dt><dd>{p.aboutYou}</dd></div>}
        </dl>
      );
  }
}

export function FactCheck() {
  const { draft, update } = useDraft();
  const [editing, setEditing] = useState<SectionId | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const checks = findChecks(draft);
  const order = sectionOrder(draft.profile);
  const ready = canGenerate(draft) && draft.factsConfirmed;

  const onChange = (patch: Partial<Profile>) => update((d) => ({ profile: { ...d.profile, ...patch }, factsConfirmed: false }));
  const goTo = (step: StepId) => update({ step });

  const generate = () => {
    if (draft.generated?.edited) {
      setConfirmReplace(true);
      return;
    }
    update({ generated: null, step: 'preview' });
  };

  const fieldLabel = draft.field === 'other' ? draft.fieldDetail : joinNonEmpty([fields.find((f) => f.id === draft.field)?.label, draft.fieldDetail], ' — ');

  return (
    <StepShell
      step="factcheck"
      ack={acknowledgements.factcheck(draft.profile.fullName.trim().split(/\s+/)[0] ?? '')}
      title={factcheckCopy.title}
      intro={factcheckCopy.intro}
      onBack={() => update({ step: 'context', contextSection: order.length - 1 })}
      onContinue={generate}
      continueLabel={draft.generated ? 'Create fresh drafts' : factcheckCopy.generate}
      continueDisabled={!ready}
      blockedReason={!canGenerate(draft) ? 'Fix the items marked “Needed” first.' : 'Tick the box above to confirm your details.'}
      footerExtra={draft.generated ? <Button onClick={() => goTo('preview')}>Keep current drafts</Button> : undefined}
      wide
    >
      {draft.isSample && (
        <Notice tone="sample" title="Sample information">This is a made-up person so you can see how Ownit works. None of it is yours.</Notice>
      )}

      <section className="panel panel--peach" aria-labelledby="checks-title">
        <h2 id="checks-title" className="h3">{checks.length ? factcheckCopy.checksTitle : factcheckCopy.noChecks}</h2>
        {checks.length > 0 && (
          <ul className="checks">
            {checks.map((c) => (
              <li key={c.id} className={`check check--${c.level}`}>
                <span className={`badge badge--${c.level}`}>{c.level === 'required' ? 'Needed' : c.level === 'verify' ? 'Double-check' : 'Suggestion'}</span>
                <span className="check__msg">{c.message}</span>
                <button type="button" className="text-btn" onClick={() => setEditing(c.section)}>
                  {c.level === 'verify' ? 'Review' : 'Fix'}<span className="sr-only"> in {sectionTitles[c.section]}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel" aria-labelledby="plan-title">
        <div className="panel__head">
          <h2 id="plan-title" className="h3">Your plan</h2>
        </div>
        <dl className="facts">
          <div><dt>Goal</dt><dd>{goals.find((g) => g.id === draft.goal)?.label} <button type="button" className="text-btn" onClick={() => goTo('goal')}>Change<span className="sr-only"> goal</span></button></dd></div>
          <div><dt>Field</dt><dd>{fieldLabel} <button type="button" className="text-btn" onClick={() => goTo('goal')}>Change<span className="sr-only"> field</span></button></dd></div>
          <div><dt>Target role</dt><dd>{draft.targetRole || <span className="muted">None — that’s fine</span>} <button type="button" className="text-btn" onClick={() => goTo('role')}>Change<span className="sr-only"> role</span></button></dd></div>
          <div><dt>Creating</dt><dd>{draft.deliverables.map((d) => deliverableOffers[d].name).join(' and ')}</dd></div>
        </dl>
      </section>

      {order.map((id) => {
        const Section = sectionComponents[id];
        const isEditing = editing === id;
        return (
          <section key={id} className={`panel ${isEditing ? 'panel--editing' : ''}`} aria-labelledby={`fc-${id}`}>
            <div className="panel__head">
              <h2 id={`fc-${id}`} className="h3">{sectionTitles[id]}</h2>
              <Button size="sm" variant={isEditing ? 'primary' : 'ghost'} icon={isEditing ? 'check' : 'edit'} onClick={() => setEditing(isEditing ? null : id)} aria-expanded={isEditing}>
                {isEditing ? 'Done' : 'Edit'}<span className="sr-only"> {sectionTitles[id]}</span>
              </Button>
            </div>
            {isEditing ? <Section profile={draft.profile} onChange={onChange} deliverables={draft.deliverables} /> : <Facts id={id} p={draft.profile} />}
          </section>
        );
      })}

      <div className="confirm-box">
        <label className="inline-check inline-check--lg">
          <input type="checkbox" checked={draft.factsConfirmed} onChange={(e) => update({ factsConfirmed: e.target.checked })} disabled={!canGenerate(draft)} />
          {factcheckCopy.confirm}
        </label>
        <p className="muted small"><Icon name="info" size={14} /> We won’t add skills, numbers or experience you haven’t listed. Anything missing is left out.</p>
      </div>

      <ConfirmDialog
        open={confirmReplace}
        title="Replace your edited drafts?"
        confirmLabel="Create fresh drafts"
        onCancel={() => setConfirmReplace(false)}
        onConfirm={() => { setConfirmReplace(false); update({ generated: null, step: 'preview' }); }}
      >
        <p>You’ve edited your current drafts by hand. Creating fresh ones will replace those edits.</p>
        <p className="muted small">To keep both, cancel and use “New version for another role” in My drafts.</p>
      </ConfirmDialog>
    </StepShell>
  );
}
