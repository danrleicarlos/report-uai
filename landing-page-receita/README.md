# Landing Page — Método 5R (Sistema de Recuperação de Receita)

Landing page em HTML/CSS/JS puro (`index.html`, arquivo único, sem dependências além do Google Fonts), pronta para ser usada como referência ou importada seção a seção no **Elementor Pro**.

## Antes de publicar

Substitua os seguintes placeholders no arquivo:

| Placeholder | Onde aparece | Substituir por |
|---|---|---|
| `[SEU-WHATSAPP]` | Botões de CTA, links `wa.me`, rodapé | Número no formato `5599999999999` |
| `[SEU-EMAIL]` | Rodapé | E-mail de contato comercial |
| `[SUA-EMPRESA]` | Rodapé | Nome da empresa/agência responsável pela operação |
| `[SEU-DOMINIO]` | Tags `og:url` / `canonical` no `<head>` | Domínio final da página |

## Como usar no Elementor Pro

1. **Página inteira**: crie uma página com template "Elementor Canvas" (sem header/footer do tema) e cole o conteúdo do `<body>` em um único widget **HTML**. Os estilos já estão em um `<style>` no `<head>` — se for colar só o `<body>`, mova o bloco `<style>...</style>` junto para dentro do widget, ou para **Site Settings → Custom CSS**.
2. **Seção a seção**: cada bloco do arquivo está demarcado com comentários `<!-- SEÇÃO: ... -->`. Copie um bloco por vez para um widget **HTML** dentro de um Container/Section do Elementor, respeitando a ordem: Header → Hero → Problema → Reposicionamento → Promessa → Método 5R → Diferencial → Público ideal → KPIs → Planos → Implantação → Simulador → FAQ → CTA final → Footer.
3. **Fontes**: os `<link>` do Google Fonts já carregam Space Grotesk, Playfair Display, JetBrains Mono e Inter. Alternativa: recriar essas 4 fontes em **Site Settings → Global Fonts** e remover o `<link>`.
4. **Cores**: todas as cores usadas estão como variáveis CSS em `:root` (início do `<style>`) — útil para replicar 1:1 no **Design System** do Elementor (Global Colors).
5. **Formulário/CTA**: os botões de conversão usam links `wa.me` (WhatsApp). Se preferir captar lead por formulário, troque esses links por um widget **Elementor Forms** apontando para o seu CRM/webhook.

## Estrutura de conteúdo

A página segue o posicionamento definido na apresentação de novo modelo de negócio: vende-se o **resultado** (receita recuperada), não a tecnologia por trás (CRM, automação, IA, WhatsApp API aparecem apenas como "inclusos", nunca como o carro-chefe da oferta).

Seções: Hero → O problema → Reposicionamento → Promessa → Método 5R → Diferencial → Público ideal → Painel/KPIs → Planos (Inicial, Pro ⭐, Total, Enterprise) → Implantação → Simulador de investimento → FAQ → CTA final → Footer.

Preços e premissas de custo (WhatsApp R$0,40/contato, IA R$0,066/execução, taxa de resposta 20%) refletem exatamente os valores fornecidos na tabela de planos.
