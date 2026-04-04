"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { encodeBillPayload } from "@/lib/codec";
import { centsFromInput } from "@/lib/math";
import { createInitialBillEvent, newFriend, newPersonalItem, newSharedItem } from "@/lib/sample-data";
import type { BillEvent, Friend, SharedItem } from "@/lib/types";

export function HostDashboard() {
  const [event, setEvent] = useState<BillEvent>(() => createInitialBillEvent());
  const [copiedId, setCopiedId] = useState("");
  const [activeFriendId, setActiveFriendId] = useState("");

  const payload = useMemo(() => encodeBillPayload(event), [event]);

  const receiptLinks = useMemo(() => {
    return event.friends.map((friend) => ({
      id: friend.id,
      name: friend.name || "Unnamed friend",
      href: `/receipt?bill=${payload}&for=${friend.id}`,
    }));
  }, [event.friends, payload]);

  const activeFriend = event.friends.find((friend) => friend.id === activeFriendId) ?? event.friends[0];
  const activeReceiptLink = receiptLinks.find((link) => link.id === activeFriend?.id);

  function updateFriend(friendId: string, updater: (friend: Friend) => Friend) {
    setEvent((previous) => ({
      ...previous,
      friends: previous.friends.map((friend) => (friend.id === friendId ? updater(friend) : friend)),
    }));
  }

  function updateSharedItem(sharedId: string, updater: (shared: SharedItem) => SharedItem) {
    setEvent((previous) => ({
      ...previous,
      sharedItems: previous.sharedItems.map((item) => (item.id === sharedId ? updater(item) : item)),
    }));
  }

  async function copyText(value: string, id: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(""), 1800);
    } catch {
      setCopiedId("");
    }
  }

  function addAnotherReceipt() {
    const created = newFriend();
    setEvent((previous) => ({ ...previous, friends: [...previous.friends, created] }));
    setActiveFriendId(created.id);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 text-[#111] sm:px-10 sm:py-12">
      <header className="mb-10 border-b border-[#d9d9d9] pb-6">
        <div className="mb-6 flex items-center justify-between text-sm tracking-[0.08em]">
          <span>Menu</span>
          <span>thanks for spending time with me :)</span>
        </div>
        <h1 className="text-6xl font-semibold tracking-tight sm:text-7xl">BILL MENU</h1>
      </header>

      <section className="grid gap-10 border-b border-[#d9d9d9] pb-10 sm:grid-cols-2">
        <div>
          <h2 className="mb-4 text-4xl font-semibold tracking-tight">EVENT</h2>
          <div className="space-y-3">
            <input
              value={event.eventName}
              onChange={(input) => setEvent((previous) => ({ ...previous, eventName: input.target.value }))}
              placeholder="Event name"
              className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={event.eventDateISO}
                onChange={(input) => setEvent((previous) => ({ ...previous, eventDateISO: input.target.value }))}
                className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg outline-none"
              />
              <input
                type="number"
                step="0.25"
                min="0"
                value={event.taxPercent}
                onChange={(input) => setEvent((previous) => ({ ...previous, taxPercent: Number(input.target.value) || 0 }))}
                placeholder="Tax %"
                className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg outline-none"
              />
            </div>
            <p className="text-xs uppercase tracking-[0.09em] text-[#666]">Los Angeles default tax: 9.50%</p>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-4xl font-semibold tracking-tight">NAME</h2>
          {activeFriend ? (
            <div className="space-y-3">
              <input
                value={activeFriend.name}
                onChange={(input) => updateFriend(activeFriend.id, (value) => ({ ...value, name: input.target.value }))}
                placeholder="Receipt name"
                className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg uppercase outline-none"
              />
              <button onClick={addAnotherReceipt} className="border border-[#111] px-3 py-1 text-sm uppercase tracking-[0.12em]">
                Add Another
              </button>
              {event.friends.length > 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {event.friends.map((friend, index) => (
                    <button
                      key={friend.id}
                      onClick={() => setActiveFriendId(friend.id)}
                      className={`border px-2 py-1 text-xs uppercase tracking-[0.1em] ${
                        friend.id === activeFriend.id ? "border-[#111] bg-[#111] text-white" : "border-[#c9c9c9]"
                      }`}
                    >
                      {friend.name || `Receipt ${index + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button onClick={addAnotherReceipt} className="border border-[#111] px-3 py-1 text-sm uppercase tracking-[0.12em]">
              Add Receipt
            </button>
          )}
        </div>
      </section>

      <section className="border-b border-[#d9d9d9] py-10">
        <h2 className="mb-4 text-4xl font-semibold tracking-tight">FEES AND TIP</h2>
        <p className="mb-4 text-xs uppercase tracking-[0.1em] text-[#666]">These are split equally by party size.</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.1em] text-[#666]">Party Size</span>
            <input
              type="number"
              step="1"
              min="1"
              value={event.partySize}
              onChange={(input) =>
                setEvent((previous) => ({ ...previous, partySize: Math.max(1, Math.round(Number(input.target.value) || 1)) }))
              }
              className="mt-1 w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.1em] text-[#666]">Tip %</span>
            <input
              type="number"
              step="0.25"
              min="0"
              value={event.tipPercent}
              onChange={(input) => setEvent((previous) => ({ ...previous, tipPercent: Number(input.target.value) || 0 }))}
              className="mt-1 w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.1em] text-[#666]">Service Fee</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={event.serviceFeeCents / 100}
              onChange={(input) => setEvent((previous) => ({ ...previous, serviceFeeCents: centsFromInput(input.target.value) }))}
              className="mt-1 w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.1em] text-[#666]">Delivery Fee</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={event.deliveryFeeCents / 100}
              onChange={(input) => setEvent((previous) => ({ ...previous, deliveryFeeCents: centsFromInput(input.target.value) }))}
              className="mt-1 w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg outline-none"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-10 border-b border-[#d9d9d9] py-10 sm:grid-cols-2">
        <div>
          <h2 className="mb-4 text-4xl font-semibold tracking-tight">PAYMENT</h2>
          <div className="space-y-3">
            <input
              placeholder="Venmo handle"
              value={event.payment.venmoHandle || ""}
              onChange={(input) =>
                setEvent((previous) => ({
                  ...previous,
                  payment: { ...previous.payment, venmoHandle: input.target.value.replace("@", "") },
                }))
              }
              className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg outline-none"
            />
            <input
              placeholder="Apple Cash label"
              value={event.payment.appleCashLabel || ""}
              onChange={(input) =>
                setEvent((previous) => ({
                  ...previous,
                  payment: { ...previous.payment, appleCashLabel: input.target.value },
                }))
              }
              className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg outline-none"
            />
            <input
              placeholder="Zelle email or phone"
              value={event.payment.zelleTarget || ""}
              onChange={(input) =>
                setEvent((previous) => ({
                  ...previous,
                  payment: { ...previous.payment, zelleTarget: input.target.value },
                }))
              }
              className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg outline-none"
            />
            <input
              placeholder="Phone number"
              value={event.payment.phoneNumber || ""}
              onChange={(input) =>
                setEvent((previous) => ({
                  ...previous,
                  payment: { ...previous.payment, phoneNumber: input.target.value },
                }))
              }
              className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg outline-none"
            />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-4xl font-semibold tracking-tight">RECEIPT TARGET</h2>
          <p className="border-b border-[#cfcfcf] px-1 py-2 text-lg uppercase">{activeFriend?.name || "No name yet"}</p>
          <p className="pt-3 text-xs uppercase tracking-[0.1em] text-[#595959]">This name is used for the generated receipt below.</p>
        </div>
      </section>

      <section className="border-b border-[#d9d9d9] py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-4xl font-semibold tracking-tight">SHARED ITEMS</h2>
          <button
            onClick={() => setEvent((previous) => ({ ...previous, sharedItems: [...previous.sharedItems, newSharedItem()] }))}
            className="border border-[#111] px-3 py-1 text-sm uppercase tracking-[0.12em]"
          >
            Add
          </button>
        </div>
        <div className="hidden grid-cols-[1fr_100px_120px_120px_90px] gap-3 pb-2 text-xs uppercase tracking-[0.12em] text-[#555] sm:grid">
          <span>Item</span>
          <span className="text-right">Qty</span>
          <span>Type</span>
          <span className="text-right">Price</span>
          <span className="text-right">Action</span>
        </div>
        <div className="space-y-3">
          {event.sharedItems.map((item) => (
            <div key={item.id} className="grid gap-2 sm:grid-cols-[1fr_100px_120px_120px_90px] sm:items-center">
              <input
                value={item.description}
                onChange={(input) => updateSharedItem(item.id, (value) => ({ ...value, description: input.target.value }))}
                placeholder="Item description"
                className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg outline-none"
              />
              <input
                type="number"
                min="0"
                value={item.quantity}
                onChange={(input) => updateSharedItem(item.id, (value) => ({ ...value, quantity: Number(input.target.value) || 0 }))}
                className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-right text-lg outline-none"
              />
              <select
                value={item.displayPrice.kind}
                onChange={(input) =>
                  updateSharedItem(item.id, (value) => ({
                    ...value,
                    displayPrice:
                      input.target.value === "priceless"
                        ? { kind: "priceless" }
                        : { kind: "money", cents: value.displayPrice.kind === "money" ? value.displayPrice.cents : 0 },
                  }))
                }
                className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-lg outline-none"
              >
                <option value="money">Money</option>
                <option value="priceless">Flat</option>
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                disabled={item.displayPrice.kind === "priceless"}
                value={item.displayPrice.kind === "money" ? item.displayPrice.cents / 100 : ""}
                onChange={(input) =>
                  updateSharedItem(item.id, (value) => ({ ...value, displayPrice: { kind: "money", cents: centsFromInput(input.target.value) } }))
                }
                className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-2 text-right text-lg outline-none disabled:opacity-40"
              />
              <button
                onClick={() =>
                  setEvent((previous) => ({
                    ...previous,
                    sharedItems: previous.sharedItems.filter((value) => value.id !== item.id),
                  }))
                }
                className="border border-[#b9b9b9] px-2 py-1 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-[#d9d9d9] py-10">
        <h2 className="mb-4 font-mono text-[2.1rem] font-semibold tracking-tight uppercase">Personal Charges</h2>
        {activeFriend ? (
          <>
            <div className="mb-2 grid grid-cols-[2.4rem_1fr_120px_90px] border-b border-dashed border-[#a7a7a7] pb-1 font-mono text-xs uppercase tracking-[0.1em] text-[#555]">
              <span>Qty</span>
              <span>Item</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Action</span>
            </div>
            <div className="space-y-2">
              {activeFriend.items.map((item) => (
                <div key={item.id} className="grid grid-cols-[2.4rem_1fr_120px_90px] items-center gap-2 font-mono">
                  <span className="text-[0.95rem] tabular-nums text-[#222]">01</span>
                  <input
                    value={item.description}
                    onChange={(input) =>
                      updateFriend(activeFriend.id, (value) => ({
                        ...value,
                        items: value.items.map((inner) => (inner.id === item.id ? { ...inner, description: input.target.value } : inner)),
                      }))
                    }
                    placeholder="ITEM"
                    className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-1.5 text-[1.03rem] uppercase outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.cents / 100}
                    onChange={(input) =>
                      updateFriend(activeFriend.id, (value) => ({
                        ...value,
                        items: value.items.map((inner) => (inner.id === item.id ? { ...inner, cents: centsFromInput(input.target.value) } : inner)),
                      }))
                    }
                    className="w-full border-b border-[#cfcfcf] bg-transparent px-1 py-1.5 text-right text-[1.03rem] tabular-nums outline-none"
                  />
                  <button
                    onClick={() =>
                      updateFriend(activeFriend.id, (value) => ({
                        ...value,
                        items: value.items.filter((inner) => inner.id !== item.id),
                      }))
                    }
                    className="border border-[#b9b9b9] px-2 py-1 text-xs uppercase"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => updateFriend(activeFriend.id, (value) => ({ ...value, items: [...value.items, newPersonalItem()] }))}
              className="mt-4 border border-[#111] px-3 py-1 text-sm uppercase tracking-[0.12em]"
            >
              Add Personal Item
            </button>
          </>
        ) : (
          <p className="text-sm uppercase tracking-[0.1em] text-[#666]">Add a receipt name to start personal charges.</p>
        )}
      </section>

      <section className="py-10">
        <h2 className="mb-4 text-4xl font-semibold tracking-tight">RECEIPTS</h2>
        {activeReceiptLink ? (
          <div className="grid gap-2 border-b border-[#ececec] pb-3 sm:grid-cols-[220px_1fr_80px] sm:items-center">
            <div className="text-lg uppercase">{activeReceiptLink.name}</div>
            <Link href={activeReceiptLink.href} className="truncate text-sm underline underline-offset-2 uppercase tracking-[0.08em]">
              View receipt
            </Link>
            <button
              onClick={() => copyText(`${window.location.origin}${activeReceiptLink.href}`, activeReceiptLink.id)}
              className="border border-[#111] px-2 py-1 text-xs uppercase"
            >
              {copiedId === activeReceiptLink.id ? "Copied" : "Copy"}
            </button>
          </div>
        ) : (
          <p className="text-sm uppercase tracking-[0.1em] text-[#666]">No active receipt yet.</p>
        )}
      </section>
    </main>
  );
}
