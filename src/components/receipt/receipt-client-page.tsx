"use client";

import Link from "next/link";
import { use, type ReactNode } from "react";
import { ReceiptPaper } from "@/components/receipt/receipt-paper";
import { decodeBillPayload } from "@/lib/codec";

type ReceiptClientPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const ZELLE_QR_HREF =
  "https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiQURSSUFOIiwiYWN0aW9uIjoicGF5bWVudCIsInRva2VuIjoiMzEwODY2MDA5NiJ9";

const VENMO_PROFILE_HREF = "https://venmo.com/u/ad-hz";

const APPLE_CASH_PHONE_TOOLTIP = "3108660096";

const RECEIPT_PAGE_BG = "bg-[url('/receipt-landscape-bg.png')] bg-cover bg-center bg-no-repeat";

function ReceiptPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center">
      <div
        className={`pointer-events-none absolute inset-0 -z-10 ${RECEIPT_PAGE_BG}`}
        aria-hidden
      />
      <div className="relative z-0 mx-auto flex w-full max-w-2xl flex-col items-center px-3 py-6 sm:px-5 sm:py-10">
        {children}
      </div>
    </main>
  );
}

export function ReceiptClientPage({ searchParams }: ReceiptClientPageProps) {
  const query = use(searchParams);
  const billParam = Array.isArray(query.bill) ? query.bill[0] : query.bill;
  const friendParam = Array.isArray(query.for) ? query.for[0] : query.for;

  if (!billParam || !friendParam) {
    return (
      <ReceiptPageShell>
        <div className="w-full max-w-xl px-4 text-center">
          <p className="rounded-2xl bg-white/95 p-4 text-[#4a5168] shadow-sm backdrop-blur-sm">Missing receipt info.</p>
          <Link className="mt-3 inline-block text-sm text-[#2d4a9e] underline drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]" href="/">
            Go back to host dashboard
          </Link>
        </div>
      </ReceiptPageShell>
    );
  }

  const event = decodeBillPayload(billParam);
  const friend = event?.friends.find((value) => value.id === friendParam);

  if (!event || !friend) {
    return (
      <ReceiptPageShell>
        <div className="w-full max-w-xl px-4 text-center">
          <p className="rounded-2xl bg-white/95 p-4 text-[#4a5168] shadow-sm backdrop-blur-sm">Could not find that receipt.</p>
          <Link className="mt-3 inline-block text-sm text-[#2d4a9e] underline drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]" href="/">
            Go back to host dashboard
          </Link>
        </div>
      </ReceiptPageShell>
    );
  }

  const resolvedFriend = friend;
  const resolvedEvent = event;

  async function copyValue(value: string, label: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      window.alert(`${label} copied!`);
    } catch {
      window.alert("Could not copy. Please copy manually.");
    }
  }

  async function onPaymentClick(action: () => Promise<void> | void) {
    await action();
  }

  const paymentActions = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a
          href={VENMO_PROFILE_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center overflow-hidden rounded-md border border-[#cfcfcf] bg-[#0d8dff] px-2"
        >
          <img src="/api/payment-logo/venmo" alt="Venmo" className="h-7 w-full object-contain" />
        </a>
        <button
          type="button"
          title={APPLE_CASH_PHONE_TOOLTIP}
          onClick={() => onPaymentClick(() => copyValue(resolvedEvent.payment.appleCashLabel || "", "Apple Cash label"))}
          className="flex h-12 items-center justify-center overflow-hidden rounded-md border border-[#cfcfcf] bg-[#0a0a0a] px-2"
        >
          <img src="/api/payment-logo/apple" alt="Apple Cash" className="h-8 w-full object-contain" />
        </button>
        <a
          href={ZELLE_QR_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center overflow-hidden rounded-md border border-[#cfcfcf] bg-[#5a2cd4] px-2"
        >
          <img src="/api/payment-logo/zelle" alt="Zelle" className="h-8 w-full object-contain" />
        </a>
        <button
          title={resolvedEvent.payment.cashTooltip || "You know where to find me"}
          onClick={() => onPaymentClick(() => undefined)}
          className="flex h-12 items-center justify-center overflow-hidden rounded-md border border-[#cfcfcf] bg-[#f5fff5] px-2"
        >
          <img src="/api/payment-logo/cash" alt="Cash" className="h-8 w-full object-contain" />
        </button>
      </div>
    </div>
  );

  const content = (
    <div className="relative mx-auto w-full max-w-md px-6 pb-8 pt-2 sm:px-10 sm:pb-10">
      <div className="receipt-print-reveal">
        <ReceiptPaper event={resolvedEvent} friend={resolvedFriend} paymentActions={paymentActions} />
      </div>

      <div className="mt-3 text-center text-xs text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
        <a
          href="#"
          onClick={(eventInput) => {
            eventInput.preventDefault();
            onPaymentClick(() => copyValue(window.location.href, "Receipt link"));
          }}
          className="font-mono uppercase tracking-[0.1em] underline underline-offset-2"
        >
          Share this link
        </a>
      </div>
    </div>
  );

  return <ReceiptPageShell>{content}</ReceiptPageShell>;
}
