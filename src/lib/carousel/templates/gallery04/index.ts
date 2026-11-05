import { CarouselTemplate } from '../../types';
import { Slide01T4 } from './slides/Slide01T4';
import { Slide02T4 } from './slides/Slide02T4';
import { Slide03T4 } from './slides/Slide03T4';
import { Slide04T4 } from './slides/Slide04T4';
import { Slide05T4 } from './slides/Slide05T4';
import { Slide06T4 } from './slides/Slide06T4';
import { Slide07T4 } from './slides/Slide07T4';
import { Slide08T4 } from './slides/Slide08T4';
import { Slide09T4 } from './slides/Slide09T4';
import { Slide10T4 } from './slides/Slide10T4';

export const GALLERY_04_TEMPLATE: CarouselTemplate = {
  id: 'hellen-gallery-04',
  name: 'Galeria Visual 04 (Editorial Moderno)',
  description: 'Composição de 10 lâminas simétricas e modulares com mosaicos verticais, grids e molduras flutuantes.',
  slides: [
    {
      id: 't4-slide-1',
      slideNumber: 1,
      thumbnailSvg: '/templates-thumbs/T04_L01.svg',
      component: Slide01T4,
      slots: [
        { id: 't4_s1_f1', label: 'Foto 01 - Sup. Esq (540x675)', defaultPlaceholder: '' },
        { id: 't4_s1_f2', label: 'Foto 02 - Sup. Dir (540x675)', defaultPlaceholder: '' },
        { id: 't4_s1_f3', label: 'Foto 03 - Inf. Esq (540x675)', defaultPlaceholder: '' },
        { id: 't4_s1_f4', label: 'Foto 04 - Inf. Dir (540x675)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't4-slide-2',
      slideNumber: 2,
      thumbnailSvg: '/templates-thumbs/T04_L02.svg',
      component: Slide02T4,
      slots: [
        { id: 't4_s2_f1', label: 'Foto 01 - Esq. Linha 1 (440x337)', defaultPlaceholder: '' },
        { id: 't4_s2_f2', label: 'Foto 02 - Esq. Linha 2 (440x337)', defaultPlaceholder: '' },
        { id: 't4_s2_f3', label: 'Foto 03 - Esq. Linha 3 (440x337)', defaultPlaceholder: '' },
        { id: 't4_s2_f4', label: 'Foto 04 - Esq. Linha 4 (440x337)', defaultPlaceholder: '' },
        { id: 't4_s2_f5', label: 'Foto 05 - Coluna Direita (640x1350)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't4-slide-3',
      slideNumber: 3,
      thumbnailSvg: '/templates-thumbs/T04_L03.svg',
      component: Slide03T4,
      slots: [
        { id: 't4_s3_f1', label: 'Foto 01 - Faixa Superior (1080x350)', defaultPlaceholder: '' },
        { id: 't4_s3_f2', label: 'Foto 02 - Faixa Central (1080x350)', defaultPlaceholder: '' },
        { id: 't4_s3_f3', label: 'Foto 03 - Faixa Inferior (1080x650)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't4-slide-4',
      slideNumber: 4,
      thumbnailSvg: '/templates-thumbs/T04_L04.svg',
      component: Slide04T4,
      slots: [
        { id: 't4_s4_bg', label: 'Foto 01 - Fundo Total (1080x1350)', defaultPlaceholder: '' },
        { id: 't4_s4_card', label: 'Foto 02 - Moldura Central (790x1040)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't4-slide-5',
      slideNumber: 5,
      thumbnailSvg: '/templates-thumbs/T04_L05.svg',
      component: Slide05T4,
      slots: [
        { id: 't4_s5_f1', label: 'Foto 01 - Superior (1080x675)', defaultPlaceholder: '' },
        { id: 't4_s5_f2', label: 'Foto 02 - Inferior (1080x675)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't4-slide-6',
      slideNumber: 6,
      thumbnailSvg: '/templates-thumbs/T04_L06.svg',
      component: Slide06T4,
      slots: [
        { id: 't4_s6_f1', label: 'Foto 01 - Superior (1080x500)', defaultPlaceholder: '' },
        { id: 't4_s6_f2', label: 'Foto 02 - Inferior (1080x850)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't4-slide-7',
      slideNumber: 7,
      thumbnailSvg: '/templates-thumbs/T04_L07.svg',
      component: Slide07T4,
      slots: [
        { id: 't4_s7_f1', label: 'Foto 01 - Tela Cheia (1080x1350)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't4-slide-8',
      slideNumber: 8,
      thumbnailSvg: '/templates-thumbs/T04_L08.svg',
      component: Slide08T4,
      slots: [
        { id: 't4_s8_f1', label: 'Foto 01 - Superior (1080x850)', defaultPlaceholder: '' },
        { id: 't4_s8_f2', label: 'Foto 02 - Inferior (1080x500)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't4-slide-9',
      slideNumber: 9,
      thumbnailSvg: '/templates-thumbs/T04_L09.svg',
      component: Slide09T4,
      slots: [
        { id: 't4_s9_f1', label: 'Foto 01 - Faixa Superior (1080x650)', defaultPlaceholder: '' },
        { id: 't4_s9_f2', label: 'Foto 02 - Faixa Central (1080x350)', defaultPlaceholder: '' },
        { id: 't4_s9_f3', label: 'Foto 03 - Faixa Inferior (1080x350)', defaultPlaceholder: '' }
      ]
    },
    {
      id: 't4-slide-10',
      slideNumber: 10,
      thumbnailSvg: '/templates-thumbs/T04_L10.svg',
      component: Slide10T4,
      slots: [
        { id: 't4_s10_f1', label: 'Foto 01 - Coluna Esquerda (640x1350)', defaultPlaceholder: '' },
        { id: 't4_s10_f2', label: 'Foto 02 - Dir. Linha 1 (440x337)', defaultPlaceholder: '' },
        { id: 't4_s10_f3', label: 'Foto 03 - Dir. Linha 2 (440x337)', defaultPlaceholder: '' },
        { id: 't4_s10_f4', label: 'Foto 04 - Dir. Linha 3 (440x337)', defaultPlaceholder: '' },
        { id: 't4_s10_f5', label: 'Foto 05 - Dir. Linha 4 (440x337)', defaultPlaceholder: '' }
      ]
    }
  ]
};
