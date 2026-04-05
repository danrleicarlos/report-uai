"use client";

import { InsightType } from "@/types/report";

interface BadgeProps {
  type: InsightType | "channel" | "status";
  label?: string;
  size?: "sm" | "md";
}

const insightConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  positive: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    label: "Destaque Positivo",
  },
  opportunity: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-400",
    label: "Oportunidade",
  },
  alert: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    dot: "bg-rose-400",
    label: "Alerta",
  },
  attention: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
    label: "Ponto de Atenção",
  },
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  scaling: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Escalar" },
  ok: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Ok" },
  monitor: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Monitorar" },
  pause: { bg: "bg-rose-500/10", text: "text-rose-400", label: "Pausar" },
};

export default function Badge({ type, label, size = "md" }: BadgeProps) {
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";

  if (type === "status" && label) {
    const cfg = statusConfig[label] || statusConfig.ok;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cfg.bg} ${cfg.text} ${sizeClass}`}>
        {cfg.label}
      </span>
    );
  }

  const cfg = insightConfig[type] || insightConfig.positive;
  const displayLabel = label || cfg.label;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cfg.bg} ${cfg.text} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {displayLabel}
    </span>
  );
}
