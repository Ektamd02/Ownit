import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Button } from './Button';

export function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onCancel, danger }: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="dialog" onCancel={(e) => { e.preventDefault(); onCancel(); }} aria-labelledby="dialog-title">
      <h2 id="dialog-title" className="dialog__title">{title}</h2>
      <div className="dialog__body">{children}</div>
      <div className="dialog__actions">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </dialog>
  );
}
