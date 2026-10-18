# Formatos

Medidas e receitas de cada canal. Em todos: fundo `paper` com grão, título serifado à esquerda, uma palavra em `red`, assinatura `@danrleicarlos` em `label` `ink-muted` no rodapé.

## Instagram

| Peça | Tamanho | Margem segura | Componente |
| --- | --- | --- | --- |
| Post e carrossel | 1080×1350 (4:5) | 88px laterais, 96px topo/base | `InstagramPost` |
| Story / Reels capa | 1080×1920 | 120px topo, 220px base (UI do app) | `InstagramPost` em 1080×1920 via `format="story"` |

Escala de tipo no canvas 1080: título de capa 120–140px (`display-xl`), título de slide interno 76–88px, texto 34–38px serifa, kicker 22px, anotação à mão 40–48px, número `stat` 160–200px.

Roteiro de carrossel de Founder Led Growth: siga a tabela do capítulo Arquétipos (provocação → crença derrubada → diagnóstico → evidência → consequência → decisão). Lâminas disponíveis:

1. **Capa** (`variant="cover"`): kicker com o tema, título-tese com a palavra vermelha, `Rule`, uma linha de lead e foto/estátua P&B com disco vermelho. Ex.: “Discurso *Aristotélico.*” / “3 pilares fundamentais para persuasão”.
2. **Lâminas de conteúdo** (`variant="list"` ou `"cover"` sem foto): um conceito por lâmina, numerado `01`, `02`, `03`.
3. **Virada** (`variant="statement"`): fundo `surface-ink`, uma frase curta, uma palavra riscada à mão.
4. **Prova** (`variant="stat"`): número grande, legenda, anotação à mão.
5. **Crença derrubada** (`variant="myth"`): a crença comum riscada com X vermelho e o contraponto em serifa. Governante.
6. **Diagnóstico** (`variant="system"`): o motor de receita em 6 etapas com o gargalo marcado à mão. Mago.
7. **Caso** (`variant="case"`): contexto → gargalo → integração → decisão → efeito na receita, com o número final em destaque. Sábio.
8. **CTA** (`variant="cta"`): fundo `red`, pergunta + ação (“Salva e manda pra quem ainda faz no achismo.” / “Bora tomar um café? Link na bio.”).

Contador `n/total` sempre no canto inferior direito em `label`.

## LinkedIn

| Peça | Tamanho | Componente |
| --- | --- | --- |
| Post imagem | 1200×1200 | `LinkedInPost` |
| Carrossel (PDF) | 1080×1350 | `InstagramPost` (mesmo layout) |
| Banner do perfil | 1584×396 | `Slide variant="section"` recortado |

No LinkedIn, mais Governante e Sábio: prefira `variant="myth"` (crença × contraponto), `variant="insight"` (número + leitura), `variant="case"` e `variant="quote"`. Texto do post: abre com a frase do título, três parágrafos curtos, fecha com pergunta. Sem hashtags no meio do texto, no máximo três no fim.

## Landing pages e link na bio

- Coluna única de até 480px no mobile (bio) e 1200px no desktop; margem `space-5` no celular.
- Sequência padrão: Hero (`Headline` + slogan `display-m` + `Rule` + lead + foto com disco) → Links/oferta (`Kicker` + `display-l` + `LinkCard`) → Respiro criativo (`Tape` + cartaz com fita) → Prova (`StatBlock` + fatos numerados) → Conteúdo social → CTA final em `surface-ink` com `Button variant="primary"` → rodapé.
- Botão principal: `red`, no máximo um por tela. Secundário: `outline` (borda ink, sombra dura).
- No Elementor: todo CSS prefixado por uma classe-wrapper, conteúdo em HTML estático, script só como melhoria (padrão do arquivo `link-na-bio.html`).

## Apresentações

| Peça | Tamanho | Componente |
| --- | --- | --- |
| Slide | 1920×1080 (16:9) | `Slide` |

Tipo no canvas 1920: título de capa 150–180px, título de slide 96px, texto 36–40px, kicker 24px, `stat` 220px. Margem `space-24` (96px).

Ritmo de deck: `title` (capa) → `section` (abre cada bloco, numerado) → `system` (diagnóstico do motor de receita) → `content`/`data`/`case` → `statement` a cada 4–6 slides para respirar → `title` final com CTA. Um vermelho por slide. Em palestra e diagnóstico executivo, o slide `system` é a peça-âncora: volte a ele para marcar cada gargalo discutido.
