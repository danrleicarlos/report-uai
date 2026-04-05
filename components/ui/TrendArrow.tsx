"use client";

interface TrendArrowProps {
  value: number;
  suffix?: string;
  inverse?: boolean; // for metrics where down is good (CPL, CPC, CAC)
  size?: "sm" | "md";
}

export default function TrendArrow({ value, suffix = "%", inverse = false, size = "md" }: TrendArrowProps) {
  const isPositive = value >= 0;
  const isGood = inverse ? !isPositive : isPositive;
  const absValue = Math.abs(value);

  const colorClass = isGood ? "text-emerald-400" : "text-rose-400";
  const bgClass = isGood ? "bg-emerald-500/10" : "bg-rose-500/10";
  const sizeClass = size === "sm" ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${colorClass} ${bgClass} ${sizeClass}`}>
      <span className="text-[10px]">{isPositive ? "▲" : "▼"}</span>
      {absValue.toFixed(1)}{suffix}
    </span>
  );
}
