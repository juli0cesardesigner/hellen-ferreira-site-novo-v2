'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

/**
 * Componente Modelo de Lâmina Convertida a partir de SVG
 *
 * Características:
 * - Compatível com propSlots dinâmicos (modo personalizado e aleatório)
 * - Coordenadas e dimensões em porcentagens exatas de 1080x1350
 * - Tratamento de sombra seguro para WebKit com filter: drop-shadow(...)
 */
export const SlideModelExample: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots
}) => {
  // IDs dinâmicos com fallback seguro
  const foto1Id = propSlots?.[0]?.id || 'example_foto1';
  const foto2Id = propSlots?.[1]?.id || 'example_foto2';

  const foto1 = slotsData[foto1Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto2 = slotsData[foto2Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* Foto 1: Exemplo de bloco superior (1080 x 675) */}
      <div
        className="absolute left-0 top-0 overflow-hidden"
        style={{
          width: '100%',
          height: `${(675 / 1350) * 100}%`
        }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(foto1Id);
        }}
      >
        <InteractivePhotoSlot
          slotId={foto1Id}
          imageUrl={foto1.imageUrl}
          defaultPlaceholder=""
          adjustments={foto1.adjustments}
          isActive={activeSlotId === foto1Id}
          onSelectSlot={() => onSelectSlot(foto1Id)}
          onUpdateAdjustments={(adj) => onUpdateAdjustments(foto1Id, adj)}
          onPickImage={() => onPickImage(foto1Id)}
          isExport={isExport}
        />
      </div>

      {/* Foto 2: Exemplo de card sobreposto com sombra projetada */}
      <div
        className="absolute z-10"
        style={{
          left: `${(150 / 1080) * 100}%`,
          top: `${(550 / 1350) * 100}%`,
          width: `${(780 / 1080) * 100}%`,
          height: `${(650 / 1350) * 100}%`,
          filter: 'drop-shadow(10px 10px 15px rgba(0,0,0,0.4))'
        }}
        onClick={(e) => {
          if (isExport) return;
          e.stopPropagation();
          onSelectSlot(foto2Id);
        }}
      >
        <div className="w-full h-full overflow-hidden rounded-lg bg-slate-100">
          <InteractivePhotoSlot
            slotId={foto2Id}
            imageUrl={foto2.imageUrl}
            defaultPlaceholder=""
            adjustments={foto2.adjustments}
            isActive={activeSlotId === foto2Id}
            onSelectSlot={() => onSelectSlot(foto2Id)}
            onUpdateAdjustments={(adj) => onUpdateAdjustments(foto2Id, adj)}
            onPickImage={() => onPickImage(foto2Id)}
            isExport={isExport}
          />
        </div>
      </div>
    </div>
  );
};

