---
title: "Layout, Imagem e Movimento"
tags:
  - marca/danrlei
  - design/layout
criado: 2026-10-18
---

# Layout, Imagem e Movimento

## Layout e espaço

- Composição editorial, alinhada à esquerda. Nunca tudo centralizado (exceção: rodapé).
- Grade de cartaz: título grande no alto à esquerda; imagem/foto ancorada embaixo à direita, “derretendo” no papel (máscara em degradê) com o disco `red` atrás.
- Canto vivo em tudo (`radius-0`). `radius-pill` só no botão flutuante; `radius-disc` no disco e no círculo da seta.
- Profundidade por sombra dura deslocada (`shadow-hard`, hover `shadow-hard-red`), nunca por sombra desfocada. A única sombra suave é `shadow-paper`, da foto colada com fita.
- Espaçamento em `space-*`. Margem mínima: `space-5` no celular, `space-16` (64–88px) em post 1080, `space-24` em slide.
- Divisor da marca: `Rule` (cinza · vermelho · cinza, 120px), entre título e texto.
- Fitas (`tape`) e leve rotação (−3° a 2°) quando algo é “colado” no papel: foto, cartaz, faixa.

## Imagem

- Fotos de pessoa em **preto e branco**, alto contraste, recortadas ou com fade para o papel na base. A cor volta só no hover (web).
- Estátuas, gravuras e referências clássicas com intervenção gráfica (coroa rabiscada, X vermelho no olho, respingo de tinta) são bem-vindas para conteúdo provocativo. Nunca rabisque o rosto do Danrlei.
- Foto oficial: `https://danrleicarlos.com.br/wp-content/uploads/2026/09/@arthhurcesarfotografiia-10-scaled.jpg` (crédito @arthhurcesarfotografiia). Imagem provocativa de apoio: `https://danrleicarlos.com.br/wp-content/uploads/2026/09/image.png`.

## Movimento (web)

- Entrada única por peça: sublinhado vermelho se desenha, disco cresce, coroa se desenha, cartões sobem em cascata.
- Faixa `Tape` corre em loop lento (26s). Respeite `prefers-reduced-motion`.
- Nada deve depender de script para aparecer: o estado de repouso já é a peça pronta.

## Não faça

- Gradiente colorido, roxo/azul, neon, glassmorphism.
- Cantos arredondados em cartões, sombras desfocadas em cartões, bordas coloridas laterais.
- Mais de um vermelho por título ou um segundo acento de cor.
- Emoji como ícone, banco de imagem genérico sorrindo, fotos coloridas saturadas.
- Texto centralizado em bloco, títulos em caixa alta inteira.
- Tese sem sustentação: nunca publique provocação sem dado, caso ou mecanismo na mesma peça.

---

**Mapa:** [[00 Mapa da Marca]]

**Relacionadas:**
- [[08 Grafismos]]
- [[06 Tipografia]]
