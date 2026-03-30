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
    return parsed;
  } catch {
    return null;
  }
}
