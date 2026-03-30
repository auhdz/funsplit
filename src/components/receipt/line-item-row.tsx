type LineItemRowProps = {
  icon?: string;
  description: string;
  qty?: number;
  price: string;
  playful?: boolean;
};

export function LineItemRow({ icon = "✨", description, qty, price, playful = false }: LineItemRowProps) {
  const normalizedDescription = description.trim().toUpperCase();
  return (
    <div className="grid grid-cols-[2.25rem_1fr_auto] items-start gap-2 py-0.5 font-mono text-[0.78rem] leading-tight">
      <span className="text-[#222] tabular-nums">{typeof qty === "number" ? String(qty).padStart(2, "0") : "01"}</span>
      <span className={playful ? "text-[#3d3d3d]" : "text-[#1e1e1e]"}>{normalizedDescription || icon.toUpperCase()}</span>
      <span className="text-right text-[#171717] tabular-nums">{price.replace("$", "")}</span>
    </div>
  );
}
