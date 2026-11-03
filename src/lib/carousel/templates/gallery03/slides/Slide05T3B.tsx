'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 3b - Lâmina 5
 * Retângulos:
 * - t3b_bg_seamless: foto1_fundo panorâmica (5400x1350, L5: 4320 a 5400)
 * - t3b_foto7_seamless: 1670 x 1350 (finaliza aos 427px na L5, offset -1243px)
 * - t3b_foto8: 757 x 545 (left 148, top 603)
 * - t3b_foto9: 407 x 524 (left 593, top 242)
 */
export const Slide05T3B: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false
}) => {
  const bgSeamless = slotsData['t3b_bg_seamless'] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto7Seamless = slotsData['t3b_foto7_seamless'] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto8 = slotsData['t3b_foto8'] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto9 = slotsData['t3b_foto9'] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Foto 1: Fundo Panorâmico Seamless (Parte 5 / 5: 4320 a 5400px) */}
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
            left: `${(-4320 / 1080) * 100}%`,
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

      {/* Foto 7: Seamless L3-L4-L5 (Finalização na L5: 0 a 427px) */}
      <div
        className="absolute left-0 top-0 h-full z-10 overflow-hidden"
        style={{ width: `${(427 / 1080) * 100}%` }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot('t3b_foto7_seamless');
        }}
      >
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${(-1243 / 427) * 100}%`,
            width: `${(1670 / 427) * 100}%`
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

      {/* Foto 8: Inferior Direita (757 x 545, x: 148, y: 603) */}
      <div
        className="absolute z-20 overflow-hidden"
        style={{
          filter: 'drop-shadow(10px 10px 15px rgba(0,0,0,0.5))',
          left: `${(148 / 1080) * 100}%`,
          top: `${(603 / 1350) * 100}%`,
          width: `${(757 / 1080) * 100}%`,
          height: `${(545 / 1350) * 100}%`
        }}
      >
        <InteractivePhotoSlot
          slotId="t3b_foto8"
          imageUrl={foto8.imageUrl}
          defaultPlaceholder=""
          adjustments={foto8.adjustments}
          isActive={activeSlotId === 't3b_foto8'}
          onSelectSlot={() => onSelectSlot('t3b_foto8')}
          onUpdateAdjustments={(adj) => onUpdateAdjustments('t3b_foto8', adj)}
          onPickImage={() => onPickImage('t3b_foto8')}
          isExport={isExport}
        />
      </div>

      {/* Foto 9: Superior Direita (407 x 524, x: 593, y: 242) */}
      <div
        className="absolute z-30 overflow-hidden"
        style={{
          filter: 'drop-shadow(10px 10px 15px rgba(0,0,0,0.5))',
          left: `${(593 / 1080) * 100}%`,
          top: `${(242 / 1350) * 100}%`,
          width: `${(407 / 1080) * 100}%`,
          height: `${(524 / 1350) * 100}%`
        }}
      >
        <InteractivePhotoSlot
          slotId="t3b_foto9"
          imageUrl={foto9.imageUrl}
          defaultPlaceholder=""
          adjustments={foto9.adjustments}
          isActive={activeSlotId === 't3b_foto9'}
          onSelectSlot={() => onSelectSlot('t3b_foto9')}
          onUpdateAdjustments={(adj) => onUpdateAdjustments('t3b_foto9', adj)}
          onPickImage={() => onPickImage('t3b_foto9')}
          isExport={isExport}
        />
      </div>
    </div>
  );
};

