/* Tela do barbeiro (celular / tablet) */
(function () {
  'use strict';
  const { api, esc, toast, modal, confirmDialog, dur, durHuman, fmtTime, fmtDate, money, isToday, uuid, resumo, popPill } = BP;

  const state = {
    me: null,
    servicos: [],
    atendimentos: new Map(),
    online: true,
    syncing: false,
  };
  const $view = document.getElementById('view');
  const $fab = document.getElementById('fab');
  const $net = document.getElementById('net');
  let wakeLock = null;

  // ------------------------------------------------------------------
  // Armazenamento local + fila offline (nenhuma marcação se perde se a internet cair)
  // ------------------------------------------------------------------
  const key = (k) => `bp_${k}_${state.me.id}`;
  function lsGet(k, def) { try { return JSON.parse(localStorage.getItem(key(k))) || def; } catch (e) { return def; } }
  function lsSet(k, v) { try { localStorage.setItem(key(k), JSON.stringify(v)); } catch (e) { /* cheio */ } }
  function outbox() { return lsGet('outbox', {}); }
  function cacheLocal() {
    const keep = [...state.atendimentos.values()].filter((a) => !a.descartado && (Date.now() - a.criadoEm < 3 * 86400000 || a.status === 'em_andamento'));
    lsSet('cache', keep);
  }

  function save(a) {
    a.versaoCliente = Date.now();
    state.atendimentos.set(a.id, a);
    const ob = outbox();
    ob[a.id] = a;
    lsSet('outbox', ob);
    cacheLocal();
    flush();
  }

  async function flush() {
    if (state.syncing) return;
    const ob = outbox();
    const ids = Object.keys(ob);
    if (!ids.length) { setNet(true); return; }
    state.syncing = true;
    let ok = true;
    for (const id of ids) {
      const local = ob[id];
      try {
        const r = await api('PUT', `/api/atendimentos/${encodeURIComponent(id)}`, local);
        const cur = outbox();
        if (cur[id] && cur[id].versaoCliente === local.versaoCliente) { delete cur[id]; lsSet('outbox', cur); }
        if (!cur[id]) { if (r.atendimento.descartado) state.atendimentos.delete(id); else state.atendimentos.set(id, r.atendimento); }
      } catch (e) {
        if (e.status === 409 || e.status === 403 || e.status === 400) {
          const cur = outbox(); delete cur[id]; lsSet('outbox', cur);
          toast(e.message, 'bad');
          if (e.status === 409) state.atendimentos.delete(id);
        } else { ok = false; break; }
      }
    }
    state.syncing = false;
    cacheLocal();
    setNet(ok);
    if (ok && Object.keys(outbox()).length) flush();
  }
  setInterval(flush, 5000);
  window.addEventListener('online', flush);

  function setNet(ok) {
    state.online = ok;
    const pend = Object.keys(outbox()).length;
    if (ok && !pend) { $net.hidden = true; return; }
    $net.hidden = false;
    $net.className = `net pill ${ok ? 'pill-warn' : 'pill-bad'}`;
    $net.innerHTML = ok ? `<span class="dot"></span> Sincronizando ${pend}` : `<span class="dot"></span> Offline · ${pend} pendente(s)`;
  }

  async function loadServer() {
    try {
      const r = await api('GET', '/api/meus-atendimentos?dias=2');
      const ob = outbox();
      state.atendimentos = new Map();
      r.atendimentos.forEach((a) => state.atendimentos.set(a.id, a));
      Object.values(ob).forEach((a) => { if (a.descartado) state.atendimentos.delete(a.id); else state.atendimentos.set(a.id, a); });
      cacheLocal();
      setNet(true);
    } catch (e) {
      if (e.status === 401) return;
      setNet(false);
    }
  }

  // ------------------------------------------------------------------
  // Regras
  // ------------------------------------------------------------------
  function running(a) { return a.procedimentos.find((p) => p.status === 'em_andamento'); }
  function activeList() { return [...state.atendimentos.values()].filter((a) => a.status === 'em_andamento' && !a.cancelado).sort((x, y) => x.criadoEm - y.criadoEm); }

  function newProc(serv, descricao) {
    return {
      id: uuid(), servicoId: serv.id, nome: serv.nome, outro: !!serv.outro, descricao: descricao || '',
      tempoPadraoMin: serv.tempoPadraoMin || 0, precoCatalogo: serv.preco || 0, precoAjustado: null,
      status: 'pendente', inicio: null, fim: null,
      checklist: (serv.checklist || []).map((c) => ({ id: c.id, texto: c.texto, feito: false })),
      checklistPulado: false, checklistEm: null, obs: '',
    };
  }

  function startProc(a, p) {
    const r = running(a);
    if (r && r.id !== p.id) {
      toast(`Finalize "${r.nome}" antes de iniciar outro procedimento`, 'bad');
      openFinish(a, r);
      return;
    }
    p.status = 'em_andamento';
    p.inicio = Date.now();
    if (!a.iniciadoEm) a.iniciadoEm = p.inicio;
    save(a);
    keepAwake(true);
    render();
  }

  async function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      } else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) { /* não suportado */ }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (activeList().some(running)) keepAwake(true);
      loadServer().then(render);
    }
  });

  // ------------------------------------------------------------------
  // Modais
  // ------------------------------------------------------------------
  function servicePicker({ title, confirmLabel, withClient, onConfirm }) {
    const selected = new Map(); // servicoId -> descricao
    const body = `
      ${withClient ? `<div class="field"><label>Cliente (opcional)</label><input class="input" id="np-cli" placeholder="Nome do cliente" autocomplete="off"></div>` : ''}
      <div class="eyebrow" style="margin-bottom:10px">O que será realizado?</div>
      <div class="chips" id="np-chips">
        ${state.servicos.map((s) => `<button type="button" class="chip" data-id="${s.id}"><b>${esc(s.nome)}</b>${s.tempoPadraoMin ? `<span class="muted tiny">~${s.tempoPadraoMin} min</span>` : ''}</button>`).join('')}
      </div>
      <div class="field" id="np-outro" hidden style="margin-top:14px">
        <label>Descreva o serviço "Outro" *</label>
        <textarea class="input" id="np-outro-txt" placeholder="Ex.: pigmentação de barba"></textarea>
      </div>`;
    modal({
      title,
      body,
      onOpen: (el) => {
        el.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
          const id = c.dataset.id;
          if (selected.has(id)) selected.delete(id); else selected.set(id, '');
          c.classList.toggle('on', selected.has(id));
          const outro = state.servicos.find((s) => s.outro && selected.has(s.id));
          el.querySelector('#np-outro').hidden = !outro;
        }));
      },
      actions: [{
        label: confirmLabel, cls: 'btn-gold',
        onClick: (close, el) => {
          if (!selected.size) { toast('Selecione pelo menos um procedimento', 'bad'); return false; }
          const procs = [];
          for (const s of state.servicos) {
            if (!selected.has(s.id)) continue;
            let desc = '';
            if (s.outro) {
              desc = el.querySelector('#np-outro-txt').value.trim();
              if (!desc) { toast('Descreva o serviço "Outro"', 'bad'); return false; }
            }
            procs.push(newProc(s, desc));
          }
          onConfirm(procs, withClient ? el.querySelector('#np-cli').value.trim() : '');
        },
      }],
    });
  }

  function openNew() {
    servicePicker({
      title: 'Novo atendimento', confirmLabel: 'Criar atendimento', withClient: true,
      onConfirm: (procs, cliente) => {
        const a = {
          id: uuid(), barbeiroId: state.me.id, cliente, criadoEm: Date.now(), iniciadoEm: null, finalizadoEm: null,
          status: 'em_andamento', observacoes: '', procedimentos: procs,
        };
        save(a);
        location.hash = `#/a/${a.id}`;
      },
    });
  }

  function openFinish(a, p, mode) {
    // mode: 'finalizar' (encerra o procedimento) | 'preencher' (checklist pulado anteriormente)
    mode = mode || 'finalizar';
    const draft = p.checklist.map((c) => ({ ...c }));
    const body = `
      ${mode === 'finalizar' && p.inicio ? `<div class="big-timer"><div class="muted small">Tempo do procedimento</div><div class="t mono" data-since="${p.inicio}">${dur(Date.now() - p.inicio)}</div></div>` : ''}
      ${p.outro && p.descricao ? `<div class="alert alert-warn">${esc(p.descricao)}</div>` : ''}
      <div class="row" style="margin-bottom:10px"><div class="eyebrow grow">Checklist · POP</div><span class="muted small" id="fc-count"></span></div>
      <div id="fc-list">
        ${draft.length ? draft.map((c, i) => `<label class="check ${c.feito ? 'on' : ''}" data-i="${i}"><span class="box"></span><span>${esc(c.texto)}</span></label>`).join('') : '<div class="empty">Este procedimento não possui checklist.</div>'}
      </div>
      <div class="field" style="margin-top:12px"><label>Observações do procedimento</label>
        <textarea class="input" id="fc-obs" placeholder="Algo fora do padrão? Produto usado, pedido do cliente...">${esc(p.obs || '')}</textarea></div>`;
    const updateCount = (el) => {
      const n = draft.filter((c) => c.feito).length;
      el.querySelector('#fc-count').textContent = `${n}/${draft.length}`;
    };
    const commit = (el, skipped) => {
      p.checklist = draft;
      p.obs = el.querySelector('#fc-obs').value.trim();
      if (mode === 'finalizar') { p.status = 'concluido'; p.fim = Date.now(); }
      if (skipped) { p.checklistPulado = true; p.checklistEm = null; } else { p.checklistEm = Date.now(); }
      save(a);
      if (!activeList().some(running)) keepAwake(false);
      render();
      if (mode === 'finalizar' && a.status === 'em_andamento' && a.procedimentos.every((x) => x.status === 'concluido')) {
        setTimeout(() => openClose(a), 250);
      }
    };
    const actions = [];
    if (mode === 'finalizar') {
      actions.push({ label: 'Pular checklist', cls: 'btn-ghost', onClick: (c, el) => commit(el, true) });
    }
    actions.push({
      label: mode === 'finalizar' ? 'Concluir procedimento' : 'Salvar checklist', cls: 'btn-ok',
      onClick: async (close, el) => {
        const faltam = draft.filter((c) => !c.feito).length;
        if (faltam) {
          const ok = await confirmDialog('Itens não marcados', `${faltam} item(ns) do POP não foram marcados. Eles serão registrados como <b>não realizados</b>. Confirmar?`, 'Confirmar');
          if (!ok) return false;
        }
        commit(el, false);
      },
    });
    modal({
      title: `${mode === 'finalizar' ? 'Finalizar' : 'Checklist'} · ${esc(p.nome)}`,
      body,
      actions,
      onOpen: (el) => {
        updateCount(el);
        el.querySelectorAll('.check').forEach((lab) => lab.addEventListener('click', (e) => {
          e.preventDefault();
          const i = Number(lab.dataset.i);
          draft[i].feito = !draft[i].feito;
          lab.classList.toggle('on', draft[i].feito);
          if (navigator.vibrate) navigator.vibrate(8);
          updateCount(el);
        }));
      },
    });
  }

  function openClose(a) {
    const r = running(a);
    if (r) { toast(`Finalize "${r.nome}" primeiro`, 'bad'); openFinish(a, r); return; }
    const pend = a.procedimentos.filter((p) => p.status === 'pendente');
    const done = a.procedimentos.filter((p) => p.status === 'concluido');
    if (!done.length) {
      toast('Inicie e conclua pelo menos um procedimento, ou descarte o atendimento', 'bad');
      return;
    }
    const sum = resumo({ ...a, finalizadoEm: Math.max(...done.map((p) => p.fim)) });
    modal({
      title: 'Encerrar atendimento',
      body: `
        <div class="big-timer"><div class="muted small">Tempo total</div><div class="t mono">${dur(sum.tempoTotal)}</div></div>
        ${pend.length ? `<div class="alert alert-warn">${pend.length} procedimento(s) não iniciado(s) serão removidos: ${pend.map((p) => esc(p.nome)).join(', ')}</div>` : ''}
        ${sum.pendentes ? `<div class="alert alert-warn">Há ${sum.pendentes} checklist(s) pulado(s). Você pode preenchê-los depois na tela inicial.</div>` : ''}
        <div class="field"><label>Observações gerais do atendimento</label>
          <textarea class="input" id="cl-obs" placeholder="Preferências do cliente, ocorrências...">${esc(a.observacoes || '')}</textarea></div>`,
      actions: [
        { label: 'Voltar', onClick: () => {} },
        {
          label: 'Encerrar', cls: 'btn-gold',
          onClick: (close, el) => {
            a.procedimentos = a.procedimentos.filter((p) => p.status !== 'pendente');
            a.observacoes = el.querySelector('#cl-obs').value.trim();
            a.finalizadoEm = Math.max(...a.procedimentos.map((p) => p.fim));
            a.status = 'finalizado';
            save(a);
            toast('Atendimento registrado ✓', 'ok');
            location.hash = '#/';
          },
        },
      ],
    });
  }

  // ------------------------------------------------------------------
  // Telas
  // ------------------------------------------------------------------
  function render() {
    const m = location.hash.match(/^#\/a\/(.+)$/);
    if (m && state.atendimentos.get(m[1])) renderAtendimento(state.atendimentos.get(m[1]));
    else renderHome();
    tick();
  }

  function renderHome() {
    document.getElementById('back').hidden = true;
    const all = [...state.atendimentos.values()].filter((a) => !a.cancelado);
    const today = all.filter((a) => isToday(a.criadoEm) && a.status === 'finalizado');
    const ativos = activeList();
    const pendentes = all.filter((a) => a.status === 'finalizado' && resumo(a).pendentes > 0);
    const tempos = today.map((a) => resumo(a).tempoTotal).filter(Boolean);
    const pops = today.map((a) => resumo(a).pop).filter((x) => x !== null);
    $view.innerHTML = `
      <div class="stat-row">
        <div class="stat"><div class="v">${today.length}</div><div class="l">Atendimentos hoje</div></div>
        <div class="stat"><div class="v">${tempos.length ? durHuman(tempos.reduce((s, x) => s + x, 0) / tempos.length) : '—'}</div><div class="l">Tempo médio</div></div>
        <div class="stat"><div class="v">${pops.length ? Math.round(pops.reduce((s, x) => s + x, 0) / pops.length) + '%' : '—'}</div><div class="l">POP cumprido</div></div>
      </div>

      ${ativos.length ? `<div class="section-title"><h2>Em andamento</h2></div>` : ''}
      ${ativos.map((a) => {
        const r = running(a); const s = resumo(a);
        return `<div class="at-card live" data-open="${a.id}">
          <div class="row"><span class="pill pill-gold"><span class="dot dot-live"></span> ${r ? esc(r.nome) : 'Aguardando início'}</span><span class="spacer"></span>
          <span class="timer-sm mono" ${s.inicio ? `data-since="${s.inicio}"` : ''}>${s.inicio ? dur(Date.now() - s.inicio) : '--:--'}</span></div>
          <div style="margin-top:8px"><b>${esc(a.cliente || 'Cliente')}</b> <span class="muted small">· ${a.procedimentos.map((p) => esc(p.nome)).join(', ')}</span></div>
        </div>`;
      }).join('')}

      ${pendentes.length ? `<div class="section-title"><h2>Checklists pendentes</h2><span class="pill pill-warn">${pendentes.length}</span></div>
        ${pendentes.map((a) => `<div class="at-card" data-open="${a.id}"><div class="row"><b class="grow">${esc(a.cliente || 'Cliente')}</b><span class="pill pill-warn">Preencher</span></div>
        <div class="muted small" style="margin-top:4px">${fmtDate(a.criadoEm)} ${fmtTime(a.criadoEm)} · ${a.procedimentos.filter((p) => p.checklistPulado && !p.checklistEm).map((p) => esc(p.nome)).join(', ')}</div></div>`).join('')}` : ''}

      <div class="section-title"><h2>Hoje</h2><span class="muted small">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</span></div>
      ${today.length ? today.sort((x, y) => y.criadoEm - x.criadoEm).map((a) => {
        const s = resumo(a);
        return `<div class="at-card" data-open="${a.id}">
          <div class="row"><b class="grow">${esc(a.cliente || 'Cliente')}</b><span class="mono muted small">${fmtTime(s.inicio)}–${fmtTime(s.fim)}</span></div>
          <div class="muted small" style="margin:4px 0 8px">${a.procedimentos.map((p) => esc(p.nome)).join(' + ')}</div>
          <div class="row row-wrap"><span class="pill">⏱ ${durHuman(s.tempoTotal)}</span>${popPill(s)}</div>
        </div>`;
      }).join('') : `<div class="empty">Nenhum atendimento finalizado hoje.<br><span class="small">Toque em <b>Novo atendimento</b> para começar.</span></div>`}
    `;
    $view.querySelectorAll('[data-open]').forEach((el) => el.addEventListener('click', () => { location.hash = `#/a/${el.dataset.open}`; }));
    $fab.innerHTML = `<div class="inner"><button class="btn btn-gold btn-lg" id="new">＋ Novo atendimento</button></div>`;
    document.getElementById('new').addEventListener('click', openNew);
  }

  function renderAtendimento(a) {
    document.getElementById('back').hidden = false;
    const s = resumo(a);
    const finished = a.status === 'finalizado';
    const r = running(a);
    $view.innerHTML = `
      <div class="card" style="margin-bottom:14px">
        <div class="row">
          <div class="grow">
            <div class="eyebrow">${finished ? 'Atendimento finalizado' : 'Atendimento em andamento'}</div>
            <h1 style="margin-top:4px" id="cli-name">${esc(a.cliente || 'Cliente')}</h1>
            <div class="muted small">${fmtDate(a.criadoEm)} · criado às ${fmtTime(a.criadoEm)}</div>
          </div>
          ${!finished ? '<button class="icon-btn" id="edit-cli" aria-label="Editar cliente">✎</button>' : ''}
        </div>
        <div class="big-timer" style="padding-bottom:0">
          <div class="muted small">Tempo total</div>
          <div class="t mono" ${s.inicio && !finished ? `data-since="${s.inicio}"` : ''}>${s.inicio ? dur(s.tempoTotal) : '00:00'}</div>
          ${finished ? `<div style="margin-top:6px">${popPill(s)}</div>` : ''}
        </div>
      </div>

      ${a.procedimentos.map((p, i) => procCard(a, p, i, r)).join('')}

      ${!finished ? `<button class="btn btn-block" id="add-proc" style="margin-bottom:14px">＋ Adicionar procedimento</button>` : ''}

      <div class="card">
        <div class="field" style="margin:0"><label>Observações gerais</label>
          <textarea class="input" id="obs-geral" placeholder="Preferências do cliente, ocorrências...">${esc(a.observacoes || '')}</textarea></div>
      </div>
      ${!finished ? `<button class="btn btn-ghost btn-block" id="discard" style="margin-top:16px;color:var(--bad)">Descartar atendimento</button>` : ''}
    `;

    $view.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', () => startProc(a, a.procedimentos.find((p) => p.id === b.dataset.start))));
    $view.querySelectorAll('[data-finish]').forEach((b) => b.addEventListener('click', () => openFinish(a, a.procedimentos.find((p) => p.id === b.dataset.finish))));
    $view.querySelectorAll('[data-fill]').forEach((b) => b.addEventListener('click', () => openFinish(a, a.procedimentos.find((p) => p.id === b.dataset.fill), 'preencher')));
    $view.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', async () => {
      const p = a.procedimentos.find((x) => x.id === b.dataset.remove);
      if (!(await confirmDialog('Remover procedimento', `Remover "${esc(p.nome)}" deste atendimento?`, 'Remover', 'btn-bad'))) return;
      a.procedimentos = a.procedimentos.filter((x) => x.id !== p.id);
      save(a); render();
    }));
    const obs = document.getElementById('obs-geral');
    obs.addEventListener('change', () => { a.observacoes = obs.value.trim(); save(a); toast('Observação salva', 'ok'); });
    const add = document.getElementById('add-proc');
    if (add) add.addEventListener('click', () => servicePicker({
      title: 'Adicionar procedimento', confirmLabel: 'Adicionar',
      onConfirm: (procs) => { a.procedimentos.push(...procs); save(a); render(); },
    }));
    const edit = document.getElementById('edit-cli');
    if (edit) edit.addEventListener('click', () => modal({
      title: 'Cliente', body: `<div class="field"><label>Nome do cliente</label><input class="input" id="ec" value="${esc(a.cliente || '')}"></div>`,
      actions: [{ label: 'Salvar', cls: 'btn-gold', onClick: (c, el) => { a.cliente = el.querySelector('#ec').value.trim(); save(a); render(); } }],
    }));
    const discard = document.getElementById('discard');
    if (discard) discard.addEventListener('click', async () => {
      if (a.procedimentos.some((p) => p.inicio)) {
        toast('Atendimentos já iniciados não podem ser descartados. Encerre normalmente ou fale com o admin.', 'bad');
        return;
      }
      if (!(await confirmDialog('Descartar', 'Descartar este atendimento que ainda não foi iniciado?', 'Descartar', 'btn-bad'))) return;
      // Atendimento nunca iniciado: some do celular e é marcado como descartado no servidor
      a.descartado = true; a.status = 'finalizado';
      save(a);
      state.atendimentos.delete(a.id);
      location.hash = '#/';
    });

    if (finished) {
      $fab.innerHTML = `<div class="inner"><button class="btn btn-lg" id="home">Voltar ao início</button></div>`;
      document.getElementById('home').addEventListener('click', () => { location.hash = '#/'; });
    } else {
      const next = a.procedimentos.find((p) => p.status === 'pendente');
      $fab.innerHTML = `<div class="inner">
        ${r ? `<button class="btn btn-ok btn-lg" data-ffinish="${r.id}">✓ Finalizar ${esc(r.nome)}</button>`
          : next ? `<button class="btn btn-gold btn-lg" data-fstart="${next.id}">▶ Iniciar ${esc(next.nome)}</button>`
            : `<button class="btn btn-gold btn-lg" id="close-at">Encerrar atendimento</button>`}
      </div>`;
      const fs = $fab.querySelector('[data-fstart]');
      if (fs) fs.addEventListener('click', () => startProc(a, next));
      const ff = $fab.querySelector('[data-ffinish]');
      if (ff) ff.addEventListener('click', () => openFinish(a, r));
      const ca = document.getElementById('close-at');
      if (ca) ca.addEventListener('click', () => openClose(a));
    }
  }

  function procCard(a, p, i, r) {
    const cls = p.status === 'em_andamento' ? 'running' : p.status === 'concluido' ? 'done' : '';
    const feitos = p.checklist.filter((c) => c.feito).length;
    const pend = p.checklistPulado && !p.checklistEm;
    const elapsed = p.inicio ? (p.fim || Date.now()) - p.inicio : 0;
    const pct = p.tempoPadraoMin ? Math.min(100, (elapsed / (p.tempoPadraoMin * 60000)) * 100) : 0;
    const over = p.tempoPadraoMin && elapsed > p.tempoPadraoMin * 60000;
    return `<div class="proc ${cls}">
      <div class="proc-head">
        <span class="proc-num">${p.status === 'concluido' ? '✓' : i + 1}</span>
        <div class="grow"><b>${esc(p.nome)}</b>${p.descricao ? `<div class="muted small">${esc(p.descricao)}</div>` : ''}</div>
        ${p.status === 'pendente' && a.status !== 'finalizado' ? `<button class="icon-btn" data-remove="${p.id}" aria-label="Remover">✕</button>` : ''}
        ${p.status === 'concluido' ? `<span class="mono">${dur(elapsed)}</span>` : ''}
      </div>
      ${p.status === 'em_andamento' ? `
        <div class="timer mono" data-since="${p.inicio}">${dur(elapsed)}</div>
        ${p.tempoPadraoMin ? `<div class="progress ${over ? 'over' : ''}" data-prog="${p.inicio}" data-std="${p.tempoPadraoMin}"><i style="width:${pct}%"></i></div>
        <div class="muted tiny" style="text-align:center;margin-top:6px">Tempo padrão: ${p.tempoPadraoMin} min</div>` : ''}
        <button class="btn btn-ok btn-block" style="margin-top:12px" data-finish="${p.id}">✓ Finalizar e marcar checklist</button>` : ''}
      ${p.status === 'pendente' && a.status !== 'finalizado' ? `
        <button class="btn ${r ? '' : 'btn-gold'} btn-block" style="margin-top:12px" data-start="${p.id}" ${r ? 'disabled' : ''}>▶ Iniciar</button>` : ''}
      ${p.status === 'concluido' ? `
        <div class="row row-wrap" style="margin-top:10px">
          <span class="muted small">${fmtTime(p.inicio)} – ${fmtTime(p.fim)}</span><span class="spacer"></span>
          ${pend ? `<button class="btn btn-sm" style="border-color:var(--warn);color:var(--warn)" data-fill="${p.id}">Preencher checklist</button>`
            : p.checklist.length ? `<span class="pill ${feitos === p.checklist.length ? 'pill-ok' : 'pill-warn'}">Checklist ${feitos}/${p.checklist.length}</span>` : ''}
        </div>
        ${p.obs ? `<div class="muted small" style="margin-top:8px">📝 ${esc(p.obs)}</div>` : ''}` : ''}
    </div>`;
  }

  function tick() {
    const t = Date.now();
    document.querySelectorAll('[data-since]').forEach((el) => { el.textContent = dur(t - Number(el.dataset.since)); });
    document.querySelectorAll('[data-prog]').forEach((el) => {
      const ms = t - Number(el.dataset.prog); const std = Number(el.dataset.std) * 60000;
      el.querySelector('i').style.width = `${Math.min(100, (ms / std) * 100)}%`;
      el.classList.toggle('over', ms > std);
    });
  }
  setInterval(tick, 1000);

  // ------------------------------------------------------------------
  // Início
  // ------------------------------------------------------------------
  async function init() {
    let me;
    try { me = await api('GET', '/api/me'); } catch (e) {
      if (e.status === 401) return;
      // Sem internet: usa a última sessão conhecida para não travar o barbeiro
      const last = JSON.parse(localStorage.getItem('bp_last_me') || 'null');
      if (!last) { $view.innerHTML = '<div class="empty">Sem conexão com o servidor. Verifique a internet.</div>'; return; }
      me = last;
    }
    if (me.usuario.papel === 'admin' && !location.search.includes('modo=barbeiro')) { location.href = '/admin'; return; }
    localStorage.setItem('bp_last_me', JSON.stringify(me));
    state.me = me.usuario;
    document.getElementById('shop').textContent = me.nomeBarbearia || 'Barber POP';
    document.getElementById('who').textContent = state.me.nome;
    if (state.me.trocarSenha) BP.changeOwnPassword(true);

    lsGet('cache', []).forEach((a) => state.atendimentos.set(a.id, a));
    Object.values(outbox()).forEach((a) => { if (!a.descartado) state.atendimentos.set(a.id, a); });
    try {
      const r = await api('GET', '/api/servicos');
      state.servicos = r.servicos;
      lsSet('servicos', r.servicos);
    } catch (e) { state.servicos = lsGet('servicos', []); }
    render();
    await loadServer();
    flush();
    render();
    if (activeList().some(running)) keepAwake(true);
  }

  window.addEventListener('hashchange', render);
  document.getElementById('back').addEventListener('click', () => { location.hash = '#/'; });
  document.getElementById('menu').addEventListener('click', () => {
    modal({
      title: state.me ? esc(state.me.nome) : 'Menu',
      body: `<div class="stack">
        <button class="btn btn-block" id="m-sync">↻ Sincronizar agora</button>
        <button class="btn btn-block" id="m-pw">Alterar minha senha</button>
        <button class="btn btn-bad btn-block" id="m-out">Sair</button>
        <p class="faint tiny" style="margin:6px 0 0">As marcações ficam salvas neste aparelho e são enviadas automaticamente quando houver internet.</p>
      </div>`,
      onOpen: (el, close) => {
        el.querySelector('#m-sync').onclick = async () => { close(); await flush(); await loadServer(); render(); toast('Sincronizado', 'ok'); };
        el.querySelector('#m-pw').onclick = () => { close(); BP.changeOwnPassword(false); };
        el.querySelector('#m-out').onclick = async () => {
          if (Object.keys(outbox()).length) { toast('Há marcações não sincronizadas. Conecte-se à internet antes de sair.', 'bad'); return; }
          BP.logout();
        };
      },
    });
  });
  // Atualiza a lista periodicamente (ex.: mudanças feitas pelo admin)
  setInterval(() => { if (document.visibilityState === 'visible' && !document.querySelector('.modal-backdrop')) loadServer().then(render); }, 60000);
  init();
})();
