import fs from 'fs';
import path from 'path';

/**
 * Utilitário CLI nativo Node.js para analisar arquivos SVG do Illustrator/Figma
 * e convertê-los em porcentagens exatas para lâminas interativas do carrossel.
 *
 * Suporta:
 * - Lâminas individuais (1080x1350 ou 1080x1920)
 * - Pranchetas panorâmicas contínuas (ex: 5400x1350)
 * - Canvas multi-prancheta com espaçamento/gaps inter-artboards (ex: 11485.93x1350 com 10 lâminas)
 *
 * Uso: node .agents/skills/svg-carousel-converter/scripts/parse-svg.mjs <arquivo.svg>
 */
function parseSvgFile(filePath) {
  const resolvedPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Erro: Arquivo não encontrado em "${resolvedPath}"`);
    process.exit(1);
  }

  const svgContent = fs.readFileSync(resolvedPath, 'utf-8');

  // 1. Extração do viewBox ou dimensões da prancheta
  const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/i);
  let vbWidth = 1080;
  let vbHeight = 1350;

  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4) {
      vbWidth = parts[2];
      vbHeight = parts[3];
    }
  }

  console.log(`\n======================================================`);
  console.log(`📐 SVG CAROUSEL ANALYZER`);
  console.log(`📁 Arquivo: ${path.basename(resolvedPath)}`);
  console.log(`📏 Dimensões detectadas: ${vbWidth} x ${vbHeight} (Proporção: ${(vbWidth / vbHeight).toFixed(2)})`);
  console.log(`======================================================\n`);

  // 2. Extração de elementos <rect>
  const rectRegex = /<rect\b([^>]*)\/?>/gi;
  const rects = [];
  let match;
  let counter = 1;

  while ((match = rectRegex.exec(svgContent)) !== null) {
    const attrs = match[1];

    const getAttr = (name) => {
      const m = attrs.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
      return m ? m[1] : '';
    };

    const rawId = getAttr('id');
    const dataName = getAttr('data-name');
    const id = rawId || dataName || `slot_${counter++}`;
    const x = parseFloat(getAttr('x')) || 0;
    const y = parseFloat(getAttr('y')) || 0;
    const width = parseFloat(getAttr('width')) || 0;
    const height = parseFloat(getAttr('height')) || 0;
    const fill = getAttr('fill');

    // Ignora retângulos invisíveis ou menores que 20px
    if (width > 20 && height > 20) {
      rects.push({ id, rawId, dataName, x, y, width, height, fill });
    }
  }

  // 3. Detecção de clusters de prancheta (Artboard Clustering)
  // Se vbWidth > 1080, verifica se há múltiplos artboards separados por gaps
  const sortedRects = [...rects].sort((a, b) => a.x - b.x);
  const clusters = [];

  if (sortedRects.length > 0) {
    let currentAb = {
      startX: sortedRects[0].x,
      endX: sortedRects[0].x + sortedRects[0].width,
      rects: [sortedRects[0]]
    };

    for (let i = 1; i < sortedRects.length; i++) {
      const r = sortedRects[i];
      // Se o elemento inicia a menos de 1070px do início da prancheta atual, pertence ao mesmo cluster
      if (r.x < currentAb.startX + 1070) {
        currentAb.rects.push(r);
        currentAb.endX = Math.max(currentAb.endX, r.x + r.width);
      } else {
        clusters.push(currentAb);
        currentAb = { startX: r.x, endX: r.x + r.width, rects: [r] };
      }
    }
    clusters.push(currentAb);
  }

  const isMultiArtboardCanvas = clusters.length > 1;

  if (isMultiArtboardCanvas) {
    console.log(`🌐 Múltiplas Pranchetas com Espaçamento Detectadas:`);
    console.log(`   - Total de pranchetas identificadas: ${clusters.length} lâminas\n`);

    clusters.forEach((cluster, abIdx) => {
      const slideNum = abIdx + 1;
      const abOriginX = cluster.startX;
      console.log(`------------------------------------------------------`);
      console.log(`🖼️  LÂMINA #${slideNum} (Origem X: ${abOriginX.toFixed(2)}px | Slots: ${cluster.rects.length})`);
      console.log(`------------------------------------------------------`);

      cluster.rects.forEach((r, idx) => {
        const relX = Number((r.x - abOriginX).toFixed(2));
        const relY = r.y;
        const leftPct = ((relX / 1080) * 100).toFixed(3);
        const topPct = ((relY / 1350) * 100).toFixed(3);
        const widthPct = ((r.width / 1080) * 100).toFixed(3);
        const heightPct = ((r.height / 1350) * 100).toFixed(3);

        const dupSuffix = r.rawId && r.rawId.includes('-') ? ` [duplicata: ${r.rawId}]` : '';
        console.log(`  [Slot #${idx + 1}] ID: "${r.id}"${dupSuffix}`);
        console.log(`    - Local: X=${relX}px, Y=${relY}px | Tam: ${r.width}px x ${r.height}px`);
        console.log(`    - CSS: left: ${leftPct}%, top: ${topPct}%, width: ${widthPct}%, height: ${heightPct}%\n`);
      });
    });
  } else {
    // Modo Prancheta Única ou Panorama Contínuo
    console.log(`🔍 Foram identificados ${rects.length} retângulos/slots de fotos:\n`);

    rects.forEach((r, idx) => {
      console.log(`[Slot #${idx + 1}] ID: "${r.id}"`);
      console.log(`  - Coordenadas: X=${r.x}px, Y=${r.y}px | Tamanho: ${r.width}px x ${r.height}px`);

      const leftPct = ((r.x / 1080) * 100).toFixed(4);
      const topPct = ((r.y / 1350) * 100).toFixed(4);
      const widthPct = ((r.width / 1080) * 100).toFixed(4);
      const heightPct = ((r.height / 1350) * 100).toFixed(4);

      console.log(`  - Em porcentagem (4:5): left: ${leftPct}%, top: ${topPct}%, width: ${widthPct}%, height: ${heightPct}%`);

      const isSeamless = (r.x + r.width > 1080) || r.id.toLowerCase().includes('seamless');
      if (isSeamless) {
        const w1 = 1080 - r.x;
        const w2 = Math.min(r.width - w1, 1080);
        console.log(`  ⚡ Elemento Panorâmico Seamless!`);
        console.log(`     Lâmina 1: largura visível ${w1}px (container width: ${((w1 / 1080) * 100).toFixed(2)}%, zoom interno: ${((r.width / w1) * 100).toFixed(2)}%)`);
        console.log(`     Lâmina 2: largura visível ${w2}px (container width: ${((w2 / 1080) * 100).toFixed(2)}%, recuo interno: -${((w1 / w2) * 100).toFixed(2)}%)`);
      }
      console.log('');
    });
  }

  console.log(`======================================================\n`);
}

// Execução a partir de argumentos CLI
const targetFile = process.argv[2];
if (!targetFile) {
  console.log('Uso: node .agents/skills/svg-carousel-converter/scripts/parse-svg.mjs <caminho-do-arquivo.svg>');
  process.exit(0);
}

parseSvgFile(targetFile);
