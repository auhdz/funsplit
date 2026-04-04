import type { BillEvent } from "@/lib/types";

function makeId(prefix: string): string {
  return `${prefix}_${globalThis.crypto?.randomUUID?.().slice(0, 8) ?? `${Date.now()}`}`;
}

export function createInitialBillEvent(): BillEvent {
  return {
    version: 1,
    eventName: "The Corner Deli",
    eventDateISO: "2026-03-29",
    taxPercent: 9.5,
    partySize: 2,
    tipPercent: 18,
    serviceFeeCents: 0,
    deliveryFeeCents: 0,
    sharedItems: [
      {
        id: "shared_1",
        description: "Fun",
        quantity: 1000,
        displayPrice: { kind: "money", cents: 0 },
      },
      {
        id: "shared_2",
        description: "Spending quality time together",
        quantity: 1,
        displayPrice: { kind: "priceless" },
      },
      {
        id: "shared_3",
        description: "Fries for the table",
        quantity: 1,
        displayPrice: { kind: "money", cents: 650 },
      },
    ],
    friends: [
      {
        id: "friend_1",
        name: "Adrian",
        items: [
          { id: "item_1", description: "Turkey Club", cents: 1495 },
          { id: "item_2", description: "Iced Tea", cents: 425 },
        ],
      },
      {
        id: "friend_2",
        name: "Taylor",
        items: [{ id: "item_3", description: "Chicken Caesar Wrap", cents: 1375 }],
      },
    ],
    payment: {
      venmoHandle: "",
      appleCashLabel: "",
      zelleTarget: "",
      phoneNumber: "310-866-0096",
      cashTooltip: "You know where to find me",
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
  };
}

export function newSharedItem() {
  return {
    id: makeId("shared"),
    description: "",
    quantity: 1,
    displayPrice: { kind: "money", cents: 0 } as const,
  };
}
