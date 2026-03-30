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
    <article className="mx-auto w-full max-w-[390px] rounded-[2rem] border border-[#ebe3d8] bg-[#fffef9] px-5 py-5 text-[#2f3241] shadow-[0_12px_30px_rgba(112,91,67,0.12)]">
      {includeHeader && (
        <header className="mb-4 border-b border-dashed border-[#d8d0c4] pb-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-[#83889c]">Your Receipt</p>
            <div className="fun-bob inline-flex items-center gap-1 rounded-full bg-[#fff4d8] px-2 py-1 text-xs">
              <span>🐶</span>
              <span>🧾</span>
            </div>
          </div>
          <h1 className="text-xl font-semibold">{friend.name || "Friend"}</h1>
          <p className="text-sm text-[#6e7488]">
            {event.eventName} - {formatDate(event.eventDateISO)}
          </p>
          <div className="mt-2 grid grid-cols-[1.5rem_2.7rem_1fr_auto] text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#868ca1]">
            <span>Ico</span>
            <span className="text-right">Qty</span>
            <span>Item</span>
            <span>Price</span>
          </div>
        </header>
      )}

      <section>
        <h2 className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8990a5]">Personal Charges</h2>
        {friend.items.length === 0 && <p className="text-sm text-[#7e8498]">No personal items yet.</p>}
        {friend.items.map((item) => (
          <LineItemRow
            key={item.id}
            icon={item.emoji || "🍽️"}
            description={item.description || "Delicious mystery"}
            qty={1}
            price={formatUSD(item.cents)}
          />
        ))}
      </section>

      <hr className="my-3 border-dashed border-[#dbd4c8]" />

      <section>
        <h2 className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8990a5]">Shared Fun Stuff</h2>
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

      <hr className="my-3 border-dashed border-[#dbd4c8]" />

      <section className="space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[#73798d]">Subtotal</span>
          <span>{formatUSD(totals.subtotalCents)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#73798d]">Tax ({event.taxPercent.toFixed(2)}%)</span>
          <span>{formatUSD(totals.taxCents)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total Owed</span>
          <span>{formatUSD(totals.totalCents)}</span>
        </div>
      </section>
    </article>
  );
}
