"use client";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function SectionTitle({ title, subtitle, action }: SectionTitleProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-3">
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-violet-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold text-white leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
