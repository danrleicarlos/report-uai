# Página de vendas — Guia de Repertórios Destrava Nota Mil

Arquivo: `guia-repertorios-valeska-salgado.html`

Página de vendas em HTML/CSS/JS puro (sem dependências externas além de uma fonte do Google Fonts e do player do YouTube), pronta para colar em um ambiente WordPress + Elementor.

## Como instalar no Elementor

1. Na página do Elementor, adicione um widget **HTML** (às vezes chamado de "Código HTML" ou, com o plugin WPCode/Insert Headers and Footers, um bloco de código bruto).
2. Abra `guia-repertorios-valeska-salgado.html`, copie **o conteúdo inteiro** e cole no widget.
3. A primeira linha (`<title>Guia Destrava Nota Mil</title>`) pode ser apagada antes de colar — ela só é usada quando o arquivo é aberto sozinho no navegador. Se deixar, não quebra nada, o navegador simplesmente ignora.
4. Salve e publique. A página já é responsiva (funciona em celular, tablet e desktop) e não depende de nenhum plugin além do próprio Elementor.

Alternativa: se preferir uma página fora do Elementor, o arquivo também pode ser hospedado como uma página HTML avulsa (por exemplo, via um tema em branco ou um plugin de "raw HTML page").

## Antes de publicar, troque 2 coisas

### 1. O vídeo da Hero
O vídeo já está configurado com o ID `b7kAvkNlzxQ` (de `https://youtu.be/b7kAvkNlzxQ`). A prévia mostra a miniatura do próprio YouTube com um botão de play; o vídeo só carrega de verdade quando alguém clica (isso deixa a página mais rápida). Se um dia precisar trocar o vídeo, procure por `id="heroVideo"` e troque o valor de `data-video-id` pelo novo ID (o trecho depois de `youtu.be/` ou de `v=` na URL do YouTube).

As fotos 2 e 3 já estão preenchidas com as imagens reais hospedadas em `valeskasalgado.com.br`. A foto do retrato (banquinho, blazer branco) não é usada na Hero, o espaço dela agora é o vídeo.

### 2. Os dois links de checkout da Hotmart
A seção de oferta agora mostra **dois planos lado a lado**, e cada um precisa do seu próprio link de checkout (configure as duas ofertas separadamente dentro do produto na Hotmart). Procure no arquivo por `SUBSTITUIR o href`:

- `<!-- SUBSTITUIR o href acima pelo link de checkout da Hotmart (Oferta 1: Guia) -->` → botão "Quero só o guia".
- `<!-- SUBSTITUIR o href acima pelo link de checkout da Hotmart (Oferta 2: Guia + Mentoria) -->` → botão "Quero o completo".

Os dois botões estão com `href="#"` até você trocar.

### 3. Confira os preços
Estão configurados assim:

| Plano | De | Por | Inclui |
|---|---|---|---|
| Guia de Repertórios | R$ 147,00 | R$ 87,00 à vista | Guia digital completo |
| Guia + Mentoria Ao Vivo | R$ 497,00 | R$ 147,00 à vista | Guia completo + grupo exclusivo no WhatsApp + aulas ao vivo |

O card do plano completo já traz a chamada "Por R$ 60,00 a mais que o guia sozinho" — essa é a diferença entre R$ 147,00 e R$ 87,00, calculada automaticamente pela lógica da oferta, mas escrita direto no texto (não é dinâmica). Se os valores mudarem, atualize esse número também.

## Sobre o conteúdo

Todo o restante do texto foi construído a partir do conteúdo real do Guia de Repertórios Destrava Nota Mil e da biografia da Valeska Salgado (sem promessas infladas, só o que está documentado no material e nos resultados já registrados).

## Nota sobre o preview

Ao visualizar este arquivo pelo link de Artifact da Claude, a miniatura do vídeo do YouTube aparece em branco: o ambiente de preview da Claude bloqueia imagens de sites externos por segurança. Isso não acontece no site publicado de verdade — no WordPress, a miniatura e o player do YouTube funcionam normalmente.
