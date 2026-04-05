"use client";

import { useState } from "react";
import { Insight } from "@/types/report";
import Badge from "@/components/ui/Badge";
import TrendArrow from "@/components/ui/TrendArrow";

interface InsightCardProps {
  insight: Insight;
  executiveText: string;
  laymanText: string;
  onUpdateExecutive: (text: string) => void;
  onUpdateLayman: (text: string) => void;
}

const typeConfig = {
  positive: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
    accent: "bg-emerald-400",
    iconBg: "bg-emerald-500/15 text-emerald-400",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  opportunity: {
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    accent: "bg-blue-400",
    iconBg: "bg-blue-500/15 text-blue-400",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  alert: {
    border: "border-rose-500/20",
    bg: "bg-rose-500/5",
    accent: "bg-rose-400",
    iconBg: "bg-rose-500/15 text-rose-400",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  attention: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    accent: "bg-amber-400",
    iconBg: "bg-amber-500/15 text-amber-400",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
};

export default function InsightCard({ insight, executiveText, laymanText, onUpdateExecutive, onUpdateLayman }: InsightCardProps) {
  const [editing, setEditing] = useState<"exec" | "layman" | null>(null);
  const [tempExec, setTempExec] = useState(executiveText);
  const [tempLayman, setTempLayman] = useState(laymanText);
  const [view, setView] = useState<"executive" | "layman">("executive");

  const cfg = typeConfig[insight.type];

  const handleSave = () => {
    if (editing === "exec") onUpdateExecutive(tempExec);
    if (editing === "layman") onUpdateLayman(tempLayman);
    setEditing(null);
  };

  const handleCancel = () => {
    setTempExec(executiveText);
    setTempLayman(laymanText);
    setEditing(null);
  };

  return (
    <div className={`insight-card border ${cfg.border} ${cfg.bg} group`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-2 rounded-xl flex-shrink-0 ${cfg.iconBg}`}>{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <Badge type={insight.type} size="sm" />
            {insight.metricValue && insight.metricTrend !== undefined && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">{insight.metric}:</span>
                <span className="text-xs font-bold text-white number-mono">{insight.metricValue}</span>
                <TrendArrow
                  value={insight.metricTrend}
                  inverse={["alert", "attention"].includes(insight.type) && insight.metricTrend > 0}
                  size="sm"
                />
              </div>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white leading-snug">{insight.title}</h3>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 mb-3 p-1 rounded-xl bg-white/[0.04] w-fit">
        <button
          onClick={() => setView("executive")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            view === "executive"
              ? "bg-white/10 text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Executivo
        </button>
        <button
          onClick={() => setView("layman")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            view === "layman"
              ? "bg-white/10 text-white"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Simplificado
        </button>
      </div>

      {/* Content */}
      <div className="relative">
        {view === "executive" ? (
          editing === "exec" ? (
            <div className="space-y-2">
              <textarea
                value={tempExec}
                onChange={(e) => setTempExec(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-3 text-sm text-slate-200 leading-relaxed resize-none focus:outline-none focus:border-white/20"
                rows={4}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                  Salvar
                </button>
                <button onClick={handleCancel} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="relative group/text">
              <p className="text-sm text-slate-300 leading-relaxed">{executiveText}</p>
              <button
                onClick={() => { setTempExec(executiveText); setEditing("exec"); }}
                className="absolute -top-1 -right-1 opacity-0 group-hover/text:opacity-100 transition-opacity p-1 rounded-lg bg-white/5 hover:bg-white/10"
                title="Editar insight"
              >
                <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          )
        ) : editing === "layman" ? (
          <div className="space-y-2">
            <textarea
              value={tempLayman}
              onChange={(e) => setTempLayman(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-3 text-sm text-slate-200 leading-relaxed resize-none focus:outline-none focus:border-white/20"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                Salvar
              </button>
              <button onClick={handleCancel} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group/text">
            <div className="flex items-center gap-1.5 mb-2">
              <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs text-cyan-400 font-medium">Explicação simplificada</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{laymanText}</p>
            <button
              onClick={() => { setTempLayman(laymanText); setEditing("layman"); }}
              className="absolute -top-1 -right-1 opacity-0 group-hover/text:opacity-100 transition-opacity p-1 rounded-lg bg-white/5 hover:bg-white/10"
              title="Editar explicação"
            >
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
