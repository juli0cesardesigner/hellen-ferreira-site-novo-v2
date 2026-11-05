'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 4 - Lâmina 09
 * Triplo Horizontal Invertido (Espelho da Lâmina 03):
 * - Faixa 1 (Superior): 1080 x 650px (48.15%)
 * - Faixa 2 (Centro):   1080 x 350px (25.93%)
 * - Faixa 3 (Base):     1080 x 350px (25.93%)
 */
export const Slide09T4: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  const f1Id = propSlots?.[0]?.id || 't4_s9_f1';
  const f2Id = propSlots?.[1]?.id || 't4_s9_f2';
  const f3Id = propSlots?.[2]?.id || 't4_s9_f3';

  const f1 = slotsData[f1Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const f2 = slotsData[f2Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const f3 = slotsData[f3Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Faixa 1 (Superior Alta - 650px = 48.148%) */}
      <div
        className="absolute left-0 top-0 w-full overflow-hidden"
        style={{ height: `${(650 / 1350) * 100}%` }}
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

      {/* Faixa 2 (Centro Fina - 350px = 25.926%) */}
      <div
        className="absolute left-0 w-full overflow-hidden"
        style={{
          top: `${(650 / 1350) * 100}%`,
          height: `${(350 / 1350) * 100}%`
        }}
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

      {/* Faixa 3 (Base Fina - 350px = 25.926%) */}
      <div
        className="absolute left-0 bottom-0 w-full overflow-hidden"
        style={{ height: `${(350 / 1350) * 100}%` }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(f3Id);
        }}
      >
        <InteractivePhotoSlot
          slotId={f3Id}
          imageUrl={f3.imageUrl}
          defaultPlaceholder=""
          adjustments={f3.adjustments}
          isActive={activeSlotId === f3Id}
          onSelectSlot={() => onSelectSlot(f3Id)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(f3Id, adj)}
          onPickImage={() => onPickImage(f3Id)}
          isExport={isExport}
        />
      </div>
    </div>
  );
};
