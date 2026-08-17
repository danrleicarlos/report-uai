# WordPress snippets

Este diretório guarda trechos de PHP para colar no `functions.php` de um
tema WordPress (hello-elementor-child), pedidos via chat. Eles **não** são
executados por este projeto (Next.js) — servem apenas como local para
gerar/versionar o código antes de você copiar para o site.

- `formulario-grupo-vip.php` — shortcode `[formulario_grupo_vip]`, duplicado
  da estrutura dos shortcodes `formulario_exper_academy` / `formulario_xtalks`
  já existentes no seu `functions.php`, com as perguntas do formulário
  "Grupo VIP" (nome, celular, email, instagram do negócio, segmento, função)
  e botão "ENTRA GRUPO VIP".

## Como usar

1. Abra o `formulario-grupo-vip.php`.
2. Copie **apenas o conteúdo da função `shortcode_form_grupo_vip` e a linha
   `add_shortcode(...)`** (sem a tag `<?php` do topo, se o seu `functions.php`
   já estiver aberto em PHP) e cole no final do `functions.php` do tema.
3. No Elementor, use o widget de Shortcode com:

```
[formulario_grupo_vip
  email="contato@danrleicarlos.com.br"
  whatsapp="https://chat.whatsapp.com/ExwcGw8KGw58DgGmhCb6w4?s=cl&p=i&ilr=0&amv=0"
  webhook="https://services.leadconnectorhq.com/hooks/zEJRfnDq6qiKNWcCQty8/webhook-trigger/03c3fa70-bd85-4502-af13-3a511fd13d7a"]
```
