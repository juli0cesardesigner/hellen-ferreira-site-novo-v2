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
  isExport = false
}) => {
  const rectSlot = slotsData['t2_s3_rect'] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const seamlessSlot = slotsData['t2_seamless'] || { adjustments: { zoom: 100, x: 50, y: 50 } };

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
          slotId="t2_s3_rect"
          imageUrl={rectSlot.imageUrl}
          defaultPlaceholder="/images/hero-newborn.jpg"
          adjustments={rectSlot.adjustments}
          isActive={activeSlotId === 't2_s3_rect'}
          onSelectSlot={() => onSelectSlot('t2_s3_rect')}
          onUpdateAdjustments={(adj) => onUpdateAdjustments('t2_s3_rect', adj)}
          onPickImage={() => onPickImage('t2_s3_rect')}
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
          onSelectSlot('t2_seamless');
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
            slotId="t2_seamless"
            imageUrl={seamlessSlot.imageUrl}
            defaultPlaceholder="/images/hero-newborn.jpg"
            adjustments={seamlessSlot.adjustments}
            isActive={activeSlotId === 't2_seamless'}
            onSelectSlot={() => onSelectSlot('t2_seamless')}
            onUpdateAdjustments={(adj) => onUpdateAdjustments('t2_seamless', adj)}
            onPickImage={() => onPickImage('t2_seamless')}
            isExport={isExport}
          />
        </div>
      </div>
    </div>
  );
};

