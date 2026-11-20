import { useState } from 'react';
import { useStore } from '../state/store';
import { Button } from './Button';
import { Logo } from './Logo';
import { DraftsPanel } from './DraftsPanel';

export function AppHeader() {
  const { active, goHome, saveNow, lastSavedAt, storageOk, drafts } = useStore();
  const [panelOpen, setPanelOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const saved = lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Saved on this device';

  return (
    <header className="app-header">
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="app-header__inner">
        <Logo onClick={goHome} />
        <div className="app-header__actions">
          {active && storageOk && (
            <span className="save-status" aria-live="polite">{justSaved ? 'Saved' : saved}</span>
          )}
          {active && !storageOk && <span className="save-status save-status--warn">Not saving — storage is off</span>}
          {active && storageOk && (
            <Button size="sm" variant="ghost" onClick={() => { if (saveNow()) { setJustSaved(true); window.setTimeout(() => setJustSaved(false), 1800); } }}>
              Save
            </Button>
          )}
          {drafts.length > 0 && (
            <Button size="sm" icon="layers" onClick={() => setPanelOpen(true)} aria-haspopup="dialog">
              My drafts
            </Button>
          )}
        </div>
      </div>
      <DraftsPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </header>
  );
}
