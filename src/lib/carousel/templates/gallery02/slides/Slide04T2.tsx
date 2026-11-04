'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 2 - Lâmina 4
 * 2 retângulos:
 * 1º - *seamless* restante (continuação direta dos 550px da lâmina 3).
 *      Largura na lâmina 4: 550px (left: 0 até 550px) x 1350px (altura total).
 *      Janela virtual com os 860px totais, deslocada -310px para a esquerda.
 * 2º - 710 x 970 (80px da lateral direita e 630px do bottom: top = 1350 - 630 - 970 = -250px ou 630px do bottom).
 *      (1350 - 630 - 970 = -250px se for topo, mas se bottom = 630px, bottom: 630px e right: 80px).
 */
export const Slide04T2: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  const seamlessId = propSlots?.[0]?.id || 't2_seamless';
  const rectId = propSlots?.[1]?.id || 't2_s4_rect';

  const seamlessSlot = slotsData[seamlessId] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const rectSlot = slotsData[rectId] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* 1º Retângulo: Seamless Parte 2 (Lâmina 4) */}
      {/* Ocupa a faixa esquerda de 550px de largura x 1350px de altura */}
      <div
        className="absolute left-0 top-0 h-full overflow-hidden"
        style={{
          width: `${(550 / 1080) * 100}%`
        }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(seamlessId);
        }}
      >
        {/* Janela virtual com os 860px totais, posicionada deslocada exatamente -310px para casar a costura perfeitamente */}
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${(-310 / 550) * 100}%`,
            width: `${(860 / 550) * 100}%`
          }}
        >
          <InteractivePhotoSlot
            slotId={seamlessId}
            imageUrl={seamlessSlot.imageUrl}
            defaultPlaceholder=""
            adjustments={seamlessSlot.adjustments}
            isActive={activeSlotId === seamlessId}
            onSelectSlot={() => onSelectSlot(seamlessId)}
            onUpdateAdjustments={(adj) => onUpdateAdjustments(seamlessId, adj)}
            onPickImage={() => onPickImage(seamlessId)}
            isExport={isExport}
          />
        </div>
      </div>

      {/* 2º Retângulo: 710 x 970 (80px da lateral direita e 190px do bottom) */}
      <div
        className="absolute z-10 overflow-hidden"
        style={{
          right: `${(80 / 1080) * 100}%`,
          bottom: `${(190 / 1350) * 100}%`,
          width: `${(710 / 1080) * 100}%`,
          height: `${(970 / 1350) * 100}%`
        }}
      >
        <InteractivePhotoSlot
          slotId={rectId}
          imageUrl={rectSlot.imageUrl}
          defaultPlaceholder=""
          adjustments={rectSlot.adjustments}
          isActive={activeSlotId === rectId}
          onSelectSlot={() => onSelectSlot(rectId)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(rectId, adj)}
          onPickImage={() => onPickImage(rectId)}
          isExport={isExport}
        />
      </div>
    </div>
  );
};

