"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { ReportData, UploadedFiles, Insight } from "@/types/report";

interface ReportState {
  files: UploadedFiles;
  reportData: ReportData | null;
  isProcessing: boolean;
  editedInsights: Record<string, { executiveText: string; laymanText: string }>;
  hiddenSections: Set<string>;
}

type Action =
  | { type: "SET_FILES"; payload: Partial<UploadedFiles> }
  | { type: "SET_REPORT_DATA"; payload: ReportData }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "UPDATE_INSIGHT"; payload: { id: string; executiveText?: string; laymanText?: string } }
  | { type: "TOGGLE_SECTION"; payload: string }
  | { type: "RESET" };

const initialState: ReportState = {
  files: { reportei: null, crm: null },
  reportData: null,
  isProcessing: false,
  editedInsights: {},
  hiddenSections: new Set(),
};

function reportReducer(state: ReportState, action: Action): ReportState {
  switch (action.type) {
    case "SET_FILES":
      return { ...state, files: { ...state.files, ...action.payload } };
    case "SET_REPORT_DATA":
      return { ...state, reportData: action.payload };
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };
    case "UPDATE_INSIGHT":
      return {
        ...state,
        editedInsights: {
          ...state.editedInsights,
          [action.payload.id]: {
            ...state.editedInsights[action.payload.id],
            ...(action.payload.executiveText !== undefined && { executiveText: action.payload.executiveText }),
            ...(action.payload.laymanText !== undefined && { laymanText: action.payload.laymanText }),
          },
        },
      };
    case "TOGGLE_SECTION": {
      const next = new Set(state.hiddenSections);
      if (next.has(action.payload)) next.delete(action.payload);
      else next.add(action.payload);
      return { ...state, hiddenSections: next };
    }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface ReportContextType {
  state: ReportState;
  setFiles: (files: Partial<UploadedFiles>) => void;
  setReportData: (data: ReportData) => void;
  setProcessing: (val: boolean) => void;
  updateInsight: (id: string, executiveText?: string, laymanText?: string) => void;
  toggleSection: (id: string) => void;
  reset: () => void;
  getInsightText: (insight: Insight) => { executiveText: string; laymanText: string };
}

const ReportContext = createContext<ReportContextType | null>(null);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reportReducer, initialState);

  const setFiles = (files: Partial<UploadedFiles>) => dispatch({ type: "SET_FILES", payload: files });
  const setReportData = (data: ReportData) => dispatch({ type: "SET_REPORT_DATA", payload: data });
  const setProcessing = (val: boolean) => dispatch({ type: "SET_PROCESSING", payload: val });
  const updateInsight = (id: string, executiveText?: string, laymanText?: string) =>
    dispatch({ type: "UPDATE_INSIGHT", payload: { id, executiveText, laymanText } });
  const toggleSection = (id: string) => dispatch({ type: "TOGGLE_SECTION", payload: id });
  const reset = () => dispatch({ type: "RESET" });

  const getInsightText = (insight: Insight) => ({
    executiveText: state.editedInsights[insight.id]?.executiveText ?? insight.executiveText,
    laymanText: state.editedInsights[insight.id]?.laymanText ?? insight.laymanText,
  });

  return React.createElement(
    ReportContext.Provider,
    { value: { state, setFiles, setReportData, setProcessing, updateInsight, toggleSection, reset, getInsightText } },
    children
  );
}

export function useReport() {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReport must be used inside <ReportProvider>");
  return ctx;
}
