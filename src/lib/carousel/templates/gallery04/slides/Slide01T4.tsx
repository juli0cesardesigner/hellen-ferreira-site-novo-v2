'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 4 - Lâmina 01
 * Grade 2x2 Simétrica (4 fotos de 540x675px)
 */
export const Slide01T4: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  const f1Id = propSlots?.[0]?.id || 't4_s1_f1';
  const f2Id = propSlots?.[1]?.id || 't4_s1_f2';
  const f3Id = propSlots?.[2]?.id || 't4_s1_f3';
  const f4Id = propSlots?.[3]?.id || 't4_s1_f4';

  const f1 = slotsData[f1Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const f2 = slotsData[f2Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const f3 = slotsData[f3Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const f4 = slotsData[f4Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Foto 01: Topo Esquerda (540x675) */}
      <div
        className="absolute left-0 top-0 overflow-hidden"
        style={{
          width: '50%',
          height: '50%'
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

      {/* Foto 02: Topo Direita (540x675) */}
      <div
        className="absolute left-1/2 top-0 overflow-hidden"
        style={{
          width: '50%',
          height: '50%'
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

      {/* Foto 03: Base Esquerda (540x675) */}
      <div
        className="absolute left-0 top-1/2 overflow-hidden"
        style={{
          width: '50%',
          height: '50%'
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

      {/* Foto 04: Base Direita (540x675) */}
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden"
        style={{
          width: '50%',
          height: '50%'
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
    </div>
  );
};
