# Diagnóstico Soma Nutrição Animal · nova proposta de entrega

Apresentação em HTML (40 slides, 16:9) com a identidade visual da Uai Sô! (Design System da LP: Tilt Warp, Figtree, Kanit, vermelho #C01831, laranja #FF972A, papel bege e vidro líquido) e o logo e mascote do deck padrão.

Estrutura: **Contexto → 01 Investigação → 02 Estratégia → 03 Plano de ação (checklist 90 dias)**.

- `index.html` — versão final autocontida (abre direto no navegador, funciona offline). Setas ←/→ navegam, `G` abre o índice, `P` imprime/gera PDF (um slide por página). Os itens do checklist são clicáveis e ficam salvos no navegador.
- `src/deck.html` — fonte editável (placeholders `{{IMG:…}}`, `{{FONT:…}}`, `{{TOPO}}`).
- `src/assets/` — fontes do DS, logos, mascote e prints Semrush do deck original.
- `src/build.py` — gera o `index.html`: `python3 src/build.py`.

Fontes de dados: deck de diagnóstico original (Semrush, seguidores, histórico de mídia) e Biblioteca de Anúncios da Meta consultada via API em 05/11/2026.
