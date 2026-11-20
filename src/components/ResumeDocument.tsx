import type { ResumeDraft, ResumeTemplateId } from '../state/types';

/**
 * Single-column, real-text resume. All three templates share the same markup and
 * reading order (good for applicant tracking systems); only spacing and accents differ.
 */
export function ResumeDocument({ resume, template, sample, className = '' }: {
  resume: ResumeDraft;
  template: ResumeTemplateId;
  sample?: boolean;
  className?: string;
}) {
  const skills = resume.skills.length > 0 && (
    <section className="r-section">
      <h3 className="r-section__title">Skills</h3>
      <p className="r-skills">{resume.skills.join(' • ')}</p>
    </section>
  );
  return (
    <article className={`resume resume--${template} ${className}`} aria-label="Resume preview">
      {sample && <p className="resume__sample">Sample — not real information</p>}
      <header className="r-header">
        <h2 className="r-name">{resume.name || 'Your name'}</h2>
        {resume.contactLine && <p className="r-contact">{resume.contactLine}</p>}
      </header>
      {resume.summary && (
        <section className="r-section">
          <h3 className="r-section__title">Summary</h3>
          <p className="r-summary">{resume.summary}</p>
        </section>
      )}
      {resume.skillsFirst && skills}
      {resume.sections.map((s) => (
        <section key={s.id} className="r-section">
          <h3 className="r-section__title">{s.title}</h3>
          {s.items.map((it) => (
            <div key={it.id} className="r-item">
              <div className="r-item__top">
                <p className="r-item__heading">
                  <strong>{it.heading}</strong>
                  {it.subheading && <span className="r-item__sub">{it.subheading}</span>}
                </p>
                {it.meta && <p className="r-item__meta">{it.meta}</p>}
              </div>
              {it.bullets.length > 0 && (
                <ul className="r-bullets">
                  {it.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      ))}
      {!resume.skillsFirst && skills}
      {resume.extras.map((x) => (
        <section key={x.title} className="r-section">
          <h3 className="r-section__title">{x.title}</h3>
          {x.lines.length === 1 ? <p>{x.lines[0]}</p> : <ul className="r-bullets">{x.lines.map((l, i) => <li key={i}>{l}</li>)}</ul>}
        </section>
      ))}
    </article>
  );
}
