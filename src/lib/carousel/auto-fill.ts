import { CarouselTemplate, PhotoSlotData } from './types';

export interface TemplateSlotInfo {
  id: string;
  label: string;
  firstSlideNumber: number;
}

/**
 * Retorna todos os slots únicos de fotos de um template na ordem de aparição das lâminas.
 * Identifica slots compartilhados (seamless) para que não sejam contados ou preenchidos em duplicidade.
 */
export function getTemplateUniqueSlots(template: CarouselTemplate): TemplateSlotInfo[] {
  const uniqueSlots: TemplateSlotInfo[] = [];
  const seenIds = new Set<string>();

  template.slides.forEach((slide) => {
    slide.slots.forEach((slot) => {
      if (!seenIds.has(slot.id)) {
        seenIds.add(slot.id);
        uniqueSlots.push({
          id: slot.id,
          label: slot.label,
          firstSlideNumber: slide.slideNumber
        });
      }
    });
  });

  return uniqueSlots;
}

/**
 * Preenche os slots de um template com uma lista de imagens carregadas em lote.
 * Preserva integralmente a estrutura e ordem das lâminas do template escolhido
 * (diferente do modo aleatório, que altera a ordem ou sorteia lâminas).
 */
export function applyAutoFillToTemplate(
  template: CarouselTemplate,
  images: { dataUrl: string; name?: string }[],
  baseSlotsData: Record<string, PhotoSlotData> = {}
): Record<string, PhotoSlotData> {
  const updatedSlotsData: Record<string, PhotoSlotData> = { ...baseSlotsData };
  const uniqueSlots = getTemplateUniqueSlots(template);

  uniqueSlots.forEach((slot, index) => {
    const img = images[index];
    updatedSlotsData[slot.id] = {
      id: slot.id,
      label: slot.label,
      imageUrl: img ? img.dataUrl : undefined,
      adjustments: { zoom: 100, x: 50, y: 50 }
    };
  });

  return updatedSlotsData;
}
