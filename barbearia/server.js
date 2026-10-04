'use strict';
/*
 * Barber POP — servidor do MVP
 * Sem dependências externas: apenas módulos nativos do Node.js (>= 18).
 *
 * Armazenamento (pasta DATA_DIR):
 *   db.json                      -> configurações, usuários, procedimentos, sessões, log de exportações
 *   atendimentos/AAAA-MM.json    -> atendimentos do mês (escrita atômica: arquivo temporário + rename)
 *   journal/AAAA-MM.jsonl        -> diário append-only de cada gravação (permite reconstruir o mês)
 * Backups (pasta BACKUP_DIR): snapshot JSON completo + CSV a cada BACKUP_HOURS horas, mantidos por BACKUP_KEEP_DAYS dias.
 * Atendimentos NUNCA são apagados automaticamente. A remoção manual exige uma exportação CSV completa recente.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const BACKUP_DIR = path.resolve(process.env.BACKUP_DIR || path.join(__dirname, 'backups'));
const BACKUP_HOURS = Number(process.env.BACKUP_HOURS) || 6;
const BACKUP_KEEP_DAYS = Math.max(45, Number(process.env.BACKUP_KEEP_DAYS) || 90);
const MIN_PURGE_DAYS = 31; // nunca permite remover atendimentos com menos de 31 dias
const EXPORT_ALERT_DAYS = Number(process.env.EXPORT_ALERT_DAYS) || 7;
const TZ = process.env.TZ_DISPLAY || 'America/Sao_Paulo';
const SESSION_IDLE_DAYS = 30;
const PUBLIC_DIR = path.join(__dirname, 'public');

const DAY = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function uid() {
  return crypto.randomUUID();
}

function now() {
  return Date.now();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeAtomic(file, content) {
  ensureDir(path.dirname(file));
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  const fd = fs.openSync(tmp, 'w');
  try {
    fs.writeSync(fd, content);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmp, file);
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
});
const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false,
});

function fmtDate(ms) {
  return ms ? dateFmt.format(new Date(ms)) : '';
}
function fmtTime(ms) {
  return ms ? timeFmt.format(new Date(ms)) : '';
}
function monthKey(ms) {
  const [d, m, y] = fmtDate(ms).split('/');
  return `${y}-${m}`;
}
function fmtDuration(ms) {
  if (!ms || ms < 0) return '';
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function fmtMoney(v) {
  return (Number(v) || 0).toFixed(2).replace('.', ',');
}

function str(v, max = 500) {
  if (v === undefined || v === null) return '';
  return String(v).slice(0, max);
}
function num(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}
function msOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

// ---------------------------------------------------------------------------
// Senhas e sessões
// ---------------------------------------------------------------------------

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}
function checkPassword(password, user) {
  if (!user || !user.salt || !user.hash) return false;
  const { hash } = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.hash, 'hex'));
}

// ---------------------------------------------------------------------------
// Estado em memória + persistência
// ---------------------------------------------------------------------------

const DEFAULT_SERVICES = [
  ['Corte de cabelo', 70, 40, ['Consultar o cliente sobre o corte desejado', 'Higienizar pente, tesoura e máquina', 'Colocar toalha e capa', 'Lavar o cabelo', 'Realizar o corte conforme combinado', 'Finalizar acabamento e contornos', 'Aplicar produto de finalização', 'Mostrar o resultado no espelho']],
  ['Barba', 50, 30, ['Consultar o cliente sobre o estilo da barba', 'Higienizar navalha e trocar lâmina', 'Aplicar toalha quente', 'Aplicar óleo/creme pré-barba', 'Modelar e aparar', 'Fazer contornos com navalha', 'Aplicar toalha fria', 'Aplicar pós-barba/balm']],
  ['Sobrancelha', 20, 10, ['Alinhar o formato com o cliente', 'Higienizar a área', 'Remover os excessos', 'Aplicar loção calmante']],
  ['Hidratação', 40, 20, ['Lavar o cabelo', 'Aplicar a máscara de hidratação', 'Respeitar o tempo de pausa', 'Enxaguar e finalizar']],
  ['Depilação nasal', 25, 10, ['Explicar o procedimento ao cliente', 'Aplicar a cera na temperatura correta', 'Remover e conferir', 'Aplicar loção calmante']],
  ['Depilação auricular', 25, 10, ['Explicar o procedimento ao cliente', 'Aplicar a cera na temperatura correta', 'Remover e conferir', 'Aplicar loção calmante']],
  ['Esfoliação', 35, 15, ['Higienizar o rosto', 'Aplicar o esfoliante com movimentos circulares', 'Remover com toalha úmida', 'Hidratar a pele']],
  ['Limpeza de pele', 90, 45, ['Higienizar o rosto', 'Esfoliar', 'Abrir os poros (vapor/toalha quente)', 'Fazer a extração', 'Aplicar máscara', 'Aplicar hidratante e protetor']],
];

let db = null; // { versao, config, usuarios, servicos, sessoes, exportacoes, backups, purgas }
const atendimentos = new Map(); // id -> atendimento
const health = { writeError: null, lastBackupAt: null, lastBackupError: null, recovered: [] };

function dbFile() {
  return path.join(DATA_DIR, 'db.json');
}
function monthFile(key) {
  return path.join(DATA_DIR, 'atendimentos', `${key}.json`);
}
function journalFile(key) {
  return path.join(DATA_DIR, 'journal', `${key}.jsonl`);
}

function saveDb() {
  try {
    writeAtomic(dbFile(), JSON.stringify(db, null, 1));
    health.writeError = null;
  } catch (err) {
    health.writeError = { at: now(), message: err.message };
    console.error('[ERRO] Falha ao gravar db.json:', err);
    throw err;
  }
}

function saveMonth(key) {
  const list = [];
  for (const a of atendimentos.values()) if (a.mes === key) list.push(a);
  list.sort((x, y) => x.criadoEm - y.criadoEm);
  try {
    writeAtomic(monthFile(key), JSON.stringify(list));
    health.writeError = null;
  } catch (err) {
    health.writeError = { at: now(), message: err.message };
    console.error('[ERRO] Falha ao gravar atendimentos:', err);
    throw err;
  }
}

function journal(key, entry) {
  try {
    ensureDir(path.dirname(journalFile(key)));
    fs.appendFileSync(journalFile(key), JSON.stringify(entry) + '\n');
  } catch (err) {
    health.writeError = { at: now(), message: err.message };
    console.error('[ERRO] Falha ao gravar journal:', err);
  }
}

function persistAtendimento(a) {
  journal(a.mes, { t: now(), op: 'upsert', a });
  saveMonth(a.mes);
}

function rebuildMonthFromJournal(key) {
  const file = journalFile(key);
  if (!fs.existsSync(file)) return [];
  const map = new Map();
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      const e = JSON.parse(line);
      if (e.op === 'upsert' && e.a) map.set(e.a.id, e.a);
      if (e.op === 'purge' && Array.isArray(e.ids)) e.ids.forEach((id) => map.delete(id));
    } catch { /* linha parcial (queda de energia) — ignora */ }
  }
  return [...map.values()];
}

function loadAll() {
  ensureDir(DATA_DIR);
  ensureDir(BACKUP_DIR);
  db = readJson(dbFile(), null);
  if (!db) {
    const senha = process.env.ADMIN_PASSWORD || 'admin123';
    const { salt, hash } = hashPassword(senha);
    db = {
      versao: 1,
      criadoEm: now(),
      config: { nomeBarbearia: process.env.SHOP_NAME || 'Barbearia' },
      usuarios: [{
        id: uid(), nome: 'Administrador', usuario: 'admin', papel: 'admin', ativo: true,
        comissao: 0, salt, hash, trocarSenha: !process.env.ADMIN_PASSWORD, criadoEm: now(),
      }],
      servicos: DEFAULT_SERVICES.map(([nome, preco, tempo, itens], i) => ({
        id: uid(), nome, preco, tempoPadraoMin: tempo, ativo: true, ordem: i, outro: false,
        checklist: itens.map((texto) => ({ id: uid(), texto })),
      })).concat([{
        id: uid(), nome: 'Outro', preco: 0, tempoPadraoMin: 0, ativo: true, ordem: 99, outro: true,
        checklist: [{ id: uid(), texto: 'Descrever o serviço realizado nas observações' }, { id: uid(), texto: 'Higienizar materiais utilizados' }],
      }]),
      sessoes: {},
      exportacoes: [],
      purgas: [],
    };
    saveDb();
    console.log(`\n[INFO] Banco criado. Login inicial: admin / ${process.env.ADMIN_PASSWORD ? '(ADMIN_PASSWORD)' : 'admin123'}\n`);
  }
  db.sessoes = db.sessoes || {};
  db.exportacoes = db.exportacoes || [];
  db.purgas = db.purgas || [];

  const dir = path.join(DATA_DIR, 'atendimentos');
  ensureDir(dir);
  const months = new Set(fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).map((f) => f.slice(0, 7)));
  const jdir = path.join(DATA_DIR, 'journal');
  if (fs.existsSync(jdir)) {
    fs.readdirSync(jdir).filter((f) => /^\d{4}-\d{2}\.jsonl$/.test(f)).forEach((f) => months.add(f.slice(0, 7)));
  }
  for (const key of months) {
    let list;
    try {
      list = readJson(monthFile(key), null);
      if (!Array.isArray(list)) throw new Error('arquivo ausente ou inválido');
    } catch (err) {
      console.error(`[ALERTA] Arquivo do mês ${key} com problema (${err.message}). Reconstruindo pelo journal...`);
      if (fs.existsSync(monthFile(key))) fs.renameSync(monthFile(key), `${monthFile(key)}.corrompido-${now()}`);
      list = rebuildMonthFromJournal(key);
      health.recovered.push({ mes: key, at: now(), registros: list.length });
      for (const a of list) atendimentos.set(a.id, a);
      saveMonth(key);
      continue;
    }
    for (const a of list) atendimentos.set(a.id, a);
  }
  console.log(`[INFO] ${atendimentos.size} atendimentos carregados de ${DATA_DIR}`);
}

// ---------------------------------------------------------------------------
// Backups
// ---------------------------------------------------------------------------

function snapshot() {
  return {
    tipo: 'barber-pop-backup',
    geradoEm: now(),
    config: db.config,
    usuarios: db.usuarios.map(({ salt, hash, ...u }) => u),
    usuariosComSenha: db.usuarios, // permite restauração completa
    servicos: db.servicos,
    atendimentos: [...atendimentos.values()],
  };
}

function runBackup() {
  try {
    ensureDir(BACKUP_DIR);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const snap = snapshot();
    writeAtomic(path.join(BACKUP_DIR, `backup-${stamp}.json`), JSON.stringify(snap));
    const all = filterAtendimentos({ incluirCancelados: true });
    writeAtomic(path.join(BACKUP_DIR, `backup-${stamp}.csv`), toCsv(all, 'procedimento'));
    health.lastBackupAt = now();
    health.lastBackupError = null;
    // Remove somente backups muito antigos (os dados vivos continuam intactos)
    const limit = now() - BACKUP_KEEP_DAYS * DAY;
    for (const f of fs.readdirSync(BACKUP_DIR)) {
      if (!/^backup-.*\.(json|csv)$/.test(f)) continue;
      const st = fs.statSync(path.join(BACKUP_DIR, f));
      if (st.mtimeMs < limit) fs.unlinkSync(path.join(BACKUP_DIR, f));
    }
    console.log(`[INFO] Backup gerado: backup-${stamp}`);
  } catch (err) {
    health.lastBackupError = { at: now(), message: err.message };
    console.error('[ERRO] Falha no backup:', err);
  }
}

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR)
    .filter((f) => /^(backup|arquivo)-.*\.(json|csv)$/.test(f))
    .map((f) => {
      const st = fs.statSync(path.join(BACKUP_DIR, f));
      return { nome: f, tamanho: st.size, criadoEm: st.mtimeMs };
    })
    .sort((a, b) => b.criadoEm - a.criadoEm);
}

function lastBackupFromDisk() {
  const b = listBackups().find((x) => x.nome.startsWith('backup-') && x.nome.endsWith('.json'));
  return b ? b.criadoEm : null;
}

// ---------------------------------------------------------------------------
// Regras de atendimento
// ---------------------------------------------------------------------------

function publicUser(u) {
  return {
    id: u.id, nome: u.nome, usuario: u.usuario, papel: u.papel, ativo: u.ativo,
    comissao: u.comissao || 0, trocarSenha: !!u.trocarSenha, criadoEm: u.criadoEm,
  };
}

function servicoById(id) {
  return db.servicos.find((s) => s.id === id);
}

/** Normaliza o atendimento enviado pelo celular do barbeiro, mantendo campos controlados pelo servidor/admin. */
function sanitizeAtendimento(input, barbeiro, existing) {
  const procs = Array.isArray(input.procedimentos) ? input.procedimentos.slice(0, 30) : [];
  const procedimentos = procs.map((p) => {
    const prev = existing && existing.procedimentos.find((x) => x.id === p.id);
    const serv = servicoById(p.servicoId);
    const precoCatalogo = prev ? prev.precoCatalogo : (serv ? num(serv.preco) : 0);
    const status = ['pendente', 'em_andamento', 'concluido'].includes(p.status) ? p.status : 'pendente';
    return {
      id: str(p.id, 64) || uid(),
      servicoId: str(p.servicoId, 64),
      nome: prev ? prev.nome : (serv ? serv.nome : str(p.nome, 80) || 'Procedimento'),
      outro: prev ? prev.outro : !!(serv && serv.outro),
      descricao: str(p.descricao, 300),
      tempoPadraoMin: prev ? prev.tempoPadraoMin : (serv ? num(serv.tempoPadraoMin) : 0),
      precoCatalogo,
      precoAjustado: prev && prev.precoAjustado !== undefined ? prev.precoAjustado : null,
      status,
      inicio: msOrNull(p.inicio),
      fim: msOrNull(p.fim),
      checklist: (Array.isArray(p.checklist) ? p.checklist.slice(0, 60) : []).map((c) => ({
        id: str(c.id, 64) || uid(), texto: str(c.texto, 200), feito: !!c.feito,
      })),
      checklistPulado: !!p.checklistPulado,
      checklistEm: msOrNull(p.checklistEm),
      obs: str(p.obs, 1000),
    };
  });
  const criadoEm = existing ? existing.criadoEm : (msOrNull(input.criadoEm) || now());
  const status = ['em_andamento', 'finalizado'].includes(input.status) ? input.status : 'em_andamento';
  return {
    id: existing ? existing.id : str(input.id, 64),
    mes: existing ? existing.mes : monthKey(criadoEm),
    barbeiroId: barbeiro.id,
    barbeiroNome: barbeiro.nome,
    cliente: str(input.cliente, 120),
    criadoEm,
    iniciadoEm: msOrNull(input.iniciadoEm),
    finalizadoEm: msOrNull(input.finalizadoEm),
    status,
    observacoes: str(input.observacoes, 2000),
    procedimentos,
    // descartado pelo barbeiro antes de iniciar qualquer procedimento
    descartado: !!input.descartado && !procedimentos.some((p) => p.inicio) && !(existing && existing.procedimentos.some((p) => p.inicio)),
    // Campos de controle do admin — nunca vêm do celular
    cancelado: existing ? !!existing.cancelado : false,
    cancelMotivo: existing ? existing.cancelMotivo || '' : '',
    criadoNoServidorEm: existing ? existing.criadoNoServidorEm : now(),
    atualizadoEm: now(),
    versaoCliente: num(input.versaoCliente, 0),
  };
}

function precoProc(p) {
  return p.precoAjustado !== null && p.precoAjustado !== undefined ? num(p.precoAjustado) : num(p.precoCatalogo);
}

function resumo(a) {
  const procs = a.procedimentos || [];
  const inicios = procs.map((p) => p.inicio).filter(Boolean);
  const fins = procs.map((p) => p.fim).filter(Boolean);
  const inicio = a.iniciadoEm || (inicios.length ? Math.min(...inicios) : null);
  const fim = a.finalizadoEm || (fins.length ? Math.max(...fins) : null);
  const totalItens = procs.reduce((s, p) => s + p.checklist.length, 0);
  const feitos = procs.reduce((s, p) => s + p.checklist.filter((c) => c.feito).length, 0);
  const pulados = procs.filter((p) => p.checklistPulado && !p.checklistEm).length;
  const tempoProcedimentos = procs.reduce((s, p) => s + (p.inicio && p.fim ? p.fim - p.inicio : 0), 0);
  return {
    inicio, fim,
    tempoTotal: inicio && fim ? fim - inicio : 0,
    tempoProcedimentos,
    totalItens, feitos,
    pop: totalItens ? Math.round((feitos / totalItens) * 100) : null,
    checklistPendente: pulados,
    valor: procs.reduce((s, p) => s + precoProc(p), 0),
  };
}

function checklistStatus(a) {
  const r = resumo(a);
  if (r.checklistPendente > 0) return 'pulado';
  if (r.totalItens && r.feitos === r.totalItens) return 'completo';
  return 'incompleto';
}

function filterAtendimentos(q = {}) {
  const de = msOrNull(q.de);
  const ate = msOrNull(q.ate);
  const barbeiros = q.barbeiro ? String(q.barbeiro).split(',').filter(Boolean) : null;
  const servico = q.servico ? String(q.servico) : null;
  const status = q.status || null;
  const checklist = q.checklist || null;
  const incluirCancelados = q.incluirCancelados === true || q.incluirCancelados === '1' || status === 'cancelado';
  const busca = q.busca ? String(q.busca).toLowerCase() : null;
  const out = [];
  for (const a of atendimentos.values()) {
    if (a.descartado) continue;
    if (de && a.criadoEm < de) continue;
    if (ate && a.criadoEm > ate) continue;
    if (barbeiros && !barbeiros.includes(a.barbeiroId)) continue;
    if (!incluirCancelados && a.cancelado) continue;
    if (status === 'cancelado' && !a.cancelado) continue;
    if (status === 'em_andamento' && (a.status !== 'em_andamento' || a.cancelado)) continue;
    if (status === 'finalizado' && (a.status !== 'finalizado' || a.cancelado)) continue;
    if (servico && !a.procedimentos.some((p) => p.servicoId === servico)) continue;
    if (checklist && checklistStatus(a) !== checklist) continue;
    if (busca && !(`${a.cliente} ${a.barbeiroNome} ${a.observacoes}`.toLowerCase().includes(busca))) continue;
    out.push(a);
  }
  out.sort((x, y) => y.criadoEm - x.criadoEm);
  return out;
}

// ---------------------------------------------------------------------------
// CSV (separador ";" e BOM para abrir corretamente no Excel em português)
// ---------------------------------------------------------------------------

function csvCell(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function comissaoDe(barbeiroId) {
  const u = db.usuarios.find((x) => x.id === barbeiroId);
  return u ? num(u.comissao) : 0;
}

function toCsv(list, modo) {
  const rows = [];
  if (modo === 'procedimento') {
    rows.push(['ID atendimento', 'Data', 'Barbeiro', 'Cliente', 'Status atendimento', 'Procedimento', 'Descrição (outro)',
      'Início', 'Fim', 'Duração', 'Duração (min)', 'Tempo padrão (min)', 'Checklist feitos', 'Checklist total', 'POP %',
      'Checklist pulado', 'Itens não realizados', 'Obs. procedimento', 'Valor (R$)', 'Comissão %', 'Comissão (R$)', 'Obs. atendimento']);
    for (const a of list) {
      for (const p of a.procedimentos) {
        const feitos = p.checklist.filter((c) => c.feito).length;
        const total = p.checklist.length;
        const dur = p.inicio && p.fim ? p.fim - p.inicio : 0;
        const valor = precoProc(p);
        const pct = comissaoDe(a.barbeiroId);
        rows.push([a.id, fmtDate(a.criadoEm), a.barbeiroNome, a.cliente, a.cancelado ? 'cancelado' : a.status, p.nome, p.descricao,
          fmtTime(p.inicio), fmtTime(p.fim), fmtDuration(dur), dur ? (dur / 60000).toFixed(1).replace('.', ',') : '', p.tempoPadraoMin || '',
          feitos, total, total ? Math.round((feitos / total) * 100) : '',
          p.checklistPulado && !p.checklistEm ? 'sim' : 'não',
          p.checklist.filter((c) => !c.feito).map((c) => c.texto).join(' | '),
          p.obs, fmtMoney(valor), pct, fmtMoney(a.cancelado ? 0 : (valor * pct) / 100), a.observacoes]);
      }
    }
  } else {
    rows.push(['ID atendimento', 'Data', 'Barbeiro', 'Cliente', 'Status', 'Início', 'Fim', 'Tempo total', 'Tempo total (min)',
      'Procedimentos', 'Qtd. procedimentos', 'Checklist feitos', 'Checklist total', 'POP %', 'Checklists pendentes',
      'Valor (R$)', 'Comissão %', 'Comissão (R$)', 'Observações', 'Motivo cancelamento']);
    for (const a of list) {
      const r = resumo(a);
      const pct = comissaoDe(a.barbeiroId);
      rows.push([a.id, fmtDate(a.criadoEm), a.barbeiroNome, a.cliente, a.cancelado ? 'cancelado' : a.status,
        fmtTime(r.inicio), fmtTime(r.fim), fmtDuration(r.tempoTotal), r.tempoTotal ? (r.tempoTotal / 60000).toFixed(1).replace('.', ',') : '',
        a.procedimentos.map((p) => (p.outro && p.descricao ? `${p.nome}: ${p.descricao}` : p.nome)).join(' + '),
        a.procedimentos.length, r.feitos, r.totalItens, r.pop ?? '', r.checklistPendente,
        fmtMoney(r.valor), pct, fmtMoney(a.cancelado ? 0 : (r.valor * pct) / 100), a.observacoes, a.cancelMotivo]);
    }
  }
  return '﻿' + rows.map((r) => r.map(csvCell).join(';')).join('\r\n') + '\r\n';
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

function send(res, status, body, headers = {}) {
  const isObj = typeof body === 'object' && !Buffer.isBuffer(body);
  res.writeHead(status, {
    'Content-Type': isObj ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(isObj ? JSON.stringify(body) : body);
}

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function readBody(req, limit = 5 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new HttpError(413, 'Corpo da requisição muito grande')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(new HttpError(400, 'JSON inválido')); }
    });
    req.on('error', reject);
  });
}

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function sessionCookie(token, maxAgeSec) {
  const secure = process.env.COOKIE_SECURE === '1' ? '; Secure' : '';
  return `bpop=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

let sessionDirty = false;
function getUser(req) {
  const token = parseCookies(req).bpop;
  if (!token) return null;
  const s = db.sessoes[token];
  if (!s) return null;
  if (now() - s.ultimoUso > SESSION_IDLE_DAYS * DAY) { delete db.sessoes[token]; sessionDirty = true; return null; }
  const u = db.usuarios.find((x) => x.id === s.userId);
  if (!u || !u.ativo) return null;
  if (now() - s.ultimoUso > 60 * 60 * 1000) { s.ultimoUso = now(); sessionDirty = true; }
  return u;
}
setInterval(() => { if (sessionDirty) { sessionDirty = false; try { saveDb(); } catch { /* registrado em health */ } } }, 60 * 1000).unref();

function revokeSessions(userId) {
  for (const [t, s] of Object.entries(db.sessoes)) if (s.userId === userId) delete db.sessoes[t];
}

const loginFails = new Map(); // ip -> { n, ate }
function ipOf(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
}

function requireUser(req, papel) {
  const u = getUser(req);
  if (!u) throw new HttpError(401, 'Sessão expirada. Faça login novamente.');
  if (papel && u.papel !== papel) throw new HttpError(403, 'Acesso não permitido');
  return u;
}

function validateUsuario(body, existing) {
  const nome = str(body.nome, 80).trim();
  const usuario = str(body.usuario, 40).trim().toLowerCase();
  if (!nome) throw new HttpError(400, 'Informe o nome');
  if (!/^[a-z0-9._-]{3,40}$/.test(usuario)) throw new HttpError(400, 'Usuário deve ter 3 a 40 caracteres (letras, números, ponto, hífen)');
  if (db.usuarios.some((u) => u.usuario === usuario && (!existing || u.id !== existing.id))) throw new HttpError(400, 'Este usuário já existe');
  const papel = body.papel === 'admin' ? 'admin' : 'barbeiro';
  const comissao = Math.min(100, Math.max(0, num(body.comissao, 0)));
  return { nome, usuario, papel, comissao };
}

function validateSenha(s) {
  if (!s || String(s).length < 4) throw new HttpError(400, 'A senha deve ter pelo menos 4 caracteres');
  return String(s).slice(0, 200);
}

function activeAdmins() {
  return db.usuarios.filter((u) => u.papel === 'admin' && u.ativo);
}

function statusPayload() {
  const list = [...atendimentos.values()];
  const oldest = list.reduce((m, a) => (m === null || a.criadoEm < m ? a.criadoEm : m), null);
  const lastExport = db.exportacoes.filter((e) => e.completo).sort((a, b) => b.at - a.at)[0] || null;
  const lastBackup = health.lastBackupAt || lastBackupFromDisk();
  const alertas = [];
  if (health.writeError) alertas.push({ nivel: 'perigo', codigo: 'gravacao', texto: `Falha ao gravar dados no servidor (${health.writeError.message}). Exporte a planilha completa AGORA e contate o suporte.` });
  if (health.lastBackupError) alertas.push({ nivel: 'perigo', codigo: 'backup', texto: `O último backup automático falhou (${health.lastBackupError.message}). Exporte a planilha completa.` });
  if (!lastBackup || now() - lastBackup > (BACKUP_HOURS * 2 + 1) * 60 * 60 * 1000) alertas.push({ nivel: 'aviso', codigo: 'backup-atrasado', texto: 'Backup automático atrasado. Gere um backup manual e exporte a planilha completa.' });
  if (list.length && (!lastExport || now() - lastExport.at > EXPORT_ALERT_DAYS * DAY)) {
    alertas.push({ nivel: 'aviso', codigo: 'exportacao', texto: lastExport ? `A última planilha completa foi exportada há ${Math.floor((now() - lastExport.at) / DAY)} dias. Recomendado: exportar toda semana como garantia.` : 'Nenhuma planilha completa foi exportada ainda. Exporte como garantia.' });
  }
  for (const r of health.recovered) alertas.push({ nivel: 'aviso', codigo: 'recuperado', texto: `O arquivo do mês ${r.mes} foi reconstruído automaticamente pelo diário (${r.registros} registros). Confira e exporte a planilha completa.` });
  const adminSemTroca = db.usuarios.find((u) => u.papel === 'admin' && u.trocarSenha && u.ativo);
  if (adminSemTroca) alertas.push({ nivel: 'aviso', codigo: 'senha-padrao', texto: `O usuário "${adminSemTroca.usuario}" ainda usa a senha inicial. Defina uma nova senha em Equipe.` });
  let disco = null;
  try {
    if (fs.statfsSync) {
      const st = fs.statfsSync(DATA_DIR);
      disco = { livre: st.bavail * st.bsize, total: st.blocks * st.bsize };
      if (disco.livre < 200 * 1024 * 1024) alertas.push({ nivel: 'perigo', codigo: 'disco', texto: 'Pouco espaço em disco no servidor. Exporte a planilha completa e libere espaço.' });
    }
  } catch { /* opcional */ }
  return {
    servidorEm: now(),
    totalAtendimentos: list.length,
    maisAntigo: oldest,
    criadoEm: db.criadoEm,
    ultimoBackup: lastBackup,
    intervaloBackupHoras: BACKUP_HOURS,
    retencaoBackupDias: BACKUP_KEEP_DAYS,
    minDiasPurga: MIN_PURGE_DAYS,
    ultimaExportacao: lastExport,
    exportacoes: db.exportacoes.slice(-15).reverse(),
    purgas: db.purgas.slice(-10).reverse(),
    backups: listBackups().slice(0, 40),
    disco,
    alertas,
  };
}

function mergeImport(lista) {
  let novos = 0; let atualizados = 0; const meses = new Set();
  for (const raw of lista) {
    if (!raw || !raw.id || !raw.criadoEm || !Array.isArray(raw.procedimentos)) continue;
    const ex = atendimentos.get(raw.id);
    if (ex && (ex.atualizadoEm || 0) >= (raw.atualizadoEm || 0)) continue;
    const a = { ...raw, mes: monthKey(raw.criadoEm) };
    atendimentos.set(a.id, a);
    journal(a.mes, { t: now(), op: 'upsert', a, origem: 'importacao' });
    meses.add(a.mes);
    if (ex) atualizados++; else novos++;
  }
  for (const m of meses) saveMonth(m);
  return { novos, atualizados };
}

async function handleApi(req, res, url) {
  const p = url.pathname;
  const m = req.method;
  const q = Object.fromEntries(url.searchParams.entries());

  // ---------------- Autenticação ----------------
  if (p === '/api/login' && m === 'POST') {
    const ip = ipOf(req);
    const f = loginFails.get(ip);
    if (f && f.n >= 8 && now() < f.ate) throw new HttpError(429, 'Muitas tentativas. Aguarde 10 minutos.');
    const body = await readBody(req);
    const u = db.usuarios.find((x) => x.usuario === str(body.usuario, 40).trim().toLowerCase());
    if (!u || !u.ativo || !checkPassword(body.senha || '', u)) {
      const cur = f && now() < f.ate ? f : { n: 0, ate: 0 };
      cur.n += 1; cur.ate = now() + 10 * 60 * 1000;
      loginFails.set(ip, cur);
      throw new HttpError(401, 'Usuário ou senha incorretos');
    }
    loginFails.delete(ip);
    const token = crypto.randomBytes(32).toString('hex');
    db.sessoes[token] = { userId: u.id, criadoEm: now(), ultimoUso: now(), ua: str(req.headers['user-agent'], 160) };
    saveDb();
    return send(res, 200, { usuario: publicUser(u) }, { 'Set-Cookie': sessionCookie(token, SESSION_IDLE_DAYS * 86400) });
  }
  if (p === '/api/logout' && m === 'POST') {
    const token = parseCookies(req).bpop;
    if (token && db.sessoes[token]) { delete db.sessoes[token]; saveDb(); }
    return send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
  }
  if (p === '/api/me' && m === 'GET') {
    const u = requireUser(req);
    return send(res, 200, { usuario: publicUser(u), nomeBarbearia: db.config.nomeBarbearia });
  }
  if (p === '/api/me/senha' && m === 'POST') {
    const u = requireUser(req);
    const body = await readBody(req);
    if (!checkPassword(body.atual || '', u)) throw new HttpError(400, 'Senha atual incorreta');
    Object.assign(u, hashPassword(validateSenha(body.nova)), { trocarSenha: false });
    saveDb();
    return send(res, 200, { ok: true });
  }

  // ---------------- Catálogo ----------------
  if (p === '/api/servicos' && m === 'GET') {
    const u = requireUser(req);
    const list = db.servicos.filter((s) => u.papel === 'admin' || s.ativo).sort((a, b) => a.ordem - b.ordem);
    return send(res, 200, { servicos: list, nomeBarbearia: db.config.nomeBarbearia });
  }

  // ---------------- Barbeiro ----------------
  if (p === '/api/meus-atendimentos' && m === 'GET') {
    const u = requireUser(req);
    const dias = Math.min(31, Math.max(1, num(q.dias, 2)));
    const desde = now() - dias * DAY;
    const list = [...atendimentos.values()]
      .filter((a) => a.barbeiroId === u.id && !a.descartado && (a.criadoEm >= desde || a.status === 'em_andamento' || resumo(a).checklistPendente > 0))
      .sort((a, b) => b.criadoEm - a.criadoEm);
    return send(res, 200, { atendimentos: list, servidorEm: now() });
  }
  let mm = p.match(/^\/api\/atendimentos\/([\w-]{8,64})$/);
  if (mm && m === 'PUT') {
    const u = requireUser(req);
    const body = await readBody(req);
    const existing = atendimentos.get(mm[1]);
    if (existing && existing.barbeiroId !== u.id && u.papel !== 'admin') throw new HttpError(403, 'Este atendimento pertence a outro barbeiro');
    if (existing && existing.cancelado) throw new HttpError(409, 'Este atendimento foi cancelado pelo administrador');
    if (existing && num(body.versaoCliente) && num(body.versaoCliente) < num(existing.versaoCliente)) {
      return send(res, 200, { atendimento: existing, ignorado: true }); // versão antiga chegando atrasada da fila offline
    }
    const owner = existing ? db.usuarios.find((x) => x.id === existing.barbeiroId) || u : u;
    const a = sanitizeAtendimento({ ...body, id: mm[1] }, owner, existing);
    atendimentos.set(a.id, a);
    persistAtendimento(a);
    return send(res, 200, { atendimento: a });
  }

  // ---------------- Admin ----------------
  if (!p.startsWith('/api/admin/')) throw new HttpError(404, 'Rota não encontrada');
  const admin = requireUser(req, 'admin');

  if (p === '/api/admin/atendimentos' && m === 'GET') {
    return send(res, 200, { atendimentos: filterAtendimentos(q), servidorEm: now() });
  }
  mm = p.match(/^\/api\/admin\/atendimentos\/([\w-]{8,64})$/);
  if (mm && m === 'PATCH') {
    const a = atendimentos.get(mm[1]);
    if (!a) throw new HttpError(404, 'Atendimento não encontrado');
    const body = await readBody(req);
    if (body.cancelado !== undefined) {
      a.cancelado = !!body.cancelado;
      a.cancelMotivo = a.cancelado ? str(body.cancelMotivo, 300) : '';
      if (a.cancelado && !a.cancelMotivo) throw new HttpError(400, 'Informe o motivo do cancelamento');
    }
    if (body.precos && typeof body.precos === 'object') {
      for (const proc of a.procedimentos) {
        if (Object.prototype.hasOwnProperty.call(body.precos, proc.id)) {
          const v = body.precos[proc.id];
          proc.precoAjustado = v === null || v === '' ? null : Math.max(0, num(v));
        }
      }
    }
    if (body.observacaoAdmin !== undefined) a.observacaoAdmin = str(body.observacaoAdmin, 1000);
    if (body.forcarFinalizar) {
      const t = now();
      for (const proc of a.procedimentos) {
        if (proc.status === 'em_andamento') { proc.status = 'concluido'; proc.fim = t; }
      }
      a.status = 'finalizado';
      a.finalizadoEm = a.finalizadoEm || t;
    }
    a.atualizadoEm = now();
    a.versaoCliente = now(); // invalida envios antigos que ainda estejam na fila offline do celular
    a.alteradoPorAdmin = { por: admin.nome, em: now() };
    persistAtendimento(a);
    return send(res, 200, { atendimento: a });
  }

  if (p === '/api/admin/export.csv' && m === 'GET') {
    const completo = q.completo === '1';
    const filtro = completo ? { incluirCancelados: true } : q;
    const list = filterAtendimentos(filtro).sort((a, b) => a.criadoEm - b.criadoEm);
    const modo = q.modo === 'procedimento' ? 'procedimento' : 'atendimento';
    const exp = { id: uid(), at: now(), por: admin.nome, completo, modo, registros: list.length, totalNoBanco: atendimentos.size };
    db.exportacoes.push(exp);
    if (db.exportacoes.length > 300) db.exportacoes = db.exportacoes.slice(-300);
    saveDb();
    const nome = `${completo ? 'completo' : 'atendimentos'}-${modo}-${fmtDate(now()).split('/').reverse().join('-')}.csv`;
    return send(res, 200, toCsv(list, modo), {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nome}"`,
      'X-Export-Id': exp.id,
      'Access-Control-Expose-Headers': 'X-Export-Id',
    });
  }

  if (p === '/api/admin/usuarios' && m === 'GET') {
    const counts = {};
    for (const a of atendimentos.values()) counts[a.barbeiroId] = (counts[a.barbeiroId] || 0) + 1;
    return send(res, 200, { usuarios: db.usuarios.map((u) => ({ ...publicUser(u), atendimentos: counts[u.id] || 0 })) });
  }
  if (p === '/api/admin/usuarios' && m === 'POST') {
    const body = await readBody(req);
    const data = validateUsuario(body);
    const u = { id: uid(), ...data, ativo: true, ...hashPassword(validateSenha(body.senha)), trocarSenha: false, criadoEm: now() };
    db.usuarios.push(u);
    saveDb();
    return send(res, 200, { usuario: publicUser(u) });
  }
  mm = p.match(/^\/api\/admin\/usuarios\/([\w-]{8,64})(\/senha)?$/);
  if (mm) {
    const u = db.usuarios.find((x) => x.id === mm[1]);
    if (!u) throw new HttpError(404, 'Usuário não encontrado');
    if (mm[2] && m === 'POST') {
      const body = await readBody(req);
      Object.assign(u, hashPassword(validateSenha(body.senha)), { trocarSenha: false });
      revokeSessions(u.id);
      saveDb();
      return send(res, 200, { ok: true });
    }
    if (!mm[2] && m === 'PUT') {
      const body = await readBody(req);
      const data = validateUsuario({ ...publicUser(u), ...body }, u);
      const ativo = body.ativo === undefined ? u.ativo : !!body.ativo;
      const removendoAdmin = u.papel === 'admin' && u.ativo && (!ativo || data.papel !== 'admin');
      if (removendoAdmin && activeAdmins().length <= 1) throw new HttpError(400, 'É necessário manter pelo menos um administrador ativo');
      Object.assign(u, data, { ativo });
      if (!ativo) revokeSessions(u.id);
      // mantém o nome atualizado nos atendimentos em andamento
      saveDb();
      return send(res, 200, { usuario: publicUser(u) });
    }
    if (!mm[2] && m === 'DELETE') {
      if (u.id === admin.id) throw new HttpError(400, 'Você não pode excluir o próprio usuário');
      const tem = [...atendimentos.values()].some((a) => a.barbeiroId === u.id);
      if (tem) throw new HttpError(400, 'Este usuário possui atendimentos registrados. Use "Desativar" para manter o histórico.');
      if (u.papel === 'admin' && u.ativo && activeAdmins().length <= 1) throw new HttpError(400, 'É necessário manter pelo menos um administrador ativo');
      db.usuarios = db.usuarios.filter((x) => x.id !== u.id);
      revokeSessions(u.id);
      saveDb();
      return send(res, 200, { ok: true });
    }
  }

  if (p === '/api/admin/servicos' && m === 'PUT') {
    const body = await readBody(req);
    if (!Array.isArray(body.servicos)) throw new HttpError(400, 'Lista inválida');
    const list = body.servicos.slice(0, 60).map((s, i) => {
      const nome = str(s.nome, 80).trim();
      if (!nome) throw new HttpError(400, 'Todo procedimento precisa de um nome');
      return {
        id: str(s.id, 64) || uid(), nome, preco: Math.max(0, num(s.preco)), tempoPadraoMin: Math.max(0, num(s.tempoPadraoMin)),
        ativo: s.ativo !== false, ordem: i, outro: !!s.outro,
        checklist: (Array.isArray(s.checklist) ? s.checklist : []).slice(0, 40)
          .map((c) => ({ id: str(c.id, 64) || uid(), texto: str(c.texto, 200).trim() })).filter((c) => c.texto),
      };
    });
    db.servicos = list;
    saveDb();
    return send(res, 200, { servicos: list });
  }
  if (p === '/api/admin/config' && m === 'PUT') {
    const body = await readBody(req);
    db.config.nomeBarbearia = str(body.nomeBarbearia, 80).trim() || db.config.nomeBarbearia;
    saveDb();
    return send(res, 200, { config: db.config });
  }

  if (p === '/api/admin/status' && m === 'GET') return send(res, 200, statusPayload());
  if (p === '/api/admin/backup-agora' && m === 'POST') {
    runBackup();
    if (health.lastBackupError) throw new HttpError(500, `Falha no backup: ${health.lastBackupError.message}`);
    return send(res, 200, statusPayload());
  }
  if (p === '/api/admin/backup.json' && m === 'GET') {
    const snap = snapshot();
    delete snap.usuariosComSenha;
    return send(res, 200, JSON.stringify(snap), {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="backup-barberpop-${fmtDate(now()).split('/').reverse().join('-')}.json"`,
    });
  }
  mm = p.match(/^\/api\/admin\/backups\/((?:backup|arquivo)-[\w.-]+\.(?:json|csv))$/);
  if (mm && m === 'GET') {
    const file = path.join(BACKUP_DIR, mm[1]);
    if (!fs.existsSync(file)) throw new HttpError(404, 'Backup não encontrado');
    let content = fs.readFileSync(file);
    if (file.endsWith('.json')) {
      const obj = JSON.parse(content.toString('utf8'));
      delete obj.usuariosComSenha;
      content = Buffer.from(JSON.stringify(obj));
    }
    return send(res, 200, content, {
      'Content-Type': file.endsWith('.csv') ? 'text/csv; charset=utf-8' : 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${mm[1]}"`,
    });
  }
  if (p === '/api/admin/importar' && m === 'POST') {
    const body = await readBody(req, 200 * 1024 * 1024);
    const lista = Array.isArray(body.atendimentos) ? body.atendimentos : [];
    if (!lista.length) throw new HttpError(400, 'Nenhum atendimento encontrado no arquivo');
    runBackup(); // garante um ponto de restauração antes de mesclar
    const r = mergeImport(lista);
    return send(res, 200, { ...r, total: atendimentos.size });
  }
  if (p === '/api/admin/purgar' && m === 'POST') {
    const body = await readBody(req);
    const antesDe = msOrNull(body.antesDe);
    if (!antesDe) throw new HttpError(400, 'Data inválida');
    if (now() - antesDe < MIN_PURGE_DAYS * DAY) throw new HttpError(400, `Só é possível remover atendimentos com mais de ${MIN_PURGE_DAYS} dias`);
    const exp = db.exportacoes.find((e) => e.id === body.exportId);
    if (!exp || !exp.completo || now() - exp.at > 15 * 60 * 1000) {
      throw new HttpError(428, 'Antes de remover dados é obrigatório baixar a planilha CSV completa (válida por 15 minutos).');
    }
    if (str(body.confirmacao, 20).toUpperCase() !== 'REMOVER') throw new HttpError(400, 'Digite REMOVER para confirmar');
    const alvo = [...atendimentos.values()].filter((a) => a.criadoEm < antesDe && a.status !== 'em_andamento');
    if (!alvo.length) throw new HttpError(400, 'Nenhum atendimento finalizado antes desta data');
    runBackup();
    if (health.lastBackupError) throw new HttpError(500, 'Backup de segurança falhou — remoção cancelada');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    writeAtomic(path.join(BACKUP_DIR, `arquivo-${stamp}.json`), JSON.stringify({ tipo: 'barber-pop-arquivo', geradoEm: now(), atendimentos: alvo }));
    writeAtomic(path.join(BACKUP_DIR, `arquivo-${stamp}.csv`), toCsv(alvo, 'procedimento'));
    const meses = new Set();
    const idsPorMes = {};
    for (const a of alvo) {
      atendimentos.delete(a.id);
      meses.add(a.mes);
      (idsPorMes[a.mes] = idsPorMes[a.mes] || []).push(a.id);
    }
    for (const mes of meses) {
      journal(mes, { t: now(), op: 'purge', ids: idsPorMes[mes] });
      saveMonth(mes);
    }
    db.purgas.push({ at: now(), por: admin.nome, antesDe, registros: alvo.length, arquivo: `arquivo-${stamp}` });
    saveDb();
    return send(res, 200, { removidos: alvo.length, arquivo: `arquivo-${stamp}` });
  }

  throw new HttpError(404, 'Rota não encontrada');
}

function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  const routes = { '/': '/index.html', '/barbeiro': '/barbeiro.html', '/admin': '/admin.html' };
  p = routes[p] || p;
  const file = path.normalize(path.join(PUBLIC_DIR, p));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, 'Proibido');
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Não encontrado');
    const ext = path.extname(file);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' || p === '/sw.js' ? 'no-cache' : 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    });
    fs.createReadStream(file).pipe(res);
  });
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname.startsWith('/api/')) {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
          // proteção simples contra CSRF: exige cabeçalho enviado pelo nosso front-end
          if (req.headers['x-requested-with'] !== 'barberpop') throw new HttpError(403, 'Requisição bloqueada');
        }
        await handleApi(req, res, url);
      } else if (req.method === 'GET' || req.method === 'HEAD') {
        serveStatic(req, res, url);
      } else {
        send(res, 405, 'Método não permitido');
      }
    } catch (err) {
      if (!(err instanceof HttpError)) console.error('[ERRO]', req.method, url.pathname, err);
      if (!res.headersSent) send(res, err.status || 500, { erro: err instanceof HttpError ? err.message : 'Erro interno no servidor' });
    }
  });
}

if (require.main === module) {
  loadAll();
  runBackup();
  setInterval(runBackup, BACKUP_HOURS * 60 * 60 * 1000).unref();
  createServer().listen(PORT, () => {
    console.log(`[INFO] Barber POP rodando em http://localhost:${PORT}`);
  });
  const shutdown = () => { try { saveDb(); } catch { /* */ } process.exit(0); };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = { createServer, loadAll, runBackup };
