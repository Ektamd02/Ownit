import { useEffect } from 'react';
import { AppHeader } from './components/AppHeader';
import { brand } from './config/brand';
import { safeStep } from './lib/steps';
import { useStore } from './state/store';
import { Checkout } from './steps/Checkout';
import { Context } from './steps/Context';
import { Deliver } from './steps/Deliver';
import { Deliverables } from './steps/Deliverables';
import { FactCheck } from './steps/FactCheck';
import { Goal } from './steps/Goal';
import { Preview } from './steps/Preview';
import { Role } from './steps/Role';
import { Welcome } from './steps/Welcome';

const screens = {
  goal: Goal,
  role: Role,
  deliverables: Deliverables,
  checkout: Checkout,
  context: Context,
  factcheck: FactCheck,
  preview: Preview,
  deliver: Deliver,
} as const;

export function App() {
  const { active, update } = useStore();

  // If a saved draft points past a step it hasn't completed, bring it back to a valid one.
  const step = active ? safeStep(active) : null;
  useEffect(() => {
    if (active && step && step !== active.step && step !== 'welcome') update({ step });
  }, [active, step, update]);

  const Screen = step && step !== 'welcome' ? screens[step] : null;

  return (
    <div className="app">
      <AppHeader />
      {active && Screen ? <Screen key={active.id} /> : <Welcome />}
      <footer className="app-footer">
        <p>
          {brand.name} — {brand.tagline} <span aria-hidden="true">·</span> Drafts stay in your browser.
        </p>
      </footer>
    </div>
  );
}
