# Landing Page — Dona Chica Cat Care

HTML completo e responsivo da landing page, gerado a partir do arquivo Figma
**"Amifec"** (frame `LP V2`, node `438:516`):
https://www.figma.com/design/QSUztWFWVy5csLau5X7xOd/Amifec?node-id=438-2

Arquivo: [`landing-page-dona-chica.html`](./landing-page-dona-chica.html)

## Como colar no Elementor Pro

1. Na página desejada, adicione um widget **HTML** (Código HTML).
2. Abra `landing-page-dona-chica.html`, copie **todo o conteúdo** do arquivo
   e cole dentro do widget.
3. Salve/atualize e visualize — a página é um bloco único e autocontido
   (CSS e JS embutidos, escopados na classe `.dc-lp`), então não deve
   conflitar com o tema do WordPress. Ela já é responsiva: menu mobile com
   "hambúrguer", grids que empilham em telas pequenas, tipografia fluida.

Se preferir, o mesmo widget pode ir dentro de uma seção "Full Width" do
Elementor para a página ocupar 100% da largura, já que o HTML define seu
próprio `max-width` interno por seção.

## ⚠️ Imagens — ação obrigatória antes de publicar

Não foi possível baixar os arquivos binários das imagens nesta sessão
(a rede deste ambiente bloqueia acesso direto a `figma.com`), então o HTML
aponta hoje para o CDN temporário do Figma
(`https://www.figma.com/api/mcp/asset/...`). **Esses links expiram em poucos
dias.** Antes de publicar definitivamente:

1. Abra cada link abaixo no navegador e salve a imagem.
2. Suba os arquivos na **Biblioteca de Mídia** do WordPress.
3. No HTML, troque o `src="https://www.figma.com/api/mcp/asset/..."`
   correspondente pela URL definitiva do WordPress.

| Seção | Descrição | Link temporário (Figma) |
|---|---|---|
| Header/Hero | Ícone do botão CTA (mãozinha) | `22559cdd-499a-4576-8cd4-d3e2028df787.svg` |
| Hero | Foto principal (gato + areia) | `a94667a1-33ab-4020-9b1f-a2ea44ea137a.png` |
| Hero | Ilustração coroa amarela | `55ff68b1-bfcb-4cad-bcf4-5923fd0b0445.png` |
| Benefícios | Foto do comparativo | `be946fef-1c94-46a9-a7a9-cc10a5f048ae.png` |
| Benefícios | Ícone "Feita de mandioca e milho" | `a02240cc-d80e-402e-8165-03b1effbfcfa.svg` |
| Benefícios | Ícone "detecta alterações na urina" | `5fb1407c-2ca5-4af8-bd2e-66bc4ddfd30e.svg` |
| Benefícios | Ícone "absorção instantânea" | `6c4fcf7e-4ed7-4242-8945-b956c2d63f8c.svg` |
| Benefícios | Ícone "baixo rastreamento" | `02228438-55be-401e-adef-c0243fa900bb.svg` |
| Benefícios | Ícone "torrões firmes" | `d3dabd76-1e55-49aa-b774-b174dfd17d00.svg` |
| Benefícios | Foto lifestyle 1 | `ad0a9123-e6f2-4c48-a3f7-01210241d045.png` |
| Benefícios | Foto lifestyle 2 | `4a4cbd45-0047-4f6f-adc6-c044a9dd3585.png` |
| Grãos | Mockup "Grãos Finos" | `7b250cc1-56ec-49b9-b6af-20efcc903f72.png` |
| Grãos | Mockup "Grãos Grossos" | `8479f8de-ca65-46f1-8c5f-382a1d7b8416.png` |
| Trust bar | Ícone cadeado (compra segura) | `ef446ce5-a86b-48c5-8a72-1a3fde5f2d4a.svg` |
| Trust bar | Ícone cartão (parcelamento) | `e0364918-bb36-4458-8a26-60102c5fe853.svg` |
| Quiz | Imagem decorativa 1 | `622bc4e7-987d-4c85-8d5b-a8a53fde87d3.png` |
| Quiz | Imagem decorativa 2 (não usada no HTML final, opcional) | `7e9748eb-8220-4226-a047-7fe64b558b22.png` |
| Quem Somos | Foto da equipe/produção | `c99cc02f-1b82-4290-a689-7f4961bf316d.png` |
| Diferenciais | Ícone "Produção própria" | `091524cb-2868-4ce1-927f-e6578abcf4d1.svg` |
| Diferenciais | Ícone "Ingredientes Naturais" (2 camadas) | `3ef90188-3c12-4bf9-b7c6-4dc56048d8c8.svg` + `39ba3e54-c56f-4f1f-9622-1ce2b2265bc2.svg` |
| Diferenciais | Ícone "Logística própria" | `e54b8dc6-013a-4a43-b352-b5b34820ce49.svg` |
| Diferenciais | Ícone "Responsabilidade ambiental" | `97e50957-b8a2-457f-b2af-9e49add9c7cd.svg` |
| Diferenciais | Ícone "Produto Brasileiro" (mapa) | `b0cf02b5-1abf-40ca-be67-ba9e035c1f4b.svg` |
| CTA final | Foto grande circular | `7a6d6fa5-61ce-49f9-8984-6fb0fbf2cc74.png` |
| CTA final | Ilustração coroa (vetor) | `4c44ab58-6538-4d7b-9575-816911c8d694.svg` |

Os demais ícones (checkmarks do comparativo, aspas dos depoimentos, redes
sociais, telefone, e-mail, WhatsApp) foram recriados como **SVG inline** no
próprio HTML — não dependem de nenhum link externo e não vão quebrar.

## Textos e links que valem revisão

- **CTA "Quero experimentar"**: por padrão aponta para o WhatsApp
  `+55 (44) 99975-1717` (número extraído do rodapé do design). Troque pelo
  link real de compra/checkout se preferir, ou confirme se esse é o canal
  correto de vendas.
- **Formulário "Quero revender Dona Chica"**: hoje só abre o WhatsApp com um
  resumo dos dados preenchidos (não envia para nenhum servidor). Se quiser
  usar Elementor Forms, RD Station ou outra automação, troque esse
  comportamento pelo widget/integração da sua preferência.
- **Quiz "Nós te ajudamos"**: é uma demonstração visual/estática — ao clicar
  em "Descobrir a areia ideal" ele apenas revela o card de recomendação que
  já existia no design. Não há lógica real de recomendação nem envio de
  dados. Pode ser conectado a uma automação depois, se fizer sentido.

## Fontes

O HTML já carrega **Barlow**, **Chewy** e **Inter** via `@import` do Google
Fonts dentro do `<style>`. Se o site já carrega essas fontes por outro meio
(plugin de fontes, tema etc.), pode remover essa linha para evitar
carregamento duplicado.

## O que foi simplificado em relação ao Figma

O arquivo Figma usa posicionamento absoluto em pixels (tela fixa de
1920px) — isso não é responsivo por natureza. O HTML entregue **recria a
mesma hierarquia visual, copy, cores e fontes** usando Flexbox/CSS Grid,
para que a página se adapte de verdade a celular, tablet e desktop.
