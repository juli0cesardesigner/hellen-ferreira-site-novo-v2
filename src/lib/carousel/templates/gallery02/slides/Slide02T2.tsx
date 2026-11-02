'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 2 - Lâmina 2
 * 2 retângulos:
 * 1º - 1080 x 740 alinhado ao bottom da lâmina (bottom: 0)
 * 2º - 870 x 590: o centro dele está alinhado ao topo superior do 1º retângulo
 *      (topo do 1º = 1350 - 740 = 610px do topo da lâmina; portanto centro do 2º em top: 610px, -translate-y-1/2)
 */
export const Slide02T2: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false
}) => {
  const baseSlot = slotsData['t2_s2_base'] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const overlaySlot = slotsData['t2_s2_overlay'] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* 1º Retângulo: 1080 x 740 alinhado ao bottom */}
      <div
        className="absolute left-0 bottom-0 w-full overflow-hidden"
        style={{
          height: `${(740 / 1350) * 100}%`
        }}
      >
        <InteractivePhotoSlot
          slotId="t2_s2_base"
          imageUrl={baseSlot.imageUrl}
          defaultPlaceholder="/images/hero-newborn.jpg"
          adjustments={baseSlot.adjustments}
          isActive={activeSlotId === 't2_s2_base'}
          onSelectSlot={() => onSelectSlot('t2_s2_base')}
          onUpdateAdjustments={(adj) => onUpdateAdjustments('t2_s2_base', adj)}
          onPickImage={() => onPickImage('t2_s2_base')}
          isExport={isExport}
        />
      </div>

      {/* 2º Retângulo: 870 x 590 ajustado para 130px do topo (top: 130px) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 overflow-hidden shadow-2xl ring-1 ring-black/5"
        style={{
          top: `${(130 / 1350) * 100}%`,
          width: `${(870 / 1080) * 100}%`,
          height: `${(590 / 1350) * 100}%`
        }}
      >
        <InteractivePhotoSlot
          slotId="t2_s2_overlay"
          imageUrl={overlaySlot.imageUrl}
          defaultPlaceholder="/images/hero-newborn.jpg"
          adjustments={overlaySlot.adjustments}
          isActive={activeSlotId === 't2_s2_overlay'}
          onSelectSlot={() => onSelectSlot('t2_s2_overlay')}
          onUpdateAdjustments={(adj) => onUpdateAdjustments('t2_s2_overlay', adj)}
          onPickImage={() => onPickImage('t2_s2_overlay')}
          isExport={isExport}
        />
      </div>
    </div>
  );
};

