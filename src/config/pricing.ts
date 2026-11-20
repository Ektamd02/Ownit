/**
 * Prices and demo discount codes.
 *
 * ⚠️ SAMPLE VALUES ONLY — prices are not final. Edit them here.
 * Amounts are in paise (₹1 = 100 paise) to avoid floating-point rounding.
 * Keep them to whole rupees; discounts are rounded to the nearest rupee.
 *
 * When a real payment provider is connected, prices and discount codes must also be
 * validated on the server — never trust a total calculated in the browser.
 */
import type { DeliverableId } from '../state/types';

export const PRICES_ARE_SAMPLE = true;

export const currency = { code: 'INR', locale: 'en-IN' } as const;

export interface DeliverableOffer {
  id: DeliverableId;
  name: string;
  shortDescription: string;
  pricePaise: number;
  includes: string[];
}

export const deliverableOffers: Record<DeliverableId, DeliverableOffer> = {
  resume: {
    id: 'resume',
    name: 'Resume',
    shortDescription: 'A clear, one-page resume you can send with applications.',
    pricePaise: 49900, // SAMPLE — ₹499
    includes: [
      'Guided questions tailored to your experience',
      'A fact-check of everything before it’s written',
      'Three clean, ATS-friendly templates',
      'Editable draft, PDF via print, and plain-text download',
    ],
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn profile',
    shortDescription: 'Headline, About, experience and skills ready to paste in.',
    pricePaise: 39900, // SAMPLE — ₹399
    includes: [
      'A headline that says what you do and want',
      'An About section in your own voice',
      'Experience entries and a skills list',
      'One-click copy for each section',
    ],
  },
};

/** Taken off automatically when both deliverables are selected. Set to 0 to disable. */
export const bundleDiscountPaise = 10000; // SAMPLE — ₹100

export type DiscountCode =
  | { code: string; kind: 'percent'; value: number; label: string }
  | { code: string; kind: 'fixed'; valuePaise: number; label: string };

/** DEMO codes for testing the checkout flow. Matching is case-insensitive. */
export const demoDiscountCodes: DiscountCode[] = [
  { code: 'WELCOME10', kind: 'percent', value: 10, label: '10% off' },
  { code: 'STUDENT25', kind: 'percent', value: 25, label: '25% off for students' },
  { code: 'FRIEND100', kind: 'fixed', valuePaise: 10000, label: '₹100 off' },
];
