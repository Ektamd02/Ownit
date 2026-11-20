import type { LinkedInDraft } from '../state/types';
import { CopyButton } from './CopyButton';

/** Read-only preview of LinkedIn sections, each copyable on its own. */
export function LinkedInPreview({ data, name, sample }: { data: LinkedInDraft; name: string; sample?: boolean }) {
  return (
    <div className="li">
      {sample && <p className="badge badge--sample">Sample — not real information</p>}
      <section className="li-card li-card--top" aria-labelledby="li-headline">
        <div className="li-card__banner" aria-hidden="true" />
        <div className="li-card__body">
          <p className="li-name">{name || 'Your name'}</p>
          <div className="li-card__head">
            <h3 id="li-headline" className="li-label">Headline</h3>
            <CopyButton text={data.headline} what="headline" />
          </div>
          <p className="li-headline">{data.headline}</p>
        </div>
      </section>
      <section className="li-card" aria-labelledby="li-about">
        <div className="li-card__head">
          <h3 id="li-about" className="li-label">About</h3>
          <CopyButton text={data.about} what="About section" />
        </div>
        <p className="li-about">{data.about}</p>
      </section>
      {data.experience.length > 0 && (
        <section className="li-card" aria-labelledby="li-exp">
          <h3 id="li-exp" className="li-label">Experience</h3>
          <ul className="li-list">
            {data.experience.map((e) => (
              <li key={e.id}>
                <div className="li-card__head">
                  <div>
                    <p className="li-item__title">{e.title}</p>
                    <p className="li-item__meta">{[e.org, e.dates].filter(Boolean).join(' · ')}</p>
                  </div>
                  <CopyButton text={e.description} what={`description for ${e.title || e.org}`} />
                </div>
                {e.description && <p className="li-about">{e.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {data.skills.length > 0 && (
        <section className="li-card" aria-labelledby="li-skills">
          <div className="li-card__head">
            <h3 id="li-skills" className="li-label">Skills</h3>
            <CopyButton text={data.skills.join(', ')} what="skills" />
          </div>
          <ul className="chip-row chip-row--static">
            {data.skills.map((s) => <li key={s} className="chip chip--static">{s}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
