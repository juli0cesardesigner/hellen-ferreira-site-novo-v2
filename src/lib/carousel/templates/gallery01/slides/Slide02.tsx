'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

export const Slide02: React.FC<SlideProps> = ({
  aspectRatio = '4:5',
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false
}) => {
  const topSlot = slotsData['s2_top'] || {
    id: 's2_top',
    label: 'Foto 1 (Superior)',
    adjustments: { zoom: 100, x: 50, y: 50 }
  };

  const bottomSlot = slotsData['s2_bottom'] || {
    id: 's2_bottom',
    label: 'Foto 2 (Inferior)',
    adjustments: { zoom: 100, x: 50, y: 50 }
  };

  const polaroidSlot = slotsData['s2_polaroid'] || {
    id: 's2_polaroid',
    label: 'Foto Polaroid (Centro)',
    adjustments: { zoom: 100, x: 50, y: 50 }
  };

  /*
    Lâmina 2:
    - Dividida ao meio horizontalmente:
      * Foto 1 em cima: 100% largura x 50% altura
      * Foto 2 embaixo: 100% largura x 50% altura
    - No meio: estilo foto polaroid:
      * Fundo: 545px largura x 425px altura
        - Em 4:5 (1080x1350): largura 545/1080 = 50.462963%, altura 425/1350 = 31.481481%
        - Em 9:16 (1080x1920): largura 545/1080 = 50.462963%, altura 425/1920 = 22.135417%
      * Área da foto: 490px largura x 315px altura
      * Bordas:
        - Top: 27.5px (27.5 / 425 = 6.470588%)
        - Esquerda: 27.5px (27.5 / 545 = 5.045872%)
        - Direita: 27.5px (27.5 / 545 = 5.045872%)
        - Bottom: 82.5px (82.5 / 425 = 19.411765%)
    - Sombra sob o card:
      * Duplicata da polaroid central, levemente maior (scale 1.06),
        desfocada (blur), com mesclagem multiply (mix-blend-multiply) e 40% de opacidade.
  */
  const isStories = aspectRatio === '9:16';

  return (
    <div className="w-full h-full relative overflow-hidden bg-white flex flex-col">
      {/* Metade Superior: Foto 1 */}
      <div className="w-full h-1/2 relative overflow-hidden">
        <InteractivePhotoSlot
          slotId="s2_top"
          imageUrl={topSlot.imageUrl}
          defaultPlaceholder="/images/hero-newborn.jpg"
          adjustments={topSlot.adjustments}
          isActive={activeSlotId === 's2_top'}
          onSelectSlot={() => onSelectSlot('s2_top')}
          onUpdateAdjustments={(adj) => onUpdateAdjustments('s2_top', adj)}
          onPickImage={() => onPickImage('s2_top')}
          isExport={isExport}
        />
      </div>

      {/* Metade Inferior: Foto 2 */}
      <div className="w-full h-1/2 relative overflow-hidden">
        <InteractivePhotoSlot
          slotId="s2_bottom"
          imageUrl={bottomSlot.imageUrl}
          defaultPlaceholder="/images/hero-newborn.jpg"
          adjustments={bottomSlot.adjustments}
          isActive={activeSlotId === 's2_bottom'}
          onSelectSlot={() => onSelectSlot('s2_bottom')}
          onUpdateAdjustments={(adj) => onUpdateAdjustments('s2_bottom', adj)}
          onPickImage={() => onPickImage('s2_bottom')}
          isExport={isExport}
        />
      </div>

      {/* Glow Ambiente da Polaroid (Backdrop Glow fiel ao CSS: filter: blur(40px) saturate(1.8); scale: 1.1) */}
      {/* Dimensão e alinhamento idênticos à janela interna da foto da Polaroid */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none select-none scale-110 overflow-hidden"
        style={{
          width: `${(490 / 1080) * 100}%`,
          height: isStories
            ? `${(315 / 1920) * 100}%`
            : `${(315 / 1350) * 100}%`,
          marginTop: isStories
            ? `${(-27.5 / 1920) * 100}%`
            : `${(-27.5 / 1350) * 100}%`,
          filter: 'blur(40px) saturate(1.8)'
        }}
      >
        <div
          className="w-full h-full"
          style={{
            transform: `scale(${polaroidSlot.adjustments.zoom / 100}) translate(${50 - polaroidSlot.adjustments.x}%, ${50 - polaroidSlot.adjustments.y}%)`,
            transformOrigin: 'center center'
          }}
        >
          <img
            src={polaroidSlot.imageUrl || '/images/hero-newborn.jpg'}
            alt=""
            draggable={false}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* No Meio: Card Central Estilo Polaroid (Sem box-shadow tradicional) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white rounded-[2px]"
        style={{
          width: `${(545 / 1080) * 100}%`,
          height: isStories
            ? `${(425 / 1920) * 100}%`
            : `${(425 / 1350) * 100}%`
        }}
      >
        <div
          className="absolute overflow-hidden"
          style={{
            top: `${(27.5 / 425) * 100}%`,
            left: `${(27.5 / 545) * 100}%`,
            right: `${(27.5 / 545) * 100}%`,
            bottom: `${(82.5 / 425) * 100}%`
          }}
        >
          <InteractivePhotoSlot
            slotId="s2_polaroid"
            imageUrl={polaroidSlot.imageUrl}
            defaultPlaceholder="/images/hero-newborn.jpg"
            adjustments={polaroidSlot.adjustments}
            isActive={activeSlotId === 's2_polaroid'}
            onSelectSlot={() => onSelectSlot('s2_polaroid')}
            onUpdateAdjustments={(adj) => onUpdateAdjustments('s2_polaroid', adj)}
            onPickImage={() => onPickImage('s2_polaroid')}
            isExport={isExport}
          />
        </div>
      </div>
    </div>
  );
};
