"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useReport } from "@/lib/store/reportStore";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ExecutiveSummary from "@/components/dashboard/ExecutiveSummary";
import KPIGrid from "@/components/dashboard/KPIGrid";
import TimeSeriesChart from "@/components/dashboard/TimeSeriesChart";
import ChannelChart from "@/components/dashboard/ChannelChart";
import ChannelRadarChart from "@/components/dashboard/ChannelRadarChart";
import FunnelChart from "@/components/dashboard/FunnelChart";
import CampaignsTable from "@/components/dashboard/CampaignsTable";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import { exportDashboardToPDF } from "@/lib/export/pdfExporter";

export default function DashboardPage() {
  const router = useRouter();
  const { state, updateInsight, getInsightText } = useReport();
  const [isExporting, setIsExporting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Allow demo: if no data, use mock — don't hard redirect
    // In production you'd redirect to / if !state.reportData
  }, []);

  const data = state.reportData;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportDashboardToPDF("dashboard-export", `relatorio-${data?.meta.period.replace(" ", "-").toLowerCase() || "uai"}.pdf`);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  if (!mounted || !data) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500/40 border-t-blue-400 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Carregando dashboard...</p>
          <button onClick={() => router.push("/")} className="text-xs text-slate-600 hover:text-slate-400 transition-colors mt-2">
            Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-bg">
      <DashboardHeader
        meta={data.meta}
        onExport={handleExport}
        isExporting={isExporting}
        onBack={handleBack}
      />

      <div id="dashboard-export" className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {/* 1. Executive Summary */}
        <ExecutiveSummary data={data} />

        {/* 2. KPI Grid */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-400 to-violet-500" />
            <h2 className="text-base font-semibold text-white">Principais Indicadores</h2>
            <span className="text-xs text-slate-500">vs {data.meta.comparisonPeriod}</span>
          </div>
          <KPIGrid kpis={data.kpis} />
        </section>

        {/* 3. Time Series + Channel Chart */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-400 to-violet-500" />
            <h2 className="text-base font-semibold text-white">Performance no Período</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3">
              <TimeSeriesChart data={data.charts.timeSeries} />
            </div>
            <div className="lg:col-span-2">
              <ChannelChart channels={data.charts.channelComparison} />
            </div>
          </div>
        </section>

        {/* 4. Funnel */}
        <section>
          <div className="flex items-center justify-between mb-0">
            <div />
            <button
              onClick={() => router.push("/conversao")}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors mb-3"
            >
              Ver análise de conversão completa
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <FunnelChart stages={data.charts.funnelStages} />
        </section>

        {/* 5. Channel Radar + Campaigns */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-400 to-violet-500" />
            <h2 className="text-base font-semibold text-white">Análise por Canal e Campanha</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
            <div className="lg:col-span-2">
              <ChannelRadarChart channels={data.charts.channelComparison} />
            </div>
            <div className="lg:col-span-3">
              <InvestmentBreakdown channels={data.charts.channelComparison} />
            </div>
          </div>
          <CampaignsTable campaigns={data.charts.campaigns} />
        </section>

        {/* 6. Insights */}
        <section>
          <InsightsPanel
            insights={data.insights}
            getInsightText={getInsightText}
            onUpdateExecutive={(id, text) => updateInsight(id, text, undefined)}
            onUpdateLayman={(id, text) => updateInsight(id, undefined, text)}
          />
        </section>

        {/* 7. Footer */}
        <footer className="border-t border-white/[0.05] pt-6 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-white">Report UAI</span>
              <span className="text-xs text-slate-500 ml-2">· {data.meta.period} · {data.meta.clientName}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-600">
              Gerado em {new Date(data.meta.generatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <button onClick={handleExport} disabled={isExporting} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar PDF
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Inline component for investment breakdown
function InvestmentBreakdown({ channels }: { channels: import("@/types/report").ChannelData[] }) {
  const total = channels.reduce((s, c) => s + c.investment, 0);

  return (
    <div className="glass rounded-2xl p-6 h-full shadow-glass">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-violet-500 flex-shrink-0" />
        <div>
          <h2 className="text-base font-semibold text-white">Distribuição de Investimento</h2>
          <p className="text-sm text-slate-400 mt-0.5">Alocação por canal e eficiência</p>
        </div>
      </div>

      <div className="space-y-4">
        {channels.map((c) => {
          const pct = (c.investment / total) * 100;
          return (
            <div key={c.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-sm text-white font-medium">{c.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400 number-mono">R$ {c.investment.toLocaleString("pt-BR")}</span>
                  <span className="text-slate-600 number-mono">{pct.toFixed(0)}%</span>
                </div>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: c.color, opacity: 0.7 }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-slate-600">
                <span>{c.leads} leads · ROAS {c.roas.toFixed(1)}x</span>
                <span>CPL R$ {c.cpl.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-white/[0.06] flex justify-between items-center">
        <span className="text-xs text-slate-500">Total investido</span>
        <span className="text-sm font-bold text-white number-mono">R$ {total.toLocaleString("pt-BR")}</span>
      </div>
    </div>
  );
}
