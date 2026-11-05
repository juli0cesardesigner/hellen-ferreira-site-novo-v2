'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 4 - Lâmina 04
 * Foto de Fundo Total (1080x1350px) + Moldura Central Flutuante (790x1040px)
 */
export const Slide04T4: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  const bgId = propSlots?.[0]?.id || 't4_s4_bg';
  const cardId = propSlots?.[1]?.id || 't4_s4_card';

  const bgSlot = slotsData[bgId] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const cardSlot = slotsData[cardId] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Foto 01: Fundo Total (1080 x 1350) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(bgId);
        }}
      >
        <InteractivePhotoSlot
          slotId={bgId}
          imageUrl={bgSlot.imageUrl}
          defaultPlaceholder=""
          adjustments={bgSlot.adjustments}
          isActive={activeSlotId === bgId}
          onSelectSlot={() => onSelectSlot(bgId)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(bgId, adj)}
          onPickImage={() => onPickImage(bgId)}
          isExport={isExport}
        />
      </div>

      {/* Foto 02: Moldura Central Sobreposta com Drop-Shadow Seguro (790 x 1040) */}
      <div
        className="absolute z-10"
        style={{
          left: `${(145 / 1080) * 100}%`,
          top: `${(155 / 1350) * 100}%`,
          width: `${(790 / 1080) * 100}%`,
          height: `${(1040 / 1350) * 100}%`,
          filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.35))'
        }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(cardId);
        }}
      >
        <div className="w-full h-full overflow-hidden bg-white">
          <InteractivePhotoSlot
            slotId={cardId}
            imageUrl={cardSlot.imageUrl}
            defaultPlaceholder=""
            adjustments={cardSlot.adjustments}
            isActive={activeSlotId === cardId}
            onSelectSlot={() => onSelectSlot(cardId)}
            onUpdateAdjustments={(adj) => onUpdateAdjustments(cardId, adj)}
            onPickImage={() => onPickImage(cardId)}
            isExport={isExport}
          />
        </div>
      </div>
    </div>
  );
};
