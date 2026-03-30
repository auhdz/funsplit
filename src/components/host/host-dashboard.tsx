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
    <main className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-5 sm:py-8">
      <section className="rounded-[1.8rem] border border-[#ece4d8] bg-white/95 p-4 shadow-[0_10px_25px_rgba(122,104,86,0.1)] sm:p-6">
        <div className="mb-4 border-b border-dashed border-[#ddd4c8] pb-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[#2f3241]">FunSplit</h1>
          <p className="mt-1 text-sm text-[#6d7283]">Cutest way to split a dinner tab.</p>
        </div>

        <section className="mb-5">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7f869a]">Event Details</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={event.eventName}
              onChange={(input) => setEvent((previous) => ({ ...previous, eventName: input.target.value }))}
              className="rounded-xl border border-[#e3e6ee] bg-white px-3 py-2"
              placeholder="Tacos & Margaritas - 3/29/26"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={event.eventDateISO}
                onChange={(input) => setEvent((previous) => ({ ...previous, eventDateISO: input.target.value }))}
                className="rounded-xl border border-[#e3e6ee] bg-white px-3 py-2"
              />
              <input
                type="number"
                step="0.25"
                min="0"
                value={event.taxPercent}
                onChange={(input) => setEvent((previous) => ({ ...previous, taxPercent: Number(input.target.value) || 0 }))}
                className="rounded-xl border border-[#e3e6ee] bg-white px-3 py-2"
                placeholder="Tax %"
              />
            </div>
          </div>
        </section>

        <section className="mb-5 border-t border-dashed border-[#e1d8cd] pt-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7f869a]">Shared Fun Items</h2>
            <button
              onClick={() => setEvent((previous) => ({ ...previous, sharedItems: [...previous.sharedItems, newSharedItem()] }))}
              className="rounded-full bg-[#e9f3ff] px-3 py-1 text-sm text-[#365682]"
            >
              + Add
            </button>
          </div>
          <div className="hidden grid-cols-[2.6rem_1fr_4.5rem_6rem_5.8rem_4.8rem] gap-2 px-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8c92a5] sm:grid">
            <span>Emoji</span>
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span>Type</span>
            <span>Price</span>
            <span />
          </div>
          <div className="space-y-2">
            {event.sharedItems.map((item) => (
              <div key={item.id} className="grid gap-2 rounded-xl border border-[#eceef4] bg-[#fcfdff] p-2 sm:grid-cols-[2.6rem_1fr_4.5rem_6rem_5.8rem_4.8rem] sm:items-center sm:p-1.5">
                <input
                  value={item.emoji || ""}
                  onChange={(input) => updateSharedItem(item.id, (value) => ({ ...value, emoji: input.target.value }))}
                  className="rounded-lg border border-[#e3e6ef] px-2 py-1 text-center"
                />
                <input
                  value={item.description}
                  onChange={(input) => updateSharedItem(item.id, (value) => ({ ...value, description: input.target.value }))}
                  placeholder="Description"
                  className="rounded-lg border border-[#e3e6ef] px-2 py-1"
                />
                <input
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(input) => updateSharedItem(item.id, (value) => ({ ...value, quantity: Number(input.target.value) || 0 }))}
                  className="rounded-lg border border-[#e3e6ef] px-2 py-1 text-right"
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
                  className="rounded-lg border border-[#e3e6ef] px-2 py-1"
                >
                  <option value="money">Money</option>
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
                  className="rounded-lg border border-[#e3e6ef] px-2 py-1 disabled:opacity-40"
                />
                <button
                  onClick={() =>
                    setEvent((previous) => ({
                      ...previous,
                      sharedItems: previous.sharedItems.filter((value) => value.id !== item.id),
                    }))
                  }
                  className="rounded-lg bg-[#fff2f2] px-2 py-1 text-sm text-[#8d4552]"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5 border-t border-dashed border-[#e1d8cd] pt-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7f869a]">Friends / Personal Items</h2>
            <button
              onClick={() => setEvent((previous) => ({ ...previous, friends: [...previous.friends, newFriend()] }))}
              className="rounded-full bg-[#fce8f6] px-3 py-1 text-sm text-[#7a3f6a]"
            >
              + Add Friend
            </button>
          </div>
          <div className="space-y-3">
            {event.friends.map((friend) => {
              const totals = calculateFriendTotals(friend, event.taxPercent);
              return (
                <article key={friend.id} className="rounded-2xl border border-[#eceef4] bg-[#fdfeff] p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      value={friend.name}
                      onChange={(input) => updateFriend(friend.id, (value) => ({ ...value, name: input.target.value }))}
                      placeholder="Friend name"
                      className="w-full rounded-lg border border-[#e3e6ef] px-2 py-1.5"
                    />
                    <button
                      onClick={() =>
                        setEvent((previous) => ({
                          ...previous,
                          friends: previous.friends.filter((value) => value.id !== friend.id),
                        }))
                      }
                      className="rounded-lg bg-[#fff2f2] px-2.5 py-1.5 text-sm text-[#8d4552]"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-2">
                    {friend.items.map((item) => (
                      <div key={item.id} className="grid grid-cols-[2.6rem_1fr_5.8rem_4.8rem] gap-2">
                        <input
                          value={item.emoji || ""}
                          onChange={(input) =>
                            updateFriend(friend.id, (value) => ({
                              ...value,
                              items: value.items.map((inner) => (inner.id === item.id ? { ...inner, emoji: input.target.value } : inner)),
                            }))
                          }
                          className="rounded-lg border border-[#e3e6ef] px-2 py-1 text-center"
                        />
                        <input
                          value={item.description}
                          onChange={(input) =>
                            updateFriend(friend.id, (value) => ({
                              ...value,
                              items: value.items.map((inner) => (inner.id === item.id ? { ...inner, description: input.target.value } : inner)),
                            }))
                          }
                          placeholder="Personal item"
                          className="rounded-lg border border-[#e3e6ef] px-2 py-1"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.cents / 100}
                          onChange={(input) =>
                            updateFriend(friend.id, (value) => ({
                              ...value,
                              items: value.items.map((inner) => (inner.id === item.id ? { ...inner, cents: centsFromInput(input.target.value) } : inner)),
                            }))
                          }
                          className="rounded-lg border border-[#e3e6ef] px-2 py-1"
                        />
                        <button
                          onClick={() =>
                            updateFriend(friend.id, (value) => ({
                              ...value,
                              items: value.items.filter((inner) => inner.id !== item.id),
                            }))
                          }
                          className="rounded-lg bg-[#f3f5fa] px-2 py-1 text-xs text-[#5f6580]"
                        >
                          X
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => updateFriend(friend.id, (value) => ({ ...value, items: [...value.items, newPersonalItem()] }))}
                      className="rounded-full bg-[#edf4ff] px-3 py-1 text-sm text-[#3a568f]"
                    >
                      + Add personal item
                    </button>
                  </div>
                  <p className="mt-2 text-right text-sm font-medium text-[#4e5467]">Preview total: {formatUSD(totals.totalCents)}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-t border-dashed border-[#dfd6ca] pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7f869a]">Payment Setup</h2>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input
              placeholder="Venmo handle (without @)"
              value={event.payment.venmoHandle || ""}
              onChange={(input) =>
                setEvent((previous) => ({
                  ...previous,
                  payment: { ...previous.payment, venmoHandle: input.target.value.replace("@", "") },
                }))
              }
              className="rounded-xl border border-[#e3e6ee] px-3 py-2 text-sm"
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
              className="rounded-xl border border-[#e3e6ee] px-3 py-2 text-sm"
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
              className="rounded-xl border border-[#e3e6ee] px-3 py-2 text-sm"
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
              className="rounded-xl border border-[#e3e6ee] px-3 py-2 text-sm"
            />
          </div>
        </section>
      </section>

      <section className="mt-4 rounded-[1.6rem] border border-[#2f3241]/20 bg-[#2f3241] p-4 text-white shadow-lg">
        <h2 className="text-lg font-semibold">Generate Receipts</h2>
        <p className="mt-1 text-sm text-[#d7d9e3]">One unique link per friend.</p>
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
