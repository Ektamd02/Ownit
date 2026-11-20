import { brand } from '../config/brand';

export function Logo({ onClick }: { onClick?: () => void }) {
  const content = (
    <>
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="var(--color-primary)" />
        <circle cx="16" cy="16" r="7.5" fill="none" stroke="var(--color-text)" strokeWidth="3" />
      </svg>
      <span className="logo__name">{brand.name}</span>
    </>
  );
  return onClick ? (
    <button type="button" className="logo" onClick={onClick} aria-label={`${brand.name} home`}>{content}</button>
  ) : (
    <span className="logo">{content}</span>
  );
}
