import { CarouselTemplate } from '../../types';
import { Slide01 } from './slides/Slide01';
import { Slide02 } from './slides/Slide02';
import { Slide03 } from './slides/Slide03';

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
        { id: 's1_r1', label: 'Retângulo 1 (Sup. Esq)', defaultPlaceholder: '/images/hero-newborn.jpg' },
        { id: 's1_r2', label: 'Retângulo 2 (Sup. Dir)', defaultPlaceholder: '/images/hero-newborn.jpg' },
        { id: 's1_r3', label: 'Retângulo 3 (Inf. Esq)', defaultPlaceholder: '/images/hero-newborn.jpg' },
        { id: 's1_r4', label: 'Retângulo 4 (Inf. Dir)', defaultPlaceholder: '/images/hero-newborn.jpg' }
      ]
    },
    {
      id: 'slide-2',
      slideNumber: 2,
      thumbnailSvg: '/templates-thumbs/T01_L02.svg',
      component: Slide02,
      slots: [
        { id: 's2_top', label: 'Foto 1 (Superior)', defaultPlaceholder: '/images/hero-newborn.jpg' },
        { id: 's2_bottom', label: 'Foto 2 (Inferior)', defaultPlaceholder: '/images/hero-newborn.jpg' },
        { id: 's2_polaroid', label: 'Foto Polaroid (Centro)', defaultPlaceholder: '/images/hero-newborn.jpg' }
      ]
    },
    {
      id: 'slide-3',
      slideNumber: 3,
      thumbnailSvg: '/templates-thumbs/T01_L03.svg',
      component: Slide03,
      slots: [
        { id: 's3_top', label: 'Foto 1 (Superior)', defaultPlaceholder: '/images/hero-newborn.jpg' },
        { id: 's3_center', label: 'Foto 2 (Centro)', defaultPlaceholder: '/images/hero-newborn.jpg' },
        { id: 's3_bottom', label: 'Foto 3 (Inferior)', defaultPlaceholder: '/images/hero-newborn.jpg' }
      ]
    }
  ]
};
