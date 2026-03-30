"use client";

import Link from "next/link";
import { use } from "react";
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

  const content = (
    <div className={printMode ? "mx-auto max-w-md" : "mx-auto max-w-md"}>
      <ReceiptPaper event={resolvedEvent} friend={resolvedFriend} />
      {!printMode && (
        <div className="mt-4 text-center text-xs uppercase tracking-[0.16em] text-[#696969]">
          <Link href={`/print?bill=${billParam}&for=${resolvedFriend.id}`} className="underline underline-offset-2">
            Open print view
          </Link>
        </div>
      )}
    </div>
  );

  if (printMode) {
    return <main className="mx-auto flex min-h-screen w-full max-w-2xl items-start justify-center bg-white px-4 py-10">{content}</main>;
  }

  return <main className="mx-auto flex min-h-screen w-full max-w-2xl items-start justify-center bg-white px-4 py-10">{content}</main>;
}
