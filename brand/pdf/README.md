# Brandbook em PDF

`Brandbook-Danrlei-Carlos.pdf`: apresentação do brandbook com 18 slides de 1920×1080.

O código-fonte está em `deck.js` (slides montados com os componentes `window.DC` de `../danrlei-carlos-design-system/components/bundle.js`) e `deck.css` (estilos das seções). Para gerar o PDF de novo, monte um HTML com os tokens, `bundle.css`, `deck.css`, React 18, `bundle.js` e `deck.js`, e imprima com o Chromium em 1920×1080 com fundo ativado.
