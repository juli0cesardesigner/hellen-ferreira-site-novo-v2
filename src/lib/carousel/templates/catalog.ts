import { SlideDefinition } from '../types';
import { GALLERY_01_TEMPLATE } from './gallery01';
import { GALLERY_02_TEMPLATE } from './gallery02';

export interface CatalogSlideItem {
  id: string;
  templateName: string;
  slideNumber: number;
  thumbnailSvg?: string;
  slideDefinition: SlideDefinition;
  seamlessPairId?: string; // ID da lâmina par se for parte de um seamless
}

export const CATALOG_SLIDES: CatalogSlideItem[] = [
  // Lâminas do Template 1
  ...GALLERY_01_TEMPLATE.slides.map((s) => ({
    id: `cat_t1_${s.id}`,
    templateName: 'Galeria 01',
    slideNumber: s.slideNumber,
    thumbnailSvg: s.thumbnailSvg,
    slideDefinition: s
  })),
  // Lâminas do Template 2
  ...GALLERY_02_TEMPLATE.slides.map((s) => ({
    id: `cat_t2_${s.id}`,
    templateName: 'Galeria 02',
    slideNumber: s.slideNumber,
    thumbnailSvg: s.thumbnailSvg,
    slideDefinition: s,
    // Vincula a L03 com a L04 e vice-versa
    seamlessPairId: s.id === 't2-slide-3' ? 'cat_t2_t2-slide-4' : s.id === 't2-slide-4' ? 'cat_t2_t2-slide-3' : undefined
  }))
];

