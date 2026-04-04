import type { ReactNode } from "react";
import { formatDate, formatSharedDisplayPrice, formatUSD } from "@/lib/format";
import { calculateFriendTotals } from "@/lib/math";
import type { BillEvent, Friend } from "@/lib/types";
import { LineItemRow } from "./line-item-row";

type ReceiptPaperProps = {
  event: BillEvent;
  friend: Friend;
  includeHeader?: boolean;
  paymentActions?: ReactNode;
};

export function ReceiptPaper({ event, friend, includeHeader = true, paymentActions }: ReceiptPaperProps) {
  const totals = calculateFriendTotals(friend, event.taxPercent, {
    tipPercent: event.tipPercent,
    serviceFeeCents: event.serviceFeeCents,
    deliveryFeeCents: event.deliveryFeeCents,
    partySize: event.partySize,
  });
  const orderSeed = `${event.eventName}_${friend.id}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const orderNumber = String((orderSeed % 9999) + 1).padStart(4, "0");
  const authCode = String((orderSeed * 17) % 100000).padStart(5, "0");
  const requiredShared = [
    { description: "Fun", quantity: 1000, displayPrice: { kind: "money" as const, cents: 0 } },
    { description: "Spending quality time together", quantity: 1, displayPrice: { kind: "priceless" as const } },
  ];

  const normalizedExisting = new Set(event.sharedItems.map((item) => item.description.trim().toLowerCase()));
  const mergedSharedItems = [
    ...event.sharedItems,
    ...requiredShared
      .filter((item) => !normalizedExisting.has(item.description.toLowerCase()))
      .map((item, index) => ({
        id: `required_${index}`,
        description: item.description,
        quantity: item.quantity,
        displayPrice: item.displayPrice,
      })),
  ];
  const gratitudeItems = mergedSharedItems.filter((item) => {
    const label = item.description.trim().toLowerCase();
    return label === "fun" || label === "spending quality time together";
  });
  const otherSharedItems = mergedSharedItems.filter((item) => {
    const label = item.description.trim().toLowerCase();
    return label !== "fun" && label !== "spending quality time together";
  });

  const barcodeBars = Array.from({ length: 72 }, (_, index) => {
    const hash = (orderSeed * (index + 9) + index * 37) % 17;
    return {
      id: index,
      widthPx: hash % 4 === 0 ? 1 : hash % 3 === 0 ? 2 : 3,
      heightPct: 100,
    };
  });

  return (
    <article className="relative isolate mx-auto w-full max-w-[380px] overflow-hidden border border-[#d4d4d4] bg-[#f9f9f7] shadow-[0_16px_40px_rgba(0,0,0,0.22)] [background-image:radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.95),rgba(255,255,255,0)_44%),radial-gradient(circle_at_80%_82%,rgba(224,224,224,0.8),rgba(255,255,255,0)_38%),linear-gradient(168deg,rgba(0,0,0,0.018)_0%,rgba(255,255,255,0)_20%),linear-gradient(12deg,rgba(0,0,0,0.016)_0%,rgba(255,255,255,0)_22%),radial-gradient(ellipse_at_58%_44%,rgba(0,0,0,0.04)_0%,rgba(255,255,255,0)_30%),radial-gradient(ellipse_at_36%_73%,rgba(0,0,0,0.03)_0%,rgba(255,255,255,0)_28%),repeating-linear-gradient(14deg,rgba(0,0,0,0.013)_0px,rgba(0,0,0,0.013)_1px,transparent_1px,transparent_5px)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[url('/receipt-paper-texture.png')] bg-cover bg-center opacity-[0.42] mix-blend-multiply"
      />
      <div className="relative z-[2] px-5 py-6 text-[#1d1d1d]">
      {includeHeader && (
        <header className="mb-3 border-b border-dashed border-[#8e8e8e] pb-2 font-mono">
          <p className="text-center text-[0.72rem] uppercase tracking-[0.12em] text-[#525252]">Your Receipt</p>
          <div className="mt-3 flex justify-center px-1">
            <div className="-skew-x-[10deg] rounded-md border-[3px] border-[#111] bg-white/30 px-1 py-1 shadow-[inset_0_0_0_1px_#111]">
              <div className="rounded-sm border border-[#111] px-3 py-2 sm:px-4">
                <h1 className="skew-x-[10deg] text-center font-mono text-[1.35rem] font-black leading-tight uppercase tracking-[0.18em] text-[#0a0a0a] sm:text-[1.65rem]">
                  {event.eventName || "Receipt"}
                </h1>
              </div>
            </div>
          </div>
          <p className="mt-2 text-[0.9rem] uppercase">
            Order #{orderNumber} for {friend.name || "Guest"}
          </p>
          <p className="text-[0.86rem] uppercase">{formatDate(event.eventDateISO)}</p>
          <div className="mt-2 grid grid-cols-[2.4rem_1fr_auto] border-b border-dashed border-[#8e8e8e] pb-1 text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-[#454545]">
            <span>Qty</span>
            <span>Item</span>
            <span className="text-right">Amt</span>
          </div>
        </header>
      )}

      <section className="font-mono">
        <h2 className="mb-1 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#333]">Personal Charges</h2>
        {friend.items.length === 0 && <p className="text-[0.84rem] text-[#666]">No personal items yet.</p>}
        {friend.items.map((item) => (
          <LineItemRow key={item.id} description={item.description || "Delicious mystery"} qty={1} price={formatUSD(item.cents)} />
        ))}
      </section>

      <hr className="my-3 border-dashed border-[#8e8e8e]" />

      <section className="font-mono">
        <h2 className="mb-1 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#333]">Thanks for the:</h2>
        {gratitudeItems.map((item) => (
          <LineItemRow
            key={item.id}
            description={item.description || "Good vibes"}
            qty={item.quantity}
            price={formatSharedDisplayPrice(item.displayPrice)}
            emphasizePrice={item.displayPrice.kind === "priceless"}
          />
        ))}
        {otherSharedItems.length > 0 && (
          <>
            <div className="my-2 border-t border-dashed border-[#8e8e8e]" />
            <h3 className="mb-1 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#333]">Shared Charges</h3>
            {otherSharedItems.map((item) => (
              <LineItemRow
                key={item.id}
                description={item.description || "Shared item"}
                qty={item.quantity}
                price={formatSharedDisplayPrice(item.displayPrice)}
                emphasizePrice={item.displayPrice.kind === "priceless"}
              />
            ))}
          </>
        )}
      </section>

      <hr className="my-3 border-dashed border-[#8e8e8e]" />

      <section className="space-y-1 font-mono text-[0.92rem] uppercase">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatUSD(totals.subtotalCents).replace("$", "")}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tax ({event.taxPercent.toFixed(2)}%)</span>
          <span className="tabular-nums">{formatUSD(totals.taxCents)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tip ({event.tipPercent.toFixed(2)}%)</span>
          <span className="tabular-nums">{totals.tipCents === 0 ? "follow your dreams" : formatUSD(totals.tipCents)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Service Fee</span>
          <span className="tabular-nums">{totals.serviceFeeCents === 0 ? "we got off lucky" : formatUSD(totals.serviceFeeCents)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Delivery Fee</span>
          <span className="tabular-nums">{totals.deliveryFeeCents === 0 ? "good thing we ate there" : formatUSD(totals.deliveryFeeCents)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-[#8e8e8e] pt-1 text-[1rem] font-semibold">
          <span>Total Owed</span>
          <span className="tabular-nums">{formatUSD(totals.totalCents)}</span>
        </div>
        <div className="pt-1 text-[0.78rem] leading-relaxed text-[#303030]">
          <p>Auth Code: {authCode}</p>
          <p>Cardholder: {friend.name || "Guest"}</p>
        </div>
      </section>

      <div className="mt-4 border-t border-dashed border-[#8e8e8e] pt-3 text-center">
        <p className="font-mono text-[0.78rem] uppercase tracking-[0.08em] text-[#2f2f2f]">Thank you for visiting.</p>
        <div aria-hidden className="mx-auto mt-2 h-14 w-[88%] border-y border-[#202020] px-1">
          <div className="flex h-full items-stretch justify-center gap-px">
            {barcodeBars.map((bar) => (
              <span key={bar.id} style={{ width: `${bar.widthPx}px`, height: `${bar.heightPct}%` }} className="block bg-[#0f0f0f]" />
            ))}
          </div>
        </div>
        <p className="mt-1 font-mono text-[0.72rem] uppercase tracking-[0.22em] text-[#202020]">to more quality time together</p>
      </div>

      {paymentActions && <div className="mt-3 border-t border-dashed border-[#8e8e8e] pt-3">{paymentActions}</div>}
      </div>
    </article>
  );
}
