'use client';

import React from 'react';
import { SlideDefinition, PhotoSlotData } from '@/lib/carousel/types';

interface SlideSlotsChecklistProps {
  slides: SlideDefinition[];
  currentSlideIndex: number;
  slotsData: Record<string, PhotoSlotData>;
  activeSlotId?: string;
  onSelectSlot: (slotId: string, slideIndex: number) => void;
  onPickImage: (slotId: string) => void;
}

interface ContinuousSlotItem {
  id: string;
  displayNumber: number;
  displayLabel: string;
  firstSlideIndex: number;
}

export const SlideSlotsChecklist: React.FC<SlideSlotsChecklistProps> = ({
  slides,
  slotsData,
  activeSlotId,
  onSelectSlot,
  onPickImage
}) => {
  // Extrai todas as fotos únicas do template (1 a N)
  const allContinuousSlots: ContinuousSlotItem[] = [];
  const seenSlotIds = new Set<string>();

  slides.forEach((slide, sIdx) => {
    slide.slots.forEach((slot) => {
      if (!seenSlotIds.has(slot.id)) {
        seenSlotIds.add(slot.id);
        const num = allContinuousSlots.length + 1;
        const numStr = num < 10 ? `0${num}` : `${num}`;
        allContinuousSlots.push({
          id: slot.id,
          displayNumber: num,
          displayLabel: `Foto ${numStr}`,
          firstSlideIndex: sIdx
        });
      }
    });
  });

  if (allContinuousSlots.length === 0) return null;

  return (
    <div className="w-full flex items-center justify-center px-2 py-1.5 z-20 shrink-0">
      {/* Grade com 5 colunas fixas */}
      <div className="w-full max-w-sm sm:max-w-md grid grid-cols-5 gap-1.5 p-1.5 rounded-xl bg-slate-900/95 border border-slate-800 shadow-md">
        {allContinuousSlots.map((item) => {
          const data = slotsData[item.id];
          const hasImage = Boolean(data?.imageUrl);
          const isActive = activeSlotId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSlot(item.id, item.firstSlideIndex)}
              onDoubleClick={() => onPickImage(item.id)}
              className={`py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-center truncate cursor-pointer ${
                hasImage
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
              } ${
                isActive
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-[1.03] z-10'
                  : 'opacity-90 hover:opacity-100'
              }`}
            >
              {item.displayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};
