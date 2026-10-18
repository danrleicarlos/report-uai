---
title: "Motor de Receita"
tags:
  - marca/danrlei
  - framework
criado: 2026-10-18
---

# Motor de Receita

Seis etapas, sempre nesta ordem e com estes nomes: **Aquisição, Conversão, Handoff, Dados, Capacidade operacional, Feedback.** Use `RevenueEngine` para desenhar e marque **um** gargalo por peça. Casos seguem `CaseFlow`: **contexto → gargalo → integração → decisão → efeito na receita**.

```mermaid
flowchart LR
  A[Aquisição] --> B[Conversão] --> C[Handoff] --> D[Dados] --> E[Capacidade operacional] --> F[Feedback]
  F -.-> A
  style C stroke:#b8121b,stroke-width:3px
```

Caso modelo (CaseFlow): **Aurum Advisory**, evento de investimentos. Gargalo: expositores captam volume sem qualificar. Integração: formulário condicional por perfil ligado ao follow-up. Decisão: tratar o evento como o começo da operação. Efeito: **R$ 200 mil** em receita direta em 30 dias, 117 leads qualificados (36%).

---

**Mapa:** [[00 Mapa da Marca]]

**Relacionadas:**
- [[03 Território, Tese e Inimigo]]
- [[09 Founder Led Growth]]
