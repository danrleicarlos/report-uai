/* Utilidades compartilhadas entre as telas */
(function () {
  'use strict';

  class ApiError extends Error {
    constructor(status, message) { super(message); this.status = status; }
  }

  async function api(method, url, body) {
    let res;
    try {
      res = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'barberpop' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (e) {
      throw new ApiError(0, 'Sem conexão com o servidor');
    }
    let data = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) data = await res.json().catch(() => null);
    if (res.status === 401 && !url.endsWith('/api/login')) {
      if (!location.pathname.match(/^\/?$|index\.html$/)) location.href = '/?expirou=1';
    }
    if (!res.ok) throw new ApiError(res.status, (data && data.erro) || `Erro ${res.status}`);
    return data;
  }

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function toast(msg, type) {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const el = document.createElement('div');
    el.className = `toast ${type || ''}`;
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; }, 3200);
    setTimeout(() => el.remove(), 3600);
  }

  /** Abre um modal. content: HTML do corpo; actions: [{label, cls, onClick(close) -> false mantém aberto}] */
  function modal({ title, body, actions = [], wide = false, onOpen, dismissable = true }) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `
      <div class="modal ${wide ? 'modal-wide' : ''}" role="dialog" aria-modal="true">
        <div class="modal-head"><h2 class="grow">${title || ''}</h2>
          ${dismissable ? '<button class="icon-btn" data-close aria-label="Fechar">✕</button>' : ''}</div>
        <div class="modal-body">${body || ''}</div>
        ${actions.length ? '<div class="modal-foot"></div>' : ''}
      </div>`;
    const close = () => { wrap.remove(); document.body.style.overflow = ''; };
    if (dismissable) {
      wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
    }
    const foot = wrap.querySelector('.modal-foot');
    actions.forEach((a) => {
      const b = document.createElement('button');
      b.className = `btn ${a.cls || ''}`;
      b.textContent = a.label;
      b.addEventListener('click', async () => {
        b.disabled = true;
        try {
          const r = await a.onClick(close, wrap);
          if (r !== false) close();
        } catch (e) {
          toast(e.message || 'Erro', 'bad');
        } finally { b.disabled = false; }
      });
      foot.appendChild(b);
    });
    document.body.appendChild(wrap);
    document.body.style.overflow = 'hidden';
    if (onOpen) onOpen(wrap, close);
    return { el: wrap, close };
  }

  function confirmDialog(title, text, okLabel = 'Confirmar', okCls = 'btn-gold') {
    return new Promise((resolve) => {
      let done = false;
      const m = modal({
        title,
        body: `<p class="muted" style="margin:0">${text}</p>`,
        actions: [
          { label: 'Cancelar', onClick: () => { done = true; resolve(false); } },
          { label: okLabel, cls: okCls, onClick: () => { done = true; resolve(true); } },
        ],
      });
      const obs = new MutationObserver(() => { if (!document.body.contains(m.el)) { obs.disconnect(); if (!done) resolve(false); } });
      obs.observe(document.body, { childList: true });
    });
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function dur(ms, withSec = true) {
    if (!ms || ms < 0) ms = 0;
    const t = Math.floor(ms / 1000);
    const h = Math.floor(t / 3600); const m = Math.floor((t % 3600) / 60); const s = t % 60;
    if (!withSec) return h ? `${h}h${pad(m)}` : `${m} min`;
    return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }
  function durHuman(ms) {
    if (!ms || ms < 0) return '—';
    const min = Math.round(ms / 60000);
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)}h${pad(min % 60)}`;
  }
  function fmtTime(ms) { if (!ms) return '—'; const d = new Date(ms); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
  function fmtDate(ms) { if (!ms) return '—'; const d = new Date(ms); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; }
  function fmtDateShort(ms) { const d = new Date(ms); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; }
  function fmtDateTime(ms) { return ms ? `${fmtDate(ms)} ${fmtTime(ms)}` : '—'; }
  function money(v) { return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function isToday(ms) { const a = new Date(ms); const b = new Date(); return a.toDateString() === b.toDateString(); }
  function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); }
  function endOfDay(d) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x.getTime(); }
  function toInputDate(ms) { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  function fromInputDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).getTime(); }
  function bytes(n) { if (!n && n !== 0) return '—'; const u = ['B', 'KB', 'MB', 'GB']; let i = 0; while (n >= 1024 && i < 3) { n /= 1024; i++; } return `${n.toFixed(i ? 1 : 0)} ${u[i]}`; }
  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15);
      return (c === 'x' ? r : (r & 3) | 8).toString(16);
    });
  }

  /** Resumo calculado de um atendimento (mesma regra do servidor). */
  function resumo(a) {
    const procs = a.procedimentos || [];
    const inicios = procs.map((p) => p.inicio).filter(Boolean);
    const fins = procs.map((p) => p.fim).filter(Boolean);
    const inicio = a.iniciadoEm || (inicios.length ? Math.min(...inicios) : null);
    const fim = a.finalizadoEm || (fins.length ? Math.max(...fins) : null);
    const totalItens = procs.reduce((s, p) => s + (p.checklist || []).length, 0);
    const feitos = procs.reduce((s, p) => s + (p.checklist || []).filter((c) => c.feito).length, 0);
    const pendentes = procs.filter((p) => p.checklistPulado && !p.checklistEm).length;
    const valor = procs.reduce((s, p) => s + (p.precoAjustado !== null && p.precoAjustado !== undefined ? Number(p.precoAjustado) : Number(p.precoCatalogo || 0)), 0);
    return {
      inicio, fim,
      tempoTotal: inicio ? (fim || Date.now()) - inicio : 0,
      emAndamento: a.status === 'em_andamento' && !a.cancelado,
      totalItens, feitos, pendentes, valor,
      pop: totalItens ? Math.round((feitos / totalItens) * 100) : null,
    };
  }
  function precoProc(p) { return p.precoAjustado !== null && p.precoAjustado !== undefined ? Number(p.precoAjustado) : Number(p.precoCatalogo || 0); }

  function popPill(r) {
    if (r.pendentes) return `<span class="pill pill-warn">Checklist pendente</span>`;
    if (r.pop === null) return `<span class="pill">Sem checklist</span>`;
    const cls = r.pop >= 100 ? 'pill-ok' : r.pop >= 70 ? 'pill-warn' : 'pill-bad';
    return `<span class="pill ${cls}">POP ${r.pop}%</span>`;
  }

  async function logout() {
    try { await api('POST', '/api/logout'); } catch (e) { /* segue */ }
    location.href = '/';
  }

  async function changeOwnPassword(forced) {
    modal({
      title: forced ? 'Defina uma nova senha' : 'Alterar minha senha',
      dismissable: !forced,
      body: `
        ${forced ? '<div class="alert alert-warn">Por segurança, troque a senha inicial antes de continuar.</div>' : ''}
        <div class="field"><label>Senha atual</label><input class="input" type="password" id="pw-a" autocomplete="current-password"></div>
        <div class="field"><label>Nova senha</label><input class="input" type="password" id="pw-n" autocomplete="new-password"></div>
        <div class="field"><label>Repita a nova senha</label><input class="input" type="password" id="pw-r" autocomplete="new-password"></div>`,
      actions: [{
        label: 'Salvar senha', cls: 'btn-gold',
        onClick: async (close, el) => {
          const a = el.querySelector('#pw-a').value; const n = el.querySelector('#pw-n').value; const r = el.querySelector('#pw-r').value;
          if (n !== r) { toast('As senhas não conferem', 'bad'); return false; }
          await api('POST', '/api/me/senha', { atual: a, nova: n });
          toast('Senha alterada', 'ok');
        },
      }],
    });
  }

  window.BP = {
    api, ApiError, esc, toast, modal, confirmDialog, dur, durHuman, fmtTime, fmtDate, fmtDateShort, fmtDateTime, money,
    isToday, startOfDay, endOfDay, toInputDate, fromInputDate, bytes, uuid, resumo, precoProc, popPill, logout, changeOwnPassword, pad,
  };
})();
