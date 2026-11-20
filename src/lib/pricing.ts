import { bundleDiscountPaise, currency, deliverableOffers, demoDiscountCodes } from '../config/pricing';
import type { DiscountCode } from '../config/pricing';
import type { DeliverableId } from '../state/types';

const formatter = new Intl.NumberFormat(currency.locale, {
  style: 'currency',
  currency: currency.code,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** e.g. 129900 paise → "₹1,299" (Indian digit grouping: ₹1,29,900 for larger amounts). */
export function formatMoney(paise: number): string {
  return formatter.format(Math.round(paise / 100));
}

/** Discounts are kept to whole rupees so every amount displays the same way. */
const toWholeRupees = (paise: number) => Math.round(paise / 100) * 100;

export function findDiscount(code: string): DiscountCode | null {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  return demoDiscountCodes.find((d) => d.code.toUpperCase() === c) ?? null;
}

export interface Totals {
  lines: { id: DeliverableId; name: string; paise: number }[];
  subtotalPaise: number;
  bundlePaise: number;
  discount: { code: string; label: string; paise: number } | null;
  totalPaise: number;
}

export function computeTotals(deliverables: DeliverableId[], code: string): Totals {
  const lines = deliverables.map((id) => ({ id, name: deliverableOffers[id].name, paise: deliverableOffers[id].pricePaise }));
  const subtotalPaise = lines.reduce((s, l) => s + l.paise, 0);
  const bundlePaise = deliverables.length > 1 ? Math.min(bundleDiscountPaise, subtotalPaise) : 0;
  const afterBundle = subtotalPaise - bundlePaise;
  const d = findDiscount(code);
  let discount: Totals['discount'] = null;
  if (d) {
    const raw = d.kind === 'percent' ? (afterBundle * d.value) / 100 : d.valuePaise;
    discount = { code: d.code, label: d.label, paise: Math.min(toWholeRupees(raw), afterBundle) };
  }
  return { lines, subtotalPaise, bundlePaise, discount, totalPaise: afterBundle - (discount?.paise ?? 0) };
}

export const demoCodeList = () => demoDiscountCodes.map((d) => d.code).join(', ');
