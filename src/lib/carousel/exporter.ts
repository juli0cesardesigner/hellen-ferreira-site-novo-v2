import { toPng } from 'html-to-image';
import { AspectRatio, ASPECT_RATIOS } from './types';

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
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/png';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

export function triggerDownload(dataUrl: string, filename: string) {
  const blob = dataUrlToBlob(dataUrl);
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = blobUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

/**
 * Renderiza o elemento em 1080x1350 ou 1080x1920 nativo
 * Com configurações específicas para compatibilidade com iOS WebKit (Safari)
 */
export async function renderSlideToImage(
  element: HTMLElement,
  aspectRatio: AspectRatio
): Promise<string> {
  const config = ASPECT_RATIOS[aspectRatio];

  return await toPng(element, {
    quality: 0.98,
    pixelRatio: 1, // Elemento já está renderizado em 1080p exato
    cacheBust: true,
    skipFonts: true, // Evita travamento/timeout no WebKit ao tentar converter fontes remotas
    imagePlaceholder: DEFAULT_FALLBACK_PLACEHOLDER,
    width: config.width,
    height: config.height,
    canvasWidth: config.width,
    canvasHeight: config.height,
    filter: (node) => {
      if (node instanceof HTMLElement && node.getAttribute('data-export-hide') === 'true') {
        return false;
      }
      return true;
    }
  });
}

/**
 * Exporta todas as lâminas. No iOS/Safari mobile, tenta usar o Web Share API
 * para permitir salvar diretamente no Rolo da Câmera (Fotos do iPhone).
 */
export async function exportSlidesSequentially(
  slideElements: { id: string; number: number; element: HTMLElement }[],
  aspectRatio: AspectRatio,
  onProgress?: ExportProgressCallback
) {
  const renderedSlides: { number: number; filename: string; dataUrl: string; blob: Blob }[] = [];

  // 1. Renderiza sequencialmente todas as lâminas
  for (let i = 0; i < slideElements.length; i++) {
    const item = slideElements[i];
    if (onProgress) {
      onProgress(i + 1, slideElements.length, item.number);
    }

    const dataUrl = await renderSlideToImage(item.element, aspectRatio);
    const filename = `hellen-ferreira-lamina-${String(item.number).padStart(2, '0')}-${aspectRatio.replace(':', 'x')}.png`;
    const blob = dataUrlToBlob(dataUrl);

    renderedSlides.push({
      number: item.number,
      filename,
      dataUrl,
      blob
    });

    // Pausa preventiva entre renderizações para desafogar o canvas/rasterizer do Safari
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // 2. Tenta compartilhar via Web Share API se suportado com arquivos (iOS Safari / iPadOS / Android)
  let sharedSuccessfully = false;

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const files = renderedSlides.map(
        (s) => new File([s.blob], s.filename, { type: 'image/png' })
      );

      if (navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          files,
          title: 'Carrossel Hellen Ferreira',
          text: 'Lâminas geradas para o Instagram'
        });
        sharedSuccessfully = true;
      }
    } catch (err: unknown) {
      // Se o usuário cancelou o menu de compartilhar (AbortError), encerra o fluxo sem forçar fallback de cliques
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.warn('Falha no Web Share API, recorrendo a download padrão:', err);
    }
  }

  // 3. Fallback: Download via Blob URL para navegadores desktop ou quando share falhar
  if (!sharedSuccessfully) {
    for (let i = 0; i < renderedSlides.length; i++) {
      const item = renderedSlides[i];
      triggerDownload(item.dataUrl, item.filename);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
