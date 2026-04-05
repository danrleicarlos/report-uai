export type InsightType = "positive" | "alert" | "attention" | "opportunity";

export interface KPIValue {
  value: number;
  formatted: string;
  trend: number;
  trendDirection: "up" | "down" | "neutral";
}

export interface ChannelData {
  name: string;
  color: string;
  investment: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  sessions: number;
  leads: number;
  cpl: number;
  mqls: number;
  sqls: number;
  sales: number;
  revenue: number;
  roas: number;
}

export interface FunnelStage {
  label: string;
  sublabel: string;
  value: number;
  formatted: string;
  conversionRate: number;
  color: string;
  icon: string;
}

export interface TimeSeriesPoint {
  date: string;
  leads?: number;
  revenue?: number;
  investment?: number;
  sessions?: number;
}

export interface CampaignRow {
  id: string;
  name: string;
  channel: string;
  investment: number;
  leads: number;
  cpl: number;
  sales: number;
  roas: number;
  status: "scaling" | "monitor" | "pause" | "ok";
}

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  executiveText: string;
  laymanText: string;
  metric?: string;
  metricValue?: string;
  metricTrend?: number;
}

export interface ReportMeta {
  period: string;
  comparisonPeriod: string;
  generatedAt: string;
  clientName: string;
  dataSource: {
    reportei: boolean;
    crm: boolean;
  };
}

export interface KPISet {
  totalInvestment: KPIValue;
  totalLeads: KPIValue;
  costPerLead: KPIValue;
  totalSales: KPIValue;
  revenue: KPIValue;
  roas: KPIValue;
  cac: KPIValue;
  sessions: KPIValue;
  impressions: KPIValue;
  ctr: KPIValue;
  mqls: KPIValue;
  conversionRate: KPIValue;
}

export interface ChartData {
  timeSeries: TimeSeriesPoint[];
  channelComparison: ChannelData[];
  funnelStages: FunnelStage[];
  campaigns: CampaignRow[];
}

export interface ReportData {
  meta: ReportMeta;
  kpis: KPISet;
  charts: ChartData;
  insights: Insight[];
}

export interface UploadedFiles {
  reportei: File | null;
  crm: File | null;
}
