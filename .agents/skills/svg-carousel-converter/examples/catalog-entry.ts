import { SlideDefinition } from '@/lib/carousel/types';
import { CatalogSlideItem } from '@/lib/carousel/templates/catalog';
import { SlideModelExample } from './template-component';

/**
 * Exemplo de definição de lâmina para inclusão no Catálogo e Modo Aleatório
 */
export const EXAMPLE_SLIDE_DEFINITION: SlideDefinition = {
  id: 'template-ex-slide-1',
  slideNumber: 1,
  title: 'Composição Modelo Superior + Card',
  thumbnailSvg: '/templates-thumbs/TEX_L01.svg',
  slots: [
    {
      id: 'ex_s1_foto1',
      label: 'Foto Superior (1080x675)',
      aspectRatio: '16:9'
    },
    {
      id: 'ex_s1_foto2',
      label: 'Card Central (780x650)',
      aspectRatio: '4:5'
    }
  ],
  component: SlideModelExample
};

/**
 * Exemplo de entrada a ser adicionada na constante CATALOG_SLIDES em:
 * src/lib/carousel/templates/catalog.ts
 */
export const EXAMPLE_CATALOG_ENTRY: CatalogSlideItem = {
  id: 'cat_tex_slide_1',
  templateName: 'Galeria Exemplo',
  slideNumber: 1,
  thumbnailSvg: EXAMPLE_SLIDE_DEFINITION.thumbnailSvg,
  slideDefinition: EXAMPLE_SLIDE_DEFINITION,
  // Se esta lâmina fizer par contínuo (seamless) com outra, preencha o ID correspondente:
  seamlessPairId: undefined // ex: 'cat_tex_slide_2'
};

