/**
 * Demo checkout. No payment is taken and no card details are collected.
 *
 * To connect a real provider (e.g. Stripe Checkout), replace `startCheckout` with a call
 * to your backend that creates a checkout session from the deliverable IDs and the
 * discount code. The backend — not the browser — must look up prices and validate codes.
 */
import type { DeliverableId } from '../state/types';

export interface CheckoutRequest {
  deliverables: DeliverableId[];
  discountCode: string;
}

export type CheckoutResult = { status: 'demo-confirmed'; confirmedAt: string };

export const PAYMENTS_CONNECTED = false;

export async function startCheckout(_req: CheckoutRequest): Promise<CheckoutResult> {
  void _req;
  await new Promise((r) => setTimeout(r, 400));
  return { status: 'demo-confirmed', confirmedAt: new Date().toISOString() };
}
