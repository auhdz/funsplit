import type { Friend } from "@/lib/types";

export type Totals = {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
};

export function centsFromInput(value: string): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.round(number * 100));
}

export function calculateFriendTotals(friend: Friend, taxPercent: number): Totals {
  const subtotalCents = friend.items.reduce((sum, item) => sum + item.cents, 0);
  const taxCents = Math.round(subtotalCents * (Math.max(taxPercent, 0) / 100));

  return {
    subtotalCents,
    taxCents,
    totalCents: subtotalCents + taxCents,
  };
}
