import { useState } from 'react';
import { useDictation } from '../lib/useDictation';
import { Icon } from './Icon';

const CONSENT_KEY = 'ownit:voice-ok';

/**
 * Small "Speak" control that appends dictated text to a field.
 * Hidden entirely when the browser has no speech support — typing always works.
 */
export function VoiceInput({ label, onText }: { label: string; onText: (t: string) => void }) {
  const d = useDictation(onText);
  const [askConsent, setAskConsent] = useState(false);

  if (!d.supported) return null;

  const begin = () => {
    let ok = false;
    try {
      ok = window.sessionStorage.getItem(CONSENT_KEY) === '1';
    } catch {
      /* ignore */
    }
    if (ok) d.start();
    else setAskConsent(true);
  };

  return (
    <div className="voice">
      {d.state === 'listening' ? (
        <button type="button" className="voice__btn voice__btn--on" onClick={d.stop} aria-label={`Stop dictating ${label}`}>
          <span className="voice__dot" aria-hidden="true" /> Stop
        </button>
      ) : (
        <button type="button" className="voice__btn" onClick={begin} aria-label={`Speak your answer for ${label}`}>
          <Icon name="mic" size={16} /> Speak
        </button>
      )}
      <div className="voice__status" aria-live="polite">
        {d.state === 'listening' && <span className="voice__interim">Listening… {d.interim}</span>}
        {d.error && <span className="voice__error">{d.error}</span>}
      </div>
      {askConsent && (
        <div className="voice__consent" role="dialog" aria-label="Before you use voice input">
          <p>
            Your browser turns speech into text. Some browsers (like Chrome) send the audio to their own speech
            service to do this. Ownit never receives or stores your audio — only the text lands in this field.
          </p>
          <div className="voice__consent-actions">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => {
                try {
                  window.sessionStorage.setItem(CONSENT_KEY, '1');
                } catch {
                  /* ignore */
                }
                setAskConsent(false);
                d.start();
              }}
            >
              <span>Start speaking</span>
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setAskConsent(false)}>
              <span>I’ll type instead</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
