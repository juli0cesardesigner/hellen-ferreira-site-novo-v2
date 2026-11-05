import { toPng } from 'html-to-image';
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

export function triggerDownload(dataUrl: string, filename: string): string {
  const blob = dataUrlToBlob(dataUrl);
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = blobUrl;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Mantém a URL ativa por 60 segundos para garantir tempo suficiente para confirmação de download no Safari/iOS
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  return blobUrl;
}

/**
 * Renderiza o elemento em 1080x1350 ou 1080x1920 nativo
 * Com configurações específicas para compatibilidade com iOS WebKit (Safari)
 */
/**
 * Aguarda todas as tags <img> do elemento terminarem de carregar antes do snapshot
 */
async function waitForSlideImages(element: HTMLElement): Promise<void> {
  const imgs = Array.from(element.querySelectorAll('img'));
  if (imgs.length === 0) return;

  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const onFinish = () => {
          img.removeEventListener('load', onFinish);
          img.removeEventListener('error', onFinish);
          resolve();
        };
        img.addEventListener('load', onFinish);
        img.addEventListener('error', onFinish);
        setTimeout(onFinish, 2500); // Timeout limite preventivo
      });
    })
  );
}

export async function renderSlideToImage(
  element: HTMLElement,
  aspectRatio: AspectRatio
): Promise<string> {
  const config = ASPECT_RATIOS[aspectRatio];

  // Garante que todas as fotos estejam descompactadas e prontas no DOM
  await waitForSlideImages(element);

  return await toPng(element, {
    quality: 0.98,
    pixelRatio: 1,
    cacheBust: true,
    skipFonts: true,
    imagePlaceholder: DEFAULT_FALLBACK_PLACEHOLDER,
    width: config.width,
    height: config.height,
    canvasWidth: config.width,
    canvasHeight: config.height,
    style: {
      opacity: '1',
      visibility: 'visible',
      transform: 'none'
    },
    filter: (node) => {
      if (node instanceof HTMLElement && node.getAttribute('data-export-hide') === 'true') {
        return false;
      }
      return true;
    }
  });
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
 * Exporta todas as lâminas via download direto sequencial (sem abrir folha de compartilhamento nativa).
 */
export async function exportSlidesSequentially(
  slideElements: { id: string; number: number; element: HTMLElement }[],
  aspectRatio: AspectRatio,
  onProgress?: ExportProgressCallback,
  options?: ExportSlidesOptions
): Promise<RenderedSlideResult[]> {
  const batchTimestamp = getExportTimestamp();
  const templateName = options?.templateName || 'carrossel';

  addCarouselLog('info', `Iniciando renderização de ${slideElements.length} lâminas para download direto`, {
    aspectRatio,
    templateName,
    batchTimestamp,
    slides: slideElements.map((s) => ({ id: s.id, number: s.number }))
  });

  const renderedSlides: RenderedSlideResult[] = [];

  // 1. Renderiza sequencialmente todas as lâminas
  for (let i = 0; i < slideElements.length; i++) {
    const item = slideElements[i];
    if (onProgress) {
      onProgress(i + 1, slideElements.length, item.number);
    }

    try {
      addCarouselLog('debug', `Renderizando lâmina #${item.number} (${i + 1}/${slideElements.length})...`);
      const startTime = performance.now();
      const dataUrl = await renderSlideToImage(item.element, aspectRatio);
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
        blobSizeKb: Math.round(blob.size / 1024)
      });
    } catch (renderError) {
      addCarouselLog('error', `Erro ao renderizar lâmina #${item.number}`, { slideId: item.id }, renderError);
      throw renderError;
    }

    // Pausa preventiva entre renderizações para desafogar o canvas/rasterizer do Safari
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // 2. Download direto via Blob URL (sem folha de compartilhamento/share sheet)
  addCarouselLog('info', `Disparando download direto de ${renderedSlides.length} arquivos...`);
  for (let i = 0; i < renderedSlides.length; i++) {
    const item = renderedSlides[i];
    try {
      addCarouselLog('debug', `Baixando arquivo ${i + 1}/${renderedSlides.length}: ${item.filename}`);
      triggerDownload(item.dataUrl, item.filename);
      // Intervalo de 600ms para permitir que o navegador processe o download de cada arquivo
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (downloadError) {
      addCarouselLog('error', `Falha ao acionar download de ${item.filename}`, undefined, downloadError);
    }
  }

  addCarouselLog('info', `Exportação e download direto concluídos com sucesso para ${renderedSlides.length} lâminas.`);
  return renderedSlides;
}
