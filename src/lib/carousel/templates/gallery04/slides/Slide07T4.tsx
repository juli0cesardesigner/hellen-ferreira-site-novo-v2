'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 4 - Lâmina 07
 * Foto Tela Cheia (1080 x 1350px)
 */
export const Slide07T4: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  const f1Id = propSlots?.[0]?.id || 't4_s7_f1';
  const f1 = slotsData[f1Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(f1Id);
        }}
      >
        <InteractivePhotoSlot
          slotId={f1Id}
          imageUrl={f1.imageUrl}
          defaultPlaceholder=""
          adjustments={f1.adjustments}
          isActive={activeSlotId === f1Id}
          onSelectSlot={() => onSelectSlot(f1Id)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(f1Id, adj)}
          onPickImage={() => onPickImage(f1Id)}
          isExport={isExport}
        />
      </div>
    </div>
  );
};
