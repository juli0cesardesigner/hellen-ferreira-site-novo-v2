'use client';

import React from 'react';
import { SlideDefinition, AspectRatio, PhotoSlotData, PhotoSlotAdjustment } from '@/lib/carousel/types';

interface SlideViewProps {
  slide: SlideDefinition;
  aspectRatio: AspectRatio;
  slotsData: Record<string, PhotoSlotData>;
  activeSlotId?: string;
  onSelectSlot: (slotId: string) => void;
  onUpdateAdjustments: (slotId: string, adj: PhotoSlotAdjustment) => void;
  onPickImage: (slotId: string) => void;
  innerRef?: (el: HTMLDivElement | null) => void;
  isExport?: boolean;
  className?: string;
}

export const SlideView: React.FC<SlideViewProps> = ({
  slide,
  aspectRatio,
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  innerRef,
  isExport = false,
  className = ''
}) => {
  const SlideComponent = slide.component;

  const isStories = aspectRatio === '9:16';
  const ratioStr = isStories ? '9 / 16' : '4 / 5';
  const ratioNum = isStories ? '9 / 16' : '4 / 5';

  const isFullSize = isExport || className.includes('w-full');

  /*
    LÂMINA RESPONSIVA NATIVA (SEM CSS TRANSFORM SCALE):
    O container usa aspect-ratio e container queries no CSS:
    - No modo interativo (viewport puro): ajusta a largura dinamicamente com base em
      min(100cqw, calc(100cqh * ratio)), mantendo SEMPRE a proporção exata 4:5 ou 9:16.
    - No modo mockup ou exportação: preenche 100% da área fornecida pelo container pai.
  */
  return (
    <div
      ref={innerRef}
      data-slide-number={slide.slideNumber}
      className={`relative select-none shadow-2xl rounded-sm overflow-hidden bg-[#f2f2f2] mx-auto shrink-0 ${
        isFullSize ? 'w-full h-full' : ''
      } ${className}`}
      style={
        isFullSize
          ? {
              width: '100%',
              height: '100%',
              aspectRatio: ratioStr
            }
          : {
              aspectRatio: ratioStr,
              width: `min(100cqw, calc(100cqh * (${ratioNum})))`,
              height: 'auto',
              maxWidth: '100cqw',
              maxHeight: '100cqh'
            }
      }
    >
      <SlideComponent
        aspectRatio={aspectRatio}
        slotsData={slotsData}
        activeSlotId={activeSlotId}
        onSelectSlot={onSelectSlot}
        onUpdateAdjustments={onUpdateAdjustments}
        onPickImage={onPickImage}
        isExport={isExport}
        slots={slide.slots}
      />
    </div>
  );
};
