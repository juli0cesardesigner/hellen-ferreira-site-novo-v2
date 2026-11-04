'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

export const Slide03: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  const slots = [
    { id: propSlots?.[0]?.id || 's3_top', label: propSlots?.[0]?.label || 'Foto 1 (Superior)' },
    { id: propSlots?.[1]?.id || 's3_center', label: propSlots?.[1]?.label || 'Foto 2 (Centro)' },
    { id: propSlots?.[2]?.id || 's3_bottom', label: propSlots?.[2]?.label || 'Foto 3 (Inferior)' }
  ];

  /*
    Lâmina 3:
    - Dividida em 3 partes iguais horizontalmente (3 faixas empilhadas):
      * Cada faixa ocupa 100% da largura e 33.333% da altura (h-1/3)
      * No canvas 1080x1350: cada foto tem 1080px largura x 450px altura
  */
  return (
    <div className="w-full h-full relative overflow-hidden bg-white flex flex-col">
      {slots.map((slot) => {
        const data = slotsData[slot.id] || {
          id: slot.id,
          label: slot.label,
          adjustments: { zoom: 100, x: 50, y: 50 }
        };

        return (
          <div key={slot.id} className="w-full h-1/3 relative overflow-hidden">
            <InteractivePhotoSlot
              slotId={slot.id}
              imageUrl={data.imageUrl}
              defaultPlaceholder=""
              adjustments={data.adjustments}
              isActive={activeSlotId === slot.id}
              onSelectSlot={() => onSelectSlot(slot.id)}
              onUpdateAdjustments={(adj) => onUpdateAdjustments(slot.id, adj)}
              onPickImage={() => onPickImage(slot.id)}
              isExport={isExport}
            />
          </div>
        );
      })}
    </div>
  );
};
