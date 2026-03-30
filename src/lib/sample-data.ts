import type { BillEvent } from "@/lib/types";

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createInitialBillEvent(): BillEvent {
  const today = new Date();
  const isoDate = today.toISOString().slice(0, 10);

  return {
    version: 1,
    eventName: `Tacos & Margaritas - ${today.toLocaleDateString("en-US")}`,
    eventDateISO: isoDate,
    taxPercent: 0,
    sharedItems: [
      {
        id: makeId("shared"),
        description: "Fun",
        quantity: 1000,
        displayPrice: { kind: "money", cents: 0 },
        emoji: "🎉",
      },
      {
        id: makeId("shared"),
        description: "Spending quality time together",
        quantity: 1,
        displayPrice: { kind: "priceless" },
        emoji: "💞",
      },
    ],
    friends: [
      {
        id: makeId("friend"),
        name: "Adrian",
        items: [
          { id: makeId("item"), description: "Birria tacos", cents: 1850, emoji: "🌮" },
          { id: makeId("item"), description: "Margarita", cents: 1200, emoji: "🍹" },
        ],
      },
      {
        id: makeId("friend"),
        name: "Taylor",
        items: [{ id: makeId("item"), description: "Quesadilla", cents: 1450, emoji: "🧀" }],
      },
    ],
    payment: {
      venmoHandle: "",
      appleCashLabel: "",
      zelleTarget: "",
      phoneNumber: "310-866-0096",
      cashTooltip: "you know where to find me 😏",
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
