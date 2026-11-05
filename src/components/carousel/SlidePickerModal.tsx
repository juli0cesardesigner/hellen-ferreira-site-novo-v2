'use client';

import React, { useMemo } from 'react';
import { CATALOG_SLIDES, CatalogSlideItem } from '@/lib/carousel/templates/catalog';
import { X, Plus } from 'lucide-react';

interface SlidePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPickSlide: (item: CatalogSlideItem) => void;
  currentTemplateId?: string;
  currentTemplateName?: string;
}

export function SlidePickerModal({
  isOpen,
  onClose,
  onPickSlide,
  currentTemplateId,
  currentTemplateName
}: SlidePickerModalProps) {
  const displayedSlides = useMemo(() => {
    if (!currentTemplateId) return CATALOG_SLIDES;
    const matches = CATALOG_SLIDES.filter((item) => item.templateId === currentTemplateId);
    // Se o template atual tiver lâminas registradas no catálogo, exibe apenas elas
    return matches.length > 0 ? matches : CATALOG_SLIDES;
  }, [currentTemplateId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#10141E] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base text-slate-100">Adicionar Lâmina</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentTemplateName
                ? `Lâminas disponíveis do template "${currentTemplateName}"`
                : 'Selecione uma lâmina do estúdio para inserir no seu carrossel'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 active:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grade de Lâminas Disponíveis (Apenas as lâminas do template ativo) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayedSlides.map((item) => (
            <button
              key={item.id}
              onClick={() => onPickSlide(item)}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-xl p-2.5 flex flex-col items-center transition-all group hover:scale-[1.03] shadow-sm hover:shadow-amber-500/20 cursor-pointer"
            >
              <div className="w-full aspect-[4/5] bg-white rounded-lg overflow-hidden border border-slate-700/60 shadow-inner relative flex items-center justify-center">
                {item.thumbnailSvg ? (
                  <img
                    src={item.thumbnailSvg}
                    alt=""
                    className="w-full h-full object-contain pointer-events-none"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Lâmina #{item.slideNumber}</span>
                )}
                {item.seamlessPairId && (
                  <div className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-amber-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-amber-500/30">
                    Seamless
                  </div>
                )}
                <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/15 flex items-center justify-center transition-colors">
                  <div className="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all">
                    <Plus className="w-5 h-5 stroke-[3]" />
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-2 font-medium">
                Lâmina #{item.slideNumber}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

