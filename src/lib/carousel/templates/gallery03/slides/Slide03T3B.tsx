'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Template 3b - Lâmina 3
 * Retângulos:
 * - t3b_bg_seamless: foto1_fundo panorâmica (5400x1350, L3: 2160 a 3240)
 * - t3b_foto3_seamless: 1500 x 1350 (finaliza aos 420px na L3, offset -1080px)
 * - t3b_foto7_seamless: 1670 x 1350 (inicia em left 917 a 1080 -> 163px)
 * - t3b_foto5_seamless: 750 x 550 (inicia em left 505, top 293 -> 575px)
 * - t3b_foto6: 500 x 370 (left 251, top 671) - Fica por cima da foto 5
 */
export const Slide03T3B: React.FC<SlideProps> = ({
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
  const foto6Id = propSlots?.[2]?.id || 't3b_foto6';
  const foto5Id = propSlots?.[3]?.id || 't3b_foto5_seamless';
  const foto7Id = propSlots?.[4]?.id || 't3b_foto7_seamless';

  const bgSeamless = slotsData[bgId] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto3Seamless = slotsData[foto3Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto7Seamless = slotsData[foto7Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto5Seamless = slotsData[foto5Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto6 = slotsData[foto6Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Foto 1: Fundo Panorâmico Seamless (Parte 3 / 5: 2160 a 3240px) */}
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
            left: `${(-2160 / 1080) * 100}%`,
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

      {/* Foto 3: Seamless L2-L3 (Finalização na L3: 0 a 420px) */}
      <div
        className="absolute left-0 top-0 h-full z-10 overflow-hidden"
        style={{ width: `${(420 / 1080) * 100}%` }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(foto3Id);
        }}
      >
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${(-1080 / 420) * 100}%`,
            width: `${(1500 / 420) * 100}%`
          }}
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

      {/* Foto 7: Seamless L3-L4-L5 (Início na L3: 917 a 1080 -> 163px) */}
      <div
        className="absolute top-0 h-full z-10 overflow-hidden"
        style={{
          left: `${(917 / 1080) * 100}%`,
          width: `${(163 / 1080) * 100}%`
        }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(foto7Id);
        }}
      >
        <div
          className="absolute top-0 h-full"
          style={{
            left: 0,
            width: `${(1670 / 163) * 100}%`
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

      {/* Foto 5: Seamless L3-L4 Superior (750 x 550, Parte 1: 505 a 1080 -> 575px) */}
      <div
        className="absolute z-20 overflow-hidden"
        style={{
          filter: 'drop-shadow(10px 10px 15px rgba(0,0,0,0.5))',
          left: `${(505 / 1080) * 100}%`,
          top: `${(293 / 1350) * 100}%`,
          width: `${(575 / 1080) * 100}%`,
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
            left: 0,
            width: `${(750 / 575) * 100}%`
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

      {/* Foto 6: Foto Central Sobreposta (500 x 370) - z-30 para ficar por cima da Foto 5 */}
      <div
        className="absolute z-30 overflow-hidden"
        style={{
          filter: 'drop-shadow(10px 10px 15px rgba(0,0,0,0.5))',
          left: `${(251 / 1080) * 100}%`,
          top: `${(671 / 1350) * 100}%`,
          width: `${(500 / 1080) * 100}%`,
          height: `${(370 / 1350) * 100}%`
        }}
      >
        <InteractivePhotoSlot
          slotId={foto6Id}
          imageUrl={foto6.imageUrl}
          defaultPlaceholder=""
          adjustments={foto6.adjustments}
          isActive={activeSlotId === foto6Id}
          onSelectSlot={() => onSelectSlot(foto6Id)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(foto6Id, adj)}
          onPickImage={() => onPickImage(foto6Id)}
          isExport={isExport}
        />
      </div>
    </div>
  );
};

