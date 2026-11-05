# Matemática do Fatiamento Panorâmico (Seamless)

## 1. Princípio Arquitetural
No carrossel contínuo (panorâmico), cada lâmina é um container independente de 1080 x 1350px (proporção 4:5) ou 1080 x 1920px (9:16).
Quando uma imagem fotográfica ultrapassa a fronteira direita de uma lâmina (largura > 1080px ou posição $X + \text{largura} > 1080\text{px}$), ela precisa ser dividida entre duas lâminas consecutivas.

Ambas as metades exibem **o mesmo arquivo de foto e compartilham o mesmo estado no banco/IndexedDB**. Por isso:
- O identificador do slot **DEVE** conter a palavra `seamless` (ex: `t3_foto4_seamless`).
- O sistema de clonagem do catálogo (`applyAddSlides`) e o randomizador (`randomizer.ts`) usam `slotId.includes('seamless')` para vincular os slots e não gerar duplicatas em branco.

---

## 2. Fórmulas de Corte para 2 Lâminas Consecutivas

Considere um elemento fotográfico do SVG com:
- Largura original: $W$
- Altura original: $H$
- Posição horizontal na Lâmina 1: $X$ (onde $X < 1080$ e $X + W > 1080$)
- Posição vertical: $Y$

### A. Lâmina 1 (Onde a foto se inicia)
1. **Largura Visível nesta Lâmina ($W_1$):**
   $$W_1 = 1080 - X$$
2. **Container Externo na Lâmina 1 (posicionamento e corte):**
   - `left`: $\left(\frac{X}{1080}\right) \times 100\%$
   - `top`: $\left(\frac{Y}{1350}\right) \times 100\%$
   - `width`: $\left(\frac{W_1}{1080}\right) \times 100\%$
   - `height`: $\left(\frac{H}{1350}\right) \times 100\%$
   - `overflow: hidden`
3. **Container Interno na Lâmina 1 (restaura a escala total da foto):**
   - `left`: `0`
   - `top`: `0`
   - `height`: `100%`
   - `width`: $\left(\frac{W}{W_1}\right) \times 100\%$

---

### B. Lâmina 2 (Onde a foto continua)
1. **Largura Visível nesta Lâmina ($W_2$):**
   $$W_2 = \min(W - W_1, 1080)$$
2. **Container Externo na Lâmina 2:**
   - `left`: `0` (cola na borda esquerda da Lâmina 2)
   - `top`: $\left(\frac{Y}{1350}\right) \times 100\%$
   - `width`: $\left(\frac{W_2}{1080}\right) \times 100\%$
   - `height`: $\left(\frac{H}{1350}\right) \times 100\%$
   - `overflow: hidden`
3. **Container Interno na Lâmina 2 (recuo negativo compensatório):**
   - `top`: `0`
   - `height`: `100%`
   - `width`: $\left(\frac{W}{W_2}\right) \times 100\%$
   - `left`: $-\left(\frac{W_1}{W_2}\right) \times 100\%$

---

## 3. Exemplo Prático Real (Template 3 - Foto 4)
- Dimensões do SVG: $W = 1370\text{px}$, $H = 920\text{px}$, $X = 791\text{px}$, $Y = 214\text{px}$.
- $W_1 = 1080 - 791 = 289\text{px}$.
- $W_2 = 1370 - 289 = 1081\text{px}$ (ajustado para 1080px da lâmina).

**Código Lâmina 1:**
```tsx
<div
  className="absolute z-20 overflow-hidden"
  style={{
    left: `${(791 / 1080) * 100}%`,
    top: `${(214 / 1350) * 100}%`,
    width: `${(289 / 1080) * 100}%`,
    height: `${(920 / 1350) * 100}%`,
    filter: 'drop-shadow(10px 10px 15px rgba(0,0,0,0.5))'
  }}
>
  <div
    className="absolute top-0 h-full"
    style={{
      left: 0,
      width: `${(1370 / 289) * 100}%`
    }}
  >
    <InteractivePhotoSlot slotId={fotoId} ... />
  </div>
</div>
```

**Código Lâmina 2:**
```tsx
<div
  className="absolute z-20 overflow-hidden"
  style={{
    left: 0,
    top: `${(214 / 1350) * 100}%`,
    width: `${(1080 / 1080) * 100}%`,
    height: `${(920 / 1350) * 100}%`,
    filter: 'drop-shadow(10px 10px 15px rgba(0,0,0,0.5))'
  }}
>
  <div
    className="absolute top-0 h-full"
    style={{
      left: `-${(289 / 1080) * 100}%`,
      width: `${(1370 / 1080) * 100}%`
    }}
  >
    <InteractivePhotoSlot slotId={fotoId} ... />
  </div>
</div>
```

