'use client';

import React, { useMemo } from 'react';
import { SlideDefinition, PhotoSlotData } from '@/lib/carousel/types';
import { Check } from 'lucide-react';

interface SlideSlotsChecklistProps {
  slides: SlideDefinition[];
  currentSlideIndex: number;
  slotsData: Record<string, PhotoSlotData>;
  activeSlotId?: string;
  onSelectSlot: (slotId: string, slideIndex: number) => void;
  onPickImage: (slotId: string) => void;
}

export const SlideSlotsChecklist: React.FC<SlideSlotsChecklistProps> = ({
  slides,
  currentSlideIndex,
  slotsData,
  activeSlotId,
  onSelectSlot,
  onPickImage
}) => {
  // Mapeia todas as fotos do template para manter numeração contínua e limpa (Foto 01, Foto 02...)
  const slotNumberMap = useMemo(() => {
    const map = new Map<string, string>();
    let count = 0;
    slides.forEach((slide) => {
      slide.slots.forEach((slot) => {
        if (!map.has(slot.id)) {
          count++;
          const numStr = count < 10 ? `0${count}` : `${count}`;
          const cleanLabel = slot.label?.startsWith('Foto ')
            ? slot.label.split('(')[0].trim()
            : `Foto ${numStr}`;
          map.set(slot.id, cleanLabel);
        }
      });
    });
    return map;
  }, [slides]);

  // Exibe apenas as fotos/slots pertencentes à lâmina atualmente selecionada
  const currentSlide = slides[currentSlideIndex];
  const currentSlots = currentSlide?.slots || [];

  if (currentSlots.length === 0) return null;

  return (
    <div className="w-full max-w-full bg-[#0D111A] border-b border-slate-800/80 px-2 sm:px-4 py-1.5 flex items-center justify-center z-20 shrink-0">
      {/* Linha única minimalista: os checks se auto-distribuem igualmente no espaço */}
      <div className="w-full max-w-xl flex items-center gap-1.5 sm:gap-2">
        {currentSlots.map((slot) => {
          const data = slotsData[slot.id];
          const hasImage = Boolean(data?.imageUrl);
          const isActive = activeSlotId === slot.id;
          const displayLabel = slotNumberMap.get(slot.id) || slot.label || 'Foto';

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => {
                if (isActive) {
                  onPickImage(slot.id);
                } else {
                  onSelectSlot(slot.id, currentSlideIndex);
                }
              }}
              onDoubleClick={() => onPickImage(slot.id)}
              aria-label={`${displayLabel}: ${hasImage ? 'Foto preenchida' : 'Vazia'}. ${isActive ? 'Toque para trocar foto' : 'Toque para selecionar'}`}
              className={`flex-1 min-w-0 h-8 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                isActive
                  ? hasImage
                    ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400/50 shadow-sm'
                    : 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-400/50 shadow-sm'
                  : hasImage
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-500/50'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:border-amber-500/40 hover:text-slate-200'
              }`}
              title={slot.label ? `${slot.label} (${hasImage ? 'Preenchida' : 'Vazia'})` : displayLabel}
            >
              {hasImage ? (
                <Check
                  className={`w-3.5 h-3.5 shrink-0 stroke-[2.5] ${
                    isActive ? 'text-white' : 'text-emerald-400'
                  }`}
                />
              ) : (
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isActive ? 'bg-slate-950' : 'bg-amber-400/80'
                  }`}
                />
              )}
              <span className="truncate">{displayLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
