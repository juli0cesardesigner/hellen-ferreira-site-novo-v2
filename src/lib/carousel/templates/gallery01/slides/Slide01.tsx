'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

export const Slide01: React.FC<SlideProps> = ({
  aspectRatio = '4:5',
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  const slots = [
    { id: propSlots?.[0]?.id || 's1_r1', label: propSlots?.[0]?.label || 'Retângulo 1 (Sup. Esq)' },
    { id: propSlots?.[1]?.id || 's1_r2', label: propSlots?.[1]?.label || 'Retângulo 2 (Sup. Dir)' },
    { id: propSlots?.[2]?.id || 's1_r3', label: propSlots?.[2]?.label || 'Retângulo 3 (Inf. Esq)' },
    { id: propSlots?.[3]?.id || 's1_r4', label: propSlots?.[3]?.label || 'Retângulo 4 (Inf. Dir)' }
  ];

  /*
    Medidas exatas solicitadas:
    - Retângulos individuais: 413px largura x 513px altura
    - Espaçamento entre os retângulos: 84.6px (horizontal e vertical)

    Cálculos proporcionais:
    - Bloco agrupado total:
      * Largura: (413 * 2 + 84.6) = 910.6px
        -> Em % do canvas de 1080px: (910.6 / 1080) * 100% = 84.314815%
        -> Margens laterais (esq/dir): (1080 - 910.6) / 2 = 84.7px cada
      * Altura em 4:5 (canvas 1350px): (513 * 2 + 84.6) = 1110.6px
        -> Em % do canvas de 1350px: (1110.6 / 1350) * 100% = 82.266667%
        -> Margens verticais (sup/inf): (1350 - 1110.6) / 2 = 119.7px cada
      * Altura em 9:16 (canvas 1920px): (513 * 2 + 84.6) = 1110.6px
        -> Em % do canvas de 1920px: (1110.6 / 1920) * 100% = 57.84375%
        -> Margens verticais (sup/inf): (1920 - 1110.6) / 2 = 404.7px cada
      * Gap colunas: (84.6 / 910.6) * 100% = 9.290578%
      * Gap linhas: (84.6 / 1110.6) * 100% = 7.617504%
  */
  const isStories = aspectRatio === '9:16';

  return (
    <div className="w-full h-full relative overflow-hidden bg-white flex items-center justify-center">
      <div
        className="grid grid-cols-2 grid-rows-2"
        style={{
          width: `${(910.6 / 1080) * 100}%`,
          height: isStories
            ? `${(1110.6 / 1920) * 100}%`
            : `${(1110.6 / 1350) * 100}%`,
          columnGap: `${(84.6 / 910.6) * 100}%`,
          rowGap: `${(84.6 / 1110.6) * 100}%`
        }}
      >
        {slots.map((slot) => {
          const data = slotsData[slot.id] || {
            id: slot.id,
            label: slot.label,
            adjustments: { zoom: 100, x: 50, y: 50 }
          };

          return (
            <div
              key={slot.id}
              className="relative overflow-hidden w-full h-full"
            >
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
    </div>
  );
};
