import { contextCopy } from '../config/copy';
import { Notice } from '../components/Notice';
import { StepShell } from '../components/StepShell';
import { useDraft } from '../state/store';
import type { Profile } from '../state/types';
import { sectionComponents, sectionIntro, sectionOrder, sectionTitles } from './context/sections';
import { useEffect, useRef } from 'react';

export function Context() {
  const { draft, update } = useDraft();
  const order = sectionOrder(draft.profile);
  const index = Math.min(draft.contextSection, order.length - 1);
  const current = order[index];
  const Section = sectionComponents[current];
  const sectionHeading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    sectionHeading.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [index]);

  const onChange = (patch: Partial<Profile>) =>
    update((d) => ({ profile: { ...d.profile, ...patch }, factsConfirmed: false }));

  const go = (i: number) => update({ contextSection: i });

  return (
    <StepShell
      step="context"
      title={contextCopy.title}
      intro={contextCopy.intro}
      onBack={() => (index === 0 ? update({ step: 'checkout' }) : go(index - 1))}
      onContinue={() => (index === order.length - 1 ? update({ step: 'factcheck', contextSection: index }) : go(index + 1))}
      continueLabel={index === order.length - 1 ? 'Review my details' : `Next: ${sectionTitles[order[index + 1]]}`}
      continueDisabled={current === 'basics' && !draft.profile.fullName.trim()}
      blockedReason="Add your name to continue."
    >
      {draft.isSample && (
        <Notice tone="sample" title="You’re looking at sample information">
          Jordan Rivera is a made-up person. Start a new draft from the home screen to use your own details.
        </Notice>
      )}

      <nav aria-label="Sections" className="section-tabs">
        <ol>
          {order.map((id, i) => (
            <li key={id}>
              <button type="button" className={`section-tab ${i === index ? 'is-current' : ''} ${i < index ? 'is-done' : ''}`} aria-current={i === index ? 'step' : undefined} onClick={() => go(i)}>
                <span className="section-tab__num" aria-hidden="true">{i + 1}</span>
                {sectionTitles[id]}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <section className="panel" aria-labelledby="section-heading">
        <h2 id="section-heading" className="h2" tabIndex={-1} ref={sectionHeading}>{sectionTitles[current]}</h2>
        <p className="muted">{sectionIntro(current, draft.profile)}</p>
        <Section profile={draft.profile} onChange={onChange} deliverables={draft.deliverables} />
      </section>
    </StepShell>
  );
}
