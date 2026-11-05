---
name: svg-carousel-converter
description: >-
  Especialista em converter SVGs de pranchetas (Illustrator, Figma) em lâminas interativas de carrossel, thumbnails SVG minimalistas, templates completos e itens para o catálogo do modo aleatório, aplicando matemática de fatiamento panorâmico seamless, compatibilidade com iOS e auto-aprimoramento contínuo.
---

# SVG Carousel Converter

Use esta skill sempre que o usuário fornecer um SVG, prancheta vetorial ou código de layout para transformar em:
1. Nova lâmina ou template no carrossel interativo.
2. Lâminas avulsas para o catálogo (`catalog.ts`) e o gerador aleatório (`randomizer.ts`).
3. Thumbnail SVG de visualização rápida em `public/templates-thumbs/`.

---

## Fluxo de Execução

### Etapa 1: Extração Automatizada das Coordenadas
Execute o script extrator CLI passando o caminho do arquivo SVG bruto:
```bash
node .agents/skills/svg-carousel-converter/scripts/parse-svg.mjs <caminho-do-arquivo.svg>
```
O script fará a varredura das tags (`<rect>`, `<path>`, etc.), calculará as porcentagens relativas ao padrão 1080x1350 (4:5) ou 1080x1920 (9:16), detectará se há elementos contínuos e imprimirá a estrutura inicial de código.

### Etapa 2: Inspeção Técnica e Aplicação das Regras
Consulte as referências especializadas conforme as características do SVG:
- Se houver fotos panorâmicas que cruzam lâminas: siga rigorosamente [references/seamless-math.md](./references/seamless-math.md).
- Para evitar bugs com sombras e filtros no Safari/iOS, ou processar **canvas com múltiplas pranchetas com espaçamento (gaps do Illustrator) e sufixos `-2`**: siga [references/svg-pitfalls.md](./references/svg-pitfalls.md).
- Para sincronizar o checklist de fotos e a exportação sem falsos alertas: siga [references/slot-sync-rules.md](./references/slot-sync-rules.md).

### Etapa 3: Criação dos Componentes e Assets
1. **Componente React da Lâmina:** Crie o arquivo em `src/lib/carousel/templates/galleryXX/slides/SlideYY.tsx` seguindo o modelo [examples/template-component.tsx](./examples/template-component.tsx).
2. **Thumbnail SVG:** Salve a thumbnail vetorizada em `public/templates-thumbs/TXX_LYY.svg` usando as classes semânticas de [examples/thumbnail-example.svg](./examples/thumbnail-example.svg).
3. **Registro no Catálogo:** Cadastre a lâmina em `src/lib/carousel/templates/catalog.ts` conforme [examples/catalog-entry.ts](./examples/catalog-entry.ts).
4. **Validação de Tipos:** Execute `npx tsc --noEmit` no terminal para garantir integridade TypeScript total.

---

## Etapa 4 (Obrigatória): Loop de Auto-Aprimoramento Contínuo

Ao finalizar a conversão, a IA deve avaliar:
> *Durante o processamento deste SVG, enfrentei alguma variável do ambiente, formato inesperado do Illustrator/Figma ou particularidade de layout que não constava nas instruções desta skill e utilizei inteligência para contornar/solucionar?*

- **Se NÃO (conversão padrão):** Apenas entregue a solução ao usuário normalmente.
- **Se SIM (houve inteligência adaptativa além da skill):**
  1. Conclua a tarefa entregando o código funcional.
  2. Apresente ao final da mensagem a seguinte notificação estruturada:

```markdown
---
### 💡 Auto-Aprimoramento da Skill Detectado

Durante a conversão deste SVG, identifiquei uma situação que não estava catalogada na skill `svg-carousel-converter`:

- **Cenário encontrado:** [Descrição clara da anomalia, tag ou estrutura encontrada no SVG/ambiente]
- **Solução inteligente adotada:** [Explicação técnica da solução aplicada]
- **Impacto preventivo:** [Por que guardar esse conhecimento evita retrabalho ou bugs futuros]

❓ **Deseja que eu atualize a documentação da skill `svg-carousel-converter` com este aprendizado agora?**
```

Se o usuário aprovar com "sim", "ok" ou equivalente, edite imediatamente o arquivo relevante da skill (`references/*.md` ou `SKILL.md`) registrando o novo aprendizado.
