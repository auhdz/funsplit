"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { encodeBillPayload } from "@/lib/codec";
import { formatUSD } from "@/lib/format";
import { calculateFriendTotals, centsFromInput } from "@/lib/math";
import { createInitialBillEvent, newFriend, newPersonalItem, newSharedItem } from "@/lib/sample-data";
import type { BillEvent, Friend, SharedItem } from "@/lib/types";

export function HostDashboard() {
  const [event, setEvent] = useState<BillEvent>(() => createInitialBillEvent());
  const [copiedId, setCopiedId] = useState("");

  const payload = useMemo(() => encodeBillPayload(event), [event]);

  const receiptLinks = useMemo(() => {
    return event.friends.map((friend) => ({
      id: friend.id,
      name: friend.name || "Unnamed friend",
      href: `/receipt?bill=${payload}&for=${friend.id}`,
    }));
  }, [event.friends, payload]);

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

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 md:py-10">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[#2f3241]">FunSplit</h1>
        <p className="mt-1 text-sm text-[#6d7283]">Turn awkward paybacks into adorable receipts.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white/80 p-4 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#7f869a]">Event</h2>
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-[#5a6074]">Event name</span>
              <input
                value={event.eventName}
                onChange={(input) => setEvent((previous) => ({ ...previous, eventName: input.target.value }))}
                className="w-full rounded-xl border border-[#e3e6ee] bg-white px-3 py-2 outline-none ring-[#cad6ff] focus:ring-2"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-sm">
                <span className="mb-1 block text-[#5a6074]">Date</span>
                <input
                  type="date"
                  value={event.eventDateISO}
                  onChange={(input) => setEvent((previous) => ({ ...previous, eventDateISO: input.target.value }))}
                  className="w-full rounded-xl border border-[#e3e6ee] bg-white px-3 py-2 outline-none ring-[#cad6ff] focus:ring-2"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-[#5a6074]">Tax %</span>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={event.taxPercent}
                  onChange={(input) =>
                    setEvent((previous) => ({ ...previous, taxPercent: Number(input.target.value) || 0 }))
                  }
                  className="w-full rounded-xl border border-[#e3e6ee] bg-white px-3 py-2 outline-none ring-[#cad6ff] focus:ring-2"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white/80 p-4 shadow-sm backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#7f869a]">Payment Setup</h2>
          <div className="space-y-2">
            <input
              placeholder="Venmo handle (without @)"
              value={event.payment.venmoHandle || ""}
              onChange={(input) =>
                setEvent((previous) => ({
                  ...previous,
                  payment: { ...previous.payment, venmoHandle: input.target.value.replace("@", "") },
                }))
              }
              className="w-full rounded-xl border border-[#e3e6ee] px-3 py-2 text-sm"
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
              className="w-full rounded-xl border border-[#e3e6ee] px-3 py-2 text-sm"
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
              className="w-full rounded-xl border border-[#e3e6ee] px-3 py-2 text-sm"
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
              className="w-full rounded-xl border border-[#e3e6ee] px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-3xl bg-white/85 p-4 shadow-sm backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7f869a]">Shared / Generic Items</h2>
          <button
            onClick={() => setEvent((previous) => ({ ...previous, sharedItems: [...previous.sharedItems, newSharedItem()] }))}
            className="rounded-full bg-[#e5f2ff] px-3 py-1.5 text-sm font-medium text-[#2f4a76]"
          >
            + Add
          </button>
        </div>
        <div className="space-y-3">
          {event.sharedItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 rounded-2xl border border-[#eef0f5] bg-white p-3">
              <input
                value={item.emoji || ""}
                onChange={(input) => updateSharedItem(item.id, (value) => ({ ...value, emoji: input.target.value }))}
                className="col-span-2 rounded-lg border border-[#e6e9f2] px-2 py-1 text-center sm:col-span-1"
              />
              <input
                value={item.description}
                onChange={(input) =>
                  updateSharedItem(item.id, (value) => ({ ...value, description: input.target.value }))
                }
                placeholder="Item description"
                className="col-span-10 rounded-lg border border-[#e6e9f2] px-2 py-1 sm:col-span-4"
              />
              <input
                type="number"
                min="0"
                value={item.quantity}
                onChange={(input) =>
                  updateSharedItem(item.id, (value) => ({ ...value, quantity: Number(input.target.value) || 0 }))
                }
                className="col-span-3 rounded-lg border border-[#e6e9f2] px-2 py-1 sm:col-span-2"
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
                className="col-span-5 rounded-lg border border-[#e6e9f2] px-2 py-1 sm:col-span-2"
              >
                <option value="money">$</option>
                <option value="priceless">Priceless</option>
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
                className="col-span-4 rounded-lg border border-[#e6e9f2] px-2 py-1 disabled:opacity-40 sm:col-span-2"
              />
              <button
                onClick={() =>
                  setEvent((previous) => ({
                    ...previous,
                    sharedItems: previous.sharedItems.filter((value) => value.id !== item.id),
                  }))
                }
                className="col-span-12 rounded-lg bg-[#fff0f0] px-2 py-1 text-sm text-[#8d4552] sm:col-span-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-3xl bg-white/85 p-4 shadow-sm backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7f869a]">Friends / People</h2>
          <button
            onClick={() => setEvent((previous) => ({ ...previous, friends: [...previous.friends, newFriend()] }))}
            className="rounded-full bg-[#fce8f6] px-3 py-1.5 text-sm font-medium text-[#783965]"
          >
            + Add Friend
          </button>
        </div>
        <div className="space-y-3">
          {event.friends.map((friend) => {
            const totals = calculateFriendTotals(friend, event.taxPercent);
            return (
              <article key={friend.id} className="rounded-2xl border border-[#eceef4] bg-white p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <input
                    value={friend.name}
                    onChange={(input) => updateFriend(friend.id, (value) => ({ ...value, name: input.target.value }))}
                    placeholder="Friend name"
                    className="w-full rounded-lg border border-[#e5e8f0] px-2 py-1.5"
                  />
                  <button
                    onClick={() =>
                      setEvent((previous) => ({
                        ...previous,
                        friends: previous.friends.filter((value) => value.id !== friend.id),
                      }))
                    }
                    className="rounded-lg bg-[#fff0f0] px-2.5 py-1.5 text-sm text-[#8d4552]"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-2">
                  {friend.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2">
                      <input
                        value={item.emoji || ""}
                        onChange={(input) =>
                          updateFriend(friend.id, (value) => ({
                            ...value,
                            items: value.items.map((inner) =>
                              inner.id === item.id ? { ...inner, emoji: input.target.value } : inner,
                            ),
                          }))
                        }
                        className="col-span-2 rounded-lg border border-[#e5e8f0] px-2 py-1 text-center sm:col-span-1"
                      />
                      <input
                        value={item.description}
                        onChange={(input) =>
                          updateFriend(friend.id, (value) => ({
                            ...value,
                            items: value.items.map((inner) =>
                              inner.id === item.id ? { ...inner, description: input.target.value } : inner,
                            ),
                          }))
                        }
                        placeholder="What did they order?"
                        className="col-span-6 rounded-lg border border-[#e5e8f0] px-2 py-1 sm:col-span-7"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.cents / 100}
                        onChange={(input) =>
                          updateFriend(friend.id, (value) => ({
                            ...value,
                            items: value.items.map((inner) =>
                              inner.id === item.id ? { ...inner, cents: centsFromInput(input.target.value) } : inner,
                            ),
                          }))
                        }
                        className="col-span-4 rounded-lg border border-[#e5e8f0] px-2 py-1 sm:col-span-3"
                      />
                      <button
                        onClick={() =>
                          updateFriend(friend.id, (value) => ({
                            ...value,
                            items: value.items.filter((inner) => inner.id !== item.id),
                          }))
                        }
                        className="col-span-12 rounded-lg bg-[#f7f7fb] px-2 py-1 text-xs text-[#5f6580] sm:col-span-1"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      updateFriend(friend.id, (value) => ({ ...value, items: [...value.items, newPersonalItem()] }))
                    }
                    className="rounded-full bg-[#eef4ff] px-3 py-1 text-sm text-[#37518a]"
                  >
                    + Add personal item
                  </button>
                </div>
                <p className="mt-3 text-right text-sm font-medium text-[#4e5467]">Preview total: {formatUSD(totals.totalCents)}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-5 rounded-3xl bg-[#2f3241] p-4 text-white shadow-lg">
        <h2 className="text-lg font-semibold">Generate Receipts</h2>
        <p className="mt-1 text-sm text-[#d7d9e3]">Every friend gets their own cute receipt link.</p>
        <div className="mt-3 space-y-2">
          {receiptLinks.map((link) => (
            <div key={link.id} className="rounded-xl bg-white/10 p-2">
              <div className="mb-1 text-sm font-medium">{link.name}</div>
              <div className="flex items-center gap-2">
                <Link href={link.href} className="truncate text-xs text-[#9fddff] underline underline-offset-2">
                  {link.href}
                </Link>
                <button
                  onClick={() => copyText(`${window.location.origin}${link.href}`, link.id)}
                  className="rounded-md bg-white/20 px-2 py-1 text-xs"
                >
                  {copiedId === link.id ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
