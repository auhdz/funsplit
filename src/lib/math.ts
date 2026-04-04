import type { Friend } from "@/lib/types";

export type Totals = {
  subtotalCents: number;
  taxCents: number;
  tipCents: number;
  serviceFeeCents: number;
  deliveryFeeCents: number;
  totalCents: number;
};

export function centsFromInput(value: string): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.round(number * 100));
}

type SharedChargesConfig = {
  tipPercent: number;
  serviceFeeCents: number;
  deliveryFeeCents: number;
  partySize: number;
};

export function calculateFriendTotals(friend: Friend, taxPercent: number, sharedCharges: SharedChargesConfig): Totals {
  const subtotalCents = friend.items.reduce((sum, item) => sum + item.cents, 0);
  const taxCents = Math.round(subtotalCents * (Math.max(taxPercent, 0) / 100));
  const tipCents = Math.round(subtotalCents * (Math.max(sharedCharges.tipPercent, 0) / 100));
  const safePartySize = Math.max(1, sharedCharges.partySize);
  const serviceFeeCents = Math.round(Math.max(sharedCharges.serviceFeeCents, 0) / safePartySize);
  const deliveryFeeCents = Math.round(Math.max(sharedCharges.deliveryFeeCents, 0) / safePartySize);

  return {
    subtotalCents,
    taxCents,
    tipCents,
    serviceFeeCents,
    deliveryFeeCents,
    totalCents: subtotalCents + taxCents + tipCents + serviceFeeCents + deliveryFeeCents,
  };
}
