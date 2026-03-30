type LineItemRowProps = {
  icon?: string;
  description: string;
  qty?: number;
  price: string;
  playful?: boolean;
};

export function LineItemRow({ icon = "✨", description, qty, price, playful = false }: LineItemRowProps) {
  return (
    <div className="grid grid-cols-[1.5rem_2.7rem_1fr_auto] items-center gap-2 py-1 text-sm">
      <span className="text-base">{icon}</span>
      <span className="text-right font-mono text-xs tabular-nums text-[#70758a]">
        {typeof qty === "number" ? qty.toLocaleString() : "1"}
      </span>
      <span className={playful ? "text-lg font-black tracking-tight text-[#cb4f99]" : "text-[#2f3241]"}>{description}</span>
      <span className={playful ? "text-base font-bold text-[#cb4f99]" : "font-medium text-[#2f3241]"}>{price}</span>
    </div>
  );
}
