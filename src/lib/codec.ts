import type { BillEvent } from "@/lib/types";

export function encodeBillPayload(event: BillEvent): string {
  const json = JSON.stringify(event);
  return encodeURIComponent(json);
}

export function decodeBillPayload(input: string): BillEvent | null {
  try {
    const decoded = decodeURIComponent(input);
    const parsed = JSON.parse(decoded) as BillEvent;
    if (parsed?.version !== 1 || !Array.isArray(parsed?.friends)) {
      return null;
    }
    return {
      ...parsed,
      partySize: typeof parsed.partySize === "number" ? parsed.partySize : Math.max(1, parsed.friends.length || 1),
      tipPercent: typeof parsed.tipPercent === "number" ? parsed.tipPercent : 18,
      serviceFeeCents: typeof parsed.serviceFeeCents === "number" ? parsed.serviceFeeCents : 0,
      deliveryFeeCents: typeof parsed.deliveryFeeCents === "number" ? parsed.deliveryFeeCents : 0,
    };
  } catch {
    return null;
  }
}
