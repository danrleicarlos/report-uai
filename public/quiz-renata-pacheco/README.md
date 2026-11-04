# Quiz de Pré-consultoria · Alongamento Adesivado (Renata Pacheco Beauty House)

Arquivo único: `index.html` (HTML + CSS + JS, logo embutida, fonte Jost via Google Fonts).

## Compatibilidade com rastreamento de formulário externo
- Um único `<form>` nativo renderizado direto no DOM.
- Todos os campos têm `name` e nenhum fica `disabled`.
- Contato: `name`, `email` (`type="email"`) e `phone` (`type="tel"`).
- Envio pelo evento `submit` nativo, via `<button type="submit">`.
- Seleções múltiplas são gravadas em campos ocultos com `name` (`quimicas`, `atencao_couro_cabeludo`, `como_usa_cabelo`, `rotina_atividades`).
- Campos ocultos gerados automaticamente: `perfil_alongamento`, `pontuacao_quiz`, `resumo_consultoria` (briefing completo em texto para a Renata) e `utm_*`.

## Configuração (no topo do `<script>`)
- `CONFIG.whatsapp`: número da Renata para o botão "Enviar fotos de referência".
- `CONFIG.webhookUrl` (opcional): também envia uma cópia em JSON (n8n, Make, Google Sheets).

## Pré-preenchimento por URL
`?nome=...&email=...&telefone=...&data=AAAA-MM-DD&utm_source=whatsapp`
