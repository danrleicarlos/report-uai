"use client";

import { ReportData } from "@/types/report";
import GlassCard from "@/components/ui/GlassCard";

interface ExecutiveSummaryProps {
  data: ReportData;
}

export default function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  const { kpis, meta, insights } = data;

  const positiveInsights = insights.filter((i) => i.type === "positive" || i.type === "opportunity");
  const negativeInsights = insights.filter((i) => i.type === "alert" || i.type === "attention");

  return (
    <GlassCard padding="lg" variant="strong" className="relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 100% 0%, #3b82f6 0%, transparent 70%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Resumo Executivo</h2>
            <p className="text-xs text-slate-400">{meta.period} · Visão geral do desempenho</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main narrative */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-sm text-slate-300 leading-relaxed">
              Em <span className="text-white font-medium">{meta.period}</span>, a operação de marketing digital
              gerou <span className="text-white font-semibold number-mono">{kpis.totalLeads.formatted} leads</span> com
              investimento total de <span className="text-white font-semibold number-mono">{kpis.totalInvestment.formatted}</span>,
              resultando em um custo por lead médio de{" "}
              <span className={`font-semibold number-mono ${kpis.costPerLead.trend < 0 ? "text-emerald-400" : "text-amber-400"}`}>
                {kpis.costPerLead.formatted}
              </span>{" "}
              ({kpis.costPerLead.trend > 0 ? "+" : ""}{kpis.costPerLead.trend}% vs {meta.comparisonPeriod}).
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Foram fechadas <span className="text-white font-semibold number-mono">{kpis.totalSales.formatted} vendas</span>,
              gerando <span className="text-emerald-400 font-semibold number-mono">{kpis.revenue.formatted}</span> em receita
              com ROAS de <span className="text-emerald-400 font-bold number-mono">{kpis.roas.formatted}</span>.
              O resultado representa crescimento de <span className="text-emerald-400 font-medium">+{kpis.revenue.trend}%</span> na
              receita em relação ao período anterior.
            </p>

            {/* Highlights list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              {positiveInsights.slice(0, 2).map((ins) => (
                <div key={ins.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-xs text-emerald-300 leading-snug">{ins.title}</p>
                </div>
              ))}
              {negativeInsights.slice(0, 2).map((ins) => (
                <div key={ins.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/15">
                  <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  </div>
                  <p className="text-xs text-rose-300 leading-snug">{ins.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Destaques do período</h3>
            {[
              {
                label: "Melhor canal (ROAS)",
                value: "Google Ads · 9,2x",
                positive: true,
              },
              {
                label: "Canal com maior volume",
                value: "Meta Ads · 654 leads",
                positive: true,
              },
              {
                label: "Principal gargalo",
                value: "SQL → Oport. (63,4%)",
                positive: false,
              },
              {
                label: "Redução de CPL",
                value: `${Math.abs(kpis.costPerLead.trend)}% vs mês anterior`,
                positive: kpis.costPerLead.trend < 0,
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <span className="text-xs text-slate-500 leading-snug flex-1">{item.label}</span>
                <span className={`text-xs font-semibold text-right flex-shrink-0 ${item.positive ? "text-emerald-400" : "text-amber-400"}`}>
                  {item.value}
                </span>
              </div>
            ))}

            <div className="pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-slate-400">
                  Dados extraídos de <strong className="text-white">2 fontes</strong> · Análise automática por IA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
