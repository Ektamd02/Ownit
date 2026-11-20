import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { VoiceInput } from './VoiceInput';

interface Common {
  label: string;
  hint?: ReactNode;
  optional?: boolean;
  error?: string;
  className?: string;
}

function Label({ id, label, optional }: { id: string; label: string; optional?: boolean }) {
  return (
    <label className="field__label" htmlFor={id}>
      {label}
      {optional && <span className="field__optional"> (optional)</span>}
    </label>
  );
}

export function TextField({ label, hint, optional, error, className = '', value, onChange, ...rest }: Common &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & { value: string; onChange: (v: string) => void }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  return (
    <div className={`field ${className}`}>
      <Label id={id} label={label} optional={optional} />
      {hint && <p className="field__hint" id={hintId}>{hint}</p>}
      <input
        id={id}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={[hintId, errId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error && <p className="field__error" id={errId}>{error}</p>}
    </div>
  );
}

export function TextArea({ label, hint, optional, error, className = '', value, onChange, voice = false, rows = 4, ...rest }: Common &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & {
    value: string;
    onChange: (v: string) => void;
    /** Show the voice dictation control. Text entry always stays available. */
    voice?: boolean;
  }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={`field ${className}`}>
      <div className="field__row">
        <Label id={id} label={label} optional={optional} />
        {voice && (
          <VoiceInput
            label={label}
            onText={(t) => {
              const sep = value && !value.endsWith('\n') ? (rows > 2 ? '\n' : ' ') : '';
              onChange(value + sep + t);
            }}
          />
        )}
      </div>
      {hint && <p className="field__hint" id={hintId}>{hint}</p>}
      <textarea
        id={id}
        className="input textarea"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hintId}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}
