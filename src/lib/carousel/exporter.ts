import { toPng } from 'html-to-image';
import { AspectRatio, ASPECT_RATIOS } from './types';

export interface ExportProgressCallback {
  (current: number, total: number, slideNumber: number): void;
}

export function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Renderiza o elemento em 1080x1350 ou 1080x1920 nativo
 */
export async function renderSlideToImage(
  element: HTMLElement,
  aspectRatio: AspectRatio
): Promise<string> {
  const config = ASPECT_RATIOS[aspectRatio];
  const rect = element.getBoundingClientRect();
  const scale = rect.width > 0 ? config.width / rect.width : 1;

  return await toPng(element, {
    quality: 0.98,
    pixelRatio: scale, // Renderiza na resolução exata 1080p
    cacheBust: true,
    width: rect.width || config.width,
    height: rect.height || config.height,
    filter: (node) => {
      if (node instanceof HTMLElement && node.getAttribute('data-export-hide') === 'true') {
        return false;
      }
      return true;
    }
  });
}

export async function exportSlidesSequentially(
  slideElements: { id: string; number: number; element: HTMLElement }[],
  aspectRatio: AspectRatio,
  onProgress?: ExportProgressCallback
) {
  for (let i = 0; i < slideElements.length; i++) {
    const item = slideElements[i];
    if (onProgress) {
      onProgress(i + 1, slideElements.length, item.number);
    }

    const dataUrl = await renderSlideToImage(item.element, aspectRatio);
    const filename = `hellen-ferreira-lamina-${String(item.number).padStart(2, '0')}-${aspectRatio.replace(':', 'x')}.png`;

    triggerDownload(dataUrl, filename);
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}
