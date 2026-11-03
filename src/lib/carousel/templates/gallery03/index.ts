import { CarouselTemplate } from '../../types';
import { Slide01T3B } from './slides/Slide01T3B';
import { Slide02T3B } from './slides/Slide02T3B';
import { Slide03T3B } from './slides/Slide03T3B';
import { Slide04T3B } from './slides/Slide04T3B';
import { Slide05T3B } from './slides/Slide05T3B';

export const GALLERY_03_TEMPLATE: CarouselTemplate = {
  id: 'hellen-gallery-03',
  name: 'Galeria Visual 03 (Panoramic Seamless)',
  description: 'Composição fluida de 5 lâminas com foto panorâmica de fundo (5400x1350) e múltiplas transições contínuas.',
  slides: [
    {
      id: 't3-slide-1',
      slideNumber: 1,
      thumbnailSvg: '/templates-thumbs/T03_L01.svg',
      component: Slide01T3B,
      slots: [
        { id: 't3_bg_seamless', label: 'Foto 01 - Fundo Panorâmico Seamless (5400x1350)', defaultPlaceholder: '' },
        { id: 't3_foto2', label: 'Foto 02 - Retângulo Esquerdo (880x1350)', defaultPlaceholder: '' },
        { id: 't3_foto4_seamless', label: 'Foto 04 - Seamless L1-L2 (1370x920)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't3-slide-2',
      slideNumber: 2,
      thumbnailSvg: '/templates-thumbs/T03_L02.svg',
      component: Slide02T3B,
      slots: [
        { id: 't3_bg_seamless', label: 'Foto 01 - Fundo Panorâmico Seamless (5400x1350)', defaultPlaceholder: '' },
        { id: 't3_foto3_seamless', label: 'Foto 03 - Seamless L2-L3 (1500x1350)', defaultPlaceholder: '' },
        { id: 't3_foto4_seamless', label: 'Foto 04 - Seamless L1-L2 (1370x920)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't3-slide-3',
      slideNumber: 3,
      thumbnailSvg: '/templates-thumbs/T03_L03.svg',
      component: Slide03T3B,
      slots: [
        { id: 't3_bg_seamless', label: 'Foto 01 - Fundo Panorâmico Seamless (5400x1350)', defaultPlaceholder: '' },
        { id: 't3_foto3_seamless', label: 'Foto 03 - Seamless L2-L3 (1500x1350)', defaultPlaceholder: '' },
        { id: 't3_foto6', label: 'Foto 06 - Central Sobreposta (500x370)', defaultPlaceholder: '' },
        { id: 't3_foto5_seamless', label: 'Foto 05 - Seamless L3-L4 (750x550)', defaultPlaceholder: '' },
        { id: 't3_foto7_seamless', label: 'Foto 07 - Panorâmica Seamless L3-L4-L5 (1670x1350)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't3-slide-4',
      slideNumber: 4,
      thumbnailSvg: '/templates-thumbs/T03_L04.svg',
      component: Slide04T3B,
      slots: [
        { id: 't3_bg_seamless', label: 'Foto 01 - Fundo Panorâmico Seamless (5400x1350)', defaultPlaceholder: '' },
        { id: 't3_foto7_seamless', label: 'Foto 07 - Panorâmica Seamless L3-L4-L5 (1670x1350)', defaultPlaceholder: '' },
        { id: 't3_foto5_seamless', label: 'Foto 05 - Seamless L3-L4 (750x550)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't3-slide-5',
      slideNumber: 5,
      thumbnailSvg: '/templates-thumbs/T03_L05.svg',
      component: Slide05T3B,
      slots: [
        { id: 't3_bg_seamless', label: 'Foto 01 - Fundo Panorâmico Seamless (5400x1350)', defaultPlaceholder: '' },
        { id: 't3_foto7_seamless', label: 'Foto 07 - Panorâmica Seamless L3-L4-L5 (1670x1350)', defaultPlaceholder: '' },
        { id: 't3_foto8', label: 'Foto 08 - Inferior Direita (757x545)', defaultPlaceholder: '' },
        { id: 't3_foto9', label: 'Foto 09 - Superior Direita (407x524)', defaultPlaceholder: '' }
      ]
    }
  ]
};
