"use client";

import { useEffect, useState } from "react";
import { KPIValue } from "@/types/report";
import TrendArrow from "@/components/ui/TrendArrow";

interface KPICardProps {
  label: string;
  kpi: KPIValue;
  icon: React.ReactNode;
  description?: string;
  inverse?: boolean;
  accent?: "blue" | "violet" | "cyan" | "emerald" | "amber";
}

const accentMap = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
};

export default function KPICard({ label, kpi, icon, description, inverse = false, accent = "blue" }: KPICardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const ac = accentMap[accent];

  return (
    <div className={`kpi-card group transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${ac.bg} border ${ac.border} ${ac.text} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <TrendArrow value={kpi.trend} inverse={inverse} size="sm" />
      </div>

      <div className="space-y-1">
        <div className={`text-2xl font-bold text-white number-mono count-up`}>
          {kpi.formatted}
        </div>
        <div className="text-sm text-slate-400 font-medium">{label}</div>
        {description && (
          <div className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-white/5 mt-2">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
