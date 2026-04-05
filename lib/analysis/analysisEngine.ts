import { ReportData } from "@/types/report";
import { MOCK_REPORT_DATA } from "./mockData";

export interface ParsedFileData {
  reporteiData?: Record<string, unknown>;
  crmData?: Record<string, unknown>;
}

/**
 * Core analysis engine.
 * In a real implementation, this would:
 * 1. Parse the uploaded files (CSV/XLSX/PDF)
 * 2. Extract and normalize metrics
 * 3. Cross-reference marketing + CRM data
 * 4. Call an AI API for insight generation
 * 5. Return a fully populated ReportData object
 *
 * For this demo, we simulate intelligent analysis by returning
 * realistic mock data that demonstrates the full dashboard experience.
 */
export async function analyzeReports(
  reporteiFile: File | null,
  crmFile: File | null
): Promise<ReportData> {
  // Simulate async processing time
  await new Promise((resolve) => setTimeout(resolve, 200));

  const data: ReportData = {
    ...MOCK_REPORT_DATA,
    meta: {
      ...MOCK_REPORT_DATA.meta,
      generatedAt: new Date().toISOString(),
      clientName: extractClientName(reporteiFile, crmFile),
      dataSource: {
        reportei: reporteiFile !== null,
        crm: crmFile !== null,
      },
    },
  };

  return data;
}

function extractClientName(reporteiFile: File | null, crmFile: File | null): string {
  const file = reporteiFile || crmFile;
  if (!file) return "Empresa Demonstração";

  const name = file.name
    .replace(/\.(csv|xlsx|xls|pdf|png|jpg|jpeg)$/i, "")
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 3)
    .join(" ");

  return name || "Empresa Demonstração";
}
