import { describe, it, expect } from 'vitest';
import { getTemplateUniqueSlots, applyAutoFillToTemplate } from './auto-fill';
import { GALLERY_01_TEMPLATE } from './templates/gallery01';
import { GALLERY_02_TEMPLATE } from './templates/gallery02';
import { GALLERY_03_TEMPLATE } from './templates/gallery03';

describe('Auto-Fill Module', () => {
  it('should correctly count unique slots for all templates', () => {
    const g1Slots = getTemplateUniqueSlots(GALLERY_01_TEMPLATE);
    // G1 tem 5 lâminas: L1 (4) + L2 (3) + L3 (3) + L4 (1) + L5 (1) = 12 fotos
    expect(g1Slots.length).toBe(12);

    const g2Slots = getTemplateUniqueSlots(GALLERY_02_TEMPLATE);
    // G2 tem 4 lâminas: L1 (3) + L2 (2) + L3 (2) + L4 (1 novo, pois t2_seamless é compartilhado) = 8 fotos
    expect(g2Slots.length).toBe(8);

    const g3Slots = getTemplateUniqueSlots(GALLERY_03_TEMPLATE);
    // G3 tem 5 lâminas com slots compartilhados panorâmicos
    expect(g3Slots.length).toBeGreaterThan(0);
  });

  it('should preserve template structure and assign images sequentially without randomizing slides', () => {
    const g2Slots = getTemplateUniqueSlots(GALLERY_02_TEMPLATE);
    const mockPhotos = g2Slots.map((s, idx) => ({
      dataUrl: `data:image/png;base64,TEST_DATA_${idx}`,
      name: `Foto_${idx}.png`
    }));

    const result = applyAutoFillToTemplate(GALLERY_02_TEMPLATE, mockPhotos);

    // Todas as fotos devem estar preenchidas
    g2Slots.forEach((slot, idx) => {
      expect(result[slot.id]).toBeDefined();
      expect(result[slot.id].imageUrl).toBe(`data:image/png;base64,TEST_DATA_${idx}`);
    });

    // O template original não é modificado
    expect(GALLERY_02_TEMPLATE.slides.length).toBe(4);
    expect(GALLERY_02_TEMPLATE.slides[0].id).toBe('t2-slide-1');
  });
});
