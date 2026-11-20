import type { ReactNode } from 'react';
import { Icon } from './Icon';

type Tone = 'info' | 'warn' | 'sample' | 'demo' | 'error' | 'success';

export function Notice({ tone = 'info', title, children, role }: { tone?: Tone; title?: string; children?: ReactNode; role?: 'status' | 'alert' }) {
  const icon = tone === 'warn' || tone === 'error' ? 'alert' : tone === 'success' ? 'check' : tone === 'demo' ? 'lock' : 'info';
  return (
    <div className={`notice notice--${tone}`} role={role}>
      <Icon name={icon} className="notice__icon" />
      <div>
        {title && <p className="notice__title">{title}</p>}
        {children && <div className="notice__body">{children}</div>}
      </div>
    </div>
  );
}
