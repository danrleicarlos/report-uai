"use client";

import { ChannelData } from "@/types/report";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip,
} from "recharts";

interface ChannelRadarProps {
  channels: ChannelData[];
}

export default function ChannelRadarChart({ channels }: ChannelRadarProps) {
  // Normalize each metric to 0-100 scale
  const maxLeads = Math.max(...channels.map((c) => c.leads));
  const maxRoas = Math.max(...channels.map((c) => c.roas));
  const maxCtr = Math.max(...channels.map((c) => c.ctr));
  const minCpl = Math.min(...channels.map((c) => c.cpl));
  const maxSales = Math.max(...channels.map((c) => c.sales));

  const radarData = [
    { metric: "Volume Leads", ...Object.fromEntries(channels.map((c) => [c.name, (c.leads / maxLeads) * 100])) },
    { metric: "ROAS", ...Object.fromEntries(channels.map((c) => [c.name, (c.roas / maxRoas) * 100])) },
    { metric: "CTR", ...Object.fromEntries(channels.map((c) => [c.name, (c.ctr / maxCtr) * 100])) },
    { metric: "Efic. CPL", ...Object.fromEntries(channels.map((c) => [c.name, (minCpl / c.cpl) * 100])) },
    { metric: "Vendas", ...Object.fromEntries(channels.map((c) => [c.name, (c.sales / maxSales) * 100])) },
  ];

  return (
    <GlassCard padding="lg" className="h-full">
      <SectionTitle title="Perfil de Eficiência" subtitle="Comparação multidimensional entre canais" />
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
          />
          <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
          {channels.map((c) => (
            <Radar
              key={c.name}
              name={c.name}
              dataKey={c.name}
              stroke={c.color}
              fill={c.color}
              fillOpacity={0.08}
              strokeWidth={1.5}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", paddingTop: "8px" }}
            iconType="circle"
            iconSize={6}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(13,20,38,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              fontSize: "11px",
            }}
            formatter={(v) => [`${Number(v).toFixed(0)}`, ""]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
