import { AspectRatio, ASPECT_RATIOS } from './types';
import { addCarouselLog } from './logger';

export interface ExportProgressCallback {
  (current: number, total: number, slideNumber: number): void;
}

// SVG neutro inline para fallback de imagens com erro ou 404
export const DEFAULT_FALLBACK_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" fill="#1e293b"><rect width="100%" height="100%" fill="#1e293b"/><text x="50%" y="50%" fill="#94a3b8" font-size="36" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">Imagem</text></svg>'
  );

export function dataUrlToBlob(dataUrl: string): Blob {
  try {
    const parts = dataUrl.split(';base64,');
    if (parts.length < 2) {
      return new Blob([], { type: 'image/png' });
    }
    const contentType = parts[0].split(':')[1] || 'image/png';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  } catch (err) {
    console.error('Falha ao converter dataUrl em Blob:', err);
    return new Blob([], { type: 'image/png' });
  }
}

export function triggerDownload(dataUrl: string, filename: string, existingBlob?: Blob): string {
  const blob = existingBlob && existingBlob.size > 0 ? existingBlob : dataUrlToBlob(dataUrl);
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = blobUrl;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  addCarouselLog('info', `Download manual acionado pelo usuário: ${filename}`, {
    blobSizeKb: Math.round(blob.size / 1024)
  });
  // Mantém a URL ativa por 60 segundos para garantir tempo suficiente para confirmação de download no Safari/iOS
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  return blobUrl;
}

/**
 * Decodifica uma imagem (dataURL ou URL relativa/remota) diretamente em HTMLImageElement
 * sem passar por <svg><foreignObject>, evitando o bug de exportação em branco no iOS WebKit.
 */
async function loadDecodedImage(
  src: string,
  domImg?: HTMLImageElement,
  cache?: Map<string, HTMLImageElement>
): Promise<HTMLImageElement | null> {
  if (!src) return null;
  if (cache?.has(src)) {
    return cache.get(src)!;
  }

  const loaded = await new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    let settled = false;
    const finish = (result: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    const timer = setTimeout(() => {
      if (img.complete && img.naturalWidth > 0) {
        finish(img);
      } else if (domImg && domImg.complete && domImg.naturalWidth > 0) {
        finish(domImg);
      } else {
        finish(null);
      }
    }, 8000);

    img.onload = async () => {
      try {
        if (typeof img.decode === 'function') {
          await img.decode();
        }
      } catch {
        // Prossegue caso decode() emita aviso após onload válido no Safari
      }
      finish(img.naturalWidth > 0 ? img : null);
    };

    img.onerror = () => {
      if (domImg && domImg.complete && domImg.naturalWidth > 0) {
        finish(domImg);
      } else {
        finish(null);
      }
    };

    img.src = src;
  });

  if (loaded && cache) {
    cache.set(src, loaded);
  }
  return loaded;
}

function hasVisibleBackground(bgColor: string | null | undefined): boolean {
  if (!bgColor) return false;
  const trimmed = bgColor.trim().toLowerCase();
  return (
    trimmed !== '' &&
    trimmed !== 'transparent' &&
    trimmed !== 'rgba(0, 0, 0, 0)' &&
    trimmed !== 'rgba(0,0,0,0)'
  );
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  if (radius <= 0.1) {
    ctx.rect(x, y, w, h);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

interface ParsedShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

function extractNodeShadow(
  node: HTMLElement,
  computed: CSSStyleDeclaration,
  isRoot: boolean
): ParsedShadow | null {
  if (isRoot) return null;

  const filterRaw = `${node.style.filter || ''} ${computed.filter || ''}`;
  if (filterRaw.includes('drop-shadow')) {
    const dsMatch = filterRaw.match(/drop-shadow\((.+)\)/i);
    if (dsMatch) {
      const inner = dsMatch[1];
      const colorMatch = inner.match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/);
      const color = colorMatch ? colorMatch[0] : 'rgba(0, 0, 0, 0.45)';
      const withoutColor = colorMatch ? inner.replace(colorMatch[0], '') : inner;
      const nums = withoutColor.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
      return {
        offsetX: nums[0] ?? 0,
        offsetY: nums[1] ?? 10,
        blur: nums[2] ?? 15,
        color
      };
    }
  }

  if (typeof node.className === 'string' && node.className.includes('shadow-2xl')) {
    return {
      offsetX: 0,
      offsetY: 25,
      blur: 50,
      color: 'rgba(0, 0, 0, 0.25)'
    };
  }

  return null;
}

function getSortedChildren(parent: HTMLElement): HTMLElement[] {
  const children = Array.from(parent.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement
  );
  return children
    .map((child, index) => {
      const zStr = window.getComputedStyle(child).zIndex;
      const z = zStr && zStr !== 'auto' ? parseInt(zStr, 10) || 0 : 0;
      return { child, z, index };
    })
    .sort((a, b) => (a.z !== b.z ? a.z - b.z : a.index - b.index))
    .map((item) => item.child);
}

function extractImageSlotParams(imgEl: HTMLImageElement): {
  zoom: number;
  posX: number;
  posY: number;
} {
  const attrZoom = parseFloat(imgEl.getAttribute('data-slot-zoom') || '');
  const attrX = parseFloat(imgEl.getAttribute('data-slot-x') || '');
  const attrY = parseFloat(imgEl.getAttribute('data-slot-y') || '');

  let zoom = Number.isFinite(attrZoom) ? attrZoom : 100;
  let posX = Number.isFinite(attrX) ? attrX : 50;
  let posY = Number.isFinite(attrY) ? attrY : 50;

  if (!Number.isFinite(attrZoom) && imgEl.style.transform) {
    const scaleMatch = imgEl.style.transform.match(/scale\(([\d.]+)\)/);
    if (scaleMatch) {
      zoom = parseFloat(scaleMatch[1]) * 100;
    }
  }

  if ((!Number.isFinite(attrX) || !Number.isFinite(attrY)) && imgEl.style.objectPosition) {
    const parts = imgEl.style.objectPosition.match(/([\d.]+)%\s+([\d.]+)%/);
    if (parts) {
      posX = parseFloat(parts[1]);
      posY = parseFloat(parts[2]);
    }
  }

  return { zoom, posX, posY };
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  zoomPercent: number,
  posXPercent: number,
  posYPercent: number
): void {
  const natW = img.naturalWidth || img.width;
  const natH = img.naturalHeight || img.height;
  if (natW <= 0 || natH <= 0 || boxW <= 0 || boxH <= 0) return;

  const coverScale = Math.max(boxW / natW, boxH / natH);
  const drawnW = natW * coverScale;
  const drawnH = natH * coverScale;

  const offsetX = (boxW - drawnW) * (posXPercent / 100);
  const offsetY = (boxH - drawnH) * (posYPercent / 100);

  const zoomFactor = Math.max(0.1, zoomPercent / 100);
  const pivotX = boxX + boxW * (posXPercent / 100);
  const pivotY = boxY + boxH * (posYPercent / 100);

  ctx.save();
  ctx.beginPath();
  ctx.rect(boxX, boxY, boxW, boxH);
  ctx.clip();

  if (Math.abs(zoomFactor - 1) > 0.001) {
    ctx.translate(pivotX, pivotY);
    ctx.scale(zoomFactor, zoomFactor);
    ctx.translate(-pivotX, -pivotY);
  }

  ctx.drawImage(img, boxX + offsetX, boxY + offsetY, drawnW, drawnH);
  ctx.restore();
}

/**
 * Desenha o efeito de glow desfocado da Polaroid usando downscaling multi-pass em Canvas 2D,
 * garantindo compatibilidade total no iOS Safari (onde ctx.filter não é suportado).
 */
function drawBlurredBackdropGlow(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  zoom: number,
  posX: number,
  posY: number
): void {
  if (w <= 0 || h <= 0) return;

  const smallW = 32;
  const smallH = Math.max(16, Math.round((h / w) * smallW));
  const c1 = document.createElement('canvas');
  c1.width = smallW;
  c1.height = smallH;
  const ctx1 = c1.getContext('2d');
  if (!ctx1) return;

  ctx1.imageSmoothingEnabled = true;
  ctx1.imageSmoothingQuality = 'high';
  drawCoverImage(ctx1, img, 0, 0, smallW, smallH, zoom, posX, posY);

  const tinyW = 14;
  const tinyH = Math.max(8, Math.round((h / w) * tinyW));
  const c2 = document.createElement('canvas');
  c2.width = tinyW;
  c2.height = tinyH;
  const ctx2 = c2.getContext('2d');
  if (!ctx2) return;

  ctx2.imageSmoothingEnabled = true;
  ctx2.imageSmoothingQuality = 'high';
  ctx2.drawImage(c1, 0, 0, tinyW, tinyH);

  const spread = 28;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(c2, x - spread, y - spread, w + spread * 2, h + spread * 2);
  ctx.restore();
}

/**
 * Renderiza a lâmina diretamente em um HTMLCanvasElement 2D nativo (1080x1350 ou 1080x1920)
 * contornando completamente o bug de <svg><foreignObject> em branco no iOS Safari / WebKit.
 */
export async function renderSlideToCanvas(
  element: HTMLElement,
  aspectRatio: AspectRatio,
  imageCache?: Map<string, HTMLImageElement>
): Promise<{ canvas: HTMLCanvasElement; drawnImagesCount: number }> {
  const config = ASPECT_RATIOS[aspectRatio];
  const targetWidth = config.width;
  const targetHeight = config.height;

  const rootRect = element.getBoundingClientRect();
  const scaleX = rootRect.width > 0 ? targetWidth / rootRect.width : 1;
  const scaleY = rootRect.height > 0 ? targetHeight / rootRect.height : 1;

  // Pré-carrega e decodifica todas as imagens presentes na lâmina
  const domImgs = Array.from(element.querySelectorAll('img'));
  const localCache = imageCache || new Map<string, HTMLImageElement>();
  const resolvedImgByElement = new Map<HTMLImageElement, HTMLImageElement>();

  for (const domImg of domImgs) {
    const rawSrc = domImg.getAttribute('src') || domImg.currentSrc || domImg.src;
    if (!rawSrc) continue;
    const decoded = await loadDecodedImage(rawSrc, domImg, localCache);
    if (decoded) {
      resolvedImgByElement.set(domImg, decoded);
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Não foi possível inicializar o contexto Canvas 2D para exportação.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fundo base padrão
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  let drawnImagesCount = 0;

  const paintNode = (node: HTMLElement, isRoot: boolean): void => {
    if (node.getAttribute('data-export-hide') === 'true' || node.tagName === 'BUTTON') {
      return;
    }

    const computed = window.getComputedStyle(node);
    if (
      computed.display === 'none' ||
      computed.visibility === 'hidden' ||
      parseFloat(computed.opacity || '1') <= 0
    ) {
      return;
    }

    const rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const x = (rect.left - rootRect.left) * scaleX;
    const y = (rect.top - rootRect.top) * scaleY;
    const w = rect.width * scaleX;
    const h = rect.height * scaleY;

    // Tratamento especial para container com filtro blur (ex.: Glow da Polaroid na Lâmina 2)
    const filterStr = `${node.style.filter || ''} ${computed.filter || ''}`;
    if (filterStr.includes('blur(')) {
      const innerImg = node.querySelector('img') as HTMLImageElement | null;
      const loaded = innerImg ? resolvedImgByElement.get(innerImg) : null;
      if (innerImg && loaded) {
        const { zoom, posX, posY } = extractImageSlotParams(innerImg);
        drawBlurredBackdropGlow(ctx, loaded, x, y, w, h, zoom, posX, posY);
      }
      return;
    }

    ctx.save();

    const opacity = parseFloat(computed.opacity || '1');
    if (opacity < 1) {
      ctx.globalAlpha *= opacity;
    }

    const radius = isRoot ? 0 : parseFloat(computed.borderTopLeftRadius || '0') * scaleX;

    // 1. Sombra projetada (drop-shadow / box-shadow) antes do recorte de overflow
    const shadow = extractNodeShadow(node, computed, isRoot);
    if (shadow) {
      ctx.save();
      ctx.shadowOffsetX = shadow.offsetX * scaleX;
      ctx.shadowOffsetY = shadow.offsetY * scaleY;
      ctx.shadowBlur = shadow.blur * Math.max(scaleX, scaleY);
      ctx.shadowColor = shadow.color;
      ctx.fillStyle = hasVisibleBackground(computed.backgroundColor)
        ? computed.backgroundColor
        : 'rgba(0, 0, 0, 1)';
      drawRoundedRectPath(ctx, x, y, w, h, radius);
      ctx.fill();
      ctx.restore();
    }

    // 2. Recorte (overflow: hidden)
    const isOverflowHidden =
      computed.overflow === 'hidden' ||
      computed.overflowX === 'hidden' ||
      computed.overflowY === 'hidden';
    if (isOverflowHidden) {
      drawRoundedRectPath(ctx, x, y, w, h, radius);
      ctx.clip();
    }

    // 3. Cor de fundo do elemento (ex.: bg-white, bg-black, bg-[#EAEAEA])
    if (hasVisibleBackground(computed.backgroundColor)) {
      ctx.fillStyle = computed.backgroundColor;
      drawRoundedRectPath(ctx, x, y, w, h, radius);
      ctx.fill();
    }

    // 4. Se for um elemento <img>, desenha a foto com object-fit: cover + zoom + pan
    if (node instanceof HTMLImageElement) {
      const loadedImg = resolvedImgByElement.get(node);
      if (loadedImg) {
        const parentEl = node.parentElement || node;
        const parentRect = parentEl.getBoundingClientRect();
        const boxX = (parentRect.left - rootRect.left) * scaleX;
        const boxY = (parentRect.top - rootRect.top) * scaleY;
        const boxW = parentRect.width * scaleX;
        const boxH = parentRect.height * scaleY;

        const { zoom, posX, posY } = extractImageSlotParams(node);
        drawCoverImage(ctx, loadedImg, boxX, boxY, boxW, boxH, zoom, posX, posY);
        drawnImagesCount++;
      }
      ctx.restore();
      return;
    }

    // 5. Renderiza filhos respeitando a ordem de empilhamento (z-index e DOM)
    const children = getSortedChildren(node);
    for (const child of children) {
      paintNode(child, false);
    }

    ctx.restore();
  };

  paintNode(element, true);

  return { canvas, drawnImagesCount };
}

export async function renderSlideToImage(
  element: HTMLElement,
  aspectRatio: AspectRatio,
  imageCache?: Map<string, HTMLImageElement>
): Promise<string> {
  const { canvas } = await renderSlideToCanvas(element, aspectRatio, imageCache);
  return canvas.toDataURL('image/png');
}

export interface RenderedSlideResult {
  number: number;
  filename: string;
  dataUrl: string;
  blob: Blob;
}

export interface ExportSlidesOptions {
  templateName?: string;
}

/**
 * Gera carimbo de data e hora no formato AAAAMMDD_HHMMSS
 */
export function getExportTimestamp(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
}

/**
 * Cria nome de arquivo único para a lâmina no formato:
 * [template]_[AAAAMMDD]_[HHMMSS]_lamina_[XX].png
 * Evita sobrescrever arquivos em múltiplos downloads.
 */
export function formatExportFilename(
  templateName: string,
  slideNumber: number,
  timestamp: string
): string {
  const cleanName =
    templateName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'carrossel';

  const num = String(slideNumber).padStart(2, '0');
  return `${cleanName}_${timestamp}_lamina_${num}.png`;
}

/**
 * Renderiza todas as lâminas sequencialmente para exibição imediata na janela oficial de exportação,
 * sem disparar downloads automáticos que abrem pré-visualizações intermediárias no navegador.
 */
export async function exportSlidesSequentially(
  slideElements: { id: string; number: number; element: HTMLElement }[],
  aspectRatio: AspectRatio,
  onProgress?: ExportProgressCallback,
  options?: ExportSlidesOptions
): Promise<RenderedSlideResult[]> {
  const batchTimestamp = getExportTimestamp();
  const templateName = options?.templateName || 'carrossel';
  const sharedImageCache = new Map<string, HTMLImageElement>();

  addCarouselLog('info', `Iniciando renderização de ${slideElements.length} lâmina(s) para a janela oficial de exportação`, {
    aspectRatio,
    templateName,
    batchTimestamp,
    slides: slideElements.map((s) => ({ id: s.id, number: s.number }))
  });

  const renderedSlides: RenderedSlideResult[] = [];

  // Renderiza sequencialmente todas as lâminas via Canvas 2D nativo
  for (let i = 0; i < slideElements.length; i++) {
    const item = slideElements[i];
    if (onProgress) {
      onProgress(i + 1, slideElements.length, item.number);
    }

    try {
      addCarouselLog('debug', `Renderizando lâmina #${item.number} (${i + 1}/${slideElements.length})...`);
      const startTime = performance.now();
      const { canvas, drawnImagesCount } = await renderSlideToCanvas(
        item.element,
        aspectRatio,
        sharedImageCache
      );
      const dataUrl = canvas.toDataURL('image/png');
      const renderDuration = Math.round(performance.now() - startTime);

      const filename = formatExportFilename(templateName, item.number, batchTimestamp);
      const blob = dataUrlToBlob(dataUrl);

      renderedSlides.push({
        number: item.number,
        filename,
        dataUrl,
        blob
      });

      addCarouselLog('info', `Lâmina #${item.number} renderizada com sucesso em ${renderDuration}ms`, {
        filename,
        drawnImagesCount,
        blobSizeKb: Math.round(blob.size / 1024)
      });
    } catch (renderError) {
      addCarouselLog('error', `Erro ao renderizar lâmina #${item.number}`, { slideId: item.id }, renderError);
      throw renderError;
    }

    // Pausa preventiva entre renderizações quando houver múltiplas lâminas para desafogar o rasterizer do Safari
    if (i < slideElements.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  addCarouselLog('info', `Exportação concluída com sucesso para ${renderedSlides.length} lâmina(s). Abrindo janela oficial de exportação.`);
  return renderedSlides;
}
