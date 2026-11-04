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
  isExport = false,
  slots: propSlots
}) => {
  const baseId = propSlots?.[0]?.id || 't2_s2_base';
  const overlayId = propSlots?.[1]?.id || 't2_s2_overlay';

  const baseSlot = slotsData[baseId] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const overlaySlot = slotsData[overlayId] || { adjustments: { zoom: 100, x: 50, y: 50 } };

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
          slotId={baseId}
          imageUrl={baseSlot.imageUrl}
          defaultPlaceholder=""
          adjustments={baseSlot.adjustments}
          isActive={activeSlotId === baseId}
          onSelectSlot={() => onSelectSlot(baseId)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(baseId, adj)}
          onPickImage={() => onPickImage(baseId)}
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
          slotId={overlayId}
          imageUrl={overlaySlot.imageUrl}
          defaultPlaceholder=""
          adjustments={overlaySlot.adjustments}
          isActive={activeSlotId === overlayId}
          onSelectSlot={() => onSelectSlot(overlayId)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(overlayId, adj)}
          onPickImage={() => onPickImage(overlayId)}
          isExport={isExport}
        />
      </div>
    </div>
  );
};

