'use strict';
/* Teste de fumaça: sobe o servidor em pasta temporária e exercita os fluxos principais. Uso: npm test */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'barberpop-'));
process.env.DATA_DIR = path.join(tmp, 'data');
process.env.BACKUP_DIR = path.join(tmp, 'backups');
process.env.ADMIN_PASSWORD = 'segredo123';

function fresh() {
  delete require.cache[require.resolve('../server.js')];
  return require('../server.js');
}

async function main() {
  let srv = fresh();
  srv.loadAll();
  let server = srv.createServer().listen(0);
  let base = `http://127.0.0.1:${server.address().port}`;

  const jar = {};
  async function call(who, method, url, body) {
    const res = await fetch(base + url, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'barberpop', Cookie: jar[who] || '' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const sc = res.headers.get('set-cookie');
    if (sc) jar[who] = sc.split(';')[0];
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('json') ? await res.json() : new TextDecoder('utf-8', { ignoreBOM: true }).decode(await res.arrayBuffer());
    return { status: res.status, data, headers: res.headers };
  }

  // login admin
  assert.equal((await call('admin', 'POST', '/api/login', { usuario: 'admin', senha: 'errada' })).status, 401);
  assert.equal((await call('admin', 'POST', '/api/login', { usuario: 'admin', senha: 'segredo123' })).status, 200);

  // CSRF: sem cabeçalho é bloqueado
  const noHdr = await fetch(base + '/api/admin/usuarios', { method: 'POST', headers: { Cookie: jar.admin } });
  assert.equal(noHdr.status, 403);

  // cria barbeiro
  const cu = await call('admin', 'POST', '/api/admin/usuarios', { nome: 'João', usuario: 'joao', senha: '1234', papel: 'barbeiro', comissao: 40 });
  assert.equal(cu.status, 200, JSON.stringify(cu.data));
  const joaoId = cu.data.usuario.id;
  assert.equal((await call('admin', 'POST', '/api/admin/usuarios', { nome: 'X', usuario: 'joao', senha: '1234' })).status, 400);

  // barbeiro faz login e não acessa admin
  assert.equal((await call('joao', 'POST', '/api/login', { usuario: 'joao', senha: '1234' })).status, 200);
  assert.equal((await call('joao', 'GET', '/api/admin/atendimentos')).status, 403);

  const servs = (await call('joao', 'GET', '/api/servicos')).data.servicos;
  const corte = servs.find((s) => s.nome === 'Corte de cabelo');
  const outro = servs.find((s) => s.outro);
  const t0 = Date.now() - 50 * 60000;
  const at = {
    id: 'aaaaaaaa-1111-4111-8111-111111111111', cliente: 'Carlos', criadoEm: t0, iniciadoEm: t0, status: 'finalizado',
    finalizadoEm: t0 + 45 * 60000, observacoes: 'Cliente pediu degradê; usar "pomada"', versaoCliente: 1,
    procedimentos: [
      { id: 'p1', servicoId: corte.id, status: 'concluido', inicio: t0, fim: t0 + 35 * 60000, precoCatalogo: 9999,
        checklist: corte.checklist.map((c, i) => ({ ...c, feito: i !== 2 })), checklistEm: t0 + 35 * 60000, obs: 'ok' },
      { id: 'p2', servicoId: outro.id, descricao: 'Pigmentação', status: 'concluido', inicio: t0 + 35 * 60000, fim: t0 + 45 * 60000,
        checklist: outro.checklist.map((c) => ({ ...c, feito: false })), checklistPulado: true },
    ],
  };
  const put = await call('joao', 'PUT', `/api/atendimentos/${at.id}`, at);
  assert.equal(put.status, 200, JSON.stringify(put.data));
  assert.equal(put.data.atendimento.procedimentos[0].precoCatalogo, corte.preco, 'preço vem do catálogo, não do celular');
  assert.equal(put.data.atendimento.barbeiroNome, 'João');

  // versão antiga atrasada é ignorada
  const old = await call('joao', 'PUT', `/api/atendimentos/${at.id}`, { ...at, versaoCliente: 0.5, cliente: 'Antigo' });
  assert.equal(old.data.atendimento.cliente, 'Carlos');

  // outro barbeiro não altera
  await call('admin', 'POST', '/api/admin/usuarios', { nome: 'Pedro', usuario: 'pedro', senha: '1234' });
  await call('pedro', 'POST', '/api/login', { usuario: 'pedro', senha: '1234' });
  assert.equal((await call('pedro', 'PUT', `/api/atendimentos/${at.id}`, at)).status, 403);

  // admin vê, ajusta preço e exporta
  const list = await call('admin', 'GET', '/api/admin/atendimentos?checklist=pulado');
  assert.equal(list.data.atendimentos.length, 1);
  const pa = await call('admin', 'PATCH', `/api/admin/atendimentos/${at.id}`, { precos: { p2: 120 } });
  assert.equal(pa.data.atendimento.procedimentos[1].precoAjustado, 120);
  // barbeiro reenviando não apaga o ajuste do admin
  const re = await call('joao', 'PUT', `/api/atendimentos/${at.id}`, { ...at, versaoCliente: Date.now() + 1000 });
  assert.equal(re.data.atendimento.procedimentos[1].precoAjustado, 120);

  const csv = await call('admin', 'GET', '/api/admin/export.csv?modo=procedimento');
  assert.equal(csv.status, 200);
  assert.ok(csv.data.startsWith('﻿'));
  assert.ok(csv.data.includes('Pigmentação'));
  assert.ok(csv.data.includes('"Cliente pediu degradê; usar ""pomada"""'));
  const csvA = await call('admin', 'GET', '/api/admin/export.csv?modo=atendimento');
  assert.ok(csvA.data.split('\r\n')[1].includes(';João;Carlos;'));

  // purga: bloqueada sem exportação completa e para dados recentes
  assert.equal((await call('admin', 'POST', '/api/admin/purgar', { antesDe: Date.now(), confirmacao: 'REMOVER' })).status, 400);
  const antes = Date.now() - 40 * 86400000;
  assert.equal((await call('admin', 'POST', '/api/admin/purgar', { antesDe: antes, confirmacao: 'REMOVER' })).status, 428);

  // desativar usuário derruba a sessão
  await call('admin', 'PUT', `/api/admin/usuarios/${joaoId}`, { ativo: false });
  assert.equal((await call('joao', 'GET', '/api/me')).status, 401);
  assert.equal((await call('admin', 'DELETE', `/api/admin/usuarios/${joaoId}`)).status, 400, 'não exclui quem tem histórico');

  // status e backups
  const st = await call('admin', 'GET', '/api/admin/status');
  assert.equal(st.data.totalAtendimentos, 1);
  srv.runBackup();
  assert.ok(fs.readdirSync(process.env.BACKUP_DIR).some((f) => f.endsWith('.json')));

  // recuperação: corrompe o arquivo do mês e reinicia — deve reconstruir pelo journal
  server.close();
  const dir = path.join(process.env.DATA_DIR, 'atendimentos');
  const mf = fs.readdirSync(dir).find((f) => f.endsWith('.json'));
  fs.writeFileSync(path.join(dir, mf), '{corrompido');
  srv = fresh();
  srv.loadAll();
  server = srv.createServer().listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
  const st2 = await call('admin', 'GET', '/api/admin/status');
  assert.equal(st2.data.totalAtendimentos, 1, 'reconstruído pelo journal');
  assert.ok(st2.data.alertas.some((a) => a.codigo === 'recuperado'));
  const rec = (await call('admin', 'GET', '/api/admin/atendimentos')).data.atendimentos[0];
  assert.equal(rec.procedimentos[1].precoAjustado, 120);

  // importação não duplica
  const imp = await call('admin', 'POST', '/api/admin/importar', { atendimentos: [rec] });
  assert.equal(imp.data.novos, 0);

  server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('✓ Todos os testes passaram');
}

main().catch((e) => { console.error(e); process.exit(1); });
