import { formatDate, formatSharedDisplayPrice, formatUSD } from "@/lib/format";
import { calculateFriendTotals } from "@/lib/math";
import type { BillEvent, Friend } from "@/lib/types";
import { LineItemRow } from "./line-item-row";

type ReceiptPaperProps = {
  event: BillEvent;
  friend: Friend;
  includeHeader?: boolean;
};

export function ReceiptPaper({ event, friend, includeHeader = true }: ReceiptPaperProps) {
  const totals = calculateFriendTotals(friend, event.taxPercent);

  return (
    <article className="rounded-3xl border border-[#ece6dc] bg-[#fffef8] p-4 shadow-[0_10px_30px_rgba(139,119,95,0.12)]">
      {includeHeader && (
        <header className="mb-4 border-b border-dashed border-[#dbd3c7] pb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8a8f9f]">Your Receipt</p>
          <h1 className="text-xl font-semibold text-[#2f3241]">{friend.name || "Friend"}</h1>
          <p className="text-sm text-[#697087]">
            {event.eventName} - {formatDate(event.eventDateISO)}
          </p>
        </header>
      )}

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8f9f]">Personal Charges</h2>
        {friend.items.length === 0 && (
          <p className="rounded-xl bg-[#f4f8ff] px-3 py-2 text-sm text-[#6d7690]">No personal items yet.</p>
        )}
        {friend.items.map((item) => (
          <LineItemRow
            key={item.id}
            icon={item.emoji || "🍽️"}
            description={item.description || "Mystery deliciousness"}
            price={formatUSD(item.cents)}
          />
        ))}
      </section>

      <hr className="my-3 border-dashed border-[#dfd9cc]" />

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8f9f]">Shared Fun Stuff</h2>
        {event.sharedItems.map((item) => (
          <LineItemRow
            key={item.id}
            icon={item.emoji || "✨"}
            description={item.description || "Good vibes"}
            qty={item.quantity}
            price={formatSharedDisplayPrice(item.displayPrice)}
            playful={item.displayPrice.kind === "priceless"}
          />
        ))}
      </section>

      <hr className="my-3 border-dashed border-[#dfd9cc]" />

      <section className="space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[#6d7283]">Subtotal</span>
          <span>{formatUSD(totals.subtotalCents)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6d7283]">Tax ({event.taxPercent.toFixed(2)}%)</span>
          <span>{formatUSD(totals.taxCents)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-base font-semibold">
          <span>Total Owed</span>
          <span>{formatUSD(totals.totalCents)}</span>
        </div>
      </section>
    </article>
  );
}
