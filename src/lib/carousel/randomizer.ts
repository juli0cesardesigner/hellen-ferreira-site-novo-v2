import { CatalogSlideItem, CATALOG_SLIDES } from '@/lib/carousel/templates/catalog';
import { SlideDefinition, PhotoSlotData } from '@/lib/carousel/types';

// Gera ID único
const uid = () => `rnd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

// Embaralha um array
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Cria uma instância de lâmina a partir de um CatalogSlideItem com novos IDs de slots
export function instantiateCatalogSlide(
  catalogItem: CatalogSlideItem,
  slideNumber: number,
  customSlideId?: string
): SlideDefinition {
  const slideId = customSlideId || uid();
  const newSlots = catalogItem.slideDefinition.slots.map((s, idx) => ({
    ...s,
    id: `${slideId}_slot_${idx}`
  }));

  return {
    ...catalogItem.slideDefinition,
    id: slideId,
    slideNumber,
    slots: newSlots
  };
}

/**
 * OPÇÃO 1:
 * Usuário sobe N imagens (dataUrls).
 * O algoritmo seleciona randomicamente lâminas do catálogo até que a soma total de slots
 * seja suficiente para acomodar todas as fotos (sem faltar vagas).
 * Em seguida, preenche automaticamente os slots com as fotos fornecidas.
 */
export function generateRandomProjectByImages(
  images: { dataUrl: string; name?: string }[],
  catalog: CatalogSlideItem[] = CATALOG_SLIDES
): {
  slides: SlideDefinition[];
  slotsData: Record<string, PhotoSlotData>;
} {
  const targetSlotsCount = images.length;
  const availableTemplates = shuffleArray([...catalog]);

  const chosenSlides: SlideDefinition[] = [];
  let totalSlots = 0;
  let slideNum = 1;

  // Enquanto a capacidade de slots for menor que o número de fotos
  while (totalSlots < targetSlotsCount && chosenSlides.length < 15) {
    // Pega uma lâmina aleatória do catálogo
    const randomItem = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];

    // Se a lâmina tiver par seamless e couber bem, tenta incluir o par para continuidade perfeita
    if (randomItem.seamlessPairId && Math.random() > 0.4) {
      const pair = catalog.find((c) => c.id === randomItem.seamlessPairId);
      if (pair) {
        const s1 = instantiateCatalogSlide(randomItem, slideNum++);
        const s2 = instantiateCatalogSlide(pair, slideNum++);
        chosenSlides.push(s1, s2);
        totalSlots += s1.slots.length + s2.slots.length;
        continue;
      }
    }

    const singleSlide = instantiateCatalogSlide(randomItem, slideNum++);
    chosenSlides.push(singleSlide);
    totalSlots += singleSlide.slots.length;
  }

  // Preenche os slots com as fotos do usuário
  const slotsData: Record<string, PhotoSlotData> = {};
  let imgIndex = 0;

  chosenSlides.forEach((slide) => {
    slide.slots.forEach((slot) => {
      const img = images[imgIndex];
      slotsData[slot.id] = {
        id: slot.id,
        label: slot.label,
        imageUrl: img ? img.dataUrl : undefined,
        adjustments: { zoom: 100, x: 50, y: 50 }
      };
      imgIndex++;
    });
  });

  return {
    slides: chosenSlides,
    slotsData
  };
}

/**
 * OPÇÃO 2:
 * Usuário define o número exato de lâminas (ex: 5 lâminas).
 * O algoritmo escolhe aleatoriamente essa quantidade de lâminas do catálogo e monta o carrossel em branco.
 */
export function generateRandomProjectBySlideCount(
  slideCount: number,
  catalog: CatalogSlideItem[] = CATALOG_SLIDES
): {
  slides: SlideDefinition[];
  slotsData: Record<string, PhotoSlotData>;
} {
  const chosenSlides: SlideDefinition[] = [];
  const slotsData: Record<string, PhotoSlotData> = {};
  let currentNum = 1;

  while (chosenSlides.length < slideCount) {
    const randomItem = catalog[Math.floor(Math.random() * catalog.length)];

    // Se precisar de pelo menos 2 lâminas e a escolhida for seamless, pode adicionar o par
    if (
      randomItem.seamlessPairId &&
      slideCount - chosenSlides.length >= 2 &&
      Math.random() > 0.4
    ) {
      const pair = catalog.find((c) => c.id === randomItem.seamlessPairId);
      if (pair) {
        const s1 = instantiateCatalogSlide(randomItem, currentNum++);
        const s2 = instantiateCatalogSlide(pair, currentNum++);
        chosenSlides.push(s1, s2);
        continue;
      }
    }

    const single = instantiateCatalogSlide(randomItem, currentNum++);
    chosenSlides.push(single);
  }

  // Inicializa os slots em branco prontos para edição
  chosenSlides.forEach((slide) => {
    slide.slots.forEach((slot) => {
      slotsData[slot.id] = {
        id: slot.id,
        label: slot.label,
        imageUrl: undefined,
        adjustments: { zoom: 100, x: 50, y: 50 }
      };
    });
  });

  return {
    slides: chosenSlides,
    slotsData
  };
}

