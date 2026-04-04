type LineItemRowProps = {
  description: string;
  qty?: number;
  price: string;
  emphasizePrice?: boolean;
};

export function LineItemRow({ description, qty, price, emphasizePrice = false }: LineItemRowProps) {
  const normalized = description.trim().toUpperCase();
  return (
    <div className="grid grid-cols-[2.4rem_1fr_auto] items-start gap-2 py-0.5 font-mono text-[0.82rem] leading-tight">
      <span className="text-[#222] tabular-nums">{typeof qty === "number" ? qty.toLocaleString("en-US") : "1"}</span>
      <span className="text-[#1e1e1e]">{normalized || "ITEM"}</span>
      <span className={`text-right tabular-nums ${emphasizePrice ? "font-bold text-[#111]" : "text-[#171717]"}`}>{price}</span>
    </div>
  );
}
