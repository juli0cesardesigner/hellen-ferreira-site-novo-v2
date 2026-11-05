'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 4 - Lâmina 08
 * Duplo Horizontal Assimétrico Invertido (Espelho da Lâmina 06):
 * - Faixa 1 (Superior): 1080 x 850px (62.96%)
 * - Faixa 2 (Inferior): 1080 x 500px (37.04%)
 */
export const Slide08T4: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  const f1Id = propSlots?.[0]?.id || 't4_s8_f1';
  const f2Id = propSlots?.[1]?.id || 't4_s8_f2';

  const f1 = slotsData[f1Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const f2 = slotsData[f2Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Faixa Superior (850px = 62.963%) */}
      <div
        className="absolute left-0 top-0 w-full overflow-hidden"
        style={{ height: `${(850 / 1350) * 100}%` }}
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

      {/* Faixa Inferior (500px = 37.037%) */}
      <div
        className="absolute left-0 bottom-0 w-full overflow-hidden"
        style={{ height: `${(500 / 1350) * 100}%` }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(f2Id);
        }}
      >
        <InteractivePhotoSlot
          slotId={f2Id}
          imageUrl={f2.imageUrl}
          defaultPlaceholder=""
          adjustments={f2.adjustments}
          isActive={activeSlotId === f2Id}
          onSelectSlot={() => onSelectSlot(f2Id)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(f2Id, adj)}
          onPickImage={() => onPickImage(f2Id)}
          isExport={isExport}
        />
      </div>
    </div>
  );
};
