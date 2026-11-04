'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 2 - Lâmina 3
 * 2 retângulos:
 * 1º - 490 x 690 (630px do topo e 140px da lateral esquerda)
 * 2º - *seamless* 860 x 1350 (avança 550px para a lâmina 4).
 *      Largura na lâmina 3: 860 - 550 = 310px.
 *      Posicionamento: encostado na direita (right: 0), ocupando 310px de largura e 1350px de altura (100% da lâmina).
 *      A imagem interna tem 860px de largura total alinhada à direita da lâmina 3 (left: 0 relativo ao canvas do seamless).
 */
export const Slide03T2: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  const rectId = propSlots?.[0]?.id || 't2_s3_rect';
  const seamlessId = propSlots?.[1]?.id || 't2_seamless';

  const rectSlot = slotsData[rectId] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const seamlessSlot = slotsData[seamlessId] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* 1º Retângulo: 490 x 690 (140px do topo superior e 140px da lateral esquerda) */}
      <div
        className="absolute z-10 overflow-hidden"
        style={{
          left: `${(140 / 1080) * 100}%`,
          top: `${(140 / 1350) * 100}%`,
          width: `${(490 / 1080) * 100}%`,
          height: `${(690 / 1350) * 100}%`
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

      {/* 2º Retângulo: Seamless Parte 1 (Lâmina 3) */}
      {/* Ocupa a faixa direita de 310px de largura x 1350px de altura */}
      <div
        className="absolute right-0 top-0 h-full overflow-hidden"
        style={{
          width: `${(310 / 1080) * 100}%`
        }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(seamlessId);
        }}
      >
        {/* Janela virtual com os 860px totais do seamless */}
        <div
          className="absolute top-0 h-full"
          style={{
            left: 0,
            width: `${(860 / 310) * 100}%`
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
    </div>
  );
};

