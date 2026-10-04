# Barber POP — MVP

Sistema web para registrar os atendimentos da barbearia, garantir que o **POP** (procedimento operacional padrão) seja seguido e facilitar o **cálculo de comissões**.

- **Tela do barbeiro** (celular/tablet): cria o atendimento, marca os procedimentos, inicia o cronômetro de cada um e marca o checklist ao finalizar (pode pular e preencher depois).
- **Painel do admin** (celular e desktop): acompanha as cadeiras ao vivo, dashboard, linhas de atendimento (geral e por barbeiro) com detalhes expansíveis, filtros e exportação CSV, cadastro da equipe, edição de procedimentos/checklists e central de backup.

Não usa nenhuma dependência externa: só **Node.js 18.15+**.

## Rodando

```bash
cd barbearia
ADMIN_PASSWORD=defina-uma-senha node server.js
# abre em http://localhost:3000
```

Primeiro acesso: usuário `admin` com a senha definida em `ADMIN_PASSWORD` (sem ela, a senha é `admin123` e o sistema obriga a troca no primeiro login).

Teste automático dos fluxos principais: `npm test`.

### Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta HTTP |
| `DATA_DIR` | `./data` | Onde ficam os dados |
| `BACKUP_DIR` | `./backups` | Onde ficam os backups automáticos |
| `BACKUP_HOURS` | `6` | Intervalo dos backups automáticos |
| `BACKUP_KEEP_DAYS` | `90` (mínimo 45) | Por quanto tempo os arquivos de backup ficam guardados |
| `EXPORT_ALERT_DAYS` | `7` | Avisa o admin se a planilha completa não for baixada nesse período |
| `ADMIN_PASSWORD` | — | Senha do admin criado na primeira execução |
| `SHOP_NAME` | `Barbearia` | Nome exibido (dá para mudar no painel) |
| `TZ_DISPLAY` | `America/Sao_Paulo` | Fuso usado nas datas do CSV |
| `COOKIE_SECURE` | — | Use `1` quando estiver atrás de HTTPS |

## Publicação (importante)

O servidor precisa de **disco persistente**. Opções que funcionam:

- VPS (Hostinger, DigitalOcean, Contabo etc.) com `pm2` ou `systemd`;
- Railway / Render / Fly.io **com volume** apontado para `DATA_DIR` e `BACKUP_DIR`;
- Docker: `docker build -t barberpop . && docker run -d -p 3000:3000 -v barberpop:/dados -e ADMIN_PASSWORD=... barberpop`.

**Não use** hospedagem serverless sem disco (Vercel, Netlify Functions) nem planos gratuitos que apagam o disco a cada deploy, porque os dados seriam perdidos.

Use HTTPS (Cloudflare, Caddy ou o próprio provedor) e defina `COOKIE_SECURE=1`.

Nos tablets e celulares dos barbeiros, abra o endereço e use “Adicionar à tela inicial” para virar um app.

## Como os dados são protegidos

Requisito: **nenhuma perda de dados em até 30 dias** e **alerta para exportar o CSV completo antes de qualquer perda**.

1. **Nada é apagado automaticamente.** Atendimentos ficam guardados indefinidamente. Usuários são *desativados*, não excluídos, e atendimentos são *cancelados* com motivo, sem sumir do banco.
2. **Gravação segura:** cada alteração é salva em disco na hora, com escrita atômica (arquivo temporário + rename + fsync), em um arquivo por mês (`data/atendimentos/AAAA-MM.json`).
3. **Diário (journal):** toda gravação também entra em `data/journal/AAAA-MM.jsonl`. Se um arquivo do mês corromper, o servidor reconstrói tudo pelo diário ao iniciar e avisa o admin.
4. **Backups automáticos** a cada 6 h (JSON completo + CSV), mantidos por 90 dias, que podem ser baixados pelo painel.
5. **Espelho no navegador do admin:** o painel guarda (IndexedDB) uma cópia dos últimos 60 dias. Se o servidor “perder” atendimentos que existem nessa cópia, aparece um **alerta vermelho** com botões para baixar o CSV da cópia e restaurar no servidor.
6. **Fila offline no celular do barbeiro:** se a internet cair, as marcações ficam salvas no aparelho e são enviadas sozinhas quando a conexão volta. O barbeiro não consegue sair da conta enquanto houver pendências.
7. **Alertas no painel** para: nenhuma planilha completa baixada nos últimos 7 dias, backup falhou ou está atrasado, erro de gravação, pouco espaço em disco, arquivo recuperado e senha inicial ainda em uso.
8. **Remoção manual de dados antigos** (opcional, para liberar espaço): só para atendimentos com mais de 31 dias. O sistema **obriga** baixar a planilha CSV completa (o comprovante vale 15 min), pede para digitar `REMOVER`, gera um backup e ainda guarda um arquivo `arquivo-*.json/.csv` no servidor com os registros removidos.

Restaurar: em **Dados & backup → Importar backup**, envie um `.json`. A importação só acrescenta o que falta e nunca apaga nada.

## Planilhas CSV

Separador `;` com BOM UTF-8 (abre direto no Excel em português e no Google Planilhas).

- **1 linha por atendimento:** data, barbeiro, cliente, horários, tempo total, serviços, POP %, checklists pendentes, valor, comissão e observações.
- **1 linha por procedimento** (ideal para comissões): início/fim, duração, tempo padrão, itens feitos e itens **não realizados**, observações, valor e comissão.

Os filtros da tela (período, barbeiro, procedimento, status, checklist e busca) valem para a exportação.

## Regras do fluxo do barbeiro

- Só um procedimento roda por vez em cada atendimento. Para iniciar o próximo, é preciso finalizar o atual.
- Ao finalizar, o checklist aparece. Itens não marcados ficam registrados como **não realizados**. “Pular checklist” deixa o item pendente na tela inicial do barbeiro e no painel até ser preenchido.
- O tempo total do atendimento vai do início do 1º procedimento até o fim do último.
- O preço vem da tabela de procedimentos (o celular não consegue alterar). O admin pode ajustar o valor de cada procedimento depois. A comissão usa o % cadastrado em cada barbeiro.
- A tela fica acesa enquanto um procedimento está rodando, nos aparelhos compatíveis.

## Estrutura

```
barbearia/
  server.js          API + arquivos estáticos + persistência + backups
  public/
    index.html       login
    barbeiro.html    tela do barbeiro
    admin.html       painel do admin
    js/              common.js, barbeiro.js, admin.js
    css/app.css
  test/smoke.js      teste dos fluxos principais
```

## Próximos passos sugeridos

- Migrar para SQLite/Postgres quando o volume crescer (o formato JSON importa direto).
- Backup externo automático (Google Drive/S3/e-mail diário do CSV).
- Fotos do resultado, avaliação do cliente e integração com agenda.
