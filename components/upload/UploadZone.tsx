"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface UploadZoneProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  acceptedFormats: string;
  accept: Record<string, string[]>;
  file: File | null;
  onFileChange: (file: File | null) => void;
  accentColor?: "blue" | "violet";
}

export default function UploadZone({
  label,
  description,
  icon,
  acceptedFormats,
  accept,
  file,
  onFileChange,
  accentColor = "blue",
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]);
      }
      setIsDragging(false);
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const accentRing = accentColor === "blue" ? "ring-blue-500/60" : "ring-violet-500/60";
  const accentBorder = accentColor === "blue" ? "border-blue-500/40" : "border-violet-500/40";
  const accentBg = accentColor === "blue" ? "bg-blue-500/5" : "bg-violet-500/5";
  const accentIconBg = accentColor === "blue" ? "bg-blue-500/10 text-blue-400" : "bg-violet-500/10 text-violet-400";
  const accentDash = accentColor === "blue"
    ? "border-dashed border-blue-500/25 hover:border-blue-500/50"
    : "border-dashed border-violet-500/25 hover:border-violet-500/50";

  if (file) {
    return (
      <div className={`relative rounded-2xl border ${accentBorder} ${accentBg} p-5 transition-all duration-300`}>
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-xl ${accentIconBg} flex-shrink-0`}>{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm font-semibold text-white truncate">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">
              {(file.size / 1024).toFixed(0)} KB · {file.type || "arquivo"}
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
              }}
              className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 text-center group
        ${isDragging
          ? `ring-2 ${accentRing} ring-offset-0 ring-offset-transparent ${accentBorder} ${accentBg}`
          : `bg-white/[0.02] ${accentDash} hover:bg-white/[0.04]`
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className={`p-3 rounded-xl ${accentIconBg} transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>
        <div className="mt-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-xs text-slate-500 font-medium">
          {isDragging ? "Solte aqui →" : "Arraste ou clique para escolher"}
        </div>
        <p className="text-xs text-slate-600">{acceptedFormats}</p>
      </div>
    </div>
  );
}
