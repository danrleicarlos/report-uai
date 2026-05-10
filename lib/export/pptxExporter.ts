import type { ReportData } from "@/types/report";

/* ─── colour palette matching the app ──────────────────────────────────────── */
const C = {
  bg: "0B1120",
  surface: "111827",
  surfaceLight: "1A2332",
  border: "1F2D3D",
  white: "FFFFFF",
  slate300: "CBD5E1",
  slate400: "94A3B8",
  slate500: "64748B",
  slate600: "475569",
  blue: "3B82F6",
  blueDark: "1D4ED8",
  violet: "8B5CF6",
  cyan: "06B6D4",
  emerald: "10B981",
  amber: "F59E0B",
  rose: "F43F5E",
  gradientStart: "2563EB",
  gradientEnd: "06B6D4",
} as const;

/* ─── slide dimensions (widescreen 16:9, inches) ────────────────────────────── */
const W = 13.33;
const H = 7.5;

/* ─── helpers ───────────────────────────────────────────────────────────────── */
function hex(c: string): string {
  return c.startsWith("#") ? c.slice(1) : c;
}

function pct(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

function rateColor(rate: number, idx: number): string {
  if (idx === 0) return C.white;
  if (rate >= 60) return C.emerald;
  if (rate >= 35) return C.amber;
  return C.rose;
}

/* ─── shared slide chrome ────────────────────────────────────────────────────── */
function addBackground(slide: ReturnType<import("pptxgenjs")["addSlide"]>): void {
  slide.background = { color: hex(C.bg) };
  // subtle top gradient bar
  slide.addShape("rect", {
    x: 0, y: 0, w: W, h: 0.06,
    fill: { type: "grad", stops: [{ pos: 0, color: hex(C.blue) }, { pos: 100, color: hex(C.cyan) }] },
    line: { width: 0 },
  });
}

function addSlideLabel(
  slide: ReturnType<import("pptxgenjs")["addSlide"]>,
  label: string,
  period: string,
): void {
  slide.addText(`Report UAI  ·  ${period}`, {
    x: 0.35, y: H - 0.32, w: W - 0.7, h: 0.22,
    fontSize: 7, color: hex(C.slate600), align: "right",
    fontFace: "Arial",
  });
  slide.addText(label, {
    x: 0.35, y: H - 0.32, w: W - 0.7, h: 0.22,
    fontSize: 7, color: hex(C.slate600), align: "left",
    fontFace: "Arial",
  });
}

function addSectionTitle(
  slide: ReturnType<import("pptxgenjs")["addSlide"]>,
  title: string,
  subtitle: string,
  y = 0.4,
): void {
  slide.addShape("rect", {
    x: 0.35, y, w: 0.05, h: 0.35,
    fill: { type: "grad", stops: [{ pos: 0, color: hex(C.blue) }, { pos: 100, color: hex(C.cyan) }] },
    line: { width: 0 },
    rounding: true,
  });
  slide.addText(title, {
    x: 0.55, y, w: W - 0.9, h: 0.22,
    fontSize: 14, bold: true, color: hex(C.white), fontFace: "Arial",
  });
  slide.addText(subtitle, {
    x: 0.55, y: y + 0.24, w: W - 0.9, h: 0.16,
    fontSize: 9, color: hex(C.slate400), fontFace: "Arial",
  });
}

/* ─── slide builders ─────────────────────────────────────────────────────────── */

function buildTitleSlide(pptx: import("pptxgenjs"), data: ReportData): void {
  const slide = pptx.addSlide();
  slide.background = { color: hex(C.bg) };

  // left accent column
  slide.addShape("rect", {
    x: 0, y: 0, w: 0.18, h: H,
    fill: { type: "grad", stops: [{ pos: 0, color: hex(C.blue) }, { pos: 100, color: hex(C.cyan) }] },
    line: { width: 0 },
  });

  // glow circles (decorative)
  slide.addShape("ellipse", {
    x: 6, y: -1.5, w: 5, h: 5,
    fill: { color: hex(C.blue), transparency: 90 },
    line: { width: 0 },
  });
  slide.addShape("ellipse", {
    x: 9, y: 4, w: 4, h: 4,
    fill: { color: hex(C.violet), transparency: 92 },
    line: { width: 0 },
  });

  // logo box
  slide.addShape("rect", {
    x: 0.5, y: 1.1, w: 0.5, h: 0.5,
    fill: { type: "grad", stops: [{ pos: 0, color: hex(C.blue) }, { pos: 100, color: hex(C.violet) }] },
    line: { width: 0 },
    rounding: true,
  });
  slide.addText("R", {
    x: 0.5, y: 1.1, w: 0.5, h: 0.5,
    fontSize: 16, bold: true, color: hex(C.white),
    align: "center", valign: "middle", fontFace: "Arial",
  });

  // title
  slide.addText("Análise de Conversão", {
    x: 0.5, y: 1.8, w: W - 1, h: 0.7,
    fontSize: 38, bold: true, color: hex(C.white), fontFace: "Arial",
  });

  // gradient subtitle word
  slide.addText("High Level · Funil Completo", {
    x: 0.5, y: 2.55, w: W - 1, h: 0.4,
    fontSize: 18, color: hex(C.cyan), fontFace: "Arial",
  });

  // meta line
  slide.addText(`${data.meta.clientName}  ·  ${data.meta.period}  ·  vs ${data.meta.comparisonPeriod}`, {
    x: 0.5, y: 3.1, w: W - 1, h: 0.28,
    fontSize: 11, color: hex(C.slate400), fontFace: "Arial",
  });

  // horizontal rule
  slide.addShape("rect", {
    x: 0.5, y: 3.55, w: 2.5, h: 0.03,
    fill: { type: "grad", stops: [{ pos: 0, color: hex(C.blue) }, { pos: 100, color: hex(C.bg) }] },
    line: { width: 0 },
  });

  // bottom summary chips
  const chips = [
    { label: "Conversão geral", val: pct((data.charts.funnelStages[7].value / data.charts.funnelStages[0].value) * 100) },
    { label: "ROAS", val: data.kpis.roas.formatted },
    { label: "Leads", val: data.kpis.totalLeads.formatted },
    { label: "Vendas", val: data.kpis.totalSales.formatted },
  ];
  chips.forEach((chip, i) => {
    const x = 0.5 + i * 3.1;
    slide.addShape("rect", {
      x, y: 4.9, w: 2.8, h: 1.1,
      fill: { color: hex(C.surface) },
      line: { color: hex(C.border), width: 0.75 },
      rounding: true,
    });
    slide.addText(chip.val, {
      x, y: 5.1, w: 2.8, h: 0.42,
      fontSize: 22, bold: true, color: hex(C.white), align: "center", fontFace: "Arial",
    });
    slide.addText(chip.label, {
      x, y: 5.55, w: 2.8, h: 0.22,
      fontSize: 8.5, color: hex(C.slate400), align: "center", fontFace: "Arial",
    });
  });

  addSlideLabel(slide, "Capa", data.meta.period);
}

function buildSummarySlide(pptx: import("pptxgenjs"), data: ReportData): void {
  const slide = pptx.addSlide();
  addBackground(slide);
  addSectionTitle(slide, "Taxas-chave de Conversão", "Indicadores de conversão nos pontos críticos do funil");

  const stages = data.charts.funnelStages;
  const metrics = [
    {
      label: "Conversão Geral",
      sub: "Impressões → Vendas",
      val: pct((stages[7].value / stages[0].value) * 100),
      color: C.blue,
    },
    {
      label: "Lead → MQL",
      sub: "Qualificação de marketing",
      val: pct((stages[4].value / stages[3].value) * 100),
      color: C.violet,
    },
    {
      label: "MQL → SQL",
      sub: "Qualificação de vendas",
      val: pct((stages[5].value / stages[4].value) * 100),
      color: C.cyan,
    },
    {
      label: "SQL → Venda",
      sub: "Taxa de fechamento",
      val: pct((stages[7].value / stages[5].value) * 100),
      color: C.emerald,
    },
  ];

  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.35 + col * 6.45;
    const y = 1.25 + row * 2.6;
    const w = 6.1;
    const h = 2.35;

    slide.addShape("rect", {
      x, y, w, h,
      fill: { color: hex(C.surface) },
      line: { color: hex(C.border), width: 0.75 },
      rounding: true,
    });
    // accent left bar
    slide.addShape("rect", {
      x: x + 0.12, y: y + 0.18, w: 0.05, h: h - 0.36,
      fill: { color: hex(m.color) },
      line: { width: 0 },
      rounding: true,
    });
    // big value
    slide.addText(m.val, {
      x: x + 0.35, y: y + 0.45, w: w - 0.5, h: 0.85,
      fontSize: 36, bold: true, color: hex(m.color), fontFace: "Arial",
    });
    slide.addText(m.label, {
      x: x + 0.35, y: y + 1.3, w: w - 0.5, h: 0.3,
      fontSize: 13, bold: true, color: hex(C.white), fontFace: "Arial",
    });
    slide.addText(m.sub, {
      x: x + 0.35, y: y + 1.65, w: w - 0.5, h: 0.22,
      fontSize: 9, color: hex(C.slate400), fontFace: "Arial",
    });
  });

  addSlideLabel(slide, "02 · Taxas-chave", data.meta.period);
}

function buildFunnelSlide(pptx: import("pptxgenjs"), data: ReportData): void {
  const slide = pptx.addSlide();
  addBackground(slide);
  addSectionTitle(slide, "Funil Completo", "Volume em cada etapa e taxa de conversão da etapa anterior");

  const stages = data.charts.funnelStages;
  const maxVal = stages[0].value;
  const startY = 1.25;
  const rowH = 0.55;
  const barMaxW = 8.5;
  const labelW = 2.2;
  const metaW = 1.5;

  stages.forEach((stage, i) => {
    const y = startY + i * rowH;
    const barW = Math.max((stage.value / maxVal) * barMaxW, 0.2);
    const barColor = stage.color.replace("#", "");
    const rc = rateColor(stage.conversionRate, i);

    // label
    slide.addText(stage.label, {
      x: 0.35, y, w: labelW, h: rowH - 0.08,
      fontSize: 9, color: hex(C.slate300), valign: "middle", fontFace: "Arial",
    });

    // bar bg
    slide.addShape("rect", {
      x: 0.35 + labelW, y: y + 0.1, w: barMaxW, h: rowH - 0.22,
      fill: { color: hex(C.border) },
      line: { width: 0 },
      rounding: true,
    });
    // bar fill
    slide.addShape("rect", {
      x: 0.35 + labelW, y: y + 0.1, w: barW, h: rowH - 0.22,
      fill: { color: barColor },
      line: { width: 0 },
      rounding: true,
    });

    // value text
    slide.addText(stage.formatted, {
      x: 0.35 + labelW + barMaxW + 0.15, y, w: metaW, h: rowH - 0.08,
      fontSize: 9, bold: true, color: hex(C.white),
      valign: "middle", fontFace: "Arial",
    });

    // conversion rate badge
    if (i > 0) {
      slide.addText(`${stage.conversionRate.toFixed(1)}%`, {
        x: 0.35 + labelW + barMaxW + 1.0, y, w: 0.9, h: rowH - 0.08,
        fontSize: 9, bold: true, color: hex(rc),
        valign: "middle", align: "right", fontFace: "Arial",
      });
    }
  });

  // legend
  const legendY = H - 0.65;
  const legendItems = [
    { label: "≥60% Ótimo", color: C.emerald },
    { label: "35–60% Ok", color: C.amber },
    { label: "<35% Gargalo", color: C.rose },
  ];
  legendItems.forEach((l, i) => {
    const lx = 0.35 + i * 2.5;
    slide.addShape("ellipse", {
      x: lx, y: legendY + 0.06, w: 0.12, h: 0.12,
      fill: { color: hex(l.color) },
      line: { width: 0 },
    });
    slide.addText(l.label, {
      x: lx + 0.18, y: legendY, w: 2.2, h: 0.26,
      fontSize: 8, color: hex(C.slate500), fontFace: "Arial",
    });
  });

  addSlideLabel(slide, "03 · Funil Completo", data.meta.period);
}

function buildTransitionsSlide(pptx: import("pptxgenjs"), data: ReportData): void {
  const stages = data.charts.funnelStages;
  const transitions = stages.slice(1).map((to, i) => ({
    from: stages[i].label,
    to: to.label,
    rate: to.conversionRate,
    dropped: stages[i].value - to.value,
  }));

  // Split into two slides (4 per slide)
  const pages = [transitions.slice(0, 4), transitions.slice(4)];

  pages.forEach((group, pageIdx) => {
    const slide = pptx.addSlide();
    addBackground(slide);
    addSectionTitle(
      slide,
      `Taxas de Transição ${pageIdx > 0 ? "(continuação)" : ""}`,
      "Taxa de passagem e volume perdido em cada etapa",
    );

    const cols = 2;
    const cardW = 5.9;
    const cardH = 2.15;
    const gapX = 0.55;
    const gapY = 0.28;
    const startX = 0.35;
    const startY = 1.2;

    group.forEach((t, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);

      const isBottleneck = t.rate < 35;
      const isStrong = t.rate >= 60;
      const borderColor = isBottleneck ? C.rose : isStrong ? C.emerald : C.border;
      const bgColor = isBottleneck ? "1A0A0E" : isStrong ? "0A1A12" : C.surface;
      const valColor = isBottleneck ? C.rose : isStrong ? C.emerald : C.amber;

      slide.addShape("rect", {
        x, y, w: cardW, h: cardH,
        fill: { color: hex(bgColor) },
        line: { color: hex(borderColor), width: 0.75 },
        rounding: true,
      });

      // from → to header
      slide.addText(`${t.from}  →  ${t.to}`, {
        x: x + 0.2, y: y + 0.18, w: cardW - 0.4, h: 0.26,
        fontSize: 10, color: hex(C.slate300), fontFace: "Arial",
      });
      if (isBottleneck) {
        slide.addText("GARGALO", {
          x: x + 0.2, y: y + 0.18, w: cardW - 0.4, h: 0.26,
          fontSize: 8.5, bold: true, color: hex(C.rose), align: "right", fontFace: "Arial",
        });
      }

      // big rate
      slide.addText(`${t.rate.toFixed(1)}%`, {
        x: x + 0.2, y: y + 0.5, w: 3, h: 0.72,
        fontSize: 36, bold: true, color: hex(valColor), fontFace: "Arial",
      });
      slide.addText("taxa de conversão", {
        x: x + 0.2, y: y + 1.22, w: 3, h: 0.2,
        fontSize: 8, color: hex(C.slate500), fontFace: "Arial",
      });

      // dropped count
      slide.addText(
        t.dropped >= 1000
          ? `${(t.dropped / 1000).toFixed(1)}k perdidos`
          : `${t.dropped.toLocaleString("pt-BR")} perdidos`,
        {
          x: x + 0.2, y: y + 1.48, w: cardW - 0.4, h: 0.2,
          fontSize: 8.5, color: hex(C.slate400), fontFace: "Arial",
        },
      );

      // progress bar bg
      slide.addShape("rect", {
        x: x + 0.2, y: y + cardH - 0.22, w: cardW - 0.4, h: 0.1,
        fill: { color: hex(C.border) },
        line: { width: 0 },
        rounding: true,
      });
      // progress bar fill
      const barW = Math.max(((cardW - 0.4) * Math.min(t.rate, 100)) / 100, 0.05);
      slide.addShape("rect", {
        x: x + 0.2, y: y + cardH - 0.22, w: barW, h: 0.1,
        fill: { color: hex(valColor) },
        line: { width: 0 },
        rounding: true,
      });
    });

    addSlideLabel(slide, `0${4 + pageIdx} · Transições`, data.meta.period);
  });
}

function buildChannelSlide(pptx: import("pptxgenjs"), data: ReportData): void {
  const slide = pptx.addSlide();
  addBackground(slide);
  addSectionTitle(slide, "Conversão por Canal", "Performance em cada etapa do funil por canal de mídia");

  const channels = data.charts.channelComparison;
  const headers = ["Canal", "Leads", "Lead→MQL", "MQL→SQL", "SQL→Venda", "Geral", "ROAS"];
  const colXs = [0.35, 2.35, 3.75, 5.2, 6.65, 8.1, 9.55];
  const colWs = [1.85, 1.25, 1.3, 1.3, 1.3, 1.3, 1.3];

  // header row
  const headerY = 1.2;
  headers.forEach((h, ci) => {
    slide.addText(h, {
      x: colXs[ci], y: headerY, w: colWs[ci], h: 0.28,
      fontSize: 8, bold: true, color: hex(C.slate500),
      align: ci === 0 ? "left" : "right",
      fontFace: "Arial",
    });
  });
  // header underline
  slide.addShape("rect", {
    x: 0.35, y: headerY + 0.28, w: W - 0.7, h: 0.02,
    fill: { color: hex(C.border) },
    line: { width: 0 },
  });

  channels.forEach((ch, ri) => {
    const y = 1.7 + ri * 1.1;
    const rowBg = ri % 2 === 0 ? C.surface : C.bg;

    slide.addShape("rect", {
      x: 0.3, y: y - 0.1, w: W - 0.6, h: 1.0,
      fill: { color: hex(rowBg) },
      line: { width: 0 },
      rounding: true,
    });

    // colour dot + name
    slide.addShape("ellipse", {
      x: colXs[0], y: y + 0.3, w: 0.14, h: 0.14,
      fill: { color: hex(ch.color.replace("#", "")) },
      line: { width: 0 },
    });
    slide.addText(ch.name, {
      x: colXs[0] + 0.2, y, w: colWs[0] - 0.2, h: 0.8,
      fontSize: 10, bold: true, color: hex(C.white), valign: "middle", fontFace: "Arial",
    });

    // leads
    slide.addText(ch.leads.toLocaleString("pt-BR"), {
      x: colXs[1], y, w: colWs[1], h: 0.8,
      fontSize: 10, color: hex(C.slate300), align: "right", valign: "middle", fontFace: "Arial",
    });

    // computed rates
    const leadToMql = ch.leads > 0 ? (ch.mqls / ch.leads) * 100 : 0;
    const mqlToSql = ch.mqls > 0 ? (ch.sqls / ch.mqls) * 100 : 0;
    const sqlToSale = ch.sqls > 0 ? (ch.sales / ch.sqls) * 100 : 0;
    const overall = ch.leads > 0 ? (ch.sales / ch.leads) * 100 : 0;
    const rates = [leadToMql, mqlToSql, sqlToSale, overall];

    rates.forEach((r, ci) => {
      const color = r >= 60 ? C.emerald : r >= 35 ? C.amber : C.rose;
      slide.addText(`${r.toFixed(1)}%`, {
        x: colXs[2 + ci], y, w: colWs[2 + ci], h: 0.8,
        fontSize: 11, bold: true, color: hex(color),
        align: "right", valign: "middle", fontFace: "Arial",
      });
    });

    // ROAS
    slide.addText(`${ch.roas.toFixed(1)}x`, {
      x: colXs[6], y, w: colWs[6], h: 0.8,
      fontSize: 11, bold: true, color: hex(C.white),
      align: "right", valign: "middle", fontFace: "Arial",
    });
  });

  addSlideLabel(slide, "06 · Canais", data.meta.period);
}

function buildOpportunitiesSlide(pptx: import("pptxgenjs"), data: ReportData): void {
  const slide = pptx.addSlide();
  addBackground(slide);
  addSectionTitle(slide, "Oportunidades de Melhoria", "Onde agir para aumentar a conversão e receita");

  const stages = data.charts.funnelStages;
  const channels = data.charts.channelComparison;

  // ── card 1: bottlenecks ──────────────────────────────────────────────────────
  const bottlenecks = stages.slice(1).filter((s) => s.conversionRate < 35);
  const c1x = 0.35, c1y = 1.2, c1w = 4.0, c1h = 4.5;

  slide.addShape("rect", {
    x: c1x, y: c1y, w: c1w, h: c1h,
    fill: { color: "140A0E" },
    line: { color: hex(C.rose), width: 0.75 },
    rounding: true,
  });
  slide.addText("Gargalos Detectados", {
    x: c1x + 0.2, y: c1y + 0.2, w: c1w - 0.4, h: 0.28,
    fontSize: 11, bold: true, color: hex(C.rose), fontFace: "Arial",
  });
  slide.addText("Etapas com taxa abaixo de 35%", {
    x: c1x + 0.2, y: c1y + 0.5, w: c1w - 0.4, h: 0.2,
    fontSize: 8.5, color: hex(C.slate400), fontFace: "Arial",
  });
  bottlenecks.forEach((s, i) => {
    const by = c1y + 0.9 + i * 0.55;
    slide.addShape("rect", {
      x: c1x + 0.2, y: by, w: c1w - 0.4, h: 0.42,
      fill: { color: "1E0A10" },
      line: { color: "3D1020", width: 0.5 },
      rounding: true,
    });
    slide.addText(s.label, {
      x: c1x + 0.38, y: by + 0.08, w: c1w - 0.75, h: 0.26,
      fontSize: 10, color: hex(C.slate300), fontFace: "Arial",
    });
    slide.addText(`${s.conversionRate.toFixed(1)}%`, {
      x: c1x + 0.38, y: by + 0.08, w: c1w - 0.75, h: 0.26,
      fontSize: 10, bold: true, color: hex(C.rose), align: "right", fontFace: "Arial",
    });
  });
  if (bottlenecks.length === 0) {
    slide.addText("Nenhum gargalo crítico identificado ✓", {
      x: c1x + 0.2, y: c1y + 0.9, w: c1w - 0.4, h: 0.4,
      fontSize: 10, color: hex(C.emerald), fontFace: "Arial",
    });
  }

  // ── card 2: best channel ─────────────────────────────────────────────────────
  const best = [...channels].sort((a, b) => b.roas - a.roas)[0];
  const c2x = 4.75, c2y = 1.2, c2w = 4.0, c2h = 2.1;

  slide.addShape("rect", {
    x: c2x, y: c2y, w: c2w, h: c2h,
    fill: { color: "0A140E" },
    line: { color: hex(C.emerald), width: 0.75 },
    rounding: true,
  });
  slide.addText("Canal Mais Eficiente", {
    x: c2x + 0.2, y: c2y + 0.18, w: c2w - 0.4, h: 0.26,
    fontSize: 11, bold: true, color: hex(C.emerald), fontFace: "Arial",
  });
  slide.addShape("ellipse", {
    x: c2x + 0.2, y: c2y + 0.58, w: 0.14, h: 0.14,
    fill: { color: hex(best.color.replace("#", "")) },
    line: { width: 0 },
  });
  slide.addText(best.name, {
    x: c2x + 0.42, y: c2y + 0.53, w: c2w - 0.62, h: 0.25,
    fontSize: 12, bold: true, color: hex(C.white), fontFace: "Arial",
  });
  const bestStats = [
    { k: "ROAS", v: `${best.roas.toFixed(1)}x` },
    { k: "CPL", v: `R$ ${best.cpl.toFixed(2)}` },
    { k: "Leads", v: best.leads.toLocaleString("pt-BR") },
  ];
  bestStats.forEach((s, i) => {
    const bx = c2x + 0.2 + i * 1.3;
    slide.addShape("rect", {
      x: bx, y: c2y + 0.95, w: 1.2, h: 0.8,
      fill: { color: hex(C.surface) },
      line: { color: hex(C.border), width: 0.5 },
      rounding: true,
    });
    slide.addText(s.v, {
      x: bx, y: c2y + 1.05, w: 1.2, h: 0.35,
      fontSize: 13, bold: true, color: hex(C.white), align: "center", fontFace: "Arial",
    });
    slide.addText(s.k, {
      x: bx, y: c2y + 1.42, w: 1.2, h: 0.2,
      fontSize: 8, color: hex(C.slate500), align: "center", fontFace: "Arial",
    });
  });

  // ── card 3: revenue potential ────────────────────────────────────────────────
  const sqlStage = stages[5];
  const oppStage = stages[6];
  const saleStage = stages[7];
  const avgTicket = data.kpis.revenue.value / data.kpis.totalSales.value;
  const potSqls = Math.round(sqlStage.value * 0.75);
  const potOpps = Math.round(potSqls * (oppStage.conversionRate / 100));
  const potSales = Math.round(potOpps * (saleStage.conversionRate / 100));
  const extraSales = potSales - saleStage.value;
  const extraRev = extraSales * avgTicket;

  const c3x = 4.75, c3y = 3.55, c3w = 4.0, c3h = 2.1;

  slide.addShape("rect", {
    x: c3x, y: c3y, w: c3w, h: c3h,
    fill: { color: "0A0F1A" },
    line: { color: hex(C.blue), width: 0.75 },
    rounding: true,
  });
  slide.addText("Receita Potencial", {
    x: c3x + 0.2, y: c3y + 0.18, w: c3w - 0.4, h: 0.26,
    fontSize: 11, bold: true, color: hex(C.blue), fontFace: "Arial",
  });
  slide.addText(
    `Otimizando SQL→Oportunidade de ${oppStage.conversionRate.toFixed(0)}% para 75%:`,
    {
      x: c3x + 0.2, y: c3y + 0.52, w: c3w - 0.4, h: 0.26,
      fontSize: 8.5, color: hex(C.slate400), fontFace: "Arial",
    },
  );
  [
    { k: "Vendas extras", v: `+${extraSales}` },
    { k: "Receita adicional", v: `R$ ${extraRev.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}` },
    { k: "Ticket médio", v: `R$ ${avgTicket.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}` },
  ].forEach((item, i) => {
    const ry = c3y + 0.9 + i * 0.38;
    slide.addText(item.k, {
      x: c3x + 0.2, y: ry, w: c3w - 0.4, h: 0.3,
      fontSize: 9.5, color: hex(C.slate400), fontFace: "Arial",
    });
    slide.addText(item.v, {
      x: c3x + 0.2, y: ry, w: c3w - 0.4, h: 0.3,
      fontSize: 9.5, bold: true, color: hex(C.white), align: "right", fontFace: "Arial",
    });
  });

  // ── card 4: call to action ───────────────────────────────────────────────────
  const c4x = 9.15, c4y = 1.2, c4w = 3.8, c4h = 4.5;
  slide.addShape("rect", {
    x: c4x, y: c4y, w: c4w, h: c4h,
    fill: { color: hex(C.surface) },
    line: { color: hex(C.border), width: 0.75 },
    rounding: true,
  });
  slide.addText("Próximos Passos", {
    x: c4x + 0.2, y: c4y + 0.18, w: c4w - 0.4, h: 0.28,
    fontSize: 11, bold: true, color: hex(C.white), fontFace: "Arial",
  });
  const actions = [
    { bullet: "01", text: "Investigar processo de abordagem SQL → Oportunidade" },
    { bullet: "02", text: `Escalar budget em Google Ads (+20-30%)` },
    { bullet: "03", text: "Revisar qualificação de MQLs com time de vendas" },
    { bullet: "04", text: "Avaliar LTV por canal antes de cortar LinkedIn" },
    { bullet: "05", text: "Monitorar CTR semana a semana para detectar fadiga" },
  ];
  actions.forEach((a, i) => {
    const ay = c4y + 0.65 + i * 0.72;
    slide.addText(a.bullet, {
      x: c4x + 0.2, y: ay, w: 0.4, h: 0.6,
      fontSize: 10, bold: true, color: hex(C.cyan),
      valign: "middle", align: "center", fontFace: "Arial",
    });
    slide.addText(a.text, {
      x: c4x + 0.7, y: ay, w: c4w - 0.9, h: 0.6,
      fontSize: 9, color: hex(C.slate300),
      valign: "middle", fontFace: "Arial",
    });
    if (i < actions.length - 1) {
      slide.addShape("rect", {
        x: c4x + 0.2, y: ay + 0.64, w: c4w - 0.4, h: 0.01,
        fill: { color: hex(C.border) },
        line: { width: 0 },
      });
    }
  });

  addSlideLabel(slide, "07 · Oportunidades", data.meta.period);
}

/* ─── main export function ───────────────────────────────────────────────────── */

export async function exportConversaoToPptx(data: ReportData): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();

  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Report UAI";
  pptx.company = data.meta.clientName;
  pptx.subject = `Análise de Conversão · ${data.meta.period}`;
  pptx.title = "Análise de Conversão High Level";

  buildTitleSlide(pptx, data);
  buildSummarySlide(pptx, data);
  buildFunnelSlide(pptx, data);
  buildTransitionsSlide(pptx, data);
  buildChannelSlide(pptx, data);
  buildOpportunitiesSlide(pptx, data);

  const fileName = `conversao-${data.meta.clientName.replace(/\s+/g, "-").toLowerCase()}-${data.meta.period.replace(/\s+/g, "-").toLowerCase()}.pptx`;
  await pptx.writeFile({ fileName });
}
