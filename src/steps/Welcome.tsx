import { useEffect, useRef } from 'react';
import { brand } from '../config/brand';
import { welcomeCopy } from '../config/copy';
import { useStore } from '../state/store';
import { Button } from '../components/Button';
import { DraftList } from '../components/DraftList';
import { Icon } from '../components/Icon';

export function Welcome() {
  const { drafts, startNew, startSample, storageOk } = useStore();
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const ownDrafts = drafts.filter((d) => !d.isSample);

  return (
    <main className="welcome" id="main">
      <section className="welcome__hero">
        <p className="eyebrow">{welcomeCopy.eyebrow}</p>
        <h1 className="welcome__title" tabIndex={-1} ref={ref}>
          {brand.name}. <span className="welcome__tagline">{brand.tagline}</span>
        </h1>
        <p className="welcome__lead">{welcomeCopy.lead}</p>
        <div className="welcome__actions">
          <Button variant="primary" size="lg" iconRight="arrowRight" onClick={startNew}>{welcomeCopy.start}</Button>
          <Button variant="ghost" onClick={startSample}>{welcomeCopy.sample}</Button>
        </div>
        <p className="muted small">{welcomeCopy.time}</p>
        {!storageOk && (
          <p className="notice notice--warn small" role="status">
            Your browser is blocking local storage, so drafts won’t be saved between visits. Everything else still works.
          </p>
        )}
      </section>

      <ul className="welcome__points">
        {welcomeCopy.points.map((p, i) => (
          <li key={p.title} className={`point point--${i}`}>
            <span className="point__icon" aria-hidden="true"><Icon name={i === 2 ? 'check' : i === 1 ? 'layers' : 'edit'} /></span>
            <p className="point__title">{p.title}</p>
            <p className="point__body">{p.body}</p>
          </li>
        ))}
      </ul>

      {drafts.length > 0 && (
        <section className="welcome__drafts" aria-labelledby="your-drafts">
          <h2 id="your-drafts" className="section-title">{ownDrafts.length > 0 ? welcomeCopy.resume : 'Your drafts'}</h2>
          <DraftList />
        </section>
      )}
    </main>
  );
}
