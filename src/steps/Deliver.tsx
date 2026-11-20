import { useState } from 'react';
import { createPortal } from 'react-dom';
import { deliverCopy, templates } from '../config/copy';
import { Button } from '../components/Button';
import { ChoiceGroup } from '../components/Choice';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CopyButton } from '../components/CopyButton';
import { TextArea, TextField } from '../components/Field';
import { Icon } from '../components/Icon';
import { LinkedInPreview } from '../components/LinkedInPreview';
import { Notice } from '../components/Notice';
import { ResumeDocument } from '../components/ResumeDocument';
import { StepShell } from '../components/StepShell';
import { downloadFile, fileSafe, linkedInToText, resumeToText, resumeToWordHtml } from '../lib/export';
import { generator } from '../lib/generator';
import { lines, splitList } from '../lib/text';
import { useGeneration } from '../lib/useGeneration';
import { useDraft, useStore } from '../state/store';
import type { Emphasis, GenerationPrefs, LinkedInDraft, Length, ResumeDraft, Tone } from '../state/types';
import { GeneratorNotice } from './Preview';

type Tab = 'resume' | 'linkedin';

export function Deliver() {
  const { draft, update } = useDraft();
  const { duplicateForNewRole } = useStore();
  const g = draft.generated;
  const [tab, setTab] = useState<Tab>(g?.resume ? 'resume' : 'linkedin');
  const [showChanges, setShowChanges] = useState(false);

  if (!g) return null;

  const setResume = (patch: Partial<ResumeDraft>) =>
    update((d) => ({ generated: d.generated && d.generated.resume ? { ...d.generated, resume: { ...d.generated.resume, ...patch }, edited: true } : d.generated }));
  const setLinkedIn = (patch: Partial<LinkedInDraft>) =>
    update((d) => ({ generated: d.generated && d.generated.linkedin ? { ...d.generated, linkedin: { ...d.generated.linkedin, ...patch }, edited: true } : d.generated }));

  const tabs: Tab[] = [g.resume ? 'resume' : null, g.linkedin ? 'linkedin' : null].filter(Boolean) as Tab[];

  return (
    <StepShell
      step="deliver"
      title={deliverCopy.title}
      intro={deliverCopy.intro}
      onBack={() => update({ step: 'preview' })}
      wide
    >
      {draft.isSample && <Notice tone="sample" title="Sample drafts">Built from made-up information. Start a new draft from the home screen to make your own.</Notice>}
      <GeneratorNotice />

      <div className="toolbar">
        <Button icon="refresh" onClick={() => setShowChanges((v) => !v)} aria-expanded={showChanges} aria-controls="changes">Request changes</Button>
        <Button variant="ghost" icon="layers" onClick={() => duplicateForNewRole(draft.id)}>New version for another role</Button>
      </div>

      {showChanges && <ChangeRequest onDone={() => setShowChanges(false)} />}

      {tabs.length > 1 && (
        <div className="tabs" role="tablist" aria-label="Draft type">
          {tabs.map((t) => (
            <button
              key={t}
              role="tab"
              id={`tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              tabIndex={tab === t ? 0 : -1}
              className={`tab ${tab === t ? 'is-active' : ''}`}
              onClick={() => setTab(t)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  const next = tabs[(tabs.indexOf(t) + 1) % tabs.length];
                  setTab(next);
                  document.getElementById(`tab-${next}`)?.focus();
                }
              }}
            >
              {t === 'resume' ? 'Resume' : 'LinkedIn'}
            </button>
          ))}
        </div>
      )}

      {tab === 'resume' && g.resume && (
        <div role={tabs.length > 1 ? 'tabpanel' : undefined} id="panel-resume" aria-labelledby={tabs.length > 1 ? 'tab-resume' : undefined} className="split">
          <div className="split__edit">
            <ResumeEditor resume={g.resume} onChange={setResume} />
          </div>
          <div className="split__preview">
            <div className="sticky stack">
              <ChoiceGroup
                legend="Style"
                legendClassName="field__label"
                options={templates.map((t) => ({ id: t.id, label: t.name }))}
                value={draft.template}
                onChange={(template) => update({ template })}
                columns={3}
              />
              <div className="row">
                <Button variant="primary" icon="print" onClick={() => window.print()}>Print or save as PDF</Button>
                <Button icon="download" onClick={() => downloadFile(`${fileSafe(g.resume!.name)}-resume.doc`, resumeToWordHtml(g.resume!), 'application/msword')}>Word</Button>
                <Button icon="download" onClick={() => downloadFile(`${fileSafe(g.resume!.name)}-resume.txt`, resumeToText(g.resume!), 'text/plain;charset=utf-8')}>Plain text</Button>
              </div>
              <p className="muted small">For a PDF, choose “Save as PDF” in the print dialog. The text stays selectable, so hiring software can read it.</p>
              <div className="paper-wrap paper-wrap--small">
                <ResumeDocument resume={g.resume} template={draft.template} sample={draft.isSample} className="paper" />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'linkedin' && g.linkedin && (
        <div role={tabs.length > 1 ? 'tabpanel' : undefined} id="panel-linkedin" aria-labelledby={tabs.length > 1 ? 'tab-linkedin' : undefined} className="split">
          <div className="split__edit">
            <LinkedInEditor data={g.linkedin} onChange={setLinkedIn} />
          </div>
          <div className="split__preview">
            <div className="sticky stack">
              <div className="row">
                <CopyButton text={linkedInToText(g.linkedin)} label="Copy everything" what="all LinkedIn sections" />
                <Button icon="download" onClick={() => downloadFile(`${fileSafe(draft.profile.fullName)}-linkedin.txt`, linkedInToText(g.linkedin!), 'text/plain;charset=utf-8')}>Download text</Button>
              </div>
              <p className="muted small">Paste each section into your LinkedIn profile yourself. Ownit never signs in to or posts on LinkedIn.</p>
              <LinkedInPreview data={g.linkedin} name={draft.profile.fullName} sample={draft.isSample} />
            </div>
          </div>
        </div>
      )}

      {g.resume &&
        createPortal(
          <div className="print-root">
            <ResumeDocument resume={g.resume} template={draft.template} sample={draft.isSample} />
          </div>,
          document.body,
        )}

      <p className="muted small storage-note"><Icon name="lock" size={14} /> {deliverCopy.storage} Manage or clear them in My drafts.</p>
    </StepShell>
  );
}

function ResumeEditor({ resume, onChange }: { resume: ResumeDraft; onChange: (p: Partial<ResumeDraft>) => void }) {
  const setSection = (si: number, ii: number, patch: Partial<ResumeDraft['sections'][number]['items'][number]>) =>
    onChange({
      sections: resume.sections.map((s, i) =>
        i !== si ? s : { ...s, items: s.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) },
      ),
    });

  return (
    <div className="stack">
      <h2 className="h3">Edit your resume</h2>
      <div className="grid-2">
        <TextField label="Name" value={resume.name} onChange={(name) => onChange({ name })} />
        <TextField label="Contact line" value={resume.contactLine} onChange={(contactLine) => onChange({ contactLine })} />
      </div>
      <TextArea label="Summary" rows={4} value={resume.summary} onChange={(summary) => onChange({ summary })} hint="Two or three sentences. Leave blank to remove it." />
      {resume.sections.map((s, si) => (
        <fieldset key={s.id} className="entry">
          <legend className="entry__legend">{s.title}</legend>
          {s.items.map((it, ii) => (
            <div key={it.id} className="stack edit-item">
              <div className="grid-2">
                <TextField label="Heading" value={it.heading} onChange={(heading) => setSection(si, ii, { heading })} />
                <TextField label="Details" value={it.subheading} onChange={(subheading) => setSection(si, ii, { subheading })} />
              </div>
              <TextField label="Dates and location" value={it.meta} onChange={(meta) => setSection(si, ii, { meta })} />
              <TextArea
                label="Bullet points"
                hint="One per line."
                rows={Math.max(3, it.bullets.length + 1)}
                value={it.bullets.join('\n')}
                onChange={(v) => setSection(si, ii, { bullets: v.split('\n') })}
                onBlur={() => setSection(si, ii, { bullets: lines(it.bullets.join('\n')) })}
              />
            </div>
          ))}
        </fieldset>
      ))}
      <TextArea label="Skills" hint="Separate with commas." rows={2} value={resume.skills.join(', ')} onChange={(v) => onChange({ skills: v.split(',').map((x) => x.trimStart()) })} onBlur={() => onChange({ skills: splitList(resume.skills.join(',')) })} />
      {resume.extras.map((x, i) => (
        <TextArea
          key={x.title}
          label={x.title}
          hint="One per line."
          rows={2}
          value={x.lines.join('\n')}
          onChange={(v) => onChange({ extras: resume.extras.map((e, j) => (j === i ? { ...e, lines: v.split('\n') } : e)) })}
          onBlur={() => onChange({ extras: resume.extras.map((e) => ({ ...e, lines: lines(e.lines.join('\n')) })).filter((e) => e.lines.length) })}
        />
      ))}
    </div>
  );
}

function LinkedInEditor({ data, onChange }: { data: LinkedInDraft; onChange: (p: Partial<LinkedInDraft>) => void }) {
  return (
    <div className="stack">
      <h2 className="h3">Edit your LinkedIn sections</h2>
      <div>
        <TextField label="Headline" value={data.headline} onChange={(headline) => onChange({ headline })} maxLength={220} />
        <p className="counter muted small" aria-live="polite">{data.headline.length} / 220 characters</p>
        <CopyButton text={data.headline} what="headline" />
      </div>
      <div>
        <TextArea label="About" rows={10} value={data.about} onChange={(about) => onChange({ about })} maxLength={2600} />
        <p className="counter muted small">{data.about.length} / 2,600 characters</p>
        <CopyButton text={data.about} what="About section" />
      </div>
      {data.experience.map((e, i) => (
        <fieldset key={e.id} className="entry">
          <legend className="entry__legend">{[e.title, e.org].filter(Boolean).join(' · ') || 'Experience'}</legend>
          <TextArea
            label="Description"
            rows={4}
            value={e.description}
            onChange={(description) => onChange({ experience: data.experience.map((x, j) => (j === i ? { ...x, description } : x)) })}
          />
          <CopyButton text={e.description} what={`description for ${e.title || e.org}`} />
        </fieldset>
      ))}
      <div>
        <TextArea label="Skills" hint="Separate with commas. Add them one at a time on LinkedIn." rows={3} value={data.skills.join(', ')} onChange={(v) => onChange({ skills: v.split(',').map((x) => x.trimStart()) })} onBlur={() => onChange({ skills: splitList(data.skills.join(',')) })} />
        <CopyButton text={data.skills.join(', ')} what="skills" />
      </div>
    </div>
  );
}

function ChangeRequest({ onDone }: { onDone: () => void }) {
  const { draft, update } = useDraft();
  const [prefs, setPrefs] = useState<GenerationPrefs>(draft.prefs);
  const [confirm, setConfirm] = useState(false);
  const { status, error, run } = useGeneration();

  const apply = async () => {
    setConfirm(false);
    update({ prefs });
    await run({ ...draft, prefs });
    onDone();
  };

  return (
    <section id="changes" className="panel panel--blue" aria-labelledby="changes-title">
      <h2 id="changes-title" className="h3">What would you like to change?</h2>
      <div className="grid-3">
        <ChoiceGroup<Tone>
          legend="Tone"
          legendClassName="field__label"
          options={[{ id: 'plain', label: 'Straightforward' }, { id: 'warm', label: 'Warmer' }, { id: 'formal', label: 'More formal' }]}
          value={prefs.tone}
          onChange={(tone) => setPrefs({ ...prefs, tone })}
          columns={2}
        />
        <ChoiceGroup<Length>
          legend="Length"
          legendClassName="field__label"
          options={[{ id: 'standard', label: 'Standard' }, { id: 'concise', label: 'Shorter' }]}
          value={prefs.length}
          onChange={(length) => setPrefs({ ...prefs, length })}
          columns={2}
        />
        <ChoiceGroup<Emphasis>
          legend="Put first on the resume"
          legendClassName="field__label"
          options={[{ id: 'auto', label: 'Our pick' }, { id: 'experience', label: 'Experience' }, { id: 'projects', label: 'Projects' }, { id: 'skills', label: 'Skills' }]}
          value={prefs.emphasis}
          onChange={(emphasis) => setPrefs({ ...prefs, emphasis })}
          columns={2}
        />
      </div>
      <TextArea
        label="Anything else?"
        optional
        voice
        rows={2}
        placeholder="e.g. Mention my bilingual skills earlier"
        value={prefs.note}
        onChange={(note) => setPrefs({ ...prefs, note })}
        hint={generator.understandsNotes ? 'We’ll pass this to the writer. It still won’t add anything you haven’t told us.' : 'The demo writer can’t read notes yet. For now, edit the text directly below — your note is saved for later.'}
      />
      {status === 'error' && <Notice tone="error" role="alert" title="That didn’t work">{error} Your current drafts are unchanged.</Notice>}
      <div className="row">
        <Button variant="primary" icon="refresh" loading={status === 'loading'} onClick={() => (draft.generated?.edited ? setConfirm(true) : void apply())}>
          Update drafts
        </Button>
        <Button variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
      <ConfirmDialog open={confirm} title="Replace your hand edits?" confirmLabel="Update drafts" onCancel={() => setConfirm(false)} onConfirm={() => void apply()}>
        <p>Updating rewrites your drafts from your confirmed details, so edits you made by hand will be replaced.</p>
        <p className="muted small">To keep this version, cancel and choose “New version for another role” first.</p>
      </ConfirmDialog>
    </section>
  );
}
