---
title: "Tokens"
tags:
  - marca/danrlei
  - design/tokens
criado: 2026-10-18
---

# Tokens

## Cores

| Token | Papel | Nanquim | Uso |
| --- | --- | --- | --- |
| `paper` | `#efede8` | `#141312` | Fundo padrão de tudo: post, slide, LP. Papel de jornal levemente quente, nunca branco puro. |
| `paper-2` | `#e6e3dc` | `#1c1b19` | Fim do degradê radial do fundo e áreas de apoio (placeholder de foto, faixas). Texto sobre ele: só ink e ink-soft. |
| `paper-raised` | `#fbfaf7` | `#201e1c` | Superfície de cartões com borda ink e sombra dura (LinkCard, moldura de foto). |
| `ink` | `#111111` | `#f2efe9` | Títulos, texto principal, bordas de 1.5px e sombra dura. Legível em paper, paper-2 e paper-raised nos dois temas. |
| `ink-soft` | `#3a3a3a` | `#cfccc5` | Texto corrido (lead, bio) em paper, paper-2 e paper-raised. |
| `ink-muted` | `#625f59` | `#9a968f` | Metadados, legendas, rodapé e contadores (1/7) em paper e paper-raised. Nunca em texto principal. |
| `line` | `#1111111f` | `#f2efe924` | Fios finos de 1px entre itens de lista e após o kicker. |
| `rule-gray` | `#b9b6b0` | `#4a4743` | Pontas cinza do divisor Rule (cinza · vermelho · cinza). Decorativo, nunca texto. |
| `red` | `#b8121b` | `#e8505a` | A cor da marca: palavra de destaque no título, sublinhado, numeração, kicker, botão primário, disco atrás da foto. Como texto, em paper e paper-raised. No máximo uma palavra vermelha por título. |
| `red-deep` | `#8e0d14` | `#b8121b` | Hover/pressionado do botão vermelho e manchas de tinta escura. |
| `on-red` | `#ffffff` | `#141312` | Texto e ícones sobre fundo red (botão primário, card de WhatsApp). |
| `surface-ink` | `#111111` | `#000000` | Blocos pretos invertidos que ficam pretos nos dois temas: post statement, StatBlock, faixa Tape, CTA final, slide statement. |
| `on-ink` | `#efede8` | `#f2efe9` | Texto sobre surface-ink. |
| `on-ink-muted` | `#cfccc5` | `#cfccc5` | Texto secundário sobre surface-ink. |
| `red-on-ink` | `#e8505a` | `#e8505a` | Destaque vermelho como texto sobre surface-ink (o red de base fica escuro demais lá). |
| `tape` | `#e8e2d2d1` | `#3a3630d1` | Fita adesiva translúcida que prende fotos e cartazes. |
| `whatsapp` | `#25d366` | `#25d366` | Somente o ícone do WhatsApp e o hover da seta do botão de WhatsApp. Nunca como cor de marca. |
| `focus` | `{red}` | `{red}` | Anel de foco de 2px, sólido, com 3px de afastamento. Alias de red. |

## Fontes

- **serif**: `"Source Serif 4", Georgia, "Times New Roman", serif`
- **sans**: `Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
- **hand**: `Caveat, "Comic Sans MS", cursive`
- **marker**: `"Permanent Marker", Caveat, cursive`

## Espaçamento

- `space-1`: `4px`
- `space-2`: `8px`
- `space-3`: `12px`
- `space-4`: `16px`
- `space-5`: `20px`
- `space-6`: `24px`
- `space-8`: `32px`
- `space-14`: `56px`
- `space-16`: `64px`
- `space-24`: `96px`

## Raio

- `radius-0`: `0`
- `radius-pill`: `999px`
- `radius-disc`: `50%`

## Sombras

- `shadow-hard`: `4px 4px 0 #111111`
- `shadow-hard-red`: `6px 6px 0 #b8121b`
- `shadow-paper`: `0 22px 40px -18px rgba(0,0,0,0.45)`

## Traços

- `stroke-hair`: `1px`
- `stroke-card`: `1.5px`
- `stroke-accent`: `3px`
- `stroke-rule`: `4px`

---

**Mapa:** [[00 Mapa da Marca]]

**Relacionadas:**
- [[05 Cor]]
- [[Componentes]]
