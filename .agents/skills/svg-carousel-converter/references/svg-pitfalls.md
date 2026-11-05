# Armadilhas Técnicas de SVG (WebKit / iOS / Illustrator)

Ao converter layouts vetoriais para HTML/CSS e renderização com `html-to-image` (utilizado no motor de exportação do carrossel), você deve evitar estas armadilhas comuns:

---

## 1. Armadilha de Sombras (`drop-shadow` vs `box-shadow`)
- **Problema do `box-shadow`:** Em containers que possuem `overflow: hidden`, o CSS `box-shadow` é cortado pelas bordas da caixa.
- **Problema de `<filter id="...">` do SVG:** Se o SVG contiver `<filter id="shadow">` e várias lâminas forem montadas no DOM (ou clonadas durante a exportação), múltiplos nós disputam o mesmo ID `#shadow`, provocando telas pretas, piscamento ou perda de renderização no Safari/WebKit.
- **Solução Correta:**
  Aplicar o filtro CSS nativo `filter: drop-shadow(dx dy blur color)` no container externo wrapper.
  O wrapper externo projeta a sombra fielmente para fora, enquanto o container interno faz o `overflow-hidden` do recorte da foto:
  ```tsx
  {/* Wrapper externo com a sombra projetada */}
  <div style={{ filter: 'drop-shadow(10px 10px 15px rgba(0,0,0,0.5))' }}>
    {/* Container interno com o recorte */}
    <div className="w-full h-full overflow-hidden">
      <InteractivePhotoSlot ... />
    </div>
  </div>
  ```

---

## 2. IDs Colidentes em `<clipPath>` e `<defs>`
- O Illustrator exporta com frequência nós chamados `<clipPath id="clip_1">` ou `<style> .cls-1 { fill: #fff; } </style>`.
- Ao renderizar várias lâminas na mesma página, a `.cls-1` de um SVG sobrescreve a do outro.
- **Solução para Thumbnails:** Sempre atribuir prefixos únicos nos IDs de clipPath e classes por lâmina (ex: `clip-t03-l01`, `cls-t3-dark`).

---

## 3. Matrizes de Transformação (`matrix(...)`)
- Vetores exportados pelo Figma ou Illustrator costumam agrupar nós em matrizes:
  `<g transform="matrix(1 0 0 1 250 180)">`
- **Solução:**
  Não preserve a tag `<g transform="...">`.
  Extraia a translação: $X = 250$, $Y = 180$.
  Se houver rotação (ex: Polaroid inclinada): extraia o ângulo em graus através de:
  $$\theta = \text{atan2}(b, a) \times \left(\frac{180}{\pi}\right)$$
  E aplique no CSS limpo do React: `className="-rotate-3"` ou `style={{ transform: 'rotate(-4deg)' }}`.

---

## 4. Remoção de Metadados Proprietários
Descarte sempre do SVG:
- Namespaces XML do Adobe: `xmlns:i="http://ns.adobe.com/..."`, `xmlns:graph="..."`
- Tags de metadados: `<metadata>`, `<i:pgf>`, `<adobe-illustrator:rasterize>`
- Comentários de gerador: `<!-- Generator: Adobe Illustrator 28.0.0 ... -->`
Manter apenas `<svg>`, `<defs>`, `<rect>`, `<path>`, `<polygon>` limpos.

---

## 5. Proibição de Assets Fantasma (URLs 404)
- **Nunca** use caminhos de imagem fictícios no código (ex: `imageUrl || '/images/placeholder.jpg'`).
- No iPhone Safari, se a biblioteca de exportação (`toPng`) tentar carregar uma imagem estática que retorne 404, toda a exportação é abortada com erro fatal de rede.
- Use `defaultPlaceholder=""` — o componente `InteractivePhotoSlot` renderiza internamente uma caixa neutra elegante com ícone central sem efetuar requisições HTTP.

---

## 6. Canvas de Múltiplas Pranchetas com Espaçamento (Gaps Inter-Artboard e Sufixos `-2`)
- **Problema do Canvas Aberto:** Ao exportar um conjunto completo de pranchetas do Illustrator ou Figma em um único SVG, o canvas engloba todas as lâminas e seus respiros de visualização (ex: `viewBox="0 0 11485.93 1350"` para 10 pranchetas de 1080px). Os espaços entre as pranchetas variam livremente (gaps de 30px até 200px+).
  - Um cálculo ingênuo baseado em `X % 1080` ou assumindo que a largura é múltipla de 1080px (`vbWidth % 1080 === 0`) corrompe o posicionamento horizontal `left` a partir da 2ª lâmina.
- **Problema de IDs Duplicados (`-2`):** Quando o designer duplica pranchetas ou blocos espelhados no Illustrator (ex: L02 espelhada na L10), o Illustrator anexa `-2` no `id` (ex: `id="foto_05-2"` com `data-name="foto_05"`).
- **Solução Padronizada:**
  1. **Detecção de Clusters de Prancheta:** Ordenar os retângulos pelo eixo horizontal $X$ e agrupar elementos cuja distância esteja contida no span de 1080px da prancheta atual.
  2. **Cálculo da Origem Local ($X_{\text{origem}}$):**
     $$X_{\text{rel}} = X - X_{\text{origem}}$$
     $$\text{left} = \left(\frac{X_{\text{rel}}}{1080}\right) \times 100\%$$
     $$\text{width} = \left(\frac{W}{1080}\right) \times 100\%$$
  3. **Normalização de Slots:** Tratar IDs duplicados mapeando nomes locais únicos (`tX_sY_fN`) preservando o `data-name` como rótulo descritivo nos metadados.


