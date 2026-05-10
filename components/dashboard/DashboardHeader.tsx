"use client";

import { useRouter } from "next/navigation";
import { ReportMeta } from "@/types/report";

interface DashboardHeaderProps {
  meta: ReportMeta;
  onExport: () => void;
  isExporting: boolean;
  onBack: () => void;
}

export default function DashboardHeader({ meta, onExport, isExporting, onBack }: DashboardHeaderProps) {
  const router = useRouter();

  const formattedDate = new Date(meta.generatedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
        {/* Left: Logo + Period */}
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Novo relatório
          </button>

          <div className="w-px h-5 bg-white/10" />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Report UAI</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-sm text-slate-400">{meta.clientName}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">Período:</span>
                <span className="text-xs font-medium text-blue-400">{meta.period}</span>
                <span className="text-xs text-slate-600">vs {meta.comparisonPeriod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/conversao")}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all duration-200 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/[0.13]"
          >
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Análise de Conversão
          </button>

          <div className="hidden md:flex items-center gap-2">
            {meta.dataSource.reportei && (
              <span className="text-xs px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Reportei
              </span>
            )}
            {meta.dataSource.crm && (
              <span className="text-xs px-2 py-1 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                CRM
              </span>
            )}
          </div>

          <p className="hidden md:block text-xs text-slate-600">Gerado em {formattedDate}</p>

          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-300 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              boxShadow: "0 0 0 1px rgba(59,130,246,0.4), 0 4px 12px rgba(37,99,235,0.3)",
            }}
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar PDF
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
