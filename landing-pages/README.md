# Página de vendas — Guia de Repertórios Destrava Nota Mil

Arquivo: `guia-repertorios-valeska-salgado.html`

Página de vendas em HTML/CSS puro (sem JavaScript, sem dependências externas além de uma fonte do Google Fonts), pronta para colar em um ambiente WordPress + Elementor.

## Como instalar no Elementor

1. Na página do Elementor, adicione um widget **HTML** (às vezes chamado de "Código HTML" ou, com o plugin WPCode/Insert Headers and Footers, um bloco de código bruto).
2. Abra `guia-repertorios-valeska-salgado.html`, copie **o conteúdo inteiro** e cole no widget.
3. A primeira linha (`<title>Guia Destrava Nota Mil</title>`) pode ser apagada antes de colar — ela só é usada quando o arquivo é aberto sozinho no navegador. Se deixar, não quebra nada, o navegador simplesmente ignora.
4. Salve e publique. A página já é responsiva (funciona em celular, tablet e desktop) e não depende de nenhum plugin além do próprio Elementor.

Alternativa: se preferir uma página fora do Elementor, o arquivo também pode ser hospedado como uma página HTML avulsa (por exemplo, via um tema em branco ou um plugin de "raw HTML page").

## Antes de publicar, troque 2 coisas

### 1. As três fotos
O arquivo vem com três marcadores visuais de foto (fundo azul-marinho com "FOTO 1 / 2 / 3"), para você enxergar exatamente onde cada uma entra. Procure no arquivo por `SUBSTITUIR` — cada uma tem um comentário dizendo qual foto usar:

- **Foto 1** (topo da página, ao lado do título): o retrato da Valeska sentada no banquinho, blazer branco, quadro ao fundo.
- **Foto 2** (seção "Quem ensina"): a foto dela dando aula, com a sala cheia de alunos.
- **Foto 3** (seção "Este guia foi escrito para você, se"): a foto com os três alunos segurando o tablet com o guia.

Para trocar: suba cada imagem na Biblioteca de Mídia do WordPress, copie a URL gerada e substitua o valor de `src="data:image/svg+xml..."` pela URL da foto (ex.: `src="https://seusite.com.br/wp-content/uploads/foto1.jpg"`). Se estiver usando o widget HTML do Elementor, é mais simples fazer essa troca antes de colar o código.

### 2. O link de checkout da Hotmart
Procure por `<!-- SUBSTITUIR o href acima pelo link de checkout da Hotmart -->` (dentro da seção da oferta, perto do preço). O botão logo acima está com `href="#"` — troque pelo link real do checkout do produto na Hotmart.

## Sobre o conteúdo

O preço exibido é **De R$ 147,00 por R$ 87,00 à vista**, conforme combinado. Todo o restante do texto foi construído a partir do conteúdo real do Guia de Repertórios Destrava Nota Mil e da biografia da Valeska Salgado (sem promessas infladas — só o que está documentado no material e nos resultados já registrados).
