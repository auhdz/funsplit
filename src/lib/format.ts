import type { DisplayPrice } from "@/lib/types";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatUSD(cents: number): string {
  return usdFormatter.format(cents / 100);
}

export function formatDate(isoDate: string): string {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return isoDate;
  const [, year, monthRaw, dayRaw] = match;
  const monthIndex = Number(monthRaw) - 1;
  const day = Number(dayRaw);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[monthIndex];
  if (!month || Number.isNaN(day)) return isoDate;
  return `${month} ${day}, ${year}`;
}

export function formatSharedDisplayPrice(displayPrice: DisplayPrice): string {
  if (displayPrice.kind === "priceless") {
    return "Priceless";
  }

  return formatUSD(displayPrice.cents);
}
