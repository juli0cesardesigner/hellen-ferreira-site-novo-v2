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
        { id: 't2_s1_left', label: 'Retângulo Esquerdo (300x620)', defaultPlaceholder: '/images/hero-newborn.jpg' },
        { id: 't2_s1_center', label: 'Retângulo Central (412x835)', defaultPlaceholder: '/images/hero-newborn.jpg' },
        { id: 't2_s1_right', label: 'Retângulo Direito (300x620)', defaultPlaceholder: '/images/hero-newborn.jpg' }
      ]
    },
    {
      id: 't2-slide-2',
      slideNumber: 2,
      thumbnailSvg: '/templates-thumbs/T02_L02.svg',
      component: Slide02T2,
      slots: [
        { id: 't2_s2_base', label: 'Retângulo Base (1080x740)', defaultPlaceholder: '/images/hero-newborn.jpg' },
        { id: 't2_s2_overlay', label: 'Retângulo Sobreposto (870x590)', defaultPlaceholder: '/images/hero-newborn.jpg' }
      ]
    },
    {
      id: 't2-slide-3',
      slideNumber: 3,
      thumbnailSvg: '/templates-thumbs/T02_L03.svg',
      component: Slide03T2,
      slots: [
        { id: 't2_s3_rect', label: 'Retângulo Superior (490x690)', defaultPlaceholder: '/images/hero-newborn.jpg' },
        { id: 't2_seamless', label: 'Foto Contínua Seamless (860x1350)', defaultPlaceholder: '/images/hero-newborn.jpg' }
      ]
    },
    {
      id: 't2-slide-4',
      slideNumber: 4,
      thumbnailSvg: '/templates-thumbs/T02_L04.svg',
      component: Slide04T2,
      slots: [
        { id: 't2_seamless', label: 'Foto Contínua Seamless (860x1350)', defaultPlaceholder: '/images/hero-newborn.jpg' },
        { id: 't2_s4_rect', label: 'Retângulo Inferior (710x970)', defaultPlaceholder: '/images/hero-newborn.jpg' }
      ]
    }
  ]
};

