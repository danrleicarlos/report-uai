"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadZone from "@/components/upload/UploadZone";
import { useReport } from "@/lib/store/reportStore";

const REPORTEI_ACCEPT = {
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "application/pdf": [".pdf"],
};

const CRM_ACCEPT = {
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

const REPORTEI_ICON = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CRM_ICON = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function UploadPage() {
  const router = useRouter();
  const { state, setFiles, setProcessing } = useReport();
  const [isLoading, setIsLoading] = useState(false);

  const canAnalyze = state.files.reportei !== null || state.files.crm !== null;

  const handleLoadDemo = () => {
    const fakeReportei = new File(["demo"], "reportei-marco-2025.csv", { type: "text/csv" });
    const fakeCrm = new File(["demo"], "crm-leads-marco-2025.csv", { type: "text/csv" });
    setFiles({ reportei: fakeReportei, crm: fakeCrm });
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setProcessing(true);
    router.push("/processing");
  };

  return (
    <div className="min-h-screen upload-bg">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Report UAI</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
            Beta
          </span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-slate-400 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Análise por IA · Sem backend · Dados no seu navegador
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
            Transforme relatórios complexos{" "}
            <span className="text-gradient">em insights claros</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Envie seu relatório do Reportei e dados de CRM. Em segundos, a IA gera um dashboard visual
            completo com insights executivos e explicações para leigos.
          </p>
        </div>

        {/* Upload area */}
        <div className="glass rounded-3xl p-6 md:p-8 shadow-glass-lg mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-400">1</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Envie seus arquivos</h2>
              <p className="text-xs text-slate-400">Pelo menos um arquivo é necessário. Dois arquivos geram análise cruzada completa.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <UploadZone
              label="Relatório Reportei"
              description="Métricas de Google Ads, Meta Ads, LinkedIn, TikTok e Analytics"
              icon={REPORTEI_ICON}
              acceptedFormats="CSV, XLSX, PDF"
              accept={REPORTEI_ACCEPT}
              file={state.files.reportei}
              onFileChange={(f) => setFiles({ reportei: f })}
              accentColor="blue"
            />
            <UploadZone
              label="Dados de CRM"
              description="Leads, MQLs, SQLs, oportunidades, vendas e receita"
              icon={CRM_ICON}
              acceptedFormats="CSV, XLSX, PDF, PNG, JPG"
              accept={CRM_ACCEPT}
              file={state.files.crm}
              onFileChange={(f) => setFiles({ crm: f })}
              accentColor="violet"
            />
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze || isLoading}
              className="btn-primary w-full sm:w-auto text-center flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Iniciando análise...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {canAnalyze ? "Analisar Relatório" : "Envie pelo menos 1 arquivo"}
                </>
              )}
            </button>

            {!canAnalyze && (
              <button
                onClick={handleLoadDemo}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Ver com dados de demonstração
              </button>
            )}
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "Dashboard visual completo",
              desc: "KPIs, gráficos, funil de vendas e comparação entre canais gerados automaticamente",
              color: "text-blue-400 bg-blue-500/10",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
              title: "Insights em 2 idiomas",
              desc: "Cada insight em linguagem executiva e também traduzido para quem não é da área",
              color: "text-violet-400 bg-violet-500/10",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              ),
              title: "Exportação em PDF",
              desc: "Relatório bonito e pronto para enviar ao cliente, gestor ou time",
              color: "text-cyan-400 bg-cyan-500/10",
            },
          ].map((f, i) => (
            <div key={i} className="glass rounded-2xl p-5 flex items-start gap-3 hover:bg-white/[0.05] transition-colors group">
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${f.color} group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Formats supported */}
        <div className="text-center">
          <p className="text-xs text-slate-600 mb-3">Analisa dados de</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Google Ads", "Meta Ads", "Google Analytics 4", "LinkedIn Ads", "TikTok Ads", "CRM (qualquer formato)", "Reportei"].map((p) => (
              <span key={p} className="text-xs px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-slate-500">
                {p}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] mt-12 py-6 px-6 text-center">
        <p className="text-xs text-slate-700">
          Report UAI · Seus dados nunca saem do seu navegador · Processamento local
        </p>
      </footer>
    </div>
  );
}
