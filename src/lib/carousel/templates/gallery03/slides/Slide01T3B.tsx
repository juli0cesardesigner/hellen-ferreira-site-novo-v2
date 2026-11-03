'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 3b - Lâmina 1
 * Retângulos:
 * - t3b_bg_seamless: foto1_fundo panorâmica (5400x1350, L1: 0 a 1080)
 * - t3b_foto2: 880 x 1350 (left: 0, top: 0)
 * - t3b_foto4_seamless: 1370 x 920 (left global 791, top 214)
 *   Na Lâmina 1: ocupa de 791 a 1080 (largura visível: 289px)
 */
export const Slide01T3B: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false
}) => {
  const bgSeamless = slotsData['t3b_bg_seamless'] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto2 = slotsData['t3b_foto2'] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto4Seamless = slotsData['t3b_foto4_seamless'] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Foto 1: Fundo Panorâmico Seamless (Parte 1 / 5: 0 a 1080px) */}
      <div
        className="absolute left-0 top-0 w-full h-full overflow-hidden"
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot('t3b_bg_seamless');
        }}
      >
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${(5400 / 1080) * 100}%` }}
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

      {/* Foto 2: 880 x 1350 */}
      <div
        className="absolute left-0 top-0 z-10 overflow-hidden"
        style={{
          width: `${(880 / 1080) * 100}%`,
          height: '100%'
        }}
      >
        <InteractivePhotoSlot
          slotId="t3b_foto2"
          imageUrl={foto2.imageUrl}
          defaultPlaceholder=""
          adjustments={foto2.adjustments}
          isActive={activeSlotId === 't3b_foto2'}
          onSelectSlot={() => onSelectSlot('t3b_foto2')}
          onUpdateAdjustments={(adj) => onUpdateAdjustments('t3b_foto2', adj)}
          onPickImage={() => onPickImage('t3b_foto2')}
          isExport={isExport}
        />
      </div>

      {/* Foto 4: Seamless L1-L2 (Parte 1 na L1: 791 a 1080 -> 289px) */}
      <div
        className="absolute z-20 overflow-hidden"
        style={{
          filter: 'drop-shadow(10px 10px 15px rgba(0,0,0,0.5))',
          left: `${(791 / 1080) * 100}%`,
          top: `${(214 / 1350) * 100}%`,
          width: `${(289 / 1080) * 100}%`,
          height: `${(920 / 1350) * 100}%`
        }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot('t3b_foto4_seamless');
        }}
      >
        <div
          className="absolute top-0 h-full"
          style={{
            left: 0,
            width: `${(1370 / 289) * 100}%`
          }}
        >
          <InteractivePhotoSlot
            slotId="t3b_foto4_seamless"
            imageUrl={foto4Seamless.imageUrl}
            defaultPlaceholder=""
            adjustments={foto4Seamless.adjustments}
            isActive={activeSlotId === 't3b_foto4_seamless'}
            onSelectSlot={() => onSelectSlot('t3b_foto4_seamless')}
            onUpdateAdjustments={(adj) => onUpdateAdjustments('t3b_foto4_seamless', adj)}
            onPickImage={() => onPickImage('t3b_foto4_seamless')}
            isExport={isExport}
          />
        </div>
      </div>
    </div>
  );
};

