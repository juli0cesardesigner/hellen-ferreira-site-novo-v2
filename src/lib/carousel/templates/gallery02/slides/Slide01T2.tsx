'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 2 - Lâmina 1
 * 3 retângulos alinhados horizontalmente (altura centralizada na lâmina de 1080 x 1350)
 * - Esquerda: 300 x 620 colado à esquerda da lâmina (left: 0)
 * - Central:   412 x 835 centralizado na lâmina (left: 50%, top: 50%)
 * - Direita:  300 x 620 colado à direita da lâmina (right: 0)
 */
export const Slide01T2: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false
}) => {
  const leftSlot = slotsData['t2_s1_left'] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const centerSlot = slotsData['t2_s1_center'] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const rightSlot = slotsData['t2_s1_right'] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Esquerda: 300 x 620 colado à esquerda da lâmina */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 overflow-hidden"
        style={{
          width: `${(300 / 1080) * 100}%`,
          height: `${(620 / 1350) * 100}%`
        }}
      >
        <InteractivePhotoSlot
          slotId="t2_s1_left"
          imageUrl={leftSlot.imageUrl}
          defaultPlaceholder=""
          adjustments={leftSlot.adjustments}
          isActive={activeSlotId === 't2_s1_left'}
          onSelectSlot={() => onSelectSlot('t2_s1_left')}
          onUpdateAdjustments={(adj) => onUpdateAdjustments('t2_s1_left', adj)}
          onPickImage={() => onPickImage('t2_s1_left')}
          isExport={isExport}
        />
      </div>

      {/* Central: 412 x 835 centralizado na lâmina */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={{
          width: `${(412 / 1080) * 100}%`,
          height: `${(835 / 1350) * 100}%`
        }}
      >
        <InteractivePhotoSlot
          slotId="t2_s1_center"
          imageUrl={centerSlot.imageUrl}
          defaultPlaceholder=""
          adjustments={centerSlot.adjustments}
          isActive={activeSlotId === 't2_s1_center'}
          onSelectSlot={() => onSelectSlot('t2_s1_center')}
          onUpdateAdjustments={(adj) => onUpdateAdjustments('t2_s1_center', adj)}
          onPickImage={() => onPickImage('t2_s1_center')}
          isExport={isExport}
        />
      </div>

      {/* Direita: 300 x 620 colado à direita da lâmina */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 overflow-hidden"
        style={{
          width: `${(300 / 1080) * 100}%`,
          height: `${(620 / 1350) * 100}%`
        }}
      >
        <InteractivePhotoSlot
          slotId="t2_s1_right"
          imageUrl={rightSlot.imageUrl}
          defaultPlaceholder=""
          adjustments={rightSlot.adjustments}
          isActive={activeSlotId === 't2_s1_right'}
          onSelectSlot={() => onSelectSlot('t2_s1_right')}
          onUpdateAdjustments={(adj) => onUpdateAdjustments('t2_s1_right', adj)}
          onPickImage={() => onPickImage('t2_s1_right')}
          isExport={isExport}
        />
      </div>
    </div>
  );
};

