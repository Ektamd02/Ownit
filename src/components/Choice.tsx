import { useId } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface Option<T extends string> {
  id: T;
  label: string;
  hint?: ReactNode;
}

/** Card-style radio group using native radios, so arrow keys and screen readers work as expected. */
export function ChoiceGroup<T extends string>({ legend, options, value, onChange, columns = 2, legendClassName = '', description }: {
  legend: ReactNode;
  options: Option<T>[];
  value: T | null;
  onChange: (v: T) => void;
  columns?: 2 | 3 | 4;
  legendClassName?: string;
  description?: ReactNode;
}) {
  const name = useId();
  return (
    <fieldset className="choice-group">
      <legend className={`choice-group__legend ${legendClassName}`}>{legend}</legend>
      {description && <p className="choice-group__desc">{description}</p>}
      <div className={`choice-grid choice-grid--${columns}`}>
        {options.map((o) => (
          <label key={o.id} className={`choice ${value === o.id ? 'is-selected' : ''}`}>
            <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="choice__input" />
            <span className="choice__mark" aria-hidden="true">{value === o.id && <Icon name="check" size={14} />}</span>
            <span className="choice__text">
              <span className="choice__label">{o.label}</span>
              {o.hint && <span className="choice__hint">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CheckCard({ checked, onChange, label, hint, children }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <label className={`choice choice--check ${checked ? 'is-selected' : ''}`}>
      <input type="checkbox" className="choice__input" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="choice__mark choice__mark--box" aria-hidden="true">{checked && <Icon name="check" size={14} />}</span>
      <span className="choice__text">
        <span className="choice__label">{label}</span>
        {hint && <span className="choice__hint">{hint}</span>}
        {children}
      </span>
    </label>
  );
}
