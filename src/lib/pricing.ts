import { bundleDiscountCents, currency, deliverableOffers, demoDiscountCodes } from '../config/pricing';
import type { DiscountCode } from '../config/pricing';
import type { DeliverableId } from '../state/types';

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat(currency.locale, { style: 'currency', currency: currency.code }).format(cents / 100);
}

export function findDiscount(code: string): DiscountCode | null {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  return demoDiscountCodes.find((d) => d.code.toUpperCase() === c) ?? null;
}

export interface Totals {
  lines: { id: DeliverableId; name: string; cents: number }[];
  subtotalCents: number;
  bundleCents: number;
  discount: { code: string; label: string; cents: number } | null;
  totalCents: number;
}

export function computeTotals(deliverables: DeliverableId[], code: string): Totals {
  const lines = deliverables.map((id) => ({ id, name: deliverableOffers[id].name, cents: deliverableOffers[id].priceCents }));
  const subtotalCents = lines.reduce((s, l) => s + l.cents, 0);
  const bundleCents = deliverables.length > 1 ? Math.min(bundleDiscountCents, subtotalCents) : 0;
  const afterBundle = subtotalCents - bundleCents;
  const d = findDiscount(code);
  let discount: Totals['discount'] = null;
  if (d) {
    const raw = d.kind === 'percent' ? Math.round((afterBundle * d.value) / 100) : d.valueCents;
    discount = { code: d.code, label: d.label, cents: Math.min(raw, afterBundle) };
  }
  return { lines, subtotalCents, bundleCents, discount, totalCents: afterBundle - (discount?.cents ?? 0) };
}
