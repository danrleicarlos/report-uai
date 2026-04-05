"use client";

import { Insight } from "@/types/report";
import InsightCard from "./InsightCard";
import SectionTitle from "@/components/ui/SectionTitle";

interface InsightsPanelProps {
  insights: Insight[];
  getInsightText: (insight: Insight) => { executiveText: string; laymanText: string };
  onUpdateExecutive: (id: string, text: string) => void;
  onUpdateLayman: (id: string, text: string) => void;
}

export default function InsightsPanel({
  insights,
  getInsightText,
  onUpdateExecutive,
  onUpdateLayman,
}: InsightsPanelProps) {
  return (
    <div>
      <SectionTitle
        title="Insights Automáticos"
        subtitle="Análise gerada pela IA com base nos dados do período"
        action={
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white/[0.04] rounded-lg px-3 py-1.5 border border-white/[0.06]">
            <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Clique em um insight para editar
          </div>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => {
          const texts = getInsightText(insight);
          return (
            <InsightCard
              key={insight.id}
              insight={insight}
              executiveText={texts.executiveText}
              laymanText={texts.laymanText}
              onUpdateExecutive={(text) => onUpdateExecutive(insight.id, text)}
              onUpdateLayman={(text) => onUpdateLayman(insight.id, text)}
            />
          );
        })}
      </div>
    </div>
  );
}
