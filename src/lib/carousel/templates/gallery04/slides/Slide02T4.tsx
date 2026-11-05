'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 4 - Lâmina 02
 * Coluna Esquerda: 4 fotos verticais empilhadas (440x337.5px cada)
 * Coluna Direita:  1 foto vertical inteira (640x1350px)
 */
export const Slide02T4: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  const f1Id = propSlots?.[0]?.id || 't4_s2_f1';
  const f2Id = propSlots?.[1]?.id || 't4_s2_f2';
  const f3Id = propSlots?.[2]?.id || 't4_s2_f3';
  const f4Id = propSlots?.[3]?.id || 't4_s2_f4';
  const f5Id = propSlots?.[4]?.id || 't4_s2_f5';

  const f1 = slotsData[f1Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const f2 = slotsData[f2Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const f3 = slotsData[f3Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const f4 = slotsData[f4Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const f5 = slotsData[f5Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Coluna Esquerda - 4 fotos empilhadas (440 / 1080 = 40.741%) */}
      {/* Foto 01: Topo (0 a 337.5px = 25%) */}
      <div
        className="absolute left-0 top-0 overflow-hidden"
        style={{
          width: `${(440 / 1080) * 100}%`,
          height: '25%'
        }}
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

      {/* Foto 02: 2ª linha (25% a 50%) */}
      <div
        className="absolute left-0 top-1/4 overflow-hidden"
        style={{
          width: `${(440 / 1080) * 100}%`,
          height: '25%'
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

      {/* Foto 03: 3ª linha (50% a 75%) */}
      <div
        className="absolute left-0 top-2/4 overflow-hidden"
        style={{
          width: `${(440 / 1080) * 100}%`,
          height: '25%'
        }}
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

      {/* Foto 04: Base (75% a 100%) */}
      <div
        className="absolute left-0 top-3/4 overflow-hidden"
        style={{
          width: `${(440 / 1080) * 100}%`,
          height: '25%'
        }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(f4Id);
        }}
      >
        <InteractivePhotoSlot
          slotId={f4Id}
          imageUrl={f4.imageUrl}
          defaultPlaceholder=""
          adjustments={f4.adjustments}
          isActive={activeSlotId === f4Id}
          onSelectSlot={() => onSelectSlot(f4Id)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(f4Id, adj)}
          onPickImage={() => onPickImage(f4Id)}
          isExport={isExport}
        />
      </div>

      {/* Coluna Direita - Foto 05 inteira (640 / 1080 = 59.259%) */}
      <div
        className="absolute top-0 right-0 overflow-hidden"
        style={{
          width: `${(640 / 1080) * 100}%`,
          height: '100%'
        }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(f5Id);
        }}
      >
        <InteractivePhotoSlot
          slotId={f5Id}
          imageUrl={f5.imageUrl}
          defaultPlaceholder=""
          adjustments={f5.adjustments}
          isActive={activeSlotId === f5Id}
          onSelectSlot={() => onSelectSlot(f5Id)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(f5Id, adj)}
          onPickImage={() => onPickImage(f5Id)}
          isExport={isExport}
        />
      </div>
    </div>
  );
};
