"use client";

import Link from "next/link";
import { use } from "react";
import { PhoneFrame } from "@/components/phone-frame";
import { ReceiptPaper } from "@/components/receipt/receipt-paper";
import { decodeBillPayload } from "@/lib/codec";

type ReceiptClientPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  printMode?: boolean;
};

export function ReceiptClientPage({ searchParams, printMode = false }: ReceiptClientPageProps) {
  const query = use(searchParams);
  const billParam = Array.isArray(query.bill) ? query.bill[0] : query.bill;
  const friendParam = Array.isArray(query.for) ? query.for[0] : query.for;

  if (!billParam || !friendParam) {
    return (
      <main className="mx-auto max-w-xl px-4 py-8 text-center">
        <p className="rounded-2xl bg-white p-4 text-[#4a5168] shadow-sm">Missing receipt info.</p>
        <Link className="mt-3 inline-block text-sm text-[#4d77c0] underline" href="/">
          Go back to host dashboard
        </Link>
      </main>
    );
  }

  const event = decodeBillPayload(billParam);
  const friend = event?.friends.find((value) => value.id === friendParam);

  if (!event || !friend) {
    return (
      <main className="mx-auto max-w-xl px-4 py-8 text-center">
        <p className="rounded-2xl bg-white p-4 text-[#4a5168] shadow-sm">Could not find that receipt.</p>
        <Link className="mt-3 inline-block text-sm text-[#4d77c0] underline" href="/">
          Go back to host dashboard
        </Link>
      </main>
    );
  }

  const resolvedFriend = friend;
  const resolvedEvent = event;

  const venmoHandle = event.payment.venmoHandle?.trim();
  const venmoHref = venmoHandle
    ? `https://venmo.com/${venmoHandle}?txn=charge&note=${encodeURIComponent(event.eventName)}`
    : "";

  const phoneNumber = event.payment.phoneNumber?.trim();

  async function copyValue(value: string, label: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      window.alert(`${label} copied!`);
    } catch {
      window.alert("Could not copy. You can copy manually.");
    }
  }

  async function shareReceipt() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `Your receipt - ${resolvedFriend.name}`,
        text: `${resolvedEvent.eventName} receipt`,
        url,
      });
      return;
    }
    await copyValue(url, "Receipt link");
  }

  const content = (
    <div className={printMode ? "mx-auto max-w-md" : ""}>
      <ReceiptPaper event={resolvedEvent} friend={resolvedFriend} />
      <section className="mt-3 rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a8f9f]">Payment</h2>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={venmoHref || "#"}
            className="rounded-xl bg-[#dff4ff] px-3 py-2 text-center font-medium text-[#215a83]"
            onClick={(eventInput) => {
              if (!venmoHref) {
                eventInput.preventDefault();
              }
            }}
          >
            Venmo
          </a>
          <button
            onClick={() => copyValue(resolvedEvent.payment.appleCashLabel || "", "Apple Cash")}
            className="rounded-xl bg-[#f1ebff] px-3 py-2 font-medium text-[#5d438f]"
          >
            Apple Cash
          </button>
          <button
            onClick={() => copyValue(resolvedEvent.payment.zelleTarget || "", "Zelle")}
            className="rounded-xl bg-[#fff1da] px-3 py-2 font-medium text-[#815d1b]"
          >
            Zelle
          </button>
          <button
            title={resolvedEvent.payment.cashTooltip || "you know where to find me 😏"}
            className="rounded-xl bg-[#e6f9ed] px-3 py-2 font-medium text-[#215f38]"
          >
            Cash 💵
          </button>
        </div>
        {phoneNumber && (
          <div className="mt-3 text-center">
            <a className="text-lg font-semibold text-[#3f4d74] underline underline-offset-3" href={`tel:${phoneNumber}`}>
              {phoneNumber}
            </a>
          </div>
        )}

        {!printMode && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={shareReceipt} className="rounded-xl bg-[#2f3241] px-3 py-2 text-white">
              Share
            </button>
            <Link
              href={`/print?bill=${billParam}&for=${resolvedFriend.id}`}
              className="rounded-xl bg-[#ebedf4] px-3 py-2 text-center text-[#2f3241]"
            >
              Print View
            </Link>
          </div>
        )}
      </section>
    </div>
  );

  if (printMode) {
    return <main className="mx-auto w-full max-w-2xl px-4 py-6">{content}</main>;
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6">
      <PhoneFrame>{content}</PhoneFrame>
      <p className="mt-3 text-center text-xs text-[#7f8494]">Powered by FunSplit + tiny corgi accountant 🐶🧾</p>
    </main>
  );
}
