import { useState } from 'react';
import { checkoutCopy } from '../config/copy';
import { deliverableOffers, PRICES_ARE_SAMPLE } from '../config/pricing';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Notice } from '../components/Notice';
import { StepShell } from '../components/StepShell';
import { startCheckout } from '../lib/checkout';
import { computeTotals, findDiscount, formatMoney } from '../lib/pricing';
import { useDraft } from '../state/store';

export function Checkout() {
  const { draft, update } = useDraft();
  const [code, setCode] = useState(draft.order.discountCode);
  const [codeMsg, setCodeMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const totals = computeTotals(draft.deliverables, draft.order.discountCode);

  const apply = () => {
    const d = findDiscount(code);
    if (!code.trim()) {
      setCodeMsg({ ok: false, text: 'Enter a code first.' });
      return;
    }
    if (!d) {
      setCodeMsg({ ok: false, text: 'That code isn’t valid. Check the spelling and try again.' });
      return;
    }
    update({ order: { ...draft.order, discountCode: d.code } });
    setCode(d.code);
    setCodeMsg({ ok: true, text: `${d.code} applied — ${d.label}.` });
  };

  const removeCode = () => {
    update({ order: { ...draft.order, discountCode: '' } });
    setCode('');
    setCodeMsg({ ok: true, text: 'Code removed.' });
  };

  const proceed = async () => {
    if (draft.order.confirmedAt) {
      update({ step: 'context' });
      return;
    }
    setBusy(true);
    const res = await startCheckout({ deliverables: draft.deliverables, discountCode: draft.order.discountCode });
    setBusy(false);
    update({ order: { ...draft.order, confirmedAt: res.confirmedAt }, step: 'context' });
  };

  return (
    <StepShell
      step="checkout"
      title={checkoutCopy.title}
      intro={checkoutCopy.intro}
      onBack={() => update({ step: 'deliverables' })}
      onContinue={proceed}
      continueLoading={busy}
      continueLabel={draft.order.confirmedAt ? 'Continue' : checkoutCopy.continue}
    >
      <div className="checkout">
        <div className="stack">
          {totals.lines.map((l) => (
            <article key={l.id} className="card">
              <div className="card__row">
                <h2 className="h3">{deliverableOffers[l.id].name}</h2>
                <p className="price">{formatMoney(l.cents)}</p>
              </div>
              <ul className="check-list">
                {deliverableOffers[l.id].includes.map((x) => (
                  <li key={x}><Icon name="check" size={16} /> {x}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <aside className="card summary" aria-labelledby="order-summary">
          <h2 id="order-summary" className="h3">Summary</h2>
          {PRICES_ARE_SAMPLE && <p className="badge badge--sample">{checkoutCopy.sampleNotice}</p>}
          <dl className="totals">
            {totals.lines.map((l) => (
              <div key={l.id}><dt>{l.name}</dt><dd>{formatMoney(l.cents)}</dd></div>
            ))}
            {totals.bundleCents > 0 && (
              <div className="totals__saving"><dt>Bundle saving</dt><dd>−{formatMoney(totals.bundleCents)}</dd></div>
            )}
            {totals.discount && (
              <div className="totals__saving"><dt>Code {totals.discount.code}</dt><dd>−{formatMoney(totals.discount.cents)}</dd></div>
            )}
            <div className="totals__total"><dt>Total, one-time</dt><dd>{formatMoney(totals.totalCents)}</dd></div>
          </dl>

          <form className="discount" onSubmit={(e) => { e.preventDefault(); apply(); }}>
            <label htmlFor="discount" className="field__label">{checkoutCopy.discountLabel}</label>
            <div className="discount__row">
              <input
                id="discount"
                className="input"
                value={code}
                onChange={(e) => { setCode(e.target.value); setCodeMsg(null); }}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                aria-describedby="discount-msg"
                disabled={Boolean(draft.order.discountCode)}
              />
              {draft.order.discountCode ? (
                <Button size="sm" onClick={removeCode}>{checkoutCopy.remove}</Button>
              ) : (
                <Button size="sm" type="submit">{checkoutCopy.apply}</Button>
              )}
            </div>
            <p id="discount-msg" className={`small ${codeMsg?.ok === false ? 'text-error' : 'muted'}`} role="status">
              {codeMsg?.text ?? 'Demo codes: WELCOME10, STUDENT25, FRIEND5'}
            </p>
          </form>
        </aside>
      </div>

      {draft.order.confirmedAt ? (
        <Notice tone="success" title="Demo checkout already confirmed">No payment was taken. You can carry on.</Notice>
      ) : (
        <Notice tone="demo" title="Demo checkout">{checkoutCopy.demoNotice}</Notice>
      )}
    </StepShell>
  );
}
