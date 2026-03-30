import type { BillEvent } from "@/lib/types";

function makeId(prefix: string): string {
  return `${prefix}_${globalThis.crypto?.randomUUID?.().slice(0, 8) ?? `${Date.now()}`}`;
}

export function createInitialBillEvent(): BillEvent {
  return {
    version: 1,
    eventName: "The Corner Deli",
    eventDateISO: "2026-03-29",
    taxPercent: 8.75,
    sharedItems: [
      {
        id: "shared_1",
        description: "Fries for the table",
        quantity: 1,
        displayPrice: { kind: "money", cents: 650 },
        emoji: "🍟",
      },
    ],
    friends: [
      {
        id: "friend_1",
        name: "Adrian",
        items: [
          { id: "item_1", description: "Turkey Club", cents: 1495, emoji: "🥪" },
          { id: "item_2", description: "Iced Tea", cents: 425, emoji: "🧋" },
        ],
      },
      {
        id: "friend_2",
        name: "Taylor",
        items: [{ id: "item_3", description: "Chicken Caesar Wrap", cents: 1375, emoji: "🌯" }],
      },
    ],
    payment: {
      venmoHandle: "",
      appleCashLabel: "",
      zelleTarget: "",
      phoneNumber: "310-866-0096",
      cashTooltip: "Cash accepted",
    },
    theme: "pastel",
  };
}

export function newFriend() {
  return {
    id: makeId("friend"),
    name: "",
    items: [],
  };
}

export function newPersonalItem() {
  return {
    id: makeId("item"),
    description: "",
    cents: 0,
    emoji: "🍽️",
  };
}

export function newSharedItem() {
  return {
    id: makeId("shared"),
    description: "",
    quantity: 1,
    displayPrice: { kind: "money", cents: 0 } as const,
    emoji: "✨",
  };
}
