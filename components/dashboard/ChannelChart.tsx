"use client";

import { ChannelData } from "@/types/report";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: {dataKey: string; name: string; value: number}[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl p-3 shadow-glass-lg border border-white/10 text-xs space-y-1">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="text-slate-400">{p.name}</span>
          <span className="font-medium text-white number-mono">{p.value?.toLocaleString("pt-BR")}</span>
        </div>
      ))}
    </div>
  );
};

interface ChannelChartProps {
  channels: ChannelData[];
}

export default function ChannelChart({ channels }: ChannelChartProps) {
  const data = channels.map((c) => ({
    name: c.name.replace(" Ads", "").replace("oogle", "oogle"),
    Leads: c.leads,
    Vendas: c.sales,
    color: c.color,
    cpl: c.cpl,
    roas: c.roas,
    investment: c.investment,
  }));

  return (
    <GlassCard padding="lg" className="h-full">
      <SectionTitle
        title="Desempenho por Canal"
        subtitle="Leads e vendas gerados por plataforma"
      />
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", paddingTop: "12px" }}
            iconType="circle"
            iconSize={6}
          />
          <Bar dataKey="Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="Vendas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>

      {/* Channel efficiency table */}
      <div className="mt-4 space-y-2">
        {channels.map((c) => (
          <div key={c.name} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
            <span className="text-xs text-slate-400 flex-1 truncate">{c.name}</span>
            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <div className="text-white font-medium number-mono">R$ {c.cpl.toFixed(2).replace(".", ",")}</div>
                <div className="text-slate-600">CPL</div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium number-mono">{c.roas.toFixed(1)}x</div>
                <div className="text-slate-600">ROAS</div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-white font-medium number-mono">R$ {c.investment.toLocaleString("pt-BR")}</div>
                <div className="text-slate-600">Invest.</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
