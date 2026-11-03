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
  isExport = false
}) => {
  const bgSeamless = slotsData['t3b_bg_seamless'] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto7Seamless = slotsData['t3b_foto7_seamless'] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto5Seamless = slotsData['t3b_foto5_seamless'] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Foto 1: Fundo Panorâmico Seamless (Parte 4 / 5: 3240 a 4320px) */}
      <div
        className="absolute left-0 top-0 w-full h-full overflow-hidden"
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot('t3b_bg_seamless');
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
            slotId="t3b_bg_seamless"
            imageUrl={bgSeamless.imageUrl}
            defaultPlaceholder=""
            adjustments={bgSeamless.adjustments}
            isActive={activeSlotId === 't3b_bg_seamless'}
            onSelectSlot={() => onSelectSlot('t3b_bg_seamless')}
            onUpdateAdjustments={(adj) => onUpdateAdjustments('t3b_bg_seamless', adj)}
            onPickImage={() => onPickImage('t3b_bg_seamless')}
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
          onSelectSlot('t3b_foto7_seamless');
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
            slotId="t3b_foto7_seamless"
            imageUrl={foto7Seamless.imageUrl}
            defaultPlaceholder=""
            adjustments={foto7Seamless.adjustments}
            isActive={activeSlotId === 't3b_foto7_seamless'}
            onSelectSlot={() => onSelectSlot('t3b_foto7_seamless')}
            onUpdateAdjustments={(adj) => onUpdateAdjustments('t3b_foto7_seamless', adj)}
            onPickImage={() => onPickImage('t3b_foto7_seamless')}
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
          onSelectSlot('t3b_foto5_seamless');
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
            slotId="t3b_foto5_seamless"
            imageUrl={foto5Seamless.imageUrl}
            defaultPlaceholder=""
            adjustments={foto5Seamless.adjustments}
            isActive={activeSlotId === 't3b_foto5_seamless'}
            onSelectSlot={() => onSelectSlot('t3b_foto5_seamless')}
            onUpdateAdjustments={(adj) => onUpdateAdjustments('t3b_foto5_seamless', adj)}
            onPickImage={() => onPickImage('t3b_foto5_seamless')}
            isExport={isExport}
          />
        </div>
      </div>
    </div>
  );
};

