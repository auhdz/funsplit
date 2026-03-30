type LineItemRowProps = {
  icon?: string;
  description: string;
  qty?: number;
  price: string;
  playful?: boolean;
};

export function LineItemRow({ icon = "✨", description, qty, price, playful = false }: LineItemRowProps) {
  return (
    <div className="grid grid-cols-[1.5rem_1fr_auto_auto] items-center gap-2 py-1.5 text-sm">
      <span className="text-base">{icon}</span>
      <span className={playful ? "font-semibold text-[#cb5aa0]" : "text-[#2f3241]"}>{description}</span>
      <span className="w-10 text-right text-xs text-[#7a7e8d]">{typeof qty === "number" ? qty : ""}</span>
      <span className={playful ? "font-semibold text-[#cb5aa0]" : "font-medium"}>{price}</span>
    </div>
  );
}
