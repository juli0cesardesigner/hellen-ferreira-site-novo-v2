import { CatalogSlideItem, CATALOG_SLIDES } from '@/lib/carousel/templates/catalog';
import { SlideDefinition, PhotoSlotData } from '@/lib/carousel/types';

// Gera ID único
const uid = () => `rnd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

// Embaralha um array de forma imutável
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface CarouselUnit {
  id: string;
  name: string;
  slotCount: number; // Quantidade de fotos únicas consumidas por esta unidade
  items: CatalogSlideItem[]; // Array de lâminas do catálogo (1 lâmina ou par atômico)
  isSeamlessPair?: boolean;
}

/**
 * Agrupa o catálogo em unidades atômicas de composição:
 * - Lâminas com sobreposição (seamless) são OBRIGATORIAMENTE unidas em pares contínuos (ex: L3+L4 do T2),
 *   garantindo que NUNCA sejam inseridas separadamente no modo aleatório.
 * - Lâminas sem sobreposição formam unidades individuais de 1 lâmina (1, 2, 3 ou 4 slots).
 */
export function buildRandomizerUnits(catalog: CatalogSlideItem[] = CATALOG_SLIDES): CarouselUnit[] {
  const units: CarouselUnit[] = [];
  const processedIds = new Set<string>();

  // Utiliza apenas lâminas de templates modulares compatíveis (G1, G2 e G4),
  // evitando que panoramas completos de 5 lâminas (G3) tenham fotos fatiadas ao meio.
  const modularCatalog = catalog.filter(
    (item) => item.templateId === 'hellen-gallery-01' || item.templateId === 'hellen-gallery-02' || item.templateId === 'hellen-gallery-04'
  );

  // 1. Processa pares seamless vinculados (lâminas com sobreposição contínua)
  for (const item of modularCatalog) {
    if (item.seamlessPairId && !processedIds.has(item.id)) {
      const pair = modularCatalog.find((c) => c.id === item.seamlessPairId);
      if (pair) {
        processedIds.add(item.id);
        processedIds.add(pair.id);

        const [s1, s2] = item.slideNumber < pair.slideNumber ? [item, pair] : [pair, item];

        // Lâminas com foto contínua compartilham o slot seamless
        const uniqueSlotNames = new Set<string>();
        s1.slideDefinition.slots.forEach((s) => uniqueSlotNames.add(s.id));
        s2.slideDefinition.slots.forEach((s) => uniqueSlotNames.add(s.id));

        units.push({
          id: `unit_pair_${s1.id}_${s2.id}`,
          name: `${s1.templateName} Par Seamless (L#${s1.slideNumber} + L#${s2.slideNumber})`,
          slotCount: uniqueSlotNames.size,
          items: [s1, s2],
          isSeamlessPair: true
        });
      }
    }
  }

  // 2. Processa lâminas independentes (sem sobreposição)
  for (const item of modularCatalog) {
    if (!processedIds.has(item.id) && !item.seamlessPairId) {
      units.push({
        id: `unit_single_${item.id}`,
        name: `${item.templateName} L#${item.slideNumber}`,
        slotCount: item.slideDefinition.slots.length,
        items: [item],
        isSeamlessPair: false
      });
    }
  }

  return units;
}

/**
 * Instancia uma unidade (1 slide ou par seamless) com novos IDs únicos,
 * sincronizando automaticamente o slot seamless compartilhado entre as duas lâminas.
 */
export function instantiateUnit(
  unit: CarouselUnit,
  startSlideNumber: number
): {
  slides: SlideDefinition[];
  uniqueSlotList: { slotId: string; label: string }[];
} {
  const slides: SlideDefinition[] = [];
  const uniqueSlotList: { slotId: string; label: string }[] = [];
  const sharedSlotMap = new Map<string, string>();
  const seenSlotIds = new Set<string>();

  let slideNum = startSlideNumber;

  for (const catalogItem of unit.items) {
    const slideId = uid();
    const newSlots = catalogItem.slideDefinition.slots.map((s, idx) => {
      const isSeamless = s.id.includes('seamless');
      let newId = isSeamless ? sharedSlotMap.get(s.id) : undefined;
      if (!newId) {
        newId = `${slideId}_slot_${idx}`;
        if (isSeamless) {
          sharedSlotMap.set(s.id, newId);
        }
      }

      if (!seenSlotIds.has(newId)) {
        seenSlotIds.add(newId);
        uniqueSlotList.push({ slotId: newId, label: s.label });
      }

      return {
        ...s,
        id: newId
      };
    });

    slides.push({
      ...catalogItem.slideDefinition,
      id: slideId,
      slideNumber: slideNum++,
      slots: newSlots
    });
  }

  return { slides, uniqueSlotList };
}

/**
 * Encontra uma partição exata de unidades cuja soma de slotCount seja estritamente
 * igual ao número total de imagens escolhidas pelo usuário (nem mais, nem menos).
 */
export function findExactUnitsPartition(
  targetSlots: number,
  availableUnits: CarouselUnit[]
): CarouselUnit[] | null {
  if (targetSlots <= 0) return [];

  // Embaralha as unidades para oferecer layouts variados a cada execução
  const shuffledUnits = shuffleArray(availableUnits);

  function search(remaining: number, currentCombo: CarouselUnit[]): CarouselUnit[] | null {
    if (remaining === 0) {
      return currentCombo;
    }
    if (remaining < 0 || currentCombo.length >= 20) {
      return null;
    }

    const candidates = shuffledUnits.filter((u) => u.slotCount <= remaining);
    if (candidates.length === 0) return null;

    for (const unit of candidates) {
      const result = search(remaining - unit.slotCount, [...currentCombo, unit]);
      if (result) return result;
    }

    return null;
  }

  return search(targetSlots, []);
}

/**
 * OPÇÃO 1 (Modo Aleatório por Fotos):
 * Ao selecionar carregar fotos, calcula a quantidade de imagens escolhidas (N)
 * e monta o carrossel personalizado apenas com lâminas suficientes para exibir
 * as fotos escolhidas: nem mais, nem menos.
 * Lâminas com sobreposição (seamless) NUNCA são inseridas separadamente.
 */
export function generateRandomProjectByImages(
  images: { dataUrl: string; name?: string }[],
  catalog: CatalogSlideItem[] = CATALOG_SLIDES
): {
  slides: SlideDefinition[];
  slotsData: Record<string, PhotoSlotData>;
} {
  const targetSlotsCount = images.length;
  if (targetSlotsCount === 0) {
    return { slides: [], slotsData: {} };
  }

  const units = buildRandomizerUnits(catalog);
  const chosenUnits = findExactUnitsPartition(targetSlotsCount, units);

  // Fallback seguro caso não encontre partição exata
  const unitsToInstantiate =
    chosenUnits ||
    (() => {
      // Combina unidades gulosamente até preencher ou aproximar
      const fallback: CarouselUnit[] = [];
      let accum = 0;
      const pool = shuffleArray(units);
      while (accum < targetSlotsCount && fallback.length < 15) {
        const remaining = targetSlotsCount - accum;
        const valid = pool.filter((u) => u.slotCount <= remaining);
        const pick = valid.length > 0 ? valid[0] : pool[0];
        fallback.push(pick);
        accum += pick.slotCount;
      }
      return fallback;
    })();

  const allSlides: SlideDefinition[] = [];
  const allUniqueSlots: { slotId: string; label: string }[] = [];
  let slideNum = 1;

  for (const unit of unitsToInstantiate) {
    const { slides, uniqueSlotList } = instantiateUnit(unit, slideNum);
    slideNum += slides.length;
    allSlides.push(...slides);
    allUniqueSlots.push(...uniqueSlotList);
  }

  // Preenche os slots com as fotos fornecidas, sem excedentes e sem vagas vazias
  const slotsData: Record<string, PhotoSlotData> = {};

  allUniqueSlots.forEach((slot, idx) => {
    const img = images[idx];
    slotsData[slot.slotId] = {
      id: slot.slotId,
      label: slot.label,
      imageUrl: img ? img.dataUrl : undefined,
      adjustments: { zoom: 100, x: 50, y: 50 }
    };
  });

  return {
    slides: allSlides,
    slotsData
  };
}

/**
 * OPÇÃO 2 (Modo Aleatório por Quantidade de Lâminas):
 * Sorteia uma quantidade exata de lâminas.
 * Lâminas que possuem sobreposição (seamless) NUNCA são inseridas separadamente.
 */
export function generateRandomProjectBySlideCount(
  slideCount: number,
  catalog: CatalogSlideItem[] = CATALOG_SLIDES
): {
  slides: SlideDefinition[];
  slotsData: Record<string, PhotoSlotData>;
} {
  const units = buildRandomizerUnits(catalog);
  const chosenUnits: CarouselUnit[] = [];
  let currentSlideCount = 0;

  while (currentSlideCount < slideCount) {
    const remainingSlides = slideCount - currentSlideCount;
    // Se sobrar apenas 1 lâmina para completar o total, não pode escolher unidade par (2 lâminas)
    const validUnits =
      remainingSlides >= 2
        ? units
        : units.filter((u) => !u.isSeamlessPair && u.items.length === 1);

    if (validUnits.length === 0) break;

    const chosen = validUnits[Math.floor(Math.random() * validUnits.length)];
    chosenUnits.push(chosen);
    currentSlideCount += chosen.items.length;
  }

  const allSlides: SlideDefinition[] = [];
  const slotsData: Record<string, PhotoSlotData> = {};
  let slideNum = 1;

  for (const unit of chosenUnits) {
    const { slides, uniqueSlotList } = instantiateUnit(unit, slideNum);
    slideNum += slides.length;
    allSlides.push(...slides);

    for (const { slotId, label } of uniqueSlotList) {
      if (!slotsData[slotId]) {
        slotsData[slotId] = {
          id: slotId,
          label,
          imageUrl: undefined,
          adjustments: { zoom: 100, x: 50, y: 50 }
        };
      }
    }
  }

  return {
    slides: allSlides,
    slotsData
  };
}
