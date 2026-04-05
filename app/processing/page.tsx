"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useReport } from "@/lib/store/reportStore";
import { analyzeReports } from "@/lib/analysis/analysisEngine";
import ProcessingScreen from "@/components/processing/ProcessingScreen";

export default function ProcessingPage() {
  const router = useRouter();
  const { state, setReportData, setProcessing } = useReport();

  const handleComplete = useCallback(async () => {
    try {
      const data = await analyzeReports(state.files.reportei, state.files.crm);
      setReportData(data);
      setProcessing(false);
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      router.push("/");
    }
  }, [state.files, setReportData, setProcessing, router]);

  // Guard: redirect if no files and not already processing
  useEffect(() => {
    if (!state.isProcessing && !state.files.reportei && !state.files.crm && !state.reportData) {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ProcessingScreen onComplete={handleComplete} />;
}
