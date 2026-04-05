"use client";

import { CampaignRow } from "@/types/report";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";
import Badge from "@/components/ui/Badge";

interface CampaignsTableProps {
  campaigns: CampaignRow[];
}

const channelColors: Record<string, string> = {
  "Google Ads": "#3b82f6",
  "Meta Ads": "#8b5cf6",
  "LinkedIn Ads": "#06b6d4",
  "TikTok Ads": "#10b981",
};

export default function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const sorted = [...campaigns].sort((a, b) => b.roas - a.roas);

  return (
    <GlassCard padding="lg">
      <SectionTitle
        title="Campanhas em Destaque"
        subtitle="Desempenho individual por campanha, ordenado por ROAS"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Campanha", "Canal", "Investimento", "Leads", "CPL", "Vendas", "ROAS", "Status"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-3 first:pl-0 last:pr-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {sorted.map((c, i) => (
              <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="py-3 pl-0 pr-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-slate-600 w-4 font-mono">#{i + 1}</span>
                    <span className="text-white font-medium text-xs truncate max-w-[180px]">{c.name}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: channelColors[c.channel] || "#94a3b8" }}
                    />
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {c.channel.replace(" Ads", "")}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-xs text-slate-300 number-mono">
                  R$ {c.investment.toLocaleString("pt-BR")}
                </td>
                <td className="py-3 px-3 text-xs text-white font-semibold number-mono">{c.leads}</td>
                <td className="py-3 px-3 text-xs text-slate-300 number-mono">
                  R$ {c.cpl.toFixed(2).replace(".", ",")}
                </td>
                <td className="py-3 px-3 text-xs text-white font-semibold number-mono">{c.sales}</td>
                <td className="py-3 px-3">
                  <span className={`text-xs font-bold number-mono ${c.roas >= 8 ? "text-emerald-400" : c.roas >= 6 ? "text-blue-400" : "text-amber-400"}`}>
                    {c.roas.toFixed(1)}x
                  </span>
                </td>
                <td className="py-3 px-3 pr-0">
                  <Badge type="status" label={c.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/[0.06]">
        {[
          { label: "Escalar", color: "text-emerald-400 bg-emerald-500/10", desc: "Performance excelente, aumentar orçamento" },
          { label: "Ok", color: "text-blue-400 bg-blue-500/10", desc: "Rodando bem, manter" },
          { label: "Monitorar", color: "text-amber-400 bg-amber-500/10", desc: "Atenção necessária" },
          { label: "Pausar", color: "text-rose-400 bg-rose-500/10", desc: "Ineficiente, pausar" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
            <span className="text-slate-600">{s.desc}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
