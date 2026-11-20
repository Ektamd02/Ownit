import { useState } from 'react';
import { stepLabels } from '../config/copy';
import { useStore } from '../state/store';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';
import type { Draft } from '../state/types';

function when(iso: string) {
  return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function DraftList({ onAction }: { onAction?: () => void }) {
  const { drafts, active, open, duplicateForNewRole, remove, rename } = useStore();
  const [toDelete, setToDelete] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');

  if (drafts.length === 0) return <p className="muted">No drafts yet. Anything you start is saved here automatically.</p>;

  return (
    <>
      <ul className="draft-list">
        {drafts.map((d) => (
          <li key={d.id} className={`draft-card ${active?.id === d.id ? 'is-active' : ''}`}>
            <div className="draft-card__main">
              {editing === d.id ? (
                <form className="draft-card__rename" onSubmit={(e) => { e.preventDefault(); if (name.trim()) rename(d.id, name.trim()); setEditing(null); }}>
                  <label className="sr-only" htmlFor={`rename-${d.id}`}>Version name</label>
                  <input id={`rename-${d.id}`} className="input input--sm" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                  <Button size="sm" type="submit">Save name</Button>
                </form>
              ) : (
                <p className="draft-card__title">
                  {d.label}
                  {d.isSample && <span className="badge badge--sample">Sample</span>}
                </p>
              )}
              <p className="draft-card__meta">
                {d.targetRole ? `${d.targetRole} · ` : ''}{stepLabels[d.step]} · Updated {when(d.updatedAt)}
              </p>
            </div>
            <div className="draft-card__actions">
              <Button size="sm" variant={active?.id === d.id ? 'secondary' : 'primary'} onClick={() => { open(d.id); onAction?.(); }}>
                {active?.id === d.id ? 'Open (current)' : 'Open'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { duplicateForNewRole(d.id); onAction?.(); }}>New version for another role</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(d.id); setName(d.label); }}>Rename</Button>
              <Button size="sm" variant="ghost" onClick={() => setToDelete(d)} aria-label={`Delete ${d.label}`}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this draft?"
        confirmLabel="Delete draft"
        danger
        onCancel={() => setToDelete(null)}
        onConfirm={() => { if (toDelete) remove(toDelete.id); setToDelete(null); }}
      >
        <p>“{toDelete?.label}” will be removed from this browser. Other versions stay as they are.</p>
      </ConfirmDialog>
    </>
  );
}
