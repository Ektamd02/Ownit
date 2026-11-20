import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'md' | 'sm' | 'lg';
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'secondary', size = 'md', icon, iconRight, loading, children, className = '', disabled, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="spinner" aria-hidden="true" /> : icon && <Icon name={icon} />}
      <span>{children}</span>
      {iconRight && !loading && <Icon name={iconRight} />}
    </button>
  );
}
