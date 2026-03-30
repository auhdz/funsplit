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
  const orderSeed = `${event.eventName}_${friend.id}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const orderNumber = String((orderSeed % 9999) + 1).padStart(4, "0");
  const maskedCard = `${String((orderSeed % 9000) + 1000)} ${String(((orderSeed + 17) % 9000) + 1000)}`;
  const allItems = [
    ...friend.items.map((item) => ({
      id: item.id,
      description: item.description || "ITEM",
      quantity: 1,
      amount: formatUSD(item.cents),
    })),
    ...event.sharedItems.map((item) => ({
      id: item.id,
      description: item.description || "SHARED ITEM",
      quantity: item.quantity,
      amount: formatSharedDisplayPrice(item.displayPrice),
    })),
  ];

  return (
    <article className="mx-auto w-full max-w-[370px] border border-[#d8d8d8] bg-[#f8f8f6] px-5 py-6 text-[#1f1f1f] shadow-[0_18px_40px_rgba(0,0,0,0.2)] [background-image:radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.9),rgba(255,255,255,0)_45%),radial-gradient(circle_at_80%_20%,rgba(234,234,234,0.7),rgba(255,255,255,0)_42%),radial-gradient(circle_at_50%_90%,rgba(229,229,229,0.8),rgba(255,255,255,0)_38%),repeating-linear-gradient(13deg,rgba(0,0,0,0.02)_0px,rgba(0,0,0,0.02)_1px,transparent_1px,transparent_5px)]">
      {includeHeader && (
        <header className="mb-3 border-b border-dashed border-[#8d8d8d] pb-2 text-center font-mono">
          <h1 className="text-[2.1rem] font-black leading-none tracking-tight">RECEIPTIFY</h1>
          <p className="mt-1 text-[0.92rem] uppercase tracking-wide text-[#3a3a3a]">{event.eventName || "LAST MONTH"}</p>
          <p className="mt-4 text-left text-[1rem] uppercase leading-snug">
            ORDER #{orderNumber} FOR {friend.name || "GUEST"}
          </p>
          <p className="text-left text-[0.96rem] uppercase">{formatDate(event.eventDateISO)}</p>
          <p className="mt-2 border-b border-dashed border-[#8d8d8d] pb-1 text-left text-[0.83rem] uppercase">QTY   ITEM   AMT</p>
        </header>
      )}

      <section className="font-mono">
        {allItems.map((item) => (
          <LineItemRow key={item.id} description={item.description} qty={item.quantity} price={item.amount} />
        ))}
      </section>

      <hr className="my-2 border-dashed border-[#8d8d8d]" />

      <section className="space-y-1 font-mono text-[0.9rem] uppercase">
        <div className="flex items-center justify-between">
          <span>ITEM COUNT:</span>
          <span>{String(allItems.length).padStart(2, "0")}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>TOTAL:</span>
          <span className="text-[1rem] tabular-nums">{formatUSD(totals.totalCents).replace("$", "")}</span>
        </div>
        <div className="mt-1 border-t border-dashed border-[#8d8d8d] pt-1 text-[0.82rem] leading-relaxed text-[#333]">
          <p>CARD #: **** **** {maskedCard}</p>
          <p>AUTH CODE: {String((orderSeed * 11) % 90000).padStart(5, "0")}</p>
          <p>CARDHOLDER: {friend.name || "GUEST"}</p>
        </div>
      </section>

      <footer className="mt-4 text-center font-mono text-[0.82rem] uppercase text-[#202020]">
        <p>THANK YOU FOR VISITING.</p>
        <div
          aria-hidden
          className="mx-auto mt-2 h-12 w-[85%] bg-[repeating-linear-gradient(90deg,#111_0px,#111_2px,transparent_2px,transparent_4px,repeating-linear-gradient(90deg,#111_0px,#111_5px,transparent_5px,transparent_9px))]"
        />
        <p className="mt-2 text-[0.75rem] lowercase tracking-wide">receiptify.app</p>
      </footer>
    </article>
  );
}
