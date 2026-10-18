(function () {
  var D = window.DC, h = React.createElement, F = React.Fragment;
  var TOTAL = 18;
  function S(n, cls, children, dark) {
    return h('section', { className: 'bb ' + (dark ? 'bb-dark ' : 'dc-grain ') + (cls || '') },
      h('div', { className: 'bb-in' }, children),
      h('div', { className: 'bb-foot' }, h('span', null, 'Brandbook · Danrlei Carlos'), h('span', null, (n < 10 ? '0' : '') + n + ' / ' + TOTAL)));
  }
  function Wrap(el) { return h('section', { className: 'bb-raw' }, el); }
  function H(title, accent, kicker, size) {
    return h(F, null, kicker ? h(D.Kicker, null, kicker) : null,
      h(D.Headline, { size: size || 'l', as: 'h2', accent: accent, className: 'bb-h' }, title));
  }
  var CASE = { client: 'Aurum Advisory · evento de investimentos', context: 'Stand em evento de alta concorrência, dois dias.', bottleneck: 'Expositores captam volume sem qualificar e perdem a janela comercial nos dias seguintes.', integration: 'Formulário condicional por perfil de investidor ligado ao follow-up digital.', decision: 'Tratar o evento como o começo da operação, não como o fim.', resultValue: 'R$ 200 mil', result: 'em receita direta em 30 dias, com 117 leads qualificados (36%).' };

  var slides = [];

  /* 1 capa */
  slides.push(S(1, 'bb-cover', h(F, null,
    h(D.Kicker, null, 'Brandbook e Design System · 2026'),
    h(D.Headline, { accent: 'Carlos.', className: 'bb-cover-h' }, 'Danrlei'),
    h('p', { className: 'bb-slogan' }, 'Falo de Marketing como quem pede um Café.'),
    h(D.Rule),
    h('p', { className: 'bb-lead bb-cover-lead' }, 'Transformo operações fragmentadas de marketing e vendas em um motor de receita integrado.'),
    h('div', { className: 'bb-cover-art' }, h('div', { className: 'bb-disc' }), h('div', { className: 'bb-slab' }, h('b', null, 'R$ 150 mil+'), h('span', null, 'por mês em mídia, com dado acima de opinião')),
      h(D.Scribble, { kind: 'crown', size: 300, rotate: -9, className: 'bb-cover-crown' }),
      h(D.Annotation, { variant: 'marker', tone: 'ink', rotate: -6, className: 'bb-cover-stamp' }, 'Penso logo vendo')))));

  /* 2 sumário */
  var toc = [['Essência', 'território, tese e inimigo'], ['Arquétipos', 'Mago, Governante, Sábio'], ['Voz', 'como a marca fala'], ['Cor', 'papel, preto e um vermelho'], ['Tipografia', 'três vozes'], ['Layout e grafismos', 'cartaz editorial'], ['Componentes', 'peças prontas'], ['Motor de receita', 'o framework'], ['Conteúdo FLG', 'carrossel, LinkedIn, slides'], ['Formatos', 'medidas de cada canal'], ['Regras', 'sombras e checklist']];
  slides.push(S(2, 'bb-toc', h(F, null, H('O que tem', 'aqui.', 'Sumário'),
    h('ol', { className: 'bb-toc-list' }, toc.map(function (t, i) { return h('li', { key: i }, h('span', null, (i < 9 ? '0' : '') + (i + 1)), h('b', null, t[0]), h('i', null, t[1])); })))));

  /* 3 essência */
  slides.push(S(3, 'bb-ess', h(F, null, H('Marketing com', 'porquê.', 'Essência'),
    h('div', { className: 'bb-cols3' },
      h('div', { className: 'bb-card' }, h('span', { className: 'bb-label' }, 'Território'), h('p', null, 'Transformar operações fragmentadas de marketing e vendas em um motor de receita integrado, sem deixar o crescimento virar caos.')),
      h('div', { className: 'bb-card' }, h('span', { className: 'bb-label' }, 'Tese'), h('p', null, 'Crescimento depende de identificar gargalos e transformar complexidade em execução que corrige o sistema continuamente.')),
      h('div', { className: 'bb-card' }, h('span', { className: 'bb-label' }, 'Personagem'), h('p', null, 'Empresário com profundidade operacional. Mineiro, direto, bem-humorado. Explica coisa complexa como conversa de café.'))),
    h('p', { className: 'bb-note' }, h('b', null, 'Público: '), 'diretor de marketing ou dono de empresa média/grande, com comercial estruturado e investimento em mídia, que perdeu clareza sobre o que gera receita.'))));

  /* 4 arquétipos */
  var arch = [['Núcleo', 'Mago', 'Transforma complexidade em execução que gera receita.', 'Diagramas de sistema, gargalo marcado à mão, antes e depois.'], ['Presença', 'Governante', 'Direção, critério, decisão. Autoridade acessível.', 'Tese em bloco preto, crença derrubada, ponto final no título.'], ['Comunicação', 'Sábio', 'Evidência que sustenta a tese: dado, lógica, caso.', 'Bloco de número, caso em cinco passos, slide de dados.'], ['Traço', 'Herói', 'Energia de ação sob pressão. Nunca posicionamento.', 'Só no CTA. Nada de pose de herói.']];
  slides.push(S(4, 'bb-arch', h(F, null, H('Transformar como Mago, conduzir como Governante, explicar como', 'Sábio.', 'Arquétipos'),
    h('div', { className: 'bb-cols4' }, arch.map(function (a, i) {
      return h('div', { key: i, className: 'bb-arch-card' + (i === 0 ? ' is-main' : '') + (i === 3 ? ' is-trait' : '') },
        h('span', { className: 'bb-label' }, a[0]), h('b', null, a[1]), h('p', null, a[2]), h('i', null, a[3]));
    })),
    h(D.Annotation, { className: 'bb-arch-note', rotate: -3 }, 'Mago lidera, Governante decide, Sábio prova.'))));

  /* 5 inimigo */
  slides.push(S(5, 'bb-enemy', h(F, null, H('O inimigo é uma', 'ideia.', 'Inimigo conceitual'),
    h('div', { className: 'bb-enemy-grid' },
      h(D.MythCard, { myth: 'Mais tráfego resolve crescimento.', truth: 'Mais mídia em uma operação ruim só compra problemas mais caros.' }),
      h('div', { className: 'bb-enemy-side' }, h('span', { className: 'bb-label' }, 'Assinatura verbal'),
        h('p', { className: 'bb-quote' }, 'Mais mídia em uma operação ruim só compra problemas mais caros.'),
        h('span', { className: 'bb-label' }, 'Tese emergente'),
        h('p', { className: 'bb-text' }, 'O mercado romantiza estratégia e subestima operação.'))))));

  /* 6 voz */
  var dos = ['Técnico, inteligente, direto e provocativo, sempre com lógica e prática.', 'Primeira pessoa com o leitor como “você”. Frases curtas, ponto final no título.', 'Provocação → diagnóstico → evidência → consequência → decisão.', 'Café como metáfora da casa. Mineirês no máximo uma vez por peça.', 'Números com unidade: R$ 150.000+, 36%, 250×.'];
  var donts = ['“Estrategista digital” ou “gestor de tráfego” como proposta.', '“Crescimento previsível”.', 'Lista de ferramentas como oferta.', 'Emoji, “incrível”, “revolucionário”, “segredo”.', 'Provocação sem dado, caso ou mecanismo.'];
  slides.push(S(6, 'bb-voice', h(F, null, H('Como a marca', 'fala.', 'Voz'),
    h('div', { className: 'bb-cols2' },
      h('div', null, h('span', { className: 'bb-label bb-label-red' }, 'Faça'), h('ul', { className: 'bb-list' }, dos.map(function (t, i) { return h('li', { key: i }, t); }))),
      h('div', null, h('span', { className: 'bb-label' }, 'Nunca'), h('ul', { className: 'bb-list bb-list-no' }, donts.map(function (t, i) { return h('li', { key: i }, t); })))),
    h('p', { className: 'bb-quote bb-voice-q' }, '“O dashboard está bonito. Mas qual decisão ele mudou esta semana?”'))));

  /* 7 cor */
  var sw = [['paper', '#efede8', 'Fundo de tudo. Papel de jornal.'], ['ink', '#111111', 'Títulos, bordas, sombra dura.'], ['red', '#b8121b', 'O único acento. Uma palavra por título.'], ['ink-soft', '#3a3a3a', 'Texto corrido.'], ['paper-2', '#e6e3dc', 'Apoio, placeholder de foto.'], ['red-on-ink', '#e8505a', 'Vermelho sobre fundo preto.']];
  slides.push(S(7, 'bb-color', h(F, null, H('Papel, preto e um', 'vermelho.', 'Cor'),
    h('div', { className: 'bb-swatches' }, sw.map(function (s, i) {
      return h('div', { key: i, className: 'bb-sw' }, h('div', { className: 'bb-sw-chip', style: { background: s[1] } }), h('b', null, s[0]), h('code', null, s[1]), h('p', null, s[2]));
    })),
    h('div', { className: 'bb-ratio' }, h('div', { style: { flex: 70 }, className: 'r-paper' }, '70% papel'), h('div', { style: { flex: 22 }, className: 'r-ink' }, '22% preto'), h('div', { style: { flex: 8 }, className: 'r-red' }, '8%')),
    h('p', { className: 'bb-note' }, 'Dois temas: Papel (padrão) e Nanquim (escuro, para palco e stories). Todo texto respeita contraste de 4,5:1 nos dois.'))));

  /* 8 tipografia */
  slides.push(S(8, 'bb-type', h(F, null, H('Três', 'vozes.', 'Tipografia'),
    h('div', { className: 'bb-type-grid' },
      h('div', { className: 'bb-type-row' }, h('span', { className: 'bb-label' }, 'Serifa · Source Serif 4 · a lógica'), h('p', { className: 'bb-spec-serif' }, 'Escolha seu ', h('em', null, 'café.'))),
      h('div', { className: 'bb-type-row' }, h('span', { className: 'bb-label' }, 'Sans · Inter · a interface'), h('p', { className: 'bb-spec-sans' }, 'Gere Receita na sua Base de WhatsApp')),
      h('div', { className: 'bb-type-row' }, h('span', { className: 'bb-label' }, 'Mão · Caveat e Permanent Marker · a emoção'), h('p', { className: 'bb-spec-hand' }, h('span', null, 'respira. e repensa.'), h('span', { className: 'm' }, 'PENSO LOGO VENDO')))),
    h('p', { className: 'bb-note' }, 'Kicker em CAIXA ALTA vermelha antes de todo título. Destaque: sublinhado em capa, itálico em seção, risco à mão para negar.'))));

  /* 9 layout e grafismos */
  var kinds = [['crown', 'coroa'], ['x', 'X de negação'], ['arrow', 'seta'], ['strike', 'risco'], ['tally', 'contagem'], ['splat', 'respingo'], ['cup', 'xícara']];
  slides.push(S(9, 'bb-graf', h(F, null, H('Cartaz editorial,', 'riscado à mão.', 'Layout e grafismos'),
    h('div', { className: 'bb-cols2 bb-graf-cols' },
      h('ul', { className: 'bb-list' }, ['Alinhado à esquerda; título grande no alto, foto P&B embaixo à direita com disco vermelho atrás.', 'Canto vivo em tudo. Profundidade só com sombra dura deslocada.', 'Divisor da marca: cinza · vermelho · cinza.', 'Sem biblioteca de ícones: rabiscos substituem ícones. Nunca no rosto do Danrlei.', 'Não existe logotipo: a assinatura é “Danrlei Carlos.” em serifa.'].map(function (t, i) { return h('li', { key: i }, t); })),
      h('div', { className: 'bb-scribbles' }, kinds.map(function (k, i) { return h('div', { key: i, className: 'bb-scr' }, h(D.Scribble, { kind: k[0], size: k[0] === 'crown' ? 150 : 100, tone: k[0] === 'arrow' ? 'red' : undefined }), h('span', null, k[1])); }))))));

  /* 10 componentes */
  slides.push(S(10, 'bb-comp', h(F, null, H('Peças', 'prontas.', 'Componentes'),
    h('div', { className: 'bb-comp-grid' },
      h('div', { className: 'bb-comp-col' },
        h(D.LinkCard, { href: '#', index: '01', tag: 'Artigo', title: 'Com IA ficou mais fácil fazer Marketing?', sub: 'Output não é outcome.' }),
        h(D.LinkCard, { href: '#', index: '05', tag: 'Conversa direta', title: 'Fale comigo no WhatsApp', sub: 'Bora tomar esse café?', variant: 'primary', whatsapp: true }),
        h('div', { className: 'dc-row' }, h(D.Button, { variant: 'primary' }, 'Quero meu diagnóstico'), h(D.Button, { variant: 'outline' }, 'Ver o método'))),
      h('div', { className: 'bb-comp-col' },
        h(D.StatBlock, { value: 'R$ 150.000', suffix: '+', label: 'gerenciados por mês em anúncios online', note: 'todo mês!' }),
        h('div', { className: 'bb-tape-box' }, h(D.Tape, { animated: false })))),
    h('p', { className: 'bb-note' }, '15 componentes no Design System: Button, Kicker, Headline, Rule, Annotation, Scribble, StatBlock, LinkCard, Tape, RevenueEngine, MythCard, CaseFlow, InstagramPost, LinkedInPost e Slide.'))));

  /* 11 motor de receita */
  slides.push(Wrap(h(D.Slide, { variant: 'system', kicker: 'O framework do motor de receita', title: 'Seis etapas, um', accent: 'gargalo.', bottleneck: 'Handoff', note: 'o gargalo tá aqui', page: '11 / ' + TOTAL, handle: 'Brandbook · Danrlei Carlos' })));

  /* 12 caso */
  slides.push(Wrap(h(D.Slide, { variant: 'case', kicker: 'Caso em cinco passos · CaseFlow', title: 'O evento era', accent: 'o começo.', case: CASE, page: '12 / ' + TOTAL, handle: 'Brandbook · Danrlei Carlos' })));

  /* 13 sistema FLG */
  var seq = [['Provocação', 'Governante', 'cover / statement'], ['Crença derrubada', 'Governante', 'myth'], ['Diagnóstico', 'Mago', 'system'], ['Lógica e evidência', 'Sábio', 'stat / case / list'], ['Consequência', 'Mago', 'list'], ['Decisão', 'Governante + Herói', 'cta']];
  slides.push(S(13, 'bb-flg', h(F, null, H('Toda peça segue o', 'argumento.', 'Sistema de conteúdo Founder Led Growth'),
    h('ol', { className: 'bb-seq' }, seq.map(function (s, i) { return h('li', { key: i }, h('span', { className: 'n' }, (i + 1)), h('b', null, s[0]), h('i', null, s[1]), h('code', null, s[2])); })),
    h('p', { className: 'bb-note' }, 'A marca pessoal gera demanda; a Uai Sô! executa. Conteúdo pessoal termina em conversa, nunca em “eu resolvo tudo”.'))));

  /* 14 carrossel */
  var sc = 0.25;
  slides.push(S(14, 'bb-carousel', h(F, null, H('O carrossel em', 'sete lâminas.', 'Instagram · 1080×1350'),
    h('div', { className: 'bb-posts' },
      h(D.InstagramPost, { scale: sc, kicker: 'Gargalos de receita', title: 'Seu CAC subiu.', accent: 'E se não for a mídia?', body: 'O problema pode estar cinco etapas depois do clique.', page: '1/7' }),
      h(D.InstagramPost, { scale: sc, variant: 'myth', kicker: 'Crença derrubada', myth: 'Mais tráfego resolve crescimento.', truth: 'Mais mídia em uma operação ruim só compra problemas mais caros.', page: '2/7' }),
      h(D.InstagramPost, { scale: sc, variant: 'system', kicker: 'Diagnóstico', title: 'Onde a receita', accent: 'trava.', bottleneck: 'Handoff', page: '3/7' }),
      h(D.InstagramPost, { scale: sc, variant: 'case', kicker: 'Caso real', title: 'O evento era', accent: 'o começo.', case: CASE, page: '4/7' }),
      h(D.InstagramPost, { scale: sc, variant: 'statement', title: 'Escalar operação desintegrada é escalar', accent: 'desperdício.', page: '5/7' }),
      h(D.InstagramPost, { scale: sc, variant: 'cta', kicker: 'Decisão', title: 'Onde a sua receita trava?', body: 'Me chama pra um café e a gente acha o gargalo.', action: 'Link na bio', page: '7/7' })),
    h('p', { className: 'bb-note' }, 'Provocação → crença derrubada → diagnóstico → evidência → consequência → decisão. Nunca dois statements seguidos; a capa leva foto P&B com disco vermelho.'))));

  /* 15 linkedin */
  var ls = 0.455;
  slides.push(S(15, 'bb-li', h(F, null, H('No LinkedIn, mais', 'decisão.', 'LinkedIn · 1200×1200'),
    h('div', { className: 'bb-posts' },
      h(D.LinkedInPost, { scale: ls, variant: 'myth', kicker: 'Execução × estratégia', title: 'Estratégia não salva', accent: 'operação.', myth: 'Falta estratégia.', truth: 'Mais estratégia não resolve uma operação que não consegue executar.' }),
      h(D.LinkedInPost, { scale: ls, kicker: 'Dados para decisão', title: 'Qual decisão o dashboard', accent: 'mudou?', value: '36', suffix: '%', label: 'de qualificação quando o dado volta para o comercial', note: 'com processo!', body: 'Dashboard bonito que não muda decisão é decoração.' }),
      h(D.LinkedInPost, { scale: ls, variant: 'quote', kicker: 'Marketing com porquê', title: 'Processo demais engessa. Processo de menos vira', accent: 'caos.' })))));

  /* 16 formatos */
  var fm = [['Post e carrossel Instagram', '1080 × 1350', 'InstagramPost'], ['Story / capa de Reels', '1080 × 1920', 'InstagramPost format="story"'], ['Post LinkedIn', '1200 × 1200', 'LinkedInPost'], ['Carrossel PDF LinkedIn', '1080 × 1350', 'InstagramPost'], ['Slide de apresentação', '1920 × 1080', 'Slide'], ['Link na bio e LP', 'até 480px no celular', 'Button, LinkCard, Tape, StatBlock']];
  slides.push(S(16, 'bb-formats', h(F, null, H('Uma marca, todos os', 'formatos.', 'Formatos'),
    h('table', { className: 'bb-table' }, h('thead', null, h('tr', null, h('th', null, 'Peça'), h('th', null, 'Tamanho'), h('th', null, 'Componente'))),
      h('tbody', null, fm.map(function (r, i) { return h('tr', { key: i }, h('td', null, r[0]), h('td', null, r[1]), h('td', null, h('code', null, r[2]))); }))))));

  /* 17 regras */
  var ck = ['A peça defende uma das teses fixas?', 'Tem provocação e sustentação (dado, caso ou mecanismo)?', 'O Mago aparece (sistema, gargalo, conexão)?', 'Fala com dono ou diretor de empresa madura?', 'Termina em decisão ou conversa, sem “eu resolvo tudo”?', 'Um vermelho por título, um gargalo por diagrama?'];
  slides.push(S(17, 'bb-rules', h(F, null, H('Antes de', 'publicar.', 'Regras'),
    h('div', { className: 'bb-cols2' },
      h('ol', { className: 'bb-check' }, ck.map(function (t, i) { return h('li', { key: i }, h('span', null, '□'), t); })),
      h('div', { className: 'bb-rules-side' }, h('span', { className: 'bb-label' }, 'Sombras que viram regra'),
        h('ul', { className: 'bb-list' }, ['Provocação vira guru: nunca dois statements seguidos.', '“É mais rápido eu fazer”: fale de desenhar o sistema, não de resolver sozinho.', 'Complexidade demais: no máximo 6 etapas e 1 gargalo.', 'Governante vira controlador: tom de decisão, nunca de bronca.'].map(function (t, i) { return h('li', { key: i }, t); })))))));

  /* 18 fecho */
  slides.push(Wrap(h(D.Slide, { variant: 'statement', title: 'Mais mídia em uma operação ruim só compra problemas mais', accent: 'caros.', page: '18 / ' + TOTAL, handle: 'Danrlei Carlos · @danrleicarlos' })));

  ReactDOM.createRoot(document.getElementById('deck')).render(h(F, null, slides.map(function (s, i) { return h(F, { key: i }, s); })));
})();
