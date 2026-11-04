'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 3b - Lâmina 2
 * Retângulos:
 * - t3b_bg_seamless: foto1_fundo panorâmica (5400x1350, L2: 1080 a 2160)
 * - t3b_foto3_seamless: 1500 x 1350 (left global 1080 -> L2: 0 a 1080, avança 420px na L3)
 * - t3b_foto4_seamless: 1370 x 920 (left global 791 -> L2: 0 a 1081px, offset -289px)
 */
export const Slide02T3B: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  const bgId = propSlots?.[0]?.id || 't3b_bg_seamless';
  const foto3Id = propSlots?.[1]?.id || 't3b_foto3_seamless';
  const foto4Id = propSlots?.[2]?.id || 't3b_foto4_seamless';

  const bgSeamless = slotsData[bgId] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto3Seamless = slotsData[foto3Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto4Seamless = slotsData[foto4Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Foto 1: Fundo Panorâmico Seamless (Parte 2 / 5: 1080 a 2160px) */}
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
            left: `${(-1080 / 1080) * 100}%`,
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

      {/* Foto 3: Seamless L2-L3 (Parte 1 na L2: 0 a 1080px) */}
      <div
        className="absolute left-0 top-0 w-full h-full z-10 overflow-hidden"
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(foto3Id);
        }}
      >
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${(1500 / 1080) * 100}%` }}
        >
          <InteractivePhotoSlot
            slotId={foto3Id}
            imageUrl={foto3Seamless.imageUrl}
            defaultPlaceholder=""
            adjustments={foto3Seamless.adjustments}
            isActive={activeSlotId === foto3Id}
            onSelectSlot={() => onSelectSlot(foto3Id)}
            onUpdateAdjustments={(adj) => onUpdateAdjustments(foto3Id, adj)}
            onPickImage={() => onPickImage(foto3Id)}
            isExport={isExport}
          />
        </div>
      </div>

      {/* Foto 4: Seamless L1-L2 Sobreposto (Parte 2 na L2: 0 a 1081px) */}
      <div
        className="absolute z-20 left-0 overflow-hidden"
        style={{
          filter: 'drop-shadow(10px 10px 15px rgba(0,0,0,0.5))',
          top: `${(214 / 1350) * 100}%`,
          width: `${(1081 / 1080) * 100}%`,
          height: `${(920 / 1350) * 100}%`
        }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(foto4Id);
        }}
      >
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${(-289 / 1081) * 100}%`,
            width: `${(1370 / 1081) * 100}%`
          }}
        >
          <InteractivePhotoSlot
            slotId={foto4Id}
            imageUrl={foto4Seamless.imageUrl}
            defaultPlaceholder=""
            adjustments={foto4Seamless.adjustments}
            isActive={activeSlotId === foto4Id}
            onSelectSlot={() => onSelectSlot(foto4Id)}
            onUpdateAdjustments={(adj) => onUpdateAdjustments(foto4Id, adj)}
            onPickImage={() => onPickImage(foto4Id)}
            isExport={isExport}
          />
        </div>
      </div>
    </div>
  );
};

