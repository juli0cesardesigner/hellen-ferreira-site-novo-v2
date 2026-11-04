'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 3b - Lâmina 4
 * Retângulos:
 * - t3b_bg_seamless: foto1_fundo panorâmica (5400x1350, L4: 3240 a 4320)
 * - t3b_foto7_seamless: 1670 x 1350 (atravessa 100% da L4, offset -163px)
 * - t3b_foto5_seamless: 750 x 550 (finaliza aos 175px na L4, offset -575px)
 */
export const Slide04T3B: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  const bgId = propSlots?.[0]?.id || 't3b_bg_seamless';
  const foto7Id = propSlots?.[1]?.id || 't3b_foto7_seamless';
  const foto5Id = propSlots?.[2]?.id || 't3b_foto5_seamless';

  const bgSeamless = slotsData[bgId] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto7Seamless = slotsData[foto7Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto5Seamless = slotsData[foto5Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Foto 1: Fundo Panorâmico Seamless (Parte 4 / 5: 3240 a 4320px) */}
      <div
        className="absolute left-0 top-0 w-full h-full overflow-hidden"
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(bgId);
        }}
      >
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${(-3240 / 1080) * 100}%`,
            width: `${(5400 / 1080) * 100}%`
          }}
        >
          <InteractivePhotoSlot
            slotId={bgId}
            imageUrl={bgSeamless.imageUrl}
            defaultPlaceholder=""
            adjustments={bgSeamless.adjustments}
            isActive={activeSlotId === bgId}
            onSelectSlot={() => onSelectSlot(bgId)}
            onUpdateAdjustments={(adj) => onUpdateAdjustments(bgId, adj)}
            onPickImage={() => onPickImage(bgId)}
            isExport={isExport}
          />
        </div>
      </div>

      {/* Foto 7: Seamless L3-L4-L5 (Atravessa 100% da L4) */}
      <div
        className="absolute left-0 top-0 w-full h-full z-10 overflow-hidden"
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(foto7Id);
        }}
      >
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${(-163 / 1080) * 100}%`,
            width: `${(1670 / 1080) * 100}%`
          }}
        >
          <InteractivePhotoSlot
            slotId={foto7Id}
            imageUrl={foto7Seamless.imageUrl}
            defaultPlaceholder=""
            adjustments={foto7Seamless.adjustments}
            isActive={activeSlotId === foto7Id}
            onSelectSlot={() => onSelectSlot(foto7Id)}
            onUpdateAdjustments={(adj) => onUpdateAdjustments(foto7Id, adj)}
            onPickImage={() => onPickImage(foto7Id)}
            isExport={isExport}
          />
        </div>
      </div>

      {/* Foto 5: Seamless L3-L4 Superior (Finalização na L4: 0 a 175px) */}
      <div
        className="absolute z-20 left-0 overflow-hidden"
        style={{
          filter: 'drop-shadow(10px 10px 15px rgba(0,0,0,0.5))',
          top: `${(293 / 1350) * 100}%`,
          width: `${(175 / 1080) * 100}%`,
          height: `${(550 / 1350) * 100}%`
        }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(foto5Id);
        }}
      >
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${(-575 / 175) * 100}%`,
            width: `${(750 / 175) * 100}%`
          }}
        >
          <InteractivePhotoSlot
            slotId={foto5Id}
            imageUrl={foto5Seamless.imageUrl}
            defaultPlaceholder=""
            adjustments={foto5Seamless.adjustments}
            isActive={activeSlotId === foto5Id}
            onSelectSlot={() => onSelectSlot(foto5Id)}
            onUpdateAdjustments={(adj) => onUpdateAdjustments(foto5Id, adj)}
            onPickImage={() => onPickImage(foto5Id)}
            isExport={isExport}
          />
        </div>
      </div>
    </div>
  );
};

