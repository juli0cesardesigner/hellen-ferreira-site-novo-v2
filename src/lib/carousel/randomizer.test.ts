import { describe, it, expect } from 'vitest';
import {
  generateRandomProjectByImages,
  generateRandomProjectBySlideCount,
  buildRandomizerUnits
} from './randomizer';
import { CATALOG_SLIDES } from './templates/catalog';

describe('Randomizer Module', () => {
  it('should never include seamless slides individually in randomizer units', () => {
    const units = buildRandomizerUnits(CATALOG_SLIDES);
    for (const unit of units) {
      if (unit.isSeamlessPair) {
        expect(unit.items.length).toBe(2);
        // O par deve conter t2-slide-3 e t2-slide-4
        const ids = unit.items.map((i) => i.slideDefinition.id);
        expect(ids).toContain('t2-slide-3');
        expect(ids).toContain('t2-slide-4');
      } else {
        // Nenhuma lâmina individual pode ser seamless
        for (const item of unit.items) {
          expect(item.seamlessPairId).toBeUndefined();
        }
      }
    }
  });

  it('should generate carousel with EXACT slot count matching uploaded images count (nem mais, nem menos)', () => {
    const testCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];

    for (const count of testCounts) {
      const mockImages = Array.from({ length: count }, (_, i) => ({
        dataUrl: `data:image/png;base64,IMG_${i + 1}`,
        name: `Foto_${i + 1}.png`
      }));

      const result = generateRandomProjectByImages(mockImages, CATALOG_SLIDES);

      // Coleta todos os slots únicos nas lâminas geradas
      const uniqueSlotIds = new Set<string>();
      result.slides.forEach((slide) => {
        slide.slots.forEach((s) => uniqueSlotIds.add(s.id));
      });

      expect(uniqueSlotIds.size).toBe(count);

      // Verifica se todas as imagens foram atribuídas aos slots sem excedente
      const filledSlots = Object.values(result.slotsData).filter((s) => Boolean(s.imageUrl));
      expect(filledSlots.length).toBe(count);

      // Verifica que lâminas com sobreposição nunca estão sozinhas
      result.slides.forEach((slide, idx) => {
        if (slide.id.includes('t2-slide-3')) {
          const next = result.slides[idx + 1];
          expect(next?.id).toContain('t2-slide-4');
        }
      });
    }
  });

  it('should respect requested slide count and keep seamless pairs together in generateRandomProjectBySlideCount', () => {
    for (let count = 2; count <= 8; count++) {
      const result = generateRandomProjectBySlideCount(count, CATALOG_SLIDES);
      expect(result.slides.length).toBe(count);

      // Nenhuma lâmina de sobreposição solteira
      result.slides.forEach((slide, idx) => {
        if (slide.id.includes('t2-slide-3')) {
          const next = result.slides[idx + 1];
          expect(next?.id).toContain('t2-slide-4');
        }
      });
    }
  });
});
