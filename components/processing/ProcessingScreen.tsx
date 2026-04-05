"use client";

import { useEffect, useState } from "react";

interface Step {
  id: number;
  label: string;
  sublabel: string;
  duration: number;
}

const STEPS: Step[] = [
  { id: 1, label: "Lendo arquivos enviados", sublabel: "Identificando formato e estrutura dos dados", duration: 600 },
  { id: 2, label: "Mapeando métricas de marketing", sublabel: "Normalizando canais, campanhas e investimentos", duration: 700 },
  { id: 3, label: "Processando dados do CRM", sublabel: "Extraindo leads, oportunidades e vendas", duration: 800 },
  { id: 4, label: "Cruzando mídia com resultados comerciais", sublabel: "Calculando ROAS, CAC e eficiência por canal", duration: 900 },
  { id: 5, label: "Identificando padrões e anomalias", sublabel: "Detectando gargalos, oportunidades e alertas", duration: 700 },
  { id: 6, label: "Gerando insights automáticos", sublabel: "Criando narrativa executiva e tradução para leigos", duration: 600 },
  { id: 7, label: "Montando seu dashboard personalizado", sublabel: "Organizando visualizações e blocos analíticos", duration: 500 },
];

interface ProcessingScreenProps {
  onComplete: () => void;
}

export default function ProcessingScreen({ onComplete }: ProcessingScreenProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stepIndex = 0;
    let elapsed = 0;
    const totalDuration = STEPS.reduce((sum, s) => sum + s.duration, 0) + 400;

    const progressInterval = setInterval(() => {
      elapsed += 50;
      setProgress(Math.min((elapsed / totalDuration) * 100, 98));
    }, 50);

    const runNextStep = () => {
      if (stepIndex >= STEPS.length) {
        setProgress(100);
        clearInterval(progressInterval);
        setTimeout(onComplete, 500);
        return;
      }

      const step = STEPS[stepIndex];
      setCurrentStep(step.id);

      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, step.id]);
        stepIndex++;
        runNextStep();
      }, step.duration);
    };

    const startTimer = setTimeout(runNextStep, 300);

    return () => {
      clearTimeout(startTimer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen upload-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Orb */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full orb-pulse"
              style={{
                background: "radial-gradient(circle at 35% 35%, #60a5fa, #3b82f6 40%, #1d4ed8 70%, #0d1426)",
                boxShadow: "0 0 60px rgba(59, 130, 246, 0.5), 0 0 120px rgba(59, 130, 246, 0.2)",
              }}
            />
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/20 animate-ping" />
            <div className="absolute -inset-3 rounded-full border border-blue-500/10 animate-pulse" />
            {/* Rotating ring */}
            <svg
              className="absolute -inset-4 w-32 h-32 animate-spin"
              style={{ animationDuration: "8s" }}
              viewBox="0 0 128 128"
            >
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth="1"
                strokeDasharray="88 264"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Analisando seus relatórios</h1>
          <p className="text-slate-400 text-sm">A IA está lendo e interpretando seus dados. Isso leva apenas alguns segundos.</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Processamento</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                boxShadow: "0 0 8px rgba(59, 130, 246, 0.6)",
              }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isActive = currentStep === step.id;
            const isPending = step.id > currentStep && !isCompleted;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ${
                  isActive ? "bg-blue-500/8 border border-blue-500/20" : "border border-transparent"
                } ${isPending ? "opacity-30" : "opacity-100"}`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300">
                  {isCompleted ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : isActive ? (
                    <div className="w-7 h-7 rounded-full border-2 border-blue-400/40 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center">
                      <span className="text-xs text-slate-600 font-mono">{step.id}</span>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isCompleted ? "text-slate-300" : isActive ? "text-white" : "text-slate-500"
                  }`}>
                    {step.label}
                  </p>
                  {isActive && (
                    <p className="text-xs text-slate-500 mt-0.5">{step.sublabel}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          Nenhum dado é armazenado — a análise acontece diretamente no seu navegador.
        </p>
      </div>
    </div>
  );
}
