"use client";

import { FunnelStage } from "@/types/report";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";

interface FunnelChartProps {
  stages: FunnelStage[];
}

const ICONS: Record<string, JSX.Element> = {
  eye: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  cursor: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
    </svg>
  ),
  globe: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  star: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  "check-circle": (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  briefcase: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  trophy: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
};

export default function FunnelChart({ stages }: FunnelChartProps) {
  const maxVal = stages[0]?.value || 1;

  const isBottleneck = (stage: FunnelStage, index: number): boolean => {
    if (index === 0) return false;
    return stage.conversionRate < 40;
  };

  return (
    <GlassCard padding="lg">
      <SectionTitle
        title="Funil de Marketing e Vendas"
        subtitle="Do primeiro contato ao negócio fechado"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Visual funnel bars */}
        <div className="space-y-2">
          {stages.map((stage, i) => {
            const width = Math.max((stage.value / maxVal) * 100, 4);
            const bottleneck = isBottleneck(stage, i);

            return (
              <div key={stage.label} className="group">
                <div className="flex items-center gap-3 mb-1.5">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                  >
                    {ICONS[stage.icon] || null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-300">{stage.label}</span>
                      {bottleneck && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/20">
                          Gargalo
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-white number-mono">{stage.formatted}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-6 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${width}%`,
                        background: `linear-gradient(90deg, ${stage.color}cc, ${stage.color}66)`,
                      }}
                    />
                  </div>
                  {i > 0 && (
                    <div className={`text-xs font-medium w-12 text-right flex-shrink-0 ${
                      bottleneck ? "text-rose-400" : "text-slate-400"
                    }`}>
                      {stage.conversionRate.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversion rates detail */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Taxas de Conversão entre Etapas</h3>
          {stages.slice(1).map((stage, i) => {
            const prev = stages[i];
            const rate = stage.conversionRate;
            const bottleneck = rate < 40;
            const isStrong = rate >= 70;

            return (
              <div key={stage.label} className={`p-3 rounded-xl border transition-colors ${
                bottleneck
                  ? "bg-rose-500/5 border-rose-500/20"
                  : isStrong
                  ? "bg-emerald-500/5 border-emerald-500/15"
                  : "bg-white/[0.02] border-white/[0.06]"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">{prev.label}</span>
                    <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-slate-300 font-medium">{stage.label}</span>
                  </div>
                  <span className={`text-sm font-bold number-mono ${
                    bottleneck ? "text-rose-400" : isStrong ? "text-emerald-400" : "text-white"
                  }`}>
                    {rate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(rate, 100)}%`,
                      background: bottleneck ? "#f43f5e" : isStrong ? "#10b981" : "#3b82f6",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
