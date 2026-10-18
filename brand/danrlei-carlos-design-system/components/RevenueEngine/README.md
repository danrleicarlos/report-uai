# RevenueEngine

O motor de receita do Danrlei em seis etapas, com o gargalo marcado à mão. É o bloco do arquétipo Mago.

- Etapas fixas, nesta ordem: Aquisição, Conversão, Handoff, Dados, Capacidade operacional, Feedback. Troque com `stages` só em casos excepcionais.
- `bottleneck`: o nome ou o índice da etapa travada. **Um** gargalo por peça; sem gargalo, o diagrama vira enfeite.
- `note`: a anotação à mão no gargalo (padrão “o gargalo tá aqui”). `loop={false}` esconde a linha de retorno do feedback; `loopLabel` troca o texto.
- Use para abrir diagnóstico: carrossel `system`, slide `system`, palestra.
