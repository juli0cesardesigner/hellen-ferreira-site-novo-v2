'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 2 - Lâmina 1
 * 3 retângulos alinhados horizontalmente (altura centralizada na lâmina de 1080 x 1350)
 * - Esquerda: 300 x 620 colado à esquerda da lâmina (left: 0)
 * - Central:   412 x 835 centralizado na lâmina (left: 50%, top: 50%)
 * - Direita:  300 x 620 colado à direita da lâmina (right: 0)
 */
export const Slide01T2: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  const leftId = propSlots?.[0]?.id || 't2_s1_left';
  const centerId = propSlots?.[1]?.id || 't2_s1_center';
  const rightId = propSlots?.[2]?.id || 't2_s1_right';

  const leftSlot = slotsData[leftId] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const centerSlot = slotsData[centerId] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const rightSlot = slotsData[rightId] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Esquerda: 300 x 620 colado à esquerda da lâmina */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 overflow-hidden"
        style={{
          width: `${(300 / 1080) * 100}%`,
          height: `${(620 / 1350) * 100}%`
        }}
      >
        <InteractivePhotoSlot
          slotId={leftId}
          imageUrl={leftSlot.imageUrl}
          defaultPlaceholder=""
          adjustments={leftSlot.adjustments}
          isActive={activeSlotId === leftId}
          onSelectSlot={() => onSelectSlot(leftId)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(leftId, adj)}
          onPickImage={() => onPickImage(leftId)}
          isExport={isExport}
        />
      </div>

      {/* Central: 412 x 835 centralizado na lâmina */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={{
          width: `${(412 / 1080) * 100}%`,
          height: `${(835 / 1350) * 100}%`
        }}
      >
        <InteractivePhotoSlot
          slotId={centerId}
          imageUrl={centerSlot.imageUrl}
          defaultPlaceholder=""
          adjustments={centerSlot.adjustments}
          isActive={activeSlotId === centerId}
          onSelectSlot={() => onSelectSlot(centerId)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(centerId, adj)}
          onPickImage={() => onPickImage(centerId)}
          isExport={isExport}
        />
      </div>

      {/* Direita: 300 x 620 colado à direita da lâmina */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 overflow-hidden"
        style={{
          width: `${(300 / 1080) * 100}%`,
          height: `${(620 / 1350) * 100}%`
        }}
      >
        <InteractivePhotoSlot
          slotId={rightId}
          imageUrl={rightSlot.imageUrl}
          defaultPlaceholder=""
          adjustments={rightSlot.adjustments}
          isActive={activeSlotId === rightId}
          onSelectSlot={() => onSelectSlot(rightId)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(rightId, adj)}
          onPickImage={() => onPickImage(rightId)}
          isExport={isExport}
        />
      </div>
    </div>
  );
};

