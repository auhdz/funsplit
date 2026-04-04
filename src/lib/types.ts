export type MoneyCents = number;

export type DisplayPrice =
  | { kind: "money"; cents: MoneyCents }
  | { kind: "priceless" };

export type SharedItem = {
  id: string;
  description: string;
  quantity: number;
  displayPrice: DisplayPrice;
  emoji?: string;
};

export type PersonalItem = {
  id: string;
  description: string;
  cents: MoneyCents;
  emoji?: string;
};

export type Friend = {
  id: string;
  name: string;
  items: PersonalItem[];
};

export type PaymentConfig = {
  venmoHandle?: string;
  appleCashLabel?: string;
  zelleTarget?: string;
  phoneNumber?: string;
  cashTooltip?: string;
};

export type BillEvent = {
  version: 1;
  eventName: string;
  eventDateISO: string;
  taxPercent: number;
  partySize: number;
  tipPercent: number;
  serviceFeeCents: MoneyCents;
  deliveryFeeCents: MoneyCents;
  sharedItems: SharedItem[];
  friends: Friend[];
  payment: PaymentConfig;
  theme?: "pastel" | "cream";
};
