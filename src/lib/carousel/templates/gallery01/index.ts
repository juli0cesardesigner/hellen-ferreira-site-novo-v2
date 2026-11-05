import { CarouselTemplate } from '../../types';
import { Slide01 } from './slides/Slide01';
import { Slide02 } from './slides/Slide02';
import { Slide03 } from './slides/Slide03';
import { Slide04 } from './slides/Slide04';
import { Slide05 } from './slides/Slide05';

export const GALLERY_01_TEMPLATE: CarouselTemplate = {
  id: 'hellen-gallery-01',
  name: 'Galeria Visual 01',
  description: 'Composições focadas puramente na fotografia.',
  slides: [
    {
      id: 'slide-1',
      slideNumber: 1,
      thumbnailSvg: '/templates-thumbs/T01_L01.svg',
      component: Slide01,
      slots: [
        { id: 's1_r1', label: 'Foto 01 (Sup. Esq)', defaultPlaceholder: '' },
        { id: 's1_r2', label: 'Foto 02 (Sup. Dir)', defaultPlaceholder: '' },
        { id: 's1_r3', label: 'Foto 03 (Inf. Esq)', defaultPlaceholder: '' },
        { id: 's1_r4', label: 'Foto 04 (Inf. Dir)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 'slide-2',
      slideNumber: 2,
      thumbnailSvg: '/templates-thumbs/T01_L02.svg',
      component: Slide02,
      slots: [
        { id: 's2_top', label: 'Foto 05 (Superior)', defaultPlaceholder: '' },
        { id: 's2_bottom', label: 'Foto 06 (Inferior)', defaultPlaceholder: '' },
        { id: 's2_polaroid', label: 'Foto 07 (Centro Polaroid)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 'slide-3',
      slideNumber: 3,
      thumbnailSvg: '/templates-thumbs/T01_L03.svg',
      component: Slide03,
      slots: [
        { id: 's3_top', label: 'Foto 08 (Superior)', defaultPlaceholder: '' },
        { id: 's3_center', label: 'Foto 09 (Centro)', defaultPlaceholder: '' },
        { id: 's3_bottom', label: 'Foto 10 (Inferior)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 'slide-4',
      slideNumber: 4,
      thumbnailSvg: '/templates-thumbs/T01_L04.svg',
      component: Slide04,
      slots: [
        { id: 's4_slot1', label: 'Foto 11 (Retângulo Central)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 'slide-5',
      slideNumber: 5,
      thumbnailSvg: '/templates-thumbs/T01_L05.svg',
      component: Slide05,
      slots: [
        { id: 's5_slot1', label: 'Foto 12 (Retângulo Central)', defaultPlaceholder: '' }
      ]
    }
  ]
};
