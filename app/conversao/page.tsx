"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useReport } from "@/lib/store/reportStore";
import { MOCK_REPORT_DATA } from "@/lib/analysis/mockData";
import { ReportData, FunnelStage, ChannelData } from "@/types/report";
import GlassCard from "@/components/ui/GlassCard";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function fmtShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString("pt-BR");
}

function rateColor(rate: number, idx: number): string {
  if (idx === 0) return "text-white";
  if (rate >= 60) return "text-emerald-400";
  if (rate >= 35) return "text-amber-400";
  return "text-rose-400";
}

function rateLabel(rate: number, idx: number): { label: string; cls: string } {
  if (idx === 0) return { label: "Topo", cls: "bg-blue-500/15 text-blue-300 border-blue-500/25" };
  if (rate >= 60) return { label: "Ótimo", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" };
  if (rate >= 35) return { label: "Ok", cls: "bg-amber-500/15 text-amber-300 border-amber-500/25" };
  return { label: "Gargalo", cls: "bg-rose-500/15 text-rose-300 border-rose-500/25" };
}

/* ─── stage icons ──────────────────────────────────────────────────────────── */

const STAGE_ICONS: Record<string, JSX.Element> = {
  eye: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  cursor: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
    </svg>
  ),
  globe: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  star: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  "check-circle": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  briefcase: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  trophy: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
};

/* ─── sub-components ───────────────────────────────────────────────────────── */

function SummaryMetricCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: JSX.Element;
}) {
  return (
    <GlassCard padding="lg" hover className="flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-white number-mono">{value}</div>
        <div className="text-sm font-medium text-slate-300 mt-0.5">{label}</div>
        <div className="text-xs text-slate-500 mt-1">{sub}</div>
      </div>
    </GlassCard>
  );
}

function DropArrow({ pct, bottleneck }: { pct: number; bottleneck: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <svg
        className={`w-4 h-4 ${bottleneck ? "text-rose-400" : "text-slate-600"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      <span className={`text-[10px] font-semibold number-mono ${bottleneck ? "text-rose-400" : "text-slate-500"}`}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

function FunnelBar({ stage, maxVal, index }: { stage: FunnelStage; maxVal: number; index: number }) {
  const widthPct = Math.max((stage.value / maxVal) * 100, 3);
  const status = rateLabel(stage.conversionRate, index);

  return (
    <div className="flex items-center gap-4 group">
      {/* Icon + label */}
      <div className="w-36 flex-shrink-0 flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${stage.color}22`, color: stage.color }}
        >
          {STAGE_ICONS[stage.icon] || null}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-200 truncate">{stage.label}</div>
          <div className="text-[10px] text-slate-600 truncate">{stage.sublabel}</div>
        </div>
      </div>

      {/* Bar */}
      <div className="flex-1 h-8 bg-white/[0.03] rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-3"
          style={{
            width: `${widthPct}%`,
            background: `linear-gradient(90deg, ${stage.color}cc 0%, ${stage.color}88 100%)`,
          }}
        >
          {widthPct > 18 && (
            <span className="text-[10px] font-bold text-white/80 number-mono">
              {fmtShort(stage.value)}
            </span>
          )}
        </div>
        {widthPct <= 18 && (
          <span className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/80 number-mono whitespace-nowrap">
            {fmtShort(stage.value)}
          </span>
        )}
      </div>

      {/* Status badge */}
      <div className="w-16 flex-shrink-0 text-right">
        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${status.cls}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
}

function StageTransitionCard({
  from,
  to,
  rate,
  dropped,
  index,
}: {
  from: FunnelStage;
  to: FunnelStage;
  rate: number;
  dropped: number;
  index: number;
}) {
  const bottleneck = rate < 35;
  const isStrong = rate >= 60;

  const borderCls = bottleneck
    ? "border-rose-500/25 bg-rose-500/5"
    : isStrong
    ? "border-emerald-500/20 bg-emerald-500/5"
    : "border-white/[0.06] bg-white/[0.02]";

  const rateCls = bottleneck ? "text-rose-400" : isStrong ? "text-emerald-400" : "text-amber-400";

  return (
    <div className={`rounded-2xl border p-4 ${borderCls} transition-colors`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-300">{from.label}</span>
          <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-white">{to.label}</span>
        </div>
        {bottleneck && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold">
            Gargalo
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <span className={`text-3xl font-bold number-mono ${rateCls}`}>{rate.toFixed(1)}%</span>
          <span className="text-xs text-slate-500 ml-1">taxa</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">perdidos</div>
          <div className="text-sm font-semibold text-slate-300 number-mono">{fmtShort(dropped)}</div>
        </div>
      </div>

      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(rate, 100)}%`,
            background: bottleneck ? "#f43f5e" : isStrong ? "#10b981" : "#f59e0b",
          }}
        />
      </div>
    </div>
  );
}

function ChannelConversionRow({ ch, maxLeads }: { ch: ChannelData; maxLeads: number }) {
  const leadToMql = ch.mqls > 0 ? (ch.mqls / ch.leads) * 100 : 0;
  const mqlToSql = ch.sqls > 0 && ch.mqls > 0 ? (ch.sqls / ch.mqls) * 100 : 0;
  const sqlToSale = ch.sales > 0 && ch.sqls > 0 ? (ch.sales / ch.sqls) * 100 : 0;
  const overallConv = ch.sales > 0 && ch.leads > 0 ? (ch.sales / ch.leads) * 100 : 0;

  const rates = [leadToMql, mqlToSql, sqlToSale, overallConv];

  return (
    <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ch.color }} />
          <span className="text-sm font-medium text-white">{ch.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <span className="text-sm font-semibold text-slate-200 number-mono">{ch.leads.toLocaleString("pt-BR")}</span>
      </td>
      {rates.map((r, i) => (
        <td key={i} className="py-3 px-4 text-right">
          <span
            className={`text-sm font-bold number-mono ${
              r >= 60 ? "text-emerald-400" : r >= 35 ? "text-amber-400" : "text-rose-400"
            }`}
          >
            {r.toFixed(1)}%
          </span>
        </td>
      ))}
      <td className="py-3 px-4 text-right">
        <span className="text-sm font-semibold text-white number-mono">{ch.roas.toFixed(1)}x</span>
      </td>
    </tr>
  );
}

/* ─── page ─────────────────────────────────────────────────────────────────── */

export default function ConversaoPage() {
  const router = useRouter();
  const { state } = useReport();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data: ReportData = state.reportData ?? MOCK_REPORT_DATA;
  const { kpis, charts, meta } = data;
  const stages = charts.funnelStages;
  const channels = charts.channelComparison;
  const maxVal = stages[0]?.value ?? 1;
  const maxLeads = Math.max(...channels.map((c) => c.leads));

  const overallConvRate = ((stages[stages.length - 1].value / stages[0].value) * 100).toFixed(4);
  const leadToMql = ((stages[4].value / stages[3].value) * 100).toFixed(1);
  const mqlToSql = ((stages[5].value / stages[4].value) * 100).toFixed(1);
  const sqlToSale = ((stages[7].value / stages[5].value) * 100).toFixed(1);

  const bottleneckStages = stages
    .slice(1)
    .filter((s) => s.conversionRate < 35)
    .map((s) => s.label);

  if (!mounted) return null;

  return (
    <div className="min-h-screen dashboard-bg">
      {/* ── nav ── */}
      <nav className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#080d1a]/80 backdrop-blur-xl">
        <div className="max-w-[1300px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </button>
            <span className="text-white/20">/</span>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
              >
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm">Análise de Conversão</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{meta.period}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              High Level
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-[1300px] mx-auto px-6 py-8 space-y-8">
        {/* ── hero title ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {meta.clientName} · {meta.period}
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight">
              Funil de{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #60a5fa 0%, #06b6d4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Conversão
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Visão completa do caminho percorrido desde a primeira impressão até o fechamento de vendas.
            </p>
          </div>

          {bottleneckStages.length > 0 && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-rose-500/8 border border-rose-500/20 max-w-xs">
              <svg className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-rose-300">Gargalos detectados</p>
                <p className="text-[11px] text-rose-400/70 mt-0.5">{bottleneckStages.join(" · ")}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── summary metrics ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryMetricCard
            label="Conversão Geral"
            value={`${overallConvRate}%`}
            sub="Impressões → Vendas"
            color="bg-blue-500/15 text-blue-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <SummaryMetricCard
            label="Lead → MQL"
            value={`${leadToMql}%`}
            sub="Qualificação de marketing"
            color="bg-violet-500/15 text-violet-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
          />
          <SummaryMetricCard
            label="MQL → SQL"
            value={`${mqlToSql}%`}
            sub="Qualificação de vendas"
            color="bg-cyan-500/15 text-cyan-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <SummaryMetricCard
            label="SQL → Venda"
            value={`${sqlToSale}%`}
            sub="Taxa de fechamento"
            color="bg-emerald-500/15 text-emerald-400"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
          />
        </section>

        {/* ── funnel visualization ── */}
        <GlassCard padding="lg">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-cyan-500 flex-shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-white">Funil Completo</h2>
              <p className="text-sm text-slate-400 mt-0.5">Volume em cada etapa e taxa de conversão da etapa anterior</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {stages.map((stage, i) => (
              <div key={stage.label}>
                <FunnelBar stage={stage} maxVal={maxVal} index={i} />
                {i < stages.length - 1 && (
                  <DropArrow
                    pct={stages[i + 1].conversionRate}
                    bottleneck={stages[i + 1].conversionRate < 35}
                  />
                )}
              </div>
            ))}
          </div>

          {/* legend */}
          <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/[0.06]">
            {[
              { label: "Ótimo (≥60%)", cls: "bg-emerald-400" },
              { label: "Ok (35–60%)", cls: "bg-amber-400" },
              { label: "Gargalo (<35%)", cls: "bg-rose-400" },
            ].map(({ label, cls }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${cls}`} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* ── stage transition analysis ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-violet-400 to-blue-500" />
            <h2 className="text-base font-semibold text-white">Análise por Transição</h2>
            <span className="text-xs text-slate-500">Taxa de passagem entre cada etapa</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {stages.slice(1).map((to, i) => {
              const from = stages[i];
              const dropped = from.value - to.value;
              return (
                <StageTransitionCard
                  key={to.label}
                  from={from}
                  to={to}
                  rate={to.conversionRate}
                  dropped={dropped}
                  index={i + 1}
                />
              );
            })}
          </div>
        </section>

        {/* ── channel conversion table ── */}
        <GlassCard padding="none">
          <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
            <div className="flex items-start gap-3">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 flex-shrink-0" />
              <div>
                <h2 className="text-base font-semibold text-white">Conversão por Canal</h2>
                <p className="text-sm text-slate-400 mt-0.5">Performance de conversão em cada etapa por canal de mídia</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Canal", "Leads", "Lead→MQL", "MQL→SQL", "SQL→Venda", "Geral", "ROAS"].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-4 text-right first:text-left text-[10px] uppercase tracking-widest font-semibold text-slate-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {channels.map((ch) => (
                  <ChannelConversionRow key={ch.name} ch={ch} maxLeads={maxLeads} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-white/[0.04]">
            <p className="text-[11px] text-slate-600">
              Taxas calculadas com base nos dados do período · {meta.period} vs {meta.comparisonPeriod}
            </p>
          </div>
        </GlassCard>

        {/* ── conversion insights ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-amber-400 to-rose-500" />
            <h2 className="text-base font-semibold text-white">Oportunidades de Melhoria</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bottleneck */}
            {bottleneckStages.length > 0 && (
              <GlassCard padding="lg" className="border-rose-500/20">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Gargalos no Funil</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Etapas com taxa abaixo de 35%</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {stages.slice(1).filter((s) => s.conversionRate < 35).map((s) => (
                    <div key={s.label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{s.label}</span>
                      <span className="text-rose-400 font-bold number-mono">{s.conversionRate.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Best channel */}
            <GlassCard padding="lg" className="border-emerald-500/15">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Canal Mais Eficiente</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Maior ROAS e menor CPL</p>
                </div>
              </div>
              {(() => {
                const best = [...channels].sort((a, b) => b.roas - a.roas)[0];
                const convRate = best.leads > 0 ? ((best.sales / best.leads) * 100).toFixed(2) : "0";
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: best.color }} />
                      <span className="text-sm font-semibold text-white">{best.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { k: "ROAS", v: `${best.roas.toFixed(1)}x` },
                        { k: "CPL", v: `R$ ${best.cpl.toFixed(2)}` },
                        { k: "Leads", v: best.leads.toLocaleString("pt-BR") },
                        { k: "Lead→Venda", v: `${convRate}%` },
                      ].map(({ k, v }) => (
                        <div key={k} className="bg-white/[0.03] rounded-xl p-2.5">
                          <div className="text-[10px] text-slate-500">{k}</div>
                          <div className="text-xs font-bold text-white number-mono mt-0.5">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </GlassCard>

            {/* Revenue potential */}
            <GlassCard padding="lg" className="border-blue-500/15">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Potencial de Melhoria</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Impacto de otimizar os gargalos</p>
                </div>
              </div>
              {(() => {
                const sqlStage = stages[5];
                const oppStage = stages[6];
                const saleStage = stages[7];
                const avgTicket = kpis.revenue.value / kpis.totalSales.value;
                const potentialSqls = Math.round(sqlStage.value * 0.75);
                const potentialOpps = Math.round(potentialSqls * (oppStage.conversionRate / 100));
                const potentialSales = Math.round(potentialOpps * (saleStage.conversionRate / 100));
                const extraSales = potentialSales - saleStage.value;
                const extraRevenue = extraSales * avgTicket;

                return (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">
                      Otimizando SQL→Oportunidade de{" "}
                      <span className="text-rose-400 font-semibold">{oppStage.conversionRate.toFixed(0)}%</span> para{" "}
                      <span className="text-emerald-400 font-semibold">75%</span>:
                    </p>
                    <div className="space-y-2">
                      {[
                        { k: "Vendas extras", v: `+${extraSales}` },
                        {
                          k: "Receita potencial",
                          v: `R$ ${extraRevenue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
                        },
                        { k: "Ticket médio", v: `R$ ${avgTicket.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}` },
                      ].map(({ k, v }) => (
                        <div key={k} className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{k}</span>
                          <span className="text-white font-semibold number-mono">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </GlassCard>
          </div>
        </section>

        {/* ── footer ── */}
        <footer className="border-t border-white/[0.05] pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
            >
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-400">Report UAI · Análise de Conversão</span>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Ver dashboard completo
          </button>
        </footer>
      </main>
    </div>
  );
}
