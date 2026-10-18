---
title: "Componentes"
tags:
  - marca/danrlei
  - design/componentes
criado: 2026-10-18
---

# Componentes

`window.DC` (React 18). `Button`, `Kicker`, `Headline`, `Rule`, `Annotation`, `Scribble`, `StatBlock`, `LinkCard`, `Tape` para web. Os blocos de argumento dos arquétipos: `RevenueEngine` (Mago: o motor de receita com o gargalo marcado), `MythCard` (Governante: crença derrubada e contraponto) e `CaseFlow` (Sábio: caso em contexto → gargalo → integração → decisão → efeito na receita). `InstagramPost`, `LinkedInPost` e `Slide` são canvases em tamanho real (1080×1350, 1200×1200, 1920×1080) com a prop `scale` para pré-visualizar menor, e usam esses blocos nas variantes `system`, `myth` e `case`. Cada componente tem guia próprio.

## Annotation


Anotação feita à mão sobre a peça.

- `variant="hand"` (Caveat, minúsculas: “respira. e repensa.”, “todo mês!”) ou `"marker"` (Permanent Marker, CAIXA ALTA: “PENSO LOGO VENDO”).
- `tone`: `red` (padrão) ou `ink`. `rotate` entre −8 e 8 graus.
- No máximo duas por peça; nunca carregue informação essencial só na anotação.

## Button


Botão de ação com canto vivo; o principal é vermelho.

- `variant`: `primary` (vermelho, no máximo um por tela, a ação que a página existe para provocar), `outline` (papel com borda ink e sombra dura, ações secundárias), `ink` (preto, quando o vermelho já foi usado na tela), `pill` (preto arredondado, só o WhatsApp flutuante).
- `icon`: `arrow` (padrão), `whatsapp` ou `none`. Com `href` vira link.
- Rótulo começa com verbo e cabe em uma linha: “Chamar no WhatsApp”, “Ver o método”.

## CaseFlow


Caso real em cinco passos: contexto → gargalo → integração → decisão → efeito na receita. É o bloco do arquétipo Sábio.

- Props: `client`, `context`, `bottleneck` (destacado em vermelho), `integration`, `decision`, `result` e `resultValue` (o número do efeito, em destaque no bloco preto).
- Uma frase por passo. Ferramentas só aparecem aqui, como meio, nunca como título.
- Use só casos reais e números verificáveis. `className="dc-case-row"` deixa os passos em linha (slides).

## Headline


Título serifado da marca com uma palavra de destaque em vermelho.

- `children`: o texto (string ou array de linhas). `accent`: a única palavra vermelha.
- `size`: `xl` (capa e assinatura; destaque sublinhado), `l` (seção; destaque em itálico), `m` (slogan, frase).
- `accentStyle`: `underline`, `italic`, `strike` (risco à mão, para negar: “sem ~~achismo~~”) ou `plain`.
- `breakBeforeAccent={false}` mantém o destaque na mesma linha. `as` define a tag.
- Termine com ponto final quando for afirmação: “Danrlei / *Carlos.*”.

## InstagramPost


Lâmina de Instagram em tamanho real (1080×1350; `format="story"` para 1080×1920).

- `variant`: `cover` (capa com foto P&B, disco vermelho e coroa), `list` (itens numerados), `statement` (fundo preto, frase com palavra riscada), `stat` (número de prova), `myth` (crença derrubada, `MythCard`), `system` (motor de receita com gargalo, `RevenueEngine`), `case` (caso, `CaseFlow`), `cta` (fundo vermelho, chamada final).
- Props: `kicker`, `title` (string ou array de linhas), `accent`, `body`, `items`, `value`/`suffix`, `note`, `image` (URL da foto P&B), `action`, `page` (“1/7”), `handle`; `myth`/`truth` para `myth`; `bottleneck`/`stages` para `system`; `case` (as props de `CaseFlow`) para `case`.
- `scale` só reduz a visualização; exporte em 1. A ordem das lâminas segue o capítulo Arquétipos.

## Kicker


Etiqueta de seção em CAIXA ALTA vermelha seguida de fio até a margem.

- Vai acima de todo título de seção e de toda lâmina/slide de conteúdo. Duas a quatro palavras: “Por onde começar”, “Quem sou eu”.
- `tone="muted"` e `rule={false}` em blocos escuros ou quando o kicker fica isolado.

## LinkCard


Cartão-botão numerado do link na bio e de listas de ofertas.

- `index` (“01”), `tag` (etiqueta curta), `title`, `sub`, `href`.
- `variant="primary"` (vermelho) só no último, que leva à conversa; `whatsapp` troca a seta pelo ícone do WhatsApp.
- No hover o preto entra da esquerda e a sombra vira vermelha. Empilhe com `space-3` de gap.

## LinkedInPost


Post quadrado de LinkedIn em tamanho real (1200×1200).

- `variant="insight"`: título + `StatBlock` + leitura curta. Props `kicker`, `title`, `accent`, `value`, `suffix`, `label`, `note`, `body`.
- `variant="myth"`: título + `MythCard` (`myth`, `truth`). O formato mais forte para o Governante.
- `variant="case"`: título + `CaseFlow` (`case`).
- `variant="quote"`: frase grande entre aspas com destaque sublinhado, assinatura com `role`.
- Para carrossel em PDF do LinkedIn, use `InstagramPost` (mesmo 1080×1350).

## MythCard


Crença comum riscada com X vermelho e o contraponto em serifa. É o bloco do arquétipo Governante.

- `myth`: a crença do mercado, curta, sem aspas (o componente coloca). `truth`: o contraponto em uma frase com ponto final.
- `mythLabel` e `truthLabel` trocam “Crença comum” e “Na real”.
- O inimigo conceitual da marca é “mais tráfego resolve crescimento”. Ataque a ideia, nunca uma pessoa ou empresa.
- Na sequência do carrossel, logo depois vem a sustentação (`system`, `case` ou `stat`).

## RevenueEngine


O motor de receita do Danrlei em seis etapas, com o gargalo marcado à mão. É o bloco do arquétipo Mago.

- Etapas fixas, nesta ordem: Aquisição, Conversão, Handoff, Dados, Capacidade operacional, Feedback. Troque com `stages` só em casos excepcionais.
- `bottleneck`: o nome ou o índice da etapa travada. **Um** gargalo por peça; sem gargalo, o diagrama vira enfeite.
- `note`: a anotação à mão no gargalo (padrão “o gargalo tá aqui”). `loop={false}` esconde a linha de retorno do feedback; `loopLabel` troca o texto.
- Use para abrir diagnóstico: carrossel `system`, slide `system`, palestra.

## Rule


Divisor da marca: fio cinza, segmento vermelho grosso, fio cinza, com 120px.

- Entre título e texto de abertura, uma vez por bloco. Não use como separador de lista (para isso, `line`).

## Scribble


Grafismos rabiscados que substituem ícones na marca.

- `kind`: `crown` (coroa com escorridos, sobre a foto/estátua), `x` (X vermelho, negação), `tally` (contagem), `arrow` (seta curva apontando o próximo bloco), `strike` (risco sobre palavra), `splat` (respingo de tinta), `cup` (xícara, CTA de café).
- `tone`: `ink`, `red` ou `paper` (sobre fundo escuro); `size` em px; `rotate` em graus.
- Nunca sobre o rosto do Danrlei. Um ou dois por peça.

## Slide


Slide 16:9 em tamanho real (1920×1080).

- `variant`: `title` (capa com foto), `section` (abertura de bloco com número gigante vermelho), `system` (motor de receita em linha com o gargalo, `bottleneck`, `note`), `content` (lista numerada em duas colunas, `items`), `data` (até 3 números, `stats: [{value, label}]`), `case` (caso em linha, `case`), `statement` (fundo preto, frase de respiro).
- Props comuns: `kicker`, `title`, `accent`, `body`, `image`, `number`, `page`.
- Um vermelho por slide; `statement` a cada 4–6 slides. Em palestra, `system` é o slide-âncora.

## StatBlock


Bloco preto com número grande de prova e sombra dura vermelha.

- `value` (“R$ 150.000”), `suffix` em vermelho (“+”, “%”, “×”), `label` explicando o número, `note` opcional à mão (“todo mês!”).
- Use só número real e verificável. Um por seção.

## Tape


Faixa preta inclinada com frases da marca correndo, bordas vermelhas.

- `items`: frases curtas de manifesto (“Sem achismo”, “Dado > opinião”). `tilt` em graus (padrão −3). `animated={false}` para estático (posts, impressos).
- Uma por página, como respiro entre blocos. O contêiner precisa de `overflow: hidden`.

---

**Mapa:** [[00 Mapa da Marca]]

**Relacionadas:**
- [[Tokens]]
- [[Formatos]]
