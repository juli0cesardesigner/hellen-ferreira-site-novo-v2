import { CarouselTemplate } from '../../types';
import { Slide01T2 } from './slides/Slide01T2';
import { Slide02T2 } from './slides/Slide02T2';
import { Slide03T2 } from './slides/Slide03T2';
import { Slide04T2 } from './slides/Slide04T2';

export const GALLERY_02_TEMPLATE: CarouselTemplate = {
  id: 'hellen-gallery-02',
  name: 'Galeria Visual 02 (Seamless)',
  description: 'Composição de 4 lâminas com foto contínua (seamless) entre as lâminas 3 e 4.',
  slides: [
    {
      id: 't2-slide-1',
      slideNumber: 1,
      thumbnailSvg: '/templates-thumbs/T02_L01.svg',
      component: Slide01T2,
      slots: [
        { id: 't2_s1_left', label: 'Foto 01 (Esquerda)', defaultPlaceholder: '' },
        { id: 't2_s1_center', label: 'Foto 02 (Central)', defaultPlaceholder: '' },
        { id: 't2_s1_right', label: 'Foto 03 (Direita)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't2-slide-2',
      slideNumber: 2,
      thumbnailSvg: '/templates-thumbs/T02_L02.svg',
      component: Slide02T2,
      slots: [
        { id: 't2_s2_base', label: 'Foto 04 (Base)', defaultPlaceholder: '' },
        { id: 't2_s2_overlay', label: 'Foto 05 (Sobreposta)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't2-slide-3',
      slideNumber: 3,
      thumbnailSvg: '/templates-thumbs/T02_L03.svg',
      component: Slide03T2,
      slots: [
        { id: 't2_s3_rect', label: 'Foto 06 (Superior)', defaultPlaceholder: '' },
        { id: 't2_seamless', label: 'Foto 07 (Seamless L3-L4)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't2-slide-4',
      slideNumber: 4,
      thumbnailSvg: '/templates-thumbs/T02_L04.svg',
      component: Slide04T2,
      slots: [
        { id: 't2_seamless', label: 'Foto 07 (Seamless L3-L4)', defaultPlaceholder: '' },
        { id: 't2_s4_rect', label: 'Foto 08 (Inferior)', defaultPlaceholder: '' }
      ]
    }
  ]
};
