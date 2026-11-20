import { useEffect, useRef, useState } from 'react';
import { deliverCopy } from '../config/copy';
import { useStore } from '../state/store';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';
import { Icon } from './Icon';
import { DraftList } from './DraftList';

export function DraftsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { clearAll, drafts } = useStore();
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className="sheet" aria-labelledby="drafts-title" onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div className="sheet__inner">
        <div className="sheet__head">
          <h2 id="drafts-title">My drafts</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close drafts"><Icon name="close" /></button>
        </div>
        <DraftList onAction={onClose} />
        <div className="sheet__foot">
          <p className="muted small"><Icon name="lock" size={14} /> {deliverCopy.storage}</p>
          {drafts.length > 0 && (
            <Button variant="danger" size="sm" icon="trash" onClick={() => setConfirmClear(true)}>Clear all drafts</Button>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmClear}
        title="Clear all drafts?"
        confirmLabel="Clear everything"
        danger
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => { clearAll(); setConfirmClear(false); onClose(); }}
      >
        <p>This permanently removes every draft saved in this browser ({drafts.length} in total). It can’t be undone.</p>
      </ConfirmDialog>
    </dialog>
  );
}

