import type { DisplayPrice } from "@/lib/types";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatUSD(cents: number): string {
  return usdFormatter.format(cents / 100);
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatSharedDisplayPrice(displayPrice: DisplayPrice): string {
  if (displayPrice.kind === "priceless") {
    return "Priceless";
  }

  return formatUSD(displayPrice.cents);
}
