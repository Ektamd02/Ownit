import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { stepLabels } from '../config/copy';
import { flow, stepIndex } from '../lib/steps';
import type { StepId } from '../state/types';
import { Button } from './Button';

interface Props {
  step: StepId;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  /** Explains why Continue is disabled; announced to screen readers. */
  blockedReason?: string;
  footerExtra?: ReactNode;
  wide?: boolean;
}

export function StepShell({ step, title, intro, children, onBack, onContinue, continueLabel = 'Continue', continueDisabled, continueLoading, blockedReason, footerExtra, wide }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const i = stepIndex(step);

  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step]);

  return (
    <main className={`step ${wide ? 'step--wide' : ''}`} id="main">
      <div className="progress" aria-label={`Step ${i + 1} of ${flow.length}: ${stepLabels[step]}`}>
        <div className="progress__meta" aria-hidden="true">
          <span>Step {i + 1} of {flow.length}</span>
          <span className="progress__label">{stepLabels[step]}</span>
        </div>
        <div className="progress__track" aria-hidden="true">
          <div className="progress__fill" style={{ width: `${((i + 1) / flow.length) * 100}%` }} />
        </div>
      </div>

      <header className="step__header">
        <h1 className="step__title" tabIndex={-1} ref={headingRef}>{title}</h1>
        {intro && <p className="step__intro">{intro}</p>}
      </header>

      <div className="step__body">{children}</div>

      {(onBack || onContinue) && (
        <nav className="step__footer" aria-label="Step navigation">
          {onBack ? (
            <Button variant="ghost" icon="arrowLeft" onClick={onBack}>Back</Button>
          ) : <span />}
          <div className="step__footer-right">
            {footerExtra}
            {onContinue && (
              <Button variant="primary" size="lg" iconRight="arrowRight" onClick={onContinue} disabled={continueDisabled} loading={continueLoading}>
                {continueLabel}
              </Button>
            )}
          </div>
          {continueDisabled && blockedReason && <p className="step__blocked" role="status">{blockedReason}</p>}
        </nav>
      )}
    </main>
  );
}
