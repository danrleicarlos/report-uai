# Quiz de Pré-consultoria · Preenchimento/Alongamento (Renata Pacheco Beauty House)

Arquivo único: `index.html` (HTML + CSS + JS, logo embutida, fonte Jost via Google Fonts).

## Etapas
1. Você: como gostaria de ser chamada, WhatsApp, e-mail, como nos conheceu (+ quem indicou)
2. Seus fios: comprimento atual e textura (cards com imagem), alergia/sensibilidade
3. O sonho: comprimento e volume desejados (cards com imagem)
4. Experiência: recepção preferida e música
5. Fotos: cabelo atual, cabelo dos sonhos, foto favorita + consentimento LGPD

## Compatibilidade com rastreamento de formulário externo
- Um único `<form>` nativo no DOM; todos os campos com `name`, nenhum `disabled`.
- Contato: `name`, `email` (`type="email"`) e `phone` (`type="tel"`).
- Envio pelo evento `submit` nativo (`<button type="submit">`), disparado uma única vez, já validado.
- Campos ocultos: `perfil_alongamento`, `resumo_consultoria` (briefing completo), `foto_*_url`, `utm_*`.

## Configuração (topo do `<script>`)
- `IMAGES`: cole a URL de cada imagem dos cards (3:4, ex. 900×1200). Vazio = placeholder descritivo.
- `CONFIG.whatsapp`: número da Renata.
- Upload das fotos (o rastreamento nativo não transporta arquivos, só os links):
  - Cloudinary: `cloudinaryCloudName` + `cloudinaryUploadPreset` (preset "unsigned"), ou
  - `uploadEndpoint`: recebe multipart `file` e responde `{ "url": "..." }`.
  - Sem upload configurado, a tela final mostra botão para enviar as fotos pelo WhatsApp.
- `CONFIG.webhookUrl` (opcional): cópia das respostas em JSON.

## Pré-preenchimento por URL
`?nome=...&email=...&telefone=...&utm_source=whatsapp`
