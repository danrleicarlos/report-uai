/* @ds-bundle: {"format":4,"namespace":"DC","components":[{"name":"Button"},{"name":"Kicker"},{"name":"Headline"},{"name":"Rule"},{"name":"Annotation"},{"name":"Scribble"},{"name":"StatBlock"},{"name":"LinkCard"},{"name":"Tape"},{"name":"RevenueEngine"},{"name":"MythCard"},{"name":"CaseFlow"},{"name":"InstagramPost"},{"name":"LinkedInPost"},{"name":"Slide"}]} */
(function () {
  var R = window.React, h = R.createElement, F = R.Fragment;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function omit(o, keys) { var r = {}; for (var k in o) { if (keys.indexOf(k) < 0) r[k] = o[k]; } return r; }

  /* ---------- grafismos ---------- */
  var PATHS = {
    crown: { vb: '0 0 160 110', d: ['M18 78 L10 22 L46 56 L78 8 L106 54 L148 18 L138 80 C104 72 56 72 18 78 Z', 'M22 90 C60 82 104 82 136 92', 'M40 80 L41 100', 'M92 79 L92 106', 'M122 82 L121 96'], w: 5 },
    x: { vb: '0 0 100 100', d: ['M18 20 C40 42 62 64 84 84', 'M80 16 C58 40 40 62 20 86'], w: 12 },
    tally: { vb: '0 0 50 30', d: ['M6 3 V27 M14 3 V27 M22 3 V27 M30 3 V27 M2 22 L36 6'], w: 2.4 },
    arrow: { vb: '0 0 46 26', d: ['M2 4 C14 22 28 22 40 14 M33 10 L41 14 L36 22'], w: 2.4 },
    strike: { vb: '0 0 100 20', d: ['M2 12 C30 6 64 14 98 7', 'M4 15 C36 10 70 16 96 12'], w: 4 },
    cup: { vb: '0 0 60 60', d: ['M22 6 C18 12 26 14 22 20', 'M32 4 C28 10 36 12 32 18', 'M10 26 H44 V40 C44 48 38 54 30 54 H24 C16 54 10 48 10 40 Z', 'M44 30 H48 C53 30 54 40 48 42 H44'], w: 2.4 }
  };
  var SPLAT = 'M62 30c14-6 30 4 34 18 5-4 14-3 15 4 1 6-6 9-10 8 6 10 4 24-6 30-3 10-16 16-27 12-12 3-25-5-27-17-10-4-14-17-7-26-4-10 4-22 15-22 3-4 8-7 13-7zM118 30a5 5 0 1 1 0 10 5 5 0 0 1 0-10zM30 110a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM72 108c2 0 3 10 3 22 0 4-5 4-5 0 0-12 0-22 2-22z';
  function Scribble(p) {
    var kind = p.kind || 'crown', tone = p.tone || (kind === 'x' || kind === 'strike' ? 'red' : 'ink');
    var style = Object.assign({ width: p.size || 120 }, p.style || {});
    if (p.rotate) style.transform = 'rotate(' + p.rotate + 'deg)';
    var cls = cx('dc-scribble', 'dc-tone-' + tone, p.className);
    if (kind === 'splat') return h('svg', { className: cls, viewBox: '0 0 150 150', style: style, 'aria-hidden': 'true' }, h('path', { d: SPLAT, fill: 'currentColor' }));
    var s = PATHS[kind] || PATHS.crown;
    return h('svg', { className: cls, viewBox: s.vb, style: style, 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', strokeWidth: s.w, strokeLinecap: 'round', strokeLinejoin: 'round' },
      s.d.map(function (d, i) { return h('path', { key: i, d: d }); }));
  }

  /* ---------- web ---------- */
  var WA_D = 'M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.1 1.3 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.6 4.2 1.6 6L0 24l6.3-1.6c1.8 1 3.8 1.5 5.7 1.5 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4z';
  function WaIcon() { return h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true', className: 'dc-wa' }, h('path', { d: WA_D })); }
  function ArrowIcon() { return h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' }, h('path', { d: 'M3 8h10M9 4l4 4-4 4' })); }

  function Button(p) {
    var v = p.variant || 'primary', icon = p.icon || 'arrow';
    var rest = omit(p, ['variant', 'icon', 'className', 'children']);
    var Tag = p.href ? 'a' : 'button';
    if (Tag === 'button' && !rest.type) rest.type = 'button';
    rest.className = cx('dc-btn', 'dc-btn-' + v, p.className);
    return h(Tag, rest, icon === 'whatsapp' ? h(WaIcon) : null, h('span', null, p.children), icon === 'arrow' ? h('span', { className: 'dc-btn-arrow' }, h(ArrowIcon)) : null);
  }

  function Kicker(p) { if (p.children == null || p.children === '') return null; return h('div', { className: cx('dc-kicker', p.rule === false && 'dc-kicker-norule', p.tone === 'muted' && 'dc-kicker-muted', p.className) }, p.children); }

  function Accent(word, style) {
    if (!word) return null;
    if (style === 'italic') return h('em', { className: 'dc-accent-italic' }, word);
    if (style === 'strike') return h('span', { className: 'dc-accent-strike' }, word, h(Scribble, { kind: 'strike', className: 'dc-strike-svg' }));
    if (style === 'plain') return h('span', { className: 'dc-accent-plain' }, word);
    return h('span', { className: 'dc-accent-underline' }, word);
  }
  function Headline(p) {
    var Tag = p.as || 'h1', size = p.size || 'xl';
    var lines = (p.children == null ? [] : [].concat(p.children));
    return h(Tag, { className: cx('dc-headline', 'dc-headline-' + size, p.className), style: p.style },
      lines.map(function (l, i) { return h(F, { key: i }, l, (i < lines.length - 1 || p.accent) && p.breakBeforeAccent !== false ? h('br') : ' '); }),
      Accent(p.accent, p.accentStyle || (size === 'xl' ? 'underline' : 'italic')));
  }

  function Rule(p) { return h('div', { className: cx('dc-rule', p.className), 'aria-hidden': 'true' }, h('i'), h('i'), h('i')); }

  function Annotation(p) {
    var st = Object.assign({}, p.style || {}); st.transform = 'rotate(' + (p.rotate == null ? -4 : p.rotate) + 'deg)';
    return h('span', { className: cx('dc-annotation', 'dc-annotation-' + (p.variant || 'hand'), 'dc-tone-' + (p.tone || 'red'), p.className), style: st }, p.children);
  }

  function StatBlock(p) {
    return h('div', { className: cx('dc-stat', p.className) },
      p.note ? h('span', { className: 'dc-stat-note' }, p.note) : null,
      h('span', { className: 'dc-stat-value' }, p.value, p.suffix ? h('i', null, p.suffix) : null),
      p.label ? h('span', { className: 'dc-stat-label' }, p.label) : null);
  }

  function LinkCard(p) {
    var primary = p.variant === 'primary';
    var rest = omit(p, ['variant', 'index', 'tag', 'title', 'sub', 'className', 'whatsapp']);
    rest.className = cx('dc-link', primary && 'dc-link-primary', p.className);
    return h('a', rest,
      h('span', { className: 'dc-link-num' }, p.index),
      h('span', { className: 'dc-link-txt' },
        p.tag ? h('span', { className: 'dc-link-tag' }, p.tag) : null,
        h('span', { className: 'dc-link-title' }, p.title),
        p.sub ? h('span', { className: 'dc-link-sub' }, p.sub) : null),
      h('span', { className: 'dc-link-arrow' }, p.whatsapp ? h(WaIcon) : h(ArrowIcon)));
  }

  function Tape(p) {
    var items = p.items || ['Marketing com porquê', 'Sem achismo', 'Dado > opinião', 'Receita > vaidade', 'Penso, logo vendo'];
    var seq = items.concat(items);
    var st = { transform: 'rotate(' + (p.tilt == null ? -3 : p.tilt) + 'deg)' };
    return h('div', { className: cx('dc-tape', p.animated === false && 'dc-tape-still', p.className), style: st, 'aria-hidden': 'true' },
      h('div', { className: 'dc-tape-track' }, seq.map(function (t, i) { return h(F, { key: i }, h('span', null, t), h('span', { className: 'x' }, '✕')); })));
  }

  /* ---------- arquétipos ---------- */
  var ENGINE = ['Aquisição', 'Conversão', 'Handoff', 'Dados', 'Capacidade operacional', 'Feedback'];
  function Ring() {
    return h('svg', { className: 'dc-ring', viewBox: '0 0 200 100', preserveAspectRatio: 'none', 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round' },
      h('path', { d: 'M18 58 C8 22 92 6 160 14 C204 20 198 78 150 90 C96 102 20 92 12 52 C10 40 26 26 40 22', vectorEffect: 'non-scaling-stroke' }));
  }
  function RevenueEngine(p) {
    var stages = p.stages || ENGINE;
    var b = typeof p.bottleneck === 'string' ? stages.indexOf(p.bottleneck) : (p.bottleneck == null ? -1 : p.bottleneck);
    return h('div', { className: cx('dc-engine', p.className) },
      h('ol', { className: 'dc-engine-grid' }, stages.map(function (s, i) {
        var hit = i === b;
        return h('li', { key: i, className: cx('dc-engine-node', hit && 'is-bottleneck', i % 3 === 2 && 'is-row-end') },
          h('span', { className: 'dc-engine-num' }, (i < 9 ? '0' : '') + (i + 1)),
          h('span', { className: 'dc-engine-name' }, s),
          hit ? h(Ring) : null,
          hit ? h(Annotation, { className: 'dc-engine-note', rotate: -6 }, p.note || 'o gargalo tá aqui') : null);
      })),
      p.loop === false ? null : h('div', { className: 'dc-engine-loop' }, h('span', null, '↺'), p.loopLabel || 'O feedback volta para a aquisição. O motor gira de novo.'));
  }

  function MythCard(p) {
    return h('div', { className: cx('dc-myth', p.className) },
      h('div', { className: 'dc-myth-a' },
        h('span', { className: 'dc-myth-label' }, p.mythLabel || 'Crença comum'),
        h('p', { className: 'dc-myth-text' }, '“', p.myth, '”'),
        h(Scribble, { kind: 'x', className: 'dc-myth-x' })),
      h('div', { className: 'dc-myth-b' },
        h('span', { className: 'dc-myth-label dc-myth-label-red' }, p.truthLabel || 'Na real'),
        h('p', { className: 'dc-myth-truth' }, p.truth)));
  }

  var CASE_KEYS = [['context', 'Contexto'], ['bottleneck', 'Gargalo'], ['integration', 'Integração'], ['decision', 'Decisão'], ['result', 'Efeito na receita']];
  function CaseFlow(p) {
    return h('div', { className: cx('dc-case', p.className) },
      p.client ? h('div', { className: 'dc-case-client' }, p.client) : null,
      h('ol', { className: 'dc-case-steps' }, CASE_KEYS.map(function (k, i) {
        if (k[0] === 'result') {
          return h('li', { key: i, className: 'dc-case-step dc-case-result' },
            h('span', { className: 'dc-case-k' }, k[1]),
            p.resultValue ? h('span', { className: 'dc-case-v' }, p.resultValue) : null,
            h('p', null, p.result));
        }
        return h('li', { key: i, className: cx('dc-case-step', k[0] === 'bottleneck' && 'is-bottleneck') },
          h('span', { className: 'dc-case-k' }, k[1]), h('p', null, p[k[0]]));
      })));
  }

  /* ---------- canvases ---------- */
  function Canvas(w, ht, scale, cls, children, style) {
    scale = scale || 1;
    return h('div', { className: 'dc-canvas-scale', style: { width: w * scale, height: ht * scale } },
      h('div', { className: cx('dc-canvas', cls), style: Object.assign({ width: w, height: ht, transform: 'scale(' + scale + ')' }, style || {}) }, children));
  }
  function Photo(p) {
    return h('div', { className: 'dc-photo' },
      h('div', { className: 'dc-photo-disc' }),
      p.image ? h('img', { src: p.image, alt: p.alt || '' }) : h('div', { className: 'dc-photo-ph' }, h('span', null, 'foto P&B')),
      p.crown !== false ? h(Scribble, { kind: 'crown', className: 'dc-photo-crown', size: 260, rotate: -9 }) : null);
  }
  function Foot(p, w) {
    return h('div', { className: 'dc-canvas-foot' }, h('span', null, p.handle || '@danrleicarlos'), p.page ? h('span', null, p.page) : null);
  }
  function Lines(t) { return [].concat(t || []).map(function (l, i, a) { return h(F, { key: i }, l, i < a.length - 1 ? h('br') : null); }); }

  function InstagramPost(p) {
    var v = p.variant || 'cover', story = p.format === 'story';
    var W = 1080, H = story ? 1920 : 1350;
    var body;
    if (v === 'statement') {
      body = h(F, null, h(Kicker, { tone: 'muted', rule: false }, p.kicker),
        h('p', { className: 'dc-ig-statement-text' }, Lines(p.title), p.accent ? h(F, null, ' ', Accent(p.accent, 'strike')) : null),
        p.body ? h('p', { className: 'dc-ig-statement-sub' }, p.body) : null);
    } else if (v === 'stat') {
      body = h(F, null, h(Kicker, null, p.kicker), h('div', { className: 'dc-ig-stat-value' }, p.value, p.suffix ? h('i', null, p.suffix) : null),
        h(Rule), h('p', { className: 'dc-ig-lead' }, p.body), p.note ? h(Annotation, { className: 'dc-ig-note', rotate: -5 }, p.note) : null);
    } else if (v === 'list') {
      body = h(F, null, h(Kicker, null, p.kicker), h(Headline, { size: 'l', accent: p.accent, as: 'h2', className: 'dc-ig-h2' }, p.title),
        h('ol', { className: 'dc-ig-list' }, (p.items || []).map(function (it, i) { return h('li', { key: i }, h('span', null, (i < 9 ? '0' : '') + (i + 1)), h('p', null, it)); })));
    } else if (v === 'myth') {
      body = h(F, null, h(Kicker, null, p.kicker), p.title ? h(Headline, { size: 'l', as: 'h2', accent: p.accent, className: 'dc-ig-h2' }, p.title) : null,
        h(MythCard, { myth: p.myth, truth: p.truth, mythLabel: p.mythLabel, truthLabel: p.truthLabel }));
    } else if (v === 'system') {
      body = h(F, null, h(Kicker, null, p.kicker), h(Headline, { size: 'l', as: 'h2', accent: p.accent, className: 'dc-ig-h2' }, p.title),
        h(RevenueEngine, { stages: p.stages, bottleneck: p.bottleneck, note: p.note, loop: false }), p.body ? h('p', { className: 'dc-ig-small' }, p.body) : null);
    } else if (v === 'case') {
      body = h(F, null, h(Kicker, null, p.kicker), h(Headline, { size: 'l', as: 'h2', accent: p.accent, className: 'dc-ig-h2' }, p.title),
        h(CaseFlow, p.case || {}));
    } else if (v === 'cta') {
      body = h(F, null, h(Kicker, { tone: 'muted', rule: false }, p.kicker), h('p', { className: 'dc-ig-cta-title' }, Lines(p.title)),
        p.body ? h('p', { className: 'dc-ig-cta-body' }, p.body) : null,
        h('div', { className: 'dc-ig-cta-action' }, h(Scribble, { kind: 'cup', size: 96, tone: 'paper' }), h('span', null, p.action || 'Link na bio')));
    } else {
      body = h(F, null, h(Kicker, null, p.kicker), h(Headline, { size: 'xl', accent: p.accent, className: 'dc-ig-h1' }, p.title),
        h(Rule), p.body ? h('p', { className: 'dc-ig-lead' }, p.body) : null, h(Photo, { image: p.image, alt: p.alt }),
        p.note ? h(Annotation, { className: 'dc-ig-stamp', variant: 'marker', tone: 'ink', rotate: -6 }, p.note) : null);
    }
    return Canvas(W, H, p.scale, cx('dc-ig', 'dc-ig-' + v, story && 'dc-ig-story', 'dc-grain'), h(F, null, h('div', { className: 'dc-ig-inner' }, body), Foot(p)));
  }

  function LinkedInPost(p) {
    var v = p.variant || 'insight', body;
    if (v === 'quote') {
      body = h(F, null, h(Kicker, null, p.kicker), h('p', { className: 'dc-li-quote-text' }, '“', Lines(p.title), p.accent ? h(F, null, ' ', Accent(p.accent, 'underline')) : null, '”'),
        h(Rule), h('p', { className: 'dc-li-author' }, h('b', null, 'Danrlei Carlos'), h('br'), p.role || 'Sócio-diretor · Uai Sô! Marketing com porquê'));
    } else if (v === 'myth') {
      body = h(F, null, h(Kicker, null, p.kicker), p.title ? h(Headline, { size: 'l', as: 'h2', accent: p.accent, className: 'dc-li-h2' }, p.title) : null,
        h(MythCard, { myth: p.myth, truth: p.truth, mythLabel: p.mythLabel, truthLabel: p.truthLabel }));
    } else if (v === 'case') {
      body = h(F, null, h(Kicker, null, p.kicker), h(Headline, { size: 'l', as: 'h2', accent: p.accent, className: 'dc-li-h2 dc-li-h2-s' }, p.title), h(CaseFlow, p.case || {}));
    } else {
      body = h(F, null, h(Kicker, null, p.kicker), h(Headline, { size: 'l', as: 'h2', accent: p.accent, className: 'dc-li-h2' }, p.title),
        h('div', { className: 'dc-li-row' }, h(StatBlock, { value: p.value, suffix: p.suffix, label: p.label, note: p.note }), h('p', { className: 'dc-li-body' }, p.body)));
    }
    return Canvas(1200, 1200, p.scale, cx('dc-li', 'dc-li-' + v, 'dc-grain'), h(F, null, h('div', { className: 'dc-li-inner' }, body), Foot(p)));
  }

  function Slide(p) {
    var v = p.variant || 'title', body;
    if (v === 'statement') {
      body = h('p', { className: 'dc-sl-statement-text' }, Lines(p.title), p.accent ? h(F, null, ' ', Accent(p.accent, 'strike')) : null);
    } else if (v === 'section') {
      body = h(F, null, h('span', { className: 'dc-sl-num' }, p.number || '01'), h(Headline, { size: 'xl', accent: p.accent, className: 'dc-sl-h1' }, p.title), h(Rule));
    } else if (v === 'data') {
      body = h(F, null, h(Kicker, null, p.kicker), h(Headline, { size: 'l', as: 'h2', accent: p.accent, className: 'dc-sl-h2' }, p.title),
        h('div', { className: 'dc-sl-data' }, (p.stats || []).map(function (s, i) { return h('div', { key: i, className: 'dc-sl-datum' }, h('span', { className: 'dc-sl-datum-v' }, s.value), h('span', { className: 'dc-sl-datum-l' }, s.label)); })));
    } else if (v === 'system') {
      body = h(F, null, h(Kicker, null, p.kicker), h(Headline, { size: 'l', as: 'h2', accent: p.accent, className: 'dc-sl-h2' }, p.title),
        h(RevenueEngine, { stages: p.stages, bottleneck: p.bottleneck, note: p.note, loopLabel: p.loopLabel }));
    } else if (v === 'case') {
      body = h(F, null, h(Kicker, null, p.kicker), h(Headline, { size: 'l', as: 'h2', accent: p.accent, className: 'dc-sl-h2' }, p.title), h(CaseFlow, Object.assign({ className: 'dc-case-row' }, p.case || {})));
    } else if (v === 'content') {
      body = h(F, null, h(Kicker, null, p.kicker), h(Headline, { size: 'l', as: 'h2', accent: p.accent, className: 'dc-sl-h2' }, p.title),
        h('ol', { className: 'dc-sl-list' }, (p.items || []).map(function (it, i) { return h('li', { key: i }, h('span', null, (i < 9 ? '0' : '') + (i + 1)), h('p', null, it)); })));
    } else {
      body = h(F, null, h(Kicker, null, p.kicker), h(Headline, { size: 'xl', accent: p.accent, className: 'dc-sl-h1' }, p.title), h(Rule),
        p.body ? h('p', { className: 'dc-sl-lead' }, p.body) : null, h(Photo, { image: p.image, alt: p.alt }));
    }
    return Canvas(1920, 1080, p.scale, cx('dc-sl', 'dc-sl-' + v, 'dc-grain'), h(F, null, h('div', { className: 'dc-sl-inner' }, body), Foot(p)));
  }

  var api = { Button: Button, Kicker: Kicker, Headline: Headline, Rule: Rule, Annotation: Annotation, Scribble: Scribble, StatBlock: StatBlock, LinkCard: LinkCard, Tape: Tape, RevenueEngine: RevenueEngine, MythCard: MythCard, CaseFlow: CaseFlow, InstagramPost: InstagramPost, LinkedInPost: LinkedInPost, Slide: Slide };
  window.DC = window.DC || {};
  Object.assign(window.DC, api);
})();
