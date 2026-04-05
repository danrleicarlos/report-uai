"use client";

import { TimeSeriesPoint } from "@/types/report";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: {dataKey: string; name: string; value: number; color: string}[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl p-3 shadow-glass-lg border border-white/10 text-xs space-y-1.5">
      <p className="font-semibold text-white">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-medium text-white number-mono">
            {p.dataKey === "revenue" ? `R$ ${p.value?.toLocaleString("pt-BR")}` : p.value?.toLocaleString("pt-BR")}
          </span>
        </div>
      ))}
    </div>
  );
};

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  return (
    <GlassCard padding="lg" className="h-full">
      <SectionTitle
        title="Evolução no Período"
        subtitle="Leads e receita ao longo do mês"
      />
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            yAxisId="leads"
            orientation="left"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <YAxis
            yAxisId="revenue"
            orientation="right"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={50}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", paddingTop: "10px" }}
            iconType="circle"
            iconSize={6}
          />
          <Area
            yAxisId="leads"
            type="monotone"
            dataKey="leads"
            name="Leads"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#leadsGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
          />
          <Area
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            name="Receita (R$)"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#revenueGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
