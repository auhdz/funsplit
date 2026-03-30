"use client";

import Link from "next/link";
import { use, useState } from "react";
import { ReceiptPaper } from "@/components/receipt/receipt-paper";
import { decodeBillPayload } from "@/lib/codec";

type ReceiptClientPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type ConfettiBit = {
  id: number;
  left: number;
  color: string;
  delayMs: number;
};

const confettiColors = ["#ffd166", "#8ec5ff", "#fda4d6", "#b7f5c6", "#cdb8ff"];

export function ReceiptClientPage({ searchParams }: ReceiptClientPageProps) {
  const query = use(searchParams);
  const billParam = Array.isArray(query.bill) ? query.bill[0] : query.bill;
  const friendParam = Array.isArray(query.for) ? query.for[0] : query.for;
  const [confettiBits, setConfettiBits] = useState<ConfettiBit[]>([]);

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

  const venmoHandle = resolvedEvent.payment.venmoHandle?.trim();
  const venmoHref = venmoHandle
    ? `https://venmo.com/${venmoHandle}?txn=charge&note=${encodeURIComponent(resolvedEvent.eventName)}`
    : "";
  const phoneNumber = resolvedEvent.payment.phoneNumber?.trim();

  async function copyValue(value: string, label: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      window.alert(`${label} copied!`);
    } catch {
      window.alert("Could not copy. Please copy manually.");
    }
  }

  function triggerConfettiOnce() {
    if (typeof window === "undefined") return;
    const key = "funsplitConfettiDone";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const bits = Array.from({ length: 20 }, (_, index) => ({
      id: Date.now() + index,
      left: Math.random() * 90 + 5,
      color: confettiColors[index % confettiColors.length],
      delayMs: Math.floor(Math.random() * 180),
    }));
    setConfettiBits(bits);
    window.setTimeout(() => setConfettiBits([]), 1300);
  }

  async function onPaymentClick(action: () => Promise<void> | void) {
    triggerConfettiOnce();
    await action();
  }

  const content = (
    <div className="relative mx-auto max-w-md">
      <ReceiptPaper event={resolvedEvent} friend={resolvedFriend} />
      {confettiBits.length > 0 && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-0">
          {confettiBits.map((bit) => (
            <span
              key={bit.id}
              className="confetti-piece absolute top-5 h-2 w-2 rounded-sm"
              style={{
                left: `${bit.left}%`,
                backgroundColor: bit.color,
                animationDelay: `${bit.delayMs}ms`,
              }}
            />
          ))}
        </div>
      )}

      <section className="mt-3 rounded-3xl border border-[#ece4d8] bg-white/95 p-4 shadow-sm">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#8a8f9f]">Pay Host</h2>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={venmoHref || "#"}
            onClick={(eventInput) => {
              if (!venmoHref) {
                eventInput.preventDefault();
              }
              onPaymentClick(async () => {
                if (!venmoHref && resolvedEvent.payment.venmoHandle) {
                  await copyValue(resolvedEvent.payment.venmoHandle, "Venmo handle");
                }
              });
            }}
            className="fun-press rounded-xl bg-[#def1ff] px-3 py-2 text-center font-medium text-[#1f5e8f]"
          >
            Venmo
          </a>
          <button
            onClick={() => onPaymentClick(() => copyValue(resolvedEvent.payment.appleCashLabel || "", "Apple Cash label"))}
            className="fun-press rounded-xl bg-[#f0e9ff] px-3 py-2 font-medium text-[#60458f]"
          >
            Apple Cash
          </button>
          <button
            onClick={() => onPaymentClick(() => copyValue(resolvedEvent.payment.zelleTarget || "", "Zelle target"))}
            className="fun-press rounded-xl bg-[#fff2da] px-3 py-2 font-medium text-[#885f20]"
          >
            Zelle
          </button>
          <button
            title={resolvedEvent.payment.cashTooltip || "you know where to find me 😏"}
            onClick={() => onPaymentClick(() => undefined)}
            className="fun-press rounded-xl bg-[#e6f9ed] px-3 py-2 font-medium text-[#27653e]"
          >
            Cash 💵
          </button>
        </div>

        {phoneNumber && (
          <div className="mt-3 text-center">
            <a href={`tel:${phoneNumber}`} className="text-lg font-semibold text-[#3e4e79] underline underline-offset-3">
              {phoneNumber}
            </a>
          </div>
        )}
      </section>

      <div className="mt-3 text-center text-xs text-[#7f8494]">
        <button
          onClick={() => onPaymentClick(() => copyValue(window.location.href, "Receipt link"))}
          className="fun-press rounded-full bg-white px-3 py-1.5 text-[#5f6680] shadow-sm"
        >
          Share Link
        </button>
      </div>
    </div>
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-start justify-center px-3 py-6 sm:px-5 sm:py-10">
      {content}
    </main>
  );
}
