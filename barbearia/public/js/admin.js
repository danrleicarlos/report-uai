/* Painel do administrador (responsivo: celular e desktop) */
(function () {
  'use strict';
  const {
    api, esc, toast, modal, confirmDialog, dur, durHuman, fmtTime, fmtDate, fmtDateShort, fmtDateTime, money,
    startOfDay, endOfDay, toInputDate, fromInputDate, bytes, resumo, precoProc, popPill,
  } = BP;

  const ICON = {
    dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></svg>',
    team: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.6c2.3.2 3.9 1.8 4.5 4.4"/></svg>',
    scissors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.6 7.6 20 19M8.6 16.4 20 5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 4 6v6c0 4.5 3.3 8.3 8 9 4.7-.7 8-4.5 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
  };
  const TABS = [
    { id: 'dashboard', label: 'Dashboard', short: 'Painel', icon: ICON.dash },
    { id: 'atendimentos', label: 'Atendimentos', short: 'Registros', icon: ICON.list },
    { id: 'equipe', label: 'Equipe', short: 'Equipe', icon: ICON.team },
    { id: 'procedimentos', label: 'Procedimentos & POP', short: 'POP', icon: ICON.scissors },
    { id: 'dados', label: 'Dados & backup', short: 'Backup', icon: ICON.shield },
  ];

  const state = {
    me: null, shop: 'Barber POP', tab: 'dashboard',
    servicos: [], usuarios: [], status: null, mirrorInfo: null,
    dash: { periodo: '7d', de: null, ate: null, barbeiro: '' },
    list: { periodo: 'hoje', de: null, ate: null, barbeiro: '', servico: '', status: '', checklist: '', busca: '', modo: 'geral' },
    data: [], ativos: [], expanded: new Set(), svcDraft: null, svcDirty: false, svcOpen: new Set(),
  };
  const $view = document.getElementById('view');
  const $alerts = document.getElementById('alerts');

  // ------------------------------------------------------------------
  // Espelho local (IndexedDB): cópia de segurança dos últimos 60 dias neste navegador
  // ------------------------------------------------------------------
  const MIRROR_DAYS = 60;
  const mirror = {
    db: null,
    open() {
      return new Promise((resolve) => {
        if (!('indexedDB' in window)) return resolve(null);
        const req = indexedDB.open('barberpop-espelho', 1);
        req.onupgradeneeded = () => { req.result.createObjectStore('atendimentos', { keyPath: 'id' }); req.result.createObjectStore('meta'); };
        req.onsuccess = () => { this.db = req.result; resolve(this.db); };
        req.onerror = () => resolve(null);
      });
    },
    tx(store, mode) { return this.db.transaction(store, mode).objectStore(store); },
    all() {
      return new Promise((resolve) => {
        if (!this.db) return resolve([]);
        const r = this.tx('atendimentos', 'readonly').getAll();
        r.onsuccess = () => resolve(r.result || []); r.onerror = () => resolve([]);
      });
    },
    put(list) {
      return new Promise((resolve) => {
        if (!this.db) return resolve();
        const t = this.db.transaction(['atendimentos', 'meta'], 'readwrite');
        const st = t.objectStore('atendimentos');
        list.forEach((a) => st.put(a));
        t.objectStore('meta').put(Date.now(), 'sync');
        t.oncomplete = () => resolve(); t.onerror = () => resolve();
      });
    },
    remove(ids) {
      return new Promise((resolve) => {
        if (!this.db || !ids.length) return resolve();
        const t = this.db.transaction('atendimentos', 'readwrite');
        ids.forEach((id) => t.objectStore('atendimentos').delete(id));
        t.oncomplete = () => resolve(); t.onerror = () => resolve();
      });
    },
    meta(k) {
      return new Promise((resolve) => {
        if (!this.db) return resolve(null);
        const r = this.tx('meta', 'readonly').get(k);
        r.onsuccess = () => resolve(r.result || null); r.onerror = () => resolve(null);
      });
    },
  };

  async function syncMirror() {
    if (!mirror.db) return;
    try {
      const desde = Date.now() - MIRROR_DAYS * 86400000;
      const r = await api('GET', `/api/admin/atendimentos?de=${desde}&incluirCancelados=1`);
      const server = r.atendimentos;
      const ids = new Set(server.map((a) => a.id));
      const local = await mirror.all();
      // limpa do espelho o que é muito antigo ou foi removido de propósito (purga com exportação)
      const ultimaPurga = (state.status && state.status.purgas[0]) ? state.status.purgas[0].antesDe : 0;
      const velhos = local.filter((a) => a.criadoEm < desde || (a.criadoEm < ultimaPurga && !ids.has(a.id))).map((a) => a.id);
      await mirror.remove(velhos);
      const faltando = local.filter((a) => a.criadoEm >= desde && a.criadoEm >= ultimaPurga && !ids.has(a.id) && !a.descartado);
      await mirror.put(server);
      state.mirrorInfo = { total: local.length - velhos.length + server.filter((a) => !local.some((l) => l.id === a.id)).length, faltando, sync: Date.now() };
    } catch (e) { /* tenta de novo depois */ }
    renderAlerts();
  }

  // ------------------------------------------------------------------
  // Downloads
  // ------------------------------------------------------------------
  async function download(url, fallbackName) {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.erro || `Erro ${res.status}`);
    }
    const blob = await res.blob();
    const cd = res.headers.get('content-disposition') || '';
    const m = cd.match(/filename="([^"]+)"/);
    saveBlob(blob, m ? m[1] : fallbackName);
    return { exportId: res.headers.get('x-export-id') };
  }
  function saveBlob(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  async function exportFull(modo = 'procedimento') {
    const r = await download(`/api/admin/export.csv?completo=1&modo=${modo}`, 'completo.csv');
    toast('Planilha completa baixada ✓', 'ok');
    loadStatus();
    return r;
  }

  /** CSV gerado no navegador a partir do espelho local (garantia caso o servidor perca dados). */
  function mirrorCsv(list) {
    const cell = (v) => { const s = v === null || v === undefined ? '' : String(v); return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const rows = [['ID atendimento', 'Data', 'Barbeiro', 'Cliente', 'Status', 'Procedimento', 'Descrição', 'Início', 'Fim', 'Duração (min)', 'Checklist feitos', 'Checklist total', 'Checklist pulado', 'Itens não realizados', 'Obs. procedimento', 'Valor (R$)', 'Obs. atendimento']];
    list.sort((a, b) => a.criadoEm - b.criadoEm).forEach((a) => a.procedimentos.forEach((p) => {
      const d = p.inicio && p.fim ? ((p.fim - p.inicio) / 60000).toFixed(1).replace('.', ',') : '';
      rows.push([a.id, fmtDate(a.criadoEm), a.barbeiroNome, a.cliente, a.cancelado ? 'cancelado' : a.status, p.nome, p.descricao, fmtTime(p.inicio), fmtTime(p.fim), d,
        p.checklist.filter((c) => c.feito).length, p.checklist.length, p.checklistPulado && !p.checklistEm ? 'sim' : 'não',
        p.checklist.filter((c) => !c.feito).map((c) => c.texto).join(' | '), p.obs, precoProc(p).toFixed(2).replace('.', ','), a.observacoes]);
    }));
    return '﻿' + rows.map((r) => r.map(cell).join(';')).join('\r\n');
  }

  // ------------------------------------------------------------------
  // Carregamento
  // ------------------------------------------------------------------
  async function loadStatus() {
    try { state.status = await api('GET', '/api/admin/status'); } catch (e) { /* */ }
    renderAlerts();
  }
  async function loadServicos() { state.servicos = (await api('GET', '/api/servicos')).servicos; }
  async function loadUsuarios() { state.usuarios = (await api('GET', '/api/admin/usuarios')).usuarios; }
  function barbeiros() { return state.usuarios.filter((u) => u.papel === 'barbeiro' || state.data.some((a) => a.barbeiroId === u.id)); }
  function moneyInt(v) { return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
  function comissaoDe(id) { const u = state.usuarios.find((x) => x.id === id); return u ? Number(u.comissao) || 0 : 0; }

  function rangeOf(f) {
    const n = new Date();
    switch (f.periodo) {
      case 'hoje': return [startOfDay(n), endOfDay(n)];
      case 'ontem': { const d = new Date(n); d.setDate(d.getDate() - 1); return [startOfDay(d), endOfDay(d)]; }
      case '7d': { const d = new Date(n); d.setDate(d.getDate() - 6); return [startOfDay(d), endOfDay(n)]; }
      case '30d': { const d = new Date(n); d.setDate(d.getDate() - 29); return [startOfDay(d), endOfDay(n)]; }
      case 'mes': return [new Date(n.getFullYear(), n.getMonth(), 1).getTime(), endOfDay(n)];
      case 'mespassado': return [new Date(n.getFullYear(), n.getMonth() - 1, 1).getTime(), new Date(n.getFullYear(), n.getMonth(), 0, 23, 59, 59, 999).getTime()];
      default: return [f.de ? fromInputDate(f.de) : startOfDay(n), f.ate ? endOfDay(fromInputDate(f.ate)) : endOfDay(n)];
    }
  }
  function qs(obj) { return Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&'); }
  function listQuery(f, extra = {}) {
    const [de, ate] = rangeOf(f);
    return qs({ de, ate, barbeiro: f.barbeiro, servico: f.servico, status: f.status, checklist: f.checklist, busca: f.busca, ...extra });
  }

  async function loadData() {
    const f = state.tab === 'dashboard' ? state.dash : state.list;
    const [r, at] = await Promise.all([
      api('GET', `/api/admin/atendimentos?${listQuery(f)}`),
      api('GET', '/api/admin/atendimentos?status=em_andamento'),
    ]);
    state.data = r.atendimentos;
    state.ativos = at.atendimentos;
  }

  // ------------------------------------------------------------------
  // Navegação
  // ------------------------------------------------------------------
  function renderNav() {
    const alertCount = state.status ? state.status.alertas.filter((a) => a.nivel === 'perigo').length : 0;
    document.getElementById('nav').innerHTML = TABS.map((t) => `<button class="nav-btn ${state.tab === t.id ? 'on' : ''}" data-tab="${t.id}">${t.icon}<span>${t.label}</span>${t.id === 'dados' && alertCount ? `<span class="pill pill-bad badge">${alertCount}</span>` : ''}</button>`).join('');
    document.getElementById('tabbar').innerHTML = TABS.map((t) => `<button class="${state.tab === t.id ? 'on' : ''}" data-tab="${t.id}">${t.icon}<span>${t.short}</span></button>`).join('');
    document.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => go(b.dataset.tab)));
  }
  async function go(tab) {
    if (state.svcDirty && tab !== 'procedimentos') {
      if (!(await confirmDialog('Alterações não salvas', 'Você alterou procedimentos/checklists e não salvou. Sair mesmo assim?', 'Sair sem salvar', 'btn-bad'))) return;
      state.svcDirty = false; state.svcDraft = null;
    }
    state.tab = tab;
    location.hash = `#${tab}`;
    renderNav();
    window.scrollTo(0, 0);
    await render(true);
  }

  function renderAlerts() {
    const out = [];
    const st = state.status;
    if (st) {
      st.alertas.forEach((a) => out.push(`<div class="alert ${a.nivel === 'perigo' ? 'alert-bad' : 'alert-warn'}"><span>⚠</span><span class="grow">${esc(a.texto)}</span>
        ${['exportacao', 'gravacao', 'backup', 'backup-atrasado', 'disco', 'recuperado'].includes(a.codigo) ? '<button class="btn btn-sm" data-export-full>Exportar planilha completa</button>' : ''}
        ${a.codigo === 'senha-padrao' ? '<button class="btn btn-sm" data-goto="equipe">Ir para Equipe</button>' : ''}</div>`));
    }
    const mi = state.mirrorInfo;
    if (mi && mi.faltando.length) {
      out.push(`<div class="alert alert-bad"><span>⚠</span><span class="grow"><b>Possível perda de dados no servidor:</b> ${mi.faltando.length} atendimento(s) existem na cópia de segurança deste navegador, mas não estão mais no servidor. Exporte a planilha do espelho e restaure.</span>
        <button class="btn btn-sm" data-mirror-csv>Baixar CSV do espelho</button><button class="btn btn-sm btn-gold" data-mirror-restore>Restaurar no servidor</button></div>`);
    }
    $alerts.innerHTML = out.join('');
    $alerts.querySelectorAll('[data-export-full]').forEach((b) => b.addEventListener('click', () => exportFull().catch((e) => toast(e.message, 'bad'))));
    $alerts.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => go(b.dataset.goto)));
    $alerts.querySelectorAll('[data-mirror-csv]').forEach((b) => b.addEventListener('click', downloadMirrorCsv));
    $alerts.querySelectorAll('[data-mirror-restore]').forEach((b) => b.addEventListener('click', restoreMirror));
    renderNav();
  }

  async function downloadMirrorCsv() {
    const list = await mirror.all();
    if (!list.length) { toast('O espelho deste navegador está vazio', 'bad'); return; }
    saveBlob(new Blob([mirrorCsv(list)], { type: 'text/csv;charset=utf-8' }), `espelho-navegador-${toInputDate(Date.now())}.csv`);
  }
  async function restoreMirror() {
    const list = await mirror.all();
    if (!list.length) { toast('O espelho deste navegador está vazio', 'bad'); return; }
    if (!(await confirmDialog('Restaurar do espelho', `Enviar ${list.length} atendimento(s) guardados neste navegador para o servidor? Registros existentes não são apagados; só entram os que faltam ou estão desatualizados.`, 'Restaurar'))) return;
    try {
      const r = await api('POST', '/api/admin/importar', { atendimentos: list });
      toast(`Restaurado: ${r.novos} novo(s), ${r.atualizados} atualizado(s)`, 'ok');
      await syncMirror(); await loadStatus(); render();
    } catch (e) { toast(e.message, 'bad'); }
  }

  // ------------------------------------------------------------------
  // Componentes
  // ------------------------------------------------------------------
  function periodSeg(f, opts) {
    const items = opts || [['hoje', 'Hoje'], ['ontem', 'Ontem'], ['7d', '7 dias'], ['30d', '30 dias'], ['mes', 'Este mês'], ['mespassado', 'Mês passado'], ['custom', 'Período']];
    return `<div class="seg" data-seg="periodo">${items.map(([v, l]) => `<button class="${f.periodo === v ? 'on' : ''}" data-v="${v}">${l}</button>`).join('')}</div>
      <div class="row row-wrap" data-custom ${f.periodo === 'custom' ? '' : 'hidden'} style="margin-top:10px">
        <input type="date" class="input input-sm" data-f="de" value="${f.de || toInputDate(Date.now())}" style="width:auto">
        <span class="muted">até</span>
        <input type="date" class="input input-sm" data-f="ate" value="${f.ate || toInputDate(Date.now())}" style="width:auto">
      </div>`;
  }
  function bindFilters(root, f) {
    root.querySelectorAll('[data-seg="periodo"] button').forEach((b) => b.addEventListener('click', () => {
      f.periodo = b.dataset.v;
      if (f.periodo === 'custom') { f.de = f.de || toInputDate(Date.now()); f.ate = f.ate || toInputDate(Date.now()); }
      render(true);
    }));
    root.querySelectorAll('[data-f]').forEach((el) => el.addEventListener(el.tagName === 'INPUT' && el.type === 'search' ? 'input' : 'change', debounce(() => {
      f[el.dataset.f] = el.value;
      render(true);
    }, el.type === 'search' ? 400 : 0)));
  }
  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); if (!ms) fn(...a); else t = setTimeout(() => fn(...a), ms); }; }
  function barberSelect(f) {
    return `<select class="input input-sm" data-f="barbeiro"><option value="">Todos os barbeiros</option>
      ${state.usuarios.filter((u) => u.papel === 'barbeiro' || u.atendimentos).map((u) => `<option value="${u.id}" ${f.barbeiro === u.id ? 'selected' : ''}>${esc(u.nome)}${u.ativo ? '' : ' (inativo)'}</option>`).join('')}</select>`;
  }

  // ------------------------------------------------------------------
  // Dashboard
  // ------------------------------------------------------------------
  function renderDashboard() {
    const f = state.dash;
    const list = state.data;
    const fin = list.filter((a) => a.status === 'finalizado');
    const rs = fin.map((a) => ({ a, r: resumo(a) }));
    const tempos = rs.map((x) => x.r.tempoTotal).filter(Boolean);
    const procs = fin.flatMap((a) => a.procedimentos.map((p) => ({ a, p })));
    const totalItens = rs.reduce((s, x) => s + x.r.totalItens, 0);
    const feitos = rs.reduce((s, x) => s + x.r.feitos, 0);
    const pulados = procs.filter(({ p }) => p.checklistPulado && !p.checklistEm).length;
    const valor = rs.reduce((s, x) => s + x.r.valor, 0);
    const comissao = rs.reduce((s, x) => s + (x.r.valor * comissaoDe(x.a.barbeiroId)) / 100, 0);
    const [de, ate] = rangeOf(f);

    // Por barbeiro
    const porB = new Map();
    rs.forEach(({ a, r }) => {
      const b = porB.get(a.barbeiroId) || { nome: a.barbeiroNome, id: a.barbeiroId, n: 0, tempo: 0, nt: 0, itens: 0, feitos: 0, pulados: 0, valor: 0, procs: 0 };
      b.n++; if (r.tempoTotal) { b.tempo += r.tempoTotal; b.nt++; }
      b.itens += r.totalItens; b.feitos += r.feitos; b.pulados += r.pendentes; b.valor += r.valor; b.procs += a.procedimentos.length;
      porB.set(a.barbeiroId, b);
    });
    const bRows = [...porB.values()].sort((x, y) => y.n - x.n);

    // Por procedimento
    const porP = new Map();
    procs.forEach(({ p }) => {
      const k = p.nome;
      const x = porP.get(k) || { nome: k, n: 0, tempo: 0, nt: 0, padrao: p.tempoPadraoMin || 0, itens: 0, feitos: 0 };
      x.n++; if (p.inicio && p.fim) { x.tempo += p.fim - p.inicio; x.nt++; }
      x.itens += p.checklist.length; x.feitos += p.checklist.filter((c) => c.feito).length;
      porP.set(k, x);
    });
    const pRows = [...porP.values()].sort((x, y) => y.n - x.n);
    const maxP = Math.max(1, ...pRows.map((x) => x.n));

    // Itens do POP mais esquecidos
    const falhas = new Map();
    procs.forEach(({ p }) => {
      if (p.checklistPulado && !p.checklistEm) return;
      p.checklist.forEach((c) => {
        const k = `${p.nome}|${c.texto}`;
        const x = falhas.get(k) || { proc: p.nome, texto: c.texto, falhas: 0, total: 0 };
        x.total++; if (!c.feito) x.falhas++;
        falhas.set(k, x);
      });
    });
    const fRows = [...falhas.values()].filter((x) => x.falhas).sort((x, y) => y.falhas / y.total - x.falhas / x.total || y.falhas - x.falhas).slice(0, 8);

    // Série temporal
    const oneDay = ate - de < 36 * 3600000;
    const buckets = [];
    if (oneDay) {
      for (let h = 7; h <= 22; h++) buckets.push({ label: `${h}h`, n: fin.filter((a) => new Date(a.criadoEm).getHours() === h).length });
    } else {
      const d = new Date(de);
      while (d.getTime() <= ate && buckets.length < 62) {
        const s = startOfDay(d); const e = endOfDay(d);
        buckets.push({ label: fmtDateShort(s), n: fin.filter((a) => a.criadoEm >= s && a.criadoEm <= e).length });
        d.setDate(d.getDate() + 1);
      }
    }
    const maxB = Math.max(1, ...buckets.map((b) => b.n));

    $view.innerHTML = `
      <div class="a-head"><h1 class="grow">Dashboard</h1>
        <div class="row row-wrap">${barberSelect(f)}</div></div>
      <div style="margin-bottom:16px">${periodSeg(f)}</div>

      <div class="eyebrow" style="margin-bottom:10px">Agora nas cadeiras</div>
      ${liveGrid()}

      <div class="kpis" style="margin-top:18px">
        <div class="kpi"><div class="l">Atendimentos</div><div class="v mono">${fin.length}</div><div class="s">${procs.length} procedimentos</div></div>
        <div class="kpi"><div class="l">Tempo médio / atendimento</div><div class="v mono">${tempos.length ? durHuman(tempos.reduce((s, x) => s + x, 0) / tempos.length) : '—'}</div><div class="s">do 1º início ao último fim</div></div>
        <div class="kpi"><div class="l">POP cumprido</div><div class="v mono" style="color:${totalItens ? (feitos / totalItens >= .9 ? 'var(--ok)' : feitos / totalItens >= .7 ? 'var(--warn)' : 'var(--bad)') : 'inherit'}">${totalItens ? Math.round((feitos / totalItens) * 100) + '%' : '—'}</div><div class="s">${feitos}/${totalItens} itens marcados</div></div>
        <div class="kpi"><div class="l">Checklists pulados</div><div class="v mono" style="color:${pulados ? 'var(--warn)' : 'inherit'}">${pulados}</div><div class="s">ainda não preenchidos</div></div>
        <div class="kpi"><div class="l">Faturamento estimado</div><div class="v mono">${moneyInt(valor)}</div><div class="s">pela tabela de preços</div></div>
        <div class="kpi"><div class="l">Comissões</div><div class="v mono">${moneyInt(comissao)}</div><div class="s">conforme % de cada barbeiro</div></div>
      </div>

      <div class="card" style="margin-bottom:14px">
        <h3>Por barbeiro</h3>
        ${bRows.length ? `<div class="table-wrap" style="border:0"><table>
          <thead><tr><th>Barbeiro</th><th class="num">Atend.</th><th class="num">Proced.</th><th class="num">Tempo médio</th><th class="num">POP</th><th class="num">Pulados</th><th class="num">Valor</th><th class="num">Comissão</th></tr></thead>
          <tbody>${bRows.map((b) => {
            const pop = b.itens ? Math.round((b.feitos / b.itens) * 100) : null;
            return `<tr class="clickable" data-barber="${b.id}"><td><b>${esc(b.nome)}</b></td><td class="num mono">${b.n}</td><td class="num mono">${b.procs}</td><td class="num mono">${b.nt ? durHuman(b.tempo / b.nt) : '—'}</td>
              <td class="num">${pop === null ? '—' : `<span class="pill ${pop >= 90 ? 'pill-ok' : pop >= 70 ? 'pill-warn' : 'pill-bad'}">${pop}%</span>`}</td>
              <td class="num mono">${b.pulados || '—'}</td><td class="num mono">${money(b.valor)}</td><td class="num mono">${money((b.valor * comissaoDe(b.id)) / 100)}</td></tr>`;
          }).join('')}</tbody></table></div>` : '<div class="empty">Sem atendimentos no período.</div>'}
      </div>

      <div class="grid-2" style="margin-bottom:14px">
        <div class="card"><h3>Procedimentos realizados</h3>
          ${pRows.length ? `<div class="bars">${pRows.map((x) => `<div class="bar-row"><span title="${esc(x.nome)}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.nome)}</span><div class="bar-track"><i style="width:${(x.n / maxP) * 100}%"></i></div><b class="mono" style="text-align:right">${x.n}</b></div>`).join('')}</div>` : '<div class="empty">Sem dados.</div>'}
        </div>
        <div class="card"><h3>Tempo médio × padrão</h3>
          ${pRows.length ? `<div class="table-wrap" style="border:0"><table><thead><tr><th>Procedimento</th><th class="num">Médio</th><th class="num">Padrão</th><th class="num">POP</th></tr></thead><tbody>
            ${pRows.map((x) => {
              const med = x.nt ? x.tempo / x.nt : 0; const over = x.padrao && med > x.padrao * 60000 * 1.15; const under = x.padrao && med && med < x.padrao * 60000 * 0.7;
              const pop = x.itens ? Math.round((x.feitos / x.itens) * 100) : null;
              return `<tr><td>${esc(x.nome)}</td><td class="num mono" style="color:${over ? 'var(--bad)' : under ? 'var(--warn)' : 'inherit'}">${med ? durHuman(med) : '—'}</td><td class="num mono muted">${x.padrao ? x.padrao + ' min' : '—'}</td><td class="num mono">${pop === null ? '—' : pop + '%'}</td></tr>`;
            }).join('')}</tbody></table></div>
            <div class="faint tiny" style="margin-top:8px">Vermelho: 15% acima do padrão · Amarelo: muito abaixo do padrão (possível pulo de etapas)</div>` : '<div class="empty">Sem dados.</div>'}
        </div>
      </div>

      <div class="grid-2">
        <div class="card"><h3>${oneDay ? 'Atendimentos por horário' : 'Atendimentos por dia'}</h3>
          <div class="cols">${buckets.map((b) => `<div class="c" title="${b.label}: ${b.n}"><b>${b.n || ''}</b><i style="height:${(b.n / maxB) * 100}%"></i><span>${buckets.length > 16 ? b.label.slice(0, 2) : b.label}</span></div>`).join('')}</div>
        </div>
        <div class="card"><h3>Itens do POP mais esquecidos</h3>
          ${fRows.length ? `<div class="bars">${fRows.map((x) => `<div><div class="row small"><span class="grow">${esc(x.texto)} <span class="faint">· ${esc(x.proc)}</span></span><b class="mono" style="color:var(--bad)">${Math.round((x.falhas / x.total) * 100)}%</b></div>
            <div class="bar-track" style="margin-top:4px"><i style="width:${(x.falhas / x.total) * 100}%;background:var(--bad)"></i></div></div>`).join('')}</div>` : '<div class="empty">Nenhum item esquecido no período 👏</div>'}
        </div>
      </div>`;
    bindFilters($view, f);
    $view.querySelectorAll('[data-barber]').forEach((tr) => tr.addEventListener('click', () => {
      Object.assign(state.list, { periodo: f.periodo, de: f.de, ate: f.ate, barbeiro: tr.dataset.barber });
      go('atendimentos');
    }));
    bindLive();
  }

  function liveGrid() {
    const ativos = state.ativos;
    const busyIds = new Set(ativos.map((a) => a.barbeiroId));
    const livres = state.usuarios.filter((u) => u.papel === 'barbeiro' && u.ativo && !busyIds.has(u.id));
    return `<div class="live-grid">
      ${ativos.map((a) => {
        const r = resumo(a); const run = a.procedimentos.find((p) => p.status === 'em_andamento');
        const done = a.procedimentos.filter((p) => p.status === 'concluido').length;
        return `<div class="live-card busy" data-open-at="${a.id}" style="cursor:pointer">
          <div class="row"><b class="grow">${esc(a.barbeiroNome)}</b><span class="pill pill-gold"><span class="dot dot-live"></span>${run ? 'Em procedimento' : 'Aguardando'}</span></div>
          <div class="muted small" style="margin-top:4px">${esc(a.cliente || 'Cliente')} · ${done}/${a.procedimentos.length} concluídos</div>
          <div class="row" style="margin-top:10px"><span class="grow">${run ? esc(run.nome) : '—'}</span><span class="mono" style="font-weight:700;color:var(--gold-2)" ${run ? `data-since="${run.inicio}"` : ''}>${run ? dur(Date.now() - run.inicio) : ''}</span></div>
          <div class="row faint tiny" style="margin-top:4px"><span class="grow">Total do atendimento</span><span class="mono" ${r.inicio ? `data-since="${r.inicio}"` : ''}>${r.inicio ? dur(Date.now() - r.inicio) : '--:--'}</span></div>
        </div>`;
      }).join('')}
      ${livres.map((u) => `<div class="live-card"><div class="row"><b class="grow">${esc(u.nome)}</b><span class="pill">Livre</span></div><div class="faint small" style="margin-top:6px">Sem atendimento em andamento</div></div>`).join('')}
      ${!ativos.length && !livres.length ? '<div class="empty" style="grid-column:1/-1">Cadastre os barbeiros em <b>Equipe</b> para acompanhar as cadeiras.</div>' : ''}
    </div>`;
  }
  function bindLive() {
    $view.querySelectorAll('[data-open-at]').forEach((el) => el.addEventListener('click', () => {
      const a = state.ativos.find((x) => x.id === el.dataset.openAt);
      if (a) openDetailModal(a);
    }));
  }

  // ------------------------------------------------------------------
  // Atendimentos (linhas por barbeiro e geral)
  // ------------------------------------------------------------------
  function renderAtendimentos() {
    const f = state.list;
    const list = state.data;
    const groups = f.modo === 'barbeiro'
      ? [...list.reduce((m, a) => { (m.get(a.barbeiroId) || m.set(a.barbeiroId, { nome: a.barbeiroNome, id: a.barbeiroId, itens: [] }).get(a.barbeiroId)).itens.push(a); return m; }, new Map()).values()].sort((x, y) => x.nome.localeCompare(y.nome))
      : [{ nome: null, itens: list }];
    const totR = list.filter((a) => !a.cancelado).map(resumo);
    $view.innerHTML = `
      <div class="a-head"><h1 class="grow">Atendimentos</h1>
        <div class="seg" data-modo><button class="${f.modo === 'geral' ? 'on' : ''}" data-v="geral">Geral</button><button class="${f.modo === 'barbeiro' ? 'on' : ''}" data-v="barbeiro">Por barbeiro</button></div>
      </div>
      <div class="card" style="margin-bottom:14px">
        <div style="margin-bottom:12px">${periodSeg(f)}</div>
        <div class="filters">
          <div class="field"><label>Barbeiro</label>${barberSelect(f)}</div>
          <div class="field"><label>Procedimento</label><select class="input input-sm" data-f="servico"><option value="">Todos</option>${state.servicos.map((s) => `<option value="${s.id}" ${f.servico === s.id ? 'selected' : ''}>${esc(s.nome)}</option>`).join('')}</select></div>
          <div class="field"><label>Status</label><select class="input input-sm" data-f="status">
            ${[['', 'Ativos (sem cancelados)'], ['finalizado', 'Finalizados'], ['em_andamento', 'Em andamento'], ['cancelado', 'Cancelados']].map(([v, l]) => `<option value="${v}" ${f.status === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="field"><label>Checklist</label><select class="input input-sm" data-f="checklist">
            ${[['', 'Todos'], ['completo', 'Completo (100%)'], ['incompleto', 'Incompleto'], ['pulado', 'Pulado / pendente']].map(([v, l]) => `<option value="${v}" ${f.checklist === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="field"><label>Buscar</label><input type="search" class="input input-sm" data-f="busca" value="${esc(f.busca)}" placeholder="Cliente, observação..."></div>
        </div>
        <div class="row row-wrap" style="margin-top:14px">
          <span class="muted small grow sum-line">${list.length} atendimento(s) · ${durHuman(totR.reduce((s, r) => s + (r.emAndamento ? 0 : r.tempoTotal), 0))} em atendimento · ${money(totR.reduce((s, r) => s + r.valor, 0))}</span>
          <button class="btn btn-sm" data-csv="atendimento">⬇ CSV (1 linha por atendimento)</button>
          <button class="btn btn-sm btn-gold" data-csv="procedimento">⬇ CSV (1 linha por procedimento)</button>
        </div>
      </div>
      ${list.length ? groups.map((g) => {
        const gr = g.itens.filter((a) => !a.cancelado).map(resumo);
        const gi = gr.reduce((s, r) => s + r.totalItens, 0); const gf = gr.reduce((s, r) => s + r.feitos, 0);
        return `${g.nome ? `<div class="group-title"><h2>${esc(g.nome)}</h2><span class="pill">${g.itens.length} atend.</span>${gi ? `<span class="pill ${gf / gi >= .9 ? 'pill-ok' : 'pill-warn'}">POP ${Math.round((gf / gi) * 100)}%</span>` : ''}<span class="pill">${money(gr.reduce((s, r) => s + r.valor, 0))}</span></div>` : ''}
        <div class="row-head"><span>Data / hora</span><span>Barbeiro</span><span>Serviços</span><span>Tempo total</span><span>POP</span><span class="col-val" style="text-align:right">Valor</span><span></span></div>
        <div class="rows">${g.itens.map(rowCard).join('')}</div>`;
      }).join('') : '<div class="empty">Nenhum atendimento encontrado com esses filtros.</div>'}
    `;
    bindFilters($view, f);
    $view.querySelectorAll('[data-modo] button').forEach((b) => b.addEventListener('click', () => { f.modo = b.dataset.v; renderAtendimentos(); tick(); }));
    $view.querySelectorAll('[data-csv]').forEach((b) => b.addEventListener('click', async () => {
      b.disabled = true;
      try { await download(`/api/admin/export.csv?${listQuery(f, { modo: b.dataset.csv })}`, 'atendimentos.csv'); toast('Planilha exportada ✓', 'ok'); } catch (e) { toast(e.message, 'bad'); }
      b.disabled = false;
    }));
    bindRows($view);
  }

  function rowCard(a) {
    const r = resumo(a);
    const open = state.expanded.has(a.id);
    return `<div class="row-card ${open ? 'open' : ''}" data-row="${a.id}">
      <div class="rc-main" data-toggle="${a.id}">
        <div class="col-date"><b class="mono">${fmtDateShort(a.criadoEm)}</b> <span class="mono muted">${fmtTime(r.inicio || a.criadoEm)}</span>
          <div class="only-mobile small"><b>${esc(a.barbeiroNome)}</b> <span class="muted">· ${esc(a.cliente || 'Cliente')}</span></div>
          <div class="only-desktop muted tiny">${esc(a.cliente || 'Cliente')}</div></div>
        <div class="col-barber">${esc(a.barbeiroNome)}</div>
        <div class="col-svc small">${a.procedimentos.map((p) => `<span class="pill" style="margin:2px 4px 2px 0">${esc(p.outro && p.descricao ? `Outro: ${p.descricao}` : p.nome)}</span>`).join('')}</div>
        <div class="col-time mono">${r.emAndamento ? `<span class="pill pill-gold"><span class="dot dot-live"></span><span ${r.inicio ? `data-since="${r.inicio}"` : ''}>${r.inicio ? dur(r.tempoTotal) : 'aguardando'}</span></span>` : `<b>${durHuman(r.tempoTotal)}</b>`}</div>
        <div class="col-pop">${a.cancelado ? '<span class="pill pill-bad">Cancelado</span>' : r.emAndamento ? '<span class="pill">Em andamento</span>' : popPill(r)}</div>
        <div class="col-val mono" style="text-align:right">${money(r.valor)}</div>
        <span class="chev">›</span>
      </div>
      ${open ? `<div class="rc-detail">${detailHtml(a)}</div>` : ''}
    </div>`;
  }

  function detailHtml(a) {
    const r = resumo(a);
    return `<div class="detail">
      <div class="row row-wrap small" style="margin-bottom:12px;gap:14px">
        <span><span class="muted">Cliente:</span> <b>${esc(a.cliente || '—')}</b></span>
        <span><span class="muted">Barbeiro:</span> <b>${esc(a.barbeiroNome)}</b></span>
        <span><span class="muted">Início:</span> <b class="mono">${fmtDateTime(r.inicio)}</b></span>
        <span><span class="muted">Fim:</span> <b class="mono">${r.emAndamento ? '—' : fmtTime(r.fim)}</b></span>
        <span><span class="muted">Total:</span> <b class="mono">${r.emAndamento ? 'em andamento' : dur(r.tempoTotal)}</b></span>
        <span><span class="muted">Comissão (${comissaoDe(a.barbeiroId)}%):</span> <b class="mono">${money(a.cancelado ? 0 : (r.valor * comissaoDe(a.barbeiroId)) / 100)}</b></span>
      </div>
      <div class="detail-procs">
        ${a.procedimentos.map((p) => {
          const d = p.inicio ? (p.fim || Date.now()) - p.inicio : 0;
          const over = p.tempoPadraoMin && d > p.tempoPadraoMin * 60000 * 1.15;
          const pend = p.checklistPulado && !p.checklistEm;
          const feitos = p.checklist.filter((c) => c.feito).length;
          return `<div class="detail-proc">
            <div class="row"><b class="grow">${esc(p.nome)}</b><span class="mono" style="color:${over ? 'var(--bad)' : 'inherit'}">${p.status === 'em_andamento' ? `<span data-since="${p.inicio}">${dur(d)}</span>` : p.inicio ? dur(d) : '—'}</span></div>
            ${p.descricao ? `<div class="small" style="color:var(--gold-2)">${esc(p.descricao)}</div>` : ''}
            <div class="muted tiny" style="margin:2px 0 8px">${fmtTime(p.inicio)} – ${p.fim ? fmtTime(p.fim) : (p.inicio ? 'em andamento' : 'não iniciado')}${p.tempoPadraoMin ? ` · padrão ${p.tempoPadraoMin} min` : ''} · ${money(precoProc(p))}${p.precoAjustado !== null && p.precoAjustado !== undefined ? ' (ajustado)' : ''}</div>
            ${pend ? '<div class="pill pill-warn" style="margin-bottom:6px">Checklist pulado — aguardando preenchimento</div>' : ''}
            ${p.checklist.length ? `<div class="tiny muted" style="margin-bottom:4px">Checklist ${feitos}/${p.checklist.length}${p.checklistEm && p.checklistPulado ? ` · preenchido depois (${fmtDateTime(p.checklistEm)})` : ''}</div>
              ${p.checklist.map((c) => `<div class="ck-line"><span class="${c.feito ? 'y' : 'n'}">${c.feito ? '✓' : pend ? '·' : '✗'}</span><span class="${c.feito ? '' : 'muted'}">${esc(c.texto)}</span></div>`).join('')}` : '<div class="tiny faint">Sem checklist</div>'}
            ${p.obs ? `<div class="small" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line)">📝 ${esc(p.obs)}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
      ${a.observacoes ? `<div class="card card-tight" style="margin-top:12px"><div class="eyebrow" style="margin-bottom:4px">Observações do barbeiro</div>${esc(a.observacoes)}</div>` : ''}
      ${a.observacaoAdmin ? `<div class="card card-tight" style="margin-top:8px"><div class="eyebrow" style="margin-bottom:4px">Nota do admin</div>${esc(a.observacaoAdmin)}</div>` : ''}
      ${a.cancelado ? `<div class="alert alert-bad" style="margin-top:12px">Cancelado: ${esc(a.cancelMotivo)}</div>` : ''}
      <div class="row row-wrap" style="margin-top:12px">
        <span class="faint tiny grow">ID ${esc(a.id.slice(0, 8))}${a.alteradoPorAdmin ? ` · alterado por ${esc(a.alteradoPorAdmin.por)} em ${fmtDateTime(a.alteradoPorAdmin.em)}` : ''}</span>
        ${r.emAndamento ? `<button class="btn btn-sm" data-act="finalizar" data-id="${a.id}">Forçar finalização</button>` : ''}
        <button class="btn btn-sm" data-act="ajustar" data-id="${a.id}">Ajustar valores / nota</button>
        ${a.cancelado ? `<button class="btn btn-sm" data-act="restaurar" data-id="${a.id}">Restaurar</button>` : `<button class="btn btn-sm btn-bad" data-act="cancelar" data-id="${a.id}">Cancelar</button>`}
      </div>
    </div>`;
  }

  function bindRows(root) {
    root.querySelectorAll('[data-toggle]').forEach((el) => el.addEventListener('click', () => {
      const id = el.dataset.toggle;
      if (state.expanded.has(id)) state.expanded.delete(id); else state.expanded.add(id);
      const a = state.data.find((x) => x.id === id);
      const card = root.querySelector(`[data-row="${id}"]`);
      card.outerHTML = rowCard(a);
      bindRows(root.querySelector(`[data-row="${id}"]`).parentElement);
      tick();
    }));
    root.querySelectorAll('[data-act]').forEach((b) => {
      if (b.dataset.bound) return; b.dataset.bound = '1';
      b.addEventListener('click', (e) => { e.stopPropagation(); adminAction(b.dataset.act, b.dataset.id); });
    });
  }

  function findAt(id) { return state.data.find((x) => x.id === id) || state.ativos.find((x) => x.id === id); }

  async function adminAction(act, id) {
    const a = findAt(id);
    if (!a) return;
    const patch = async (body, msg) => {
      const r = await api('PATCH', `/api/admin/atendimentos/${id}`, body);
      [state.data, state.ativos].forEach((arr) => { const i = arr.findIndex((x) => x.id === id); if (i >= 0) arr[i] = r.atendimento; });
      toast(msg, 'ok');
      await render(true);
    };
    if (act === 'cancelar') {
      modal({
        title: 'Cancelar atendimento',
        body: `<p class="muted" style="margin-top:0">O atendimento continua guardado (não é apagado), mas sai dos totais e das comissões.</p>
          <div class="field"><label>Motivo *</label><input class="input" id="mt" placeholder="Ex.: lançado por engano"></div>`,
        actions: [{ label: 'Voltar', onClick: () => {} }, { label: 'Cancelar atendimento', cls: 'btn-bad', onClick: (c, el) => patch({ cancelado: true, cancelMotivo: el.querySelector('#mt').value.trim() }, 'Atendimento cancelado') }],
      });
    } else if (act === 'restaurar') {
      await patch({ cancelado: false }, 'Atendimento restaurado').catch((e) => toast(e.message, 'bad'));
    } else if (act === 'finalizar') {
      if (await confirmDialog('Forçar finalização', 'O procedimento em andamento será encerrado agora e o atendimento finalizado. Use quando o barbeiro esqueceu de finalizar.', 'Finalizar')) {
        await patch({ forcarFinalizar: true }, 'Atendimento finalizado').catch((e) => toast(e.message, 'bad'));
      }
    } else if (act === 'ajustar') {
      modal({
        title: 'Ajustar valores',
        body: `<p class="muted small" style="margin-top:0">Deixe em branco para usar o preço da tabela.</p>
          ${a.procedimentos.map((p) => `<div class="field"><label>${esc(p.nome)}${p.descricao ? ` — ${esc(p.descricao)}` : ''} <span class="faint">(tabela: ${money(p.precoCatalogo)})</span></label>
            <input class="input" type="number" step="0.01" min="0" inputmode="decimal" data-pid="${p.id}" value="${p.precoAjustado ?? ''}" placeholder="${Number(p.precoCatalogo || 0).toFixed(2)}"></div>`).join('')}
          <div class="field"><label>Nota do admin</label><textarea class="input" id="na">${esc(a.observacaoAdmin || '')}</textarea></div>`,
        actions: [{
          label: 'Salvar', cls: 'btn-gold',
          onClick: (c, el) => {
            const precos = {};
            el.querySelectorAll('[data-pid]').forEach((i) => { precos[i.dataset.pid] = i.value === '' ? null : Number(i.value); });
            return patch({ precos, observacaoAdmin: el.querySelector('#na').value }, 'Valores atualizados');
          },
        }],
      });
    }
  }

  function openDetailModal(a) {
    const m = modal({ title: `${esc(a.barbeiroNome)} · ${esc(a.cliente || 'Cliente')}`, body: detailHtml(a), wide: true });
    m.el.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => { m.close(); adminAction(b.dataset.act, b.dataset.id); }));
  }

  // ------------------------------------------------------------------
  // Equipe
  // ------------------------------------------------------------------
  function renderEquipe() {
    const us = [...state.usuarios].sort((a, b) => (b.ativo - a.ativo) || a.nome.localeCompare(b.nome));
    $view.innerHTML = `
      <div class="a-head"><h1 class="grow">Equipe</h1><button class="btn btn-gold" id="new-user">＋ Novo usuário</button></div>
      <div class="table-wrap only-desktop"><table>
        <thead><tr><th>Nome</th><th>Usuário</th><th>Função</th><th class="num">Comissão</th><th class="num">Atendimentos</th><th>Status</th><th></th></tr></thead>
        <tbody>${us.map((u) => `<tr>
          <td><b>${esc(u.nome)}</b>${u.id === state.me.id ? ' <span class="pill">você</span>' : ''}</td>
          <td class="mono">${esc(u.usuario)}</td>
          <td>${u.papel === 'admin' ? '<span class="pill pill-gold">Admin</span>' : 'Barbeiro'}</td>
          <td class="num mono">${u.comissao}%</td>
          <td class="num mono">${u.atendimentos}</td>
          <td>${u.ativo ? '<span class="pill pill-ok">Ativo</span>' : '<span class="pill">Inativo</span>'}</td>
          <td style="text-align:right;white-space:nowrap">${userActions(u)}</td></tr>`).join('')}</tbody></table></div>
      <div class="rows only-mobile">${us.map((u) => `<div class="card card-tight">
        <div class="row"><div class="grow"><b>${esc(u.nome)}</b><div class="muted small mono">${esc(u.usuario)} · ${u.papel === 'admin' ? 'Admin' : 'Barbeiro'} · ${u.comissao}%</div></div>
        ${u.ativo ? '<span class="pill pill-ok">Ativo</span>' : '<span class="pill">Inativo</span>'}</div>
        <div class="row row-wrap" style="margin-top:10px;gap:6px">${userActions(u)}</div></div>`).join('')}</div>
      <p class="faint small" style="margin-top:14px">“Desativar” bloqueia o acesso mas mantém todo o histórico de atendimentos. Só é possível excluir usuários sem atendimentos.</p>`;
    document.getElementById('new-user').addEventListener('click', () => userModal());
    $view.querySelectorAll('[data-uact]').forEach((b) => b.addEventListener('click', () => userAction(b.dataset.uact, b.dataset.id)));
  }
  function userActions(u) {
    return `<button class="btn btn-sm" data-uact="editar" data-id="${u.id}">Editar</button>
      <button class="btn btn-sm" data-uact="senha" data-id="${u.id}">Nova senha</button>
      ${u.id !== state.me.id ? (u.ativo ? `<button class="btn btn-sm btn-bad" data-uact="desativar" data-id="${u.id}">Desativar</button>` : `<button class="btn btn-sm" data-uact="ativar" data-id="${u.id}">Reativar</button>`) : ''}
      ${u.id !== state.me.id && !u.atendimentos ? `<button class="btn btn-sm btn-ghost" data-uact="excluir" data-id="${u.id}" title="Excluir">🗑</button>` : ''}`;
  }
  function userModal(u) {
    const isNew = !u;
    u = u || { nome: '', usuario: '', papel: 'barbeiro', comissao: 0 };
    modal({
      title: isNew ? 'Novo usuário' : `Editar ${esc(u.nome)}`,
      body: `
        <div class="field"><label>Nome *</label><input class="input" id="u-nome" value="${esc(u.nome)}" placeholder="Ex.: João Silva"></div>
        <div class="field"><label>Usuário (login) *</label><input class="input" id="u-user" value="${esc(u.usuario)}" autocapitalize="none" placeholder="ex.: joao"></div>
        ${isNew ? '<div class="field"><label>Senha inicial *</label><input class="input" id="u-pass" type="text" placeholder="mínimo 4 caracteres" autocomplete="off"></div>' : ''}
        <div class="row" style="gap:12px">
          <div class="field grow"><label>Função</label><select class="input" id="u-papel"><option value="barbeiro" ${u.papel === 'barbeiro' ? 'selected' : ''}>Barbeiro</option><option value="admin" ${u.papel === 'admin' ? 'selected' : ''}>Administrador</option></select></div>
          <div class="field grow"><label>Comissão (%)</label><input class="input" id="u-com" type="number" min="0" max="100" step="0.5" inputmode="decimal" value="${u.comissao}"></div>
        </div>`,
      actions: [{
        label: isNew ? 'Cadastrar' : 'Salvar', cls: 'btn-gold',
        onClick: async (c, el) => {
          const body = { nome: el.querySelector('#u-nome').value, usuario: el.querySelector('#u-user').value, papel: el.querySelector('#u-papel').value, comissao: Number(el.querySelector('#u-com').value) };
          if (isNew) { body.senha = el.querySelector('#u-pass').value; await api('POST', '/api/admin/usuarios', body); } else await api('PUT', `/api/admin/usuarios/${u.id}`, body);
          toast(isNew ? 'Usuário cadastrado' : 'Usuário atualizado', 'ok');
          await loadUsuarios(); renderEquipe();
        },
      }],
    });
  }
  async function userAction(act, id) {
    const u = state.usuarios.find((x) => x.id === id);
    try {
      if (act === 'editar') return userModal(u);
      if (act === 'senha') {
        return modal({
          title: `Nova senha · ${esc(u.nome)}`,
          body: '<div class="field"><label>Nova senha</label><input class="input" id="np" type="text" autocomplete="off" placeholder="mínimo 4 caracteres"></div><p class="muted small">O usuário será desconectado dos aparelhos e precisará entrar com a nova senha.</p>',
          actions: [{ label: 'Definir senha', cls: 'btn-gold', onClick: async (c, el) => { await api('POST', `/api/admin/usuarios/${id}/senha`, { senha: el.querySelector('#np').value }); toast('Senha redefinida', 'ok'); await loadUsuarios(); loadStatus(); } }],
        });
      }
      if (act === 'desativar') {
        if (!(await confirmDialog('Desativar usuário', `${esc(u.nome)} não conseguirá mais entrar. O histórico é mantido.`, 'Desativar', 'btn-bad'))) return;
        await api('PUT', `/api/admin/usuarios/${id}`, { ativo: false });
      }
      if (act === 'ativar') await api('PUT', `/api/admin/usuarios/${id}`, { ativo: true });
      if (act === 'excluir') {
        if (!(await confirmDialog('Excluir usuário', `Excluir ${esc(u.nome)} definitivamente?`, 'Excluir', 'btn-bad'))) return;
        await api('DELETE', `/api/admin/usuarios/${id}`);
      }
      toast('Feito', 'ok');
      await loadUsuarios(); renderEquipe();
    } catch (e) { toast(e.message, 'bad'); }
  }

  // ------------------------------------------------------------------
  // Procedimentos & checklists
  // ------------------------------------------------------------------
  function renderProcedimentos() {
    if (!state.svcDraft) state.svcDraft = JSON.parse(JSON.stringify(state.servicos));
    const list = state.svcDraft;
    $view.innerHTML = `
      <div class="a-head"><h1 class="grow">Procedimentos & POP</h1>
        <button class="btn" id="svc-add">＋ Procedimento</button>
        <button class="btn btn-gold" id="svc-save" ${state.svcDirty ? '' : 'disabled'}>Salvar alterações</button></div>
      <p class="muted small" style="margin-top:-6px">O checklist é o POP que o barbeiro marca ao finalizar cada procedimento. Alterações valem para os próximos atendimentos (os já registrados mantêm o checklist da época).</p>
      ${state.svcDirty ? '<div class="alert alert-warn">Há alterações não salvas.</div>' : ''}
      ${list.map((s, i) => {
        const open = state.svcOpen.has(s.id);
        return `<div class="svc-card" data-svc="${i}">
          <div class="svc-head">
            <div class="row" style="gap:4px"><button class="icon-btn" data-mv="-1" ${i === 0 ? 'disabled' : ''} aria-label="Subir">↑</button><button class="icon-btn" data-mv="1" ${i === list.length - 1 ? 'disabled' : ''} aria-label="Descer">↓</button></div>
            <input class="input input-sm grow" data-k="nome" value="${esc(s.nome)}" style="min-width:160px;font-weight:600">
            <label class="small muted row" style="gap:6px">R$ <input class="input input-sm" data-k="preco" type="number" min="0" step="0.01" inputmode="decimal" value="${s.preco}" style="width:90px"></label>
            <label class="small muted row" style="gap:6px">Padrão <input class="input input-sm" data-k="tempoPadraoMin" type="number" min="0" step="1" inputmode="numeric" value="${s.tempoPadraoMin}" style="width:70px"> min</label>
            <label class="row small muted" style="gap:8px"><span class="switch"><input type="checkbox" data-k="ativo" ${s.ativo ? 'checked' : ''}><span></span></span>Ativo</label>
            ${s.outro ? '<span class="pill pill-gold" title="Exige descrição do barbeiro">Outro</span>' : ''}
            <button class="btn btn-sm" data-open-svc>${open ? 'Fechar' : `Checklist (${s.checklist.length})`}</button>
          </div>
          ${open ? `<div class="svc-body">
            ${s.checklist.map((c, j) => `<div class="ck-edit" data-ck="${j}">
              <span class="faint mono small" style="width:20px">${j + 1}.</span>
              <input class="input input-sm grow" data-ck-txt value="${esc(c.texto)}">
              <button class="icon-btn" data-ck-mv="-1" ${j === 0 ? 'disabled' : ''}>↑</button>
              <button class="icon-btn" data-ck-mv="1" ${j === s.checklist.length - 1 ? 'disabled' : ''}>↓</button>
              <button class="icon-btn" data-ck-del style="color:var(--bad)">✕</button></div>`).join('')}
            <div class="row" style="margin-top:10px"><input class="input input-sm grow" data-ck-new placeholder="Novo item do checklist e Enter"><button class="btn btn-sm" data-ck-add>Adicionar</button></div>
            ${!s.outro ? `<div style="margin-top:14px;text-align:right"><button class="btn btn-sm btn-ghost" data-del-svc style="color:var(--bad)">Excluir procedimento</button></div>` : '<p class="faint tiny">O procedimento “Outro” não pode ser excluído (pode ser desativado).</p>'}
          </div>` : ''}
        </div>`;
      }).join('')}
      <div class="card" style="margin-top:20px">
        <h3>Nome da barbearia</h3>
        <div class="row"><input class="input grow" id="shop-name" value="${esc(state.shop)}"><button class="btn" id="shop-save">Salvar</button></div>
      </div>`;

    const dirty = () => { state.svcDirty = true; const b = document.getElementById('svc-save'); if (b) b.disabled = false; };
    const rerender = () => { renderProcedimentos(); };
    document.getElementById('svc-add').addEventListener('click', () => {
      const id = BP.uuid();
      list.push({ id, nome: 'Novo procedimento', preco: 0, tempoPadraoMin: 0, ativo: true, outro: false, checklist: [] });
      state.svcOpen.add(id); dirty(); rerender();
      setTimeout(() => { const el = $view.querySelector(`[data-svc="${list.length - 1}"] [data-k="nome"]`); if (el) { el.focus(); el.select(); el.scrollIntoView({ block: 'center' }); } }, 30);
    });
    document.getElementById('svc-save').addEventListener('click', async () => {
      try {
        const r = await api('PUT', '/api/admin/servicos', { servicos: list });
        state.servicos = r.servicos; state.svcDraft = null; state.svcDirty = false;
        toast('Procedimentos salvos ✓', 'ok'); rerender();
      } catch (e) { toast(e.message, 'bad'); }
    });
    document.getElementById('shop-save').addEventListener('click', async () => {
      try {
        const r = await api('PUT', '/api/admin/config', { nomeBarbearia: document.getElementById('shop-name').value });
        state.shop = r.config.nomeBarbearia; setShop(); toast('Nome salvo', 'ok');
      } catch (e) { toast(e.message, 'bad'); }
    });
    $view.querySelectorAll('[data-svc]').forEach((card) => {
      const i = Number(card.dataset.svc); const s = list[i];
      card.querySelectorAll('[data-k]').forEach((inp) => inp.addEventListener(inp.type === 'checkbox' ? 'change' : 'input', () => {
        const k = inp.dataset.k;
        s[k] = inp.type === 'checkbox' ? inp.checked : inp.type === 'number' ? Number(inp.value) : inp.value;
        dirty();
      }));
      card.querySelectorAll('[data-mv]').forEach((b) => b.addEventListener('click', () => {
        const j = i + Number(b.dataset.mv); [list[i], list[j]] = [list[j], list[i]]; dirty(); rerender();
      }));
      const ob = card.querySelector('[data-open-svc]');
      ob.addEventListener('click', () => { if (state.svcOpen.has(s.id)) state.svcOpen.delete(s.id); else state.svcOpen.add(s.id); rerender(); });
      card.querySelectorAll('[data-ck]').forEach((row) => {
        const j = Number(row.dataset.ck);
        row.querySelector('[data-ck-txt]').addEventListener('input', (e) => { s.checklist[j].texto = e.target.value; dirty(); });
        row.querySelectorAll('[data-ck-mv]').forEach((b) => b.addEventListener('click', () => {
          const k = j + Number(b.dataset.ckMv); [s.checklist[j], s.checklist[k]] = [s.checklist[k], s.checklist[j]]; dirty(); rerender();
        }));
        row.querySelector('[data-ck-del]').addEventListener('click', () => { s.checklist.splice(j, 1); dirty(); rerender(); });
      });
      const nw = card.querySelector('[data-ck-new]');
      const addItem = () => {
        const t = nw.value.trim(); if (!t) return;
        s.checklist.push({ id: BP.uuid(), texto: t }); dirty(); rerender();
        setTimeout(() => { const el = $view.querySelector(`[data-svc="${i}"] [data-ck-new]`); if (el) el.focus(); }, 20);
      };
      if (nw) {
        nw.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } });
        card.querySelector('[data-ck-add]').addEventListener('click', addItem);
      }
      const del = card.querySelector('[data-del-svc]');
      if (del) del.addEventListener('click', async () => {
        if (!(await confirmDialog('Excluir procedimento', `Excluir "${esc(s.nome)}"? Atendimentos antigos não são afetados. Se preferir, apenas desative.`, 'Excluir', 'btn-bad'))) return;
        list.splice(i, 1); dirty(); rerender();
      });
    });
  }

  // ------------------------------------------------------------------
  // Dados & backup
  // ------------------------------------------------------------------
  function renderDados() {
    const st = state.status || { alertas: [], backups: [], exportacoes: [], purgas: [] };
    const mi = state.mirrorInfo;
    const minPurge = new Date(); minPurge.setDate(minPurge.getDate() - (st.minDiasPurga || 31));
    $view.innerHTML = `
      <div class="a-head"><h1 class="grow">Dados & backup</h1><button class="btn" id="bk-now">Gerar backup agora</button></div>
      <div class="alert alert-ok"><span>🛡</span><span><b>Política de garantia:</b> nenhum atendimento é apagado automaticamente. O servidor grava cada alteração em disco com diário de recuperação, gera backups (JSON + CSV) a cada ${st.intervaloBackupHoras || 6} h mantidos por ${st.retencaoBackupDias || 90} dias, e este navegador guarda uma cópia dos últimos ${MIRROR_DAYS} dias. Remover dados só é possível depois de baixar a planilha completa.</span></div>

      <div class="kpis">
        <div class="kpi"><div class="l">Atendimentos guardados</div><div class="v mono">${st.totalAtendimentos ?? '—'}</div><div class="s">desde ${st.maisAntigo ? fmtDate(st.maisAntigo) : '—'}</div></div>
        <div class="kpi"><div class="l">Último backup automático</div><div class="v" style="font-size:18px">${st.ultimoBackup ? fmtDateTime(st.ultimoBackup) : '—'}</div><div class="s">a cada ${st.intervaloBackupHoras || 6} horas</div></div>
        <div class="kpi"><div class="l">Última planilha completa</div><div class="v" style="font-size:18px">${st.ultimaExportacao ? fmtDateTime(st.ultimaExportacao.at) : 'nunca'}</div><div class="s">${st.ultimaExportacao ? `por ${esc(st.ultimaExportacao.por)}` : 'recomendado: semanal'}</div></div>
        <div class="kpi"><div class="l">Espelho neste navegador</div><div class="v mono">${mi ? mi.total : '—'}</div><div class="s">${mi ? `sincronizado ${fmtTime(mi.sync)}` : 'indisponível'}</div></div>
        ${st.disco ? `<div class="kpi"><div class="l">Espaço livre no servidor</div><div class="v mono" style="font-size:20px">${bytes(st.disco.livre)}</div><div class="s">de ${bytes(st.disco.total)}</div></div>` : ''}
      </div>

      <div class="grid-2" style="margin-bottom:14px">
        <div class="card"><h3>Exportar</h3>
          <div class="stack">
            <button class="btn btn-gold btn-block" data-full="procedimento">⬇ Planilha completa (1 linha por procedimento)</button>
            <button class="btn btn-block" data-full="atendimento">⬇ Planilha completa (1 linha por atendimento)</button>
            <button class="btn btn-block" id="bk-json">⬇ Backup completo (JSON — para restauração)</button>
            <button class="btn btn-block" id="mirror-csv">⬇ CSV da cópia deste navegador</button>
          </div>
          <p class="faint tiny" style="margin-bottom:0">Os CSVs usam “;” e abrem direto no Excel / Google Planilhas.</p>
        </div>
        <div class="card"><h3>Restaurar / importar</h3>
          <p class="muted small" style="margin-top:0">Envie um arquivo de backup (.json). A importação apenas <b>acrescenta</b> o que falta — nunca apaga registros existentes.</p>
          <input type="file" id="imp-file" accept=".json,application/json" class="input">
          <button class="btn btn-block" id="imp-go" style="margin-top:10px">Importar backup</button>
          <button class="btn btn-block" id="mirror-restore" style="margin-top:10px">Restaurar a partir da cópia deste navegador</button>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px"><h3>Backups no servidor</h3>
        ${st.backups.length ? `<div class="table-wrap" style="border:0;max-height:340px;overflow:auto"><table><thead><tr><th>Arquivo</th><th>Data</th><th class="num">Tamanho</th><th></th></tr></thead><tbody>
          ${st.backups.map((b) => `<tr><td class="mono small">${esc(b.nome)}</td><td class="small">${fmtDateTime(b.criadoEm)}</td><td class="num small">${bytes(b.tamanho)}</td><td style="text-align:right"><button class="btn btn-sm" data-bk="${esc(b.nome)}">Baixar</button></td></tr>`).join('')}
        </tbody></table></div>` : '<div class="empty">Nenhum backup ainda.</div>'}
      </div>

      <div class="grid-2">
        <div class="card"><h3>Histórico de exportações</h3>
          ${st.exportacoes.length ? st.exportacoes.map((e) => `<div class="row small" style="padding:6px 0;border-bottom:1px solid var(--line)"><span class="grow">${fmtDateTime(e.at)} · ${esc(e.por)}</span><span class="pill ${e.completo ? 'pill-ok' : ''}">${e.completo ? 'Completa' : 'Filtrada'}</span><span class="mono muted">${e.registros}</span></div>`).join('') : '<div class="faint small">Nenhuma exportação ainda.</div>'}
        </div>
        <div class="card"><h3>Remover dados antigos</h3>
          <p class="muted small" style="margin-top:0">Opcional, para liberar espaço. Só atendimentos com mais de ${st.minDiasPurga || 31} dias. Antes de remover, o sistema <b>obriga</b> o download da planilha completa e ainda guarda um arquivo de segurança no servidor.</p>
          <div class="field"><label>Remover atendimentos anteriores a</label><input type="date" class="input" id="pg-date" max="${toInputDate(minPurge.getTime())}" value="${toInputDate(minPurge.getTime() - 60 * 86400000)}"></div>
          <button class="btn btn-bad btn-block" id="pg-go">Remover dados antigos…</button>
          ${st.purgas.length ? `<div class="faint tiny" style="margin-top:10px">Última remoção: ${fmtDateTime(st.purgas[0].at)} · ${st.purgas[0].registros} registros · arquivo ${esc(st.purgas[0].arquivo)}</div>` : ''}
        </div>
      </div>`;

    $view.querySelectorAll('[data-full]').forEach((b) => b.addEventListener('click', () => exportFull(b.dataset.full).then(renderDados).catch((e) => toast(e.message, 'bad'))));
    document.getElementById('bk-json').addEventListener('click', () => download('/api/admin/backup.json', 'backup.json').catch((e) => toast(e.message, 'bad')));
    document.getElementById('mirror-csv').addEventListener('click', downloadMirrorCsv);
    document.getElementById('mirror-restore').addEventListener('click', restoreMirror);
    document.getElementById('bk-now').addEventListener('click', async () => {
      try { state.status = await api('POST', '/api/admin/backup-agora'); toast('Backup gerado ✓', 'ok'); renderAlerts(); renderDados(); } catch (e) { toast(e.message, 'bad'); }
    });
    $view.querySelectorAll('[data-bk]').forEach((b) => b.addEventListener('click', () => download(`/api/admin/backups/${encodeURIComponent(b.dataset.bk)}`, b.dataset.bk).catch((e) => toast(e.message, 'bad'))));
    document.getElementById('imp-go').addEventListener('click', async () => {
      const file = document.getElementById('imp-file').files[0];
      if (!file) { toast('Selecione um arquivo .json', 'bad'); return; }
      try {
        const json = JSON.parse(await file.text());
        const lista = json.atendimentos || [];
        if (!(await confirmDialog('Importar backup', `O arquivo contém ${lista.length} atendimento(s). Importar (sem apagar nada)?`, 'Importar'))) return;
        const r = await api('POST', '/api/admin/importar', { atendimentos: lista });
        toast(`Importado: ${r.novos} novo(s), ${r.atualizados} atualizado(s)`, 'ok');
        await loadStatus(); renderDados();
      } catch (e) { toast(e.message.includes('JSON') ? 'Arquivo inválido' : e.message, 'bad'); }
    });
    document.getElementById('pg-go').addEventListener('click', () => purgeFlow(document.getElementById('pg-date').value));
  }

  function purgeFlow(dateStr) {
    if (!dateStr) { toast('Escolha a data', 'bad'); return; }
    const antesDe = fromInputDate(dateStr);
    let exportId = null;
    modal({
      title: 'Remover dados antigos',
      body: `
        <div class="alert alert-bad">Atenção: atendimentos criados antes de <b>${fmtDate(antesDe)}</b> serão removidos do sistema.</div>
        <p><b>Passo 1 —</b> baixe a planilha completa (garantia obrigatória):</p>
        <button class="btn btn-gold btn-block" id="pg-exp">⬇ Baixar planilha completa</button>
        <div id="pg-ok" class="small" style="margin-top:8px"></div>
        <p style="margin-top:18px"><b>Passo 2 —</b> digite <b>REMOVER</b> para confirmar:</p>
        <input class="input" id="pg-conf" autocomplete="off" placeholder="REMOVER">`,
      onOpen: (el) => {
        el.querySelector('#pg-exp').addEventListener('click', async () => {
          try {
            const r = await exportFull('procedimento');
            exportId = r.exportId;
            el.querySelector('#pg-ok').innerHTML = '<span style="color:var(--ok)">✓ Planilha baixada. Confira o arquivo antes de continuar (válido por 15 minutos).</span>';
          } catch (e) { toast(e.message, 'bad'); }
        });
      },
      actions: [
        { label: 'Cancelar', onClick: () => {} },
        {
          label: 'Remover definitivamente', cls: 'btn-bad',
          onClick: async (c, el) => {
            if (!exportId) { toast('Baixe a planilha completa primeiro (passo 1)', 'bad'); return false; }
            const r = await api('POST', '/api/admin/purgar', { antesDe, exportId, confirmacao: el.querySelector('#pg-conf').value });
            toast(`${r.removidos} atendimento(s) removido(s). Arquivo de segurança: ${r.arquivo}`, 'ok');
            const local = await mirror.all();
            await mirror.remove(local.filter((a) => a.criadoEm < antesDe).map((a) => a.id));
            await loadStatus(); await syncMirror(); renderDados();
          },
        },
      ],
    });
  }

  // ------------------------------------------------------------------
  // Render geral + atualização ao vivo
  // ------------------------------------------------------------------
  let loading = false;
  async function render(reload) {
    try {
      if (reload && (state.tab === 'dashboard' || state.tab === 'atendimentos')) {
        if (!$view.innerHTML) $view.innerHTML = '<div class="empty">Carregando…</div>';
        loading = true; await loadData(); loading = false;
      }
      if (reload && state.tab === 'equipe') await loadUsuarios();
      if (reload && state.tab === 'dados') await loadStatus();
    } catch (e) { loading = false; toast(e.message, 'bad'); }
    if (state.tab === 'dashboard') renderDashboard();
    else if (state.tab === 'atendimentos') renderAtendimentos();
    else if (state.tab === 'equipe') renderEquipe();
    else if (state.tab === 'procedimentos') renderProcedimentos();
    else renderDados();
    tick();
  }

  function tick() {
    const t = Date.now();
    document.querySelectorAll('[data-since]').forEach((el) => { el.textContent = dur(t - Number(el.dataset.since)); });
  }
  setInterval(tick, 1000);

  // Atualiza registros a cada 15 s (sem atrapalhar quem está digitando ou com modal aberto)
  setInterval(async () => {
    if (document.visibilityState !== 'visible' || loading) return;
    if (!['dashboard', 'atendimentos'].includes(state.tab)) return;
    if (document.querySelector('.modal-backdrop')) return;
    const ae = document.activeElement;
    if (ae && ['INPUT', 'SELECT', 'TEXTAREA'].includes(ae.tagName)) return;
    try {
      await loadData();
      const y = window.scrollY;
      if (state.tab === 'dashboard') renderDashboard(); else renderAtendimentos();
      window.scrollTo(0, y);
      tick();
    } catch (e) { /* tenta de novo */ }
  }, 15000);
  setInterval(() => { if (document.visibilityState === 'visible') loadStatus(); }, 5 * 60000);
  setInterval(() => { if (document.visibilityState === 'visible') syncMirror(); }, 10 * 60000);

  function setShop() {
    document.getElementById('shop').textContent = state.shop;
    document.getElementById('shop-m').textContent = state.shop;
    document.title = `${state.shop} · Admin`;
  }

  async function init() {
    const me = await api('GET', '/api/me').catch(() => null);
    if (!me) return;
    if (me.usuario.papel !== 'admin') { location.href = '/barbeiro'; return; }
    state.me = me.usuario; state.shop = me.nomeBarbearia || 'Barber POP';
    setShop();
    document.getElementById('me-name').textContent = state.me.nome;
    document.getElementById('pw').addEventListener('click', () => BP.changeOwnPassword(false));
    document.getElementById('out').addEventListener('click', BP.logout);
    document.getElementById('menu-m').addEventListener('click', () => modal({
      title: esc(state.me.nome),
      body: `<div class="stack"><button class="btn btn-block" id="mm-b">Abrir tela do barbeiro</button><button class="btn btn-block" id="mm-pw">Alterar minha senha</button><button class="btn btn-bad btn-block" id="mm-out">Sair</button></div>`,
      onOpen: (el, close) => {
        el.querySelector('#mm-b').onclick = () => { location.href = '/barbeiro?modo=barbeiro'; };
        el.querySelector('#mm-pw').onclick = () => { close(); BP.changeOwnPassword(false); };
        el.querySelector('#mm-out').onclick = BP.logout;
      },
    }));
    if (state.me.trocarSenha) BP.changeOwnPassword(true);
    const h = location.hash.slice(1);
    if (TABS.some((t) => t.id === h)) state.tab = h;
    renderNav();
    await Promise.all([loadServicos(), loadUsuarios(), loadStatus()]);
    await render(true);
    await mirror.open();
    syncMirror();
  }
  window.addEventListener('hashchange', () => {
    const h = location.hash.slice(1);
    if (state.me && h !== state.tab && TABS.some((t) => t.id === h)) go(h);
  });
  window.addEventListener('beforeunload', (e) => { if (state.svcDirty) { e.preventDefault(); e.returnValue = ''; } });
  init();
})();
