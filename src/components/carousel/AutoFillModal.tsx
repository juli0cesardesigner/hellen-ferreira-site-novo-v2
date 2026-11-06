'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CarouselTemplate, PhotoSlotData } from '@/lib/carousel/types';
import { getTemplateUniqueSlots, applyAutoFillToTemplate } from '@/lib/carousel/auto-fill';
import { DEMO_PHOTOS } from '@/lib/carousel/demo-photos';
import { X, Upload, Image as ImageIcon, Loader2, ArrowRight } from 'lucide-react';

interface AutoFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: CarouselTemplate;
  onApply: (updatedSlotsData: Record<string, PhotoSlotData>) => void;
}

export const AutoFillModal: React.FC<AutoFillModalProps> = ({
  isOpen,
  onClose,
  template,
  onApply
}) => {
  const [selectedPhotos, setSelectedPhotos] = useState<{ dataUrl: string; name: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fecha com a tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const uniqueSlots = getTemplateUniqueSlots(template);
  const totalSlotsNeeded = uniqueSlots.length;

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const readers: Promise<{ dataUrl: string; name: string }>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const p = new Promise<{ dataUrl: string; name: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            dataUrl: event.target?.result as string,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      });
      readers.push(p);
    }

    Promise.all(readers).then((results) => {
      setSelectedPhotos((prev) => [...prev, ...results]);
      setIsProcessing(false);
    });

    e.target.value = '';
  };

  const handleApply = () => {
    if (selectedPhotos.length === 0) return;
    const filledData = applyAutoFillToTemplate(template, selectedPhotos);
    onApply(filledData);
    onClose();
  };

  const handleUseDemo = () => {
    // Repete fotos demo se o template precisar de mais fotos
    const demoItems: { dataUrl: string; name: string }[] = [];
    for (let i = 0; i < totalSlotsNeeded; i++) {
      const p = DEMO_PHOTOS[i % DEMO_PHOTOS.length];
      demoItems.push({
        dataUrl: p.url,
        name: `Foto Teste ${i + 1}`
      });
    }
    setSelectedPhotos(demoItems);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="autofill-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 motion-reduce:animate-none"
      style={{
        paddingTop: 'max(0.75rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))',
        paddingBottom: 'max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))'
      }}
    >
      <div className="bg-[#10141E] border border-slate-800 rounded-2xl w-full max-w-lg max-h-full shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 id="autofill-title" className="font-bold text-sm sm:text-base text-white">
                Auto-Preenchimento
              </h3>
              <p className="text-[11px] text-slate-400">
                {template.name} ({totalSlotsNeeded} vagas de fotos)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar janela de auto-preenchimento"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg bg-slate-800/80 active:bg-slate-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-5 flex flex-col gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesChange}
            accept="image/*"
            multiple
            className="fixed -top-96 -left-96 w-1 h-1 opacity-0 pointer-events-none"
            tabIndex={-1}
            aria-hidden="true"
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Fotos escolhidas:{' '}
              <strong className={selectedPhotos.length >= totalSlotsNeeded ? 'text-emerald-400' : 'text-amber-400'}>
                {selectedPhotos.length}
              </strong>{' '}
              / {totalSlotsNeeded} vagas
            </span>
            {selectedPhotos.length > 0 && (
              <button
                onClick={() => setSelectedPhotos([])}
                className="text-[11px] text-red-400 hover:underline cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {selectedPhotos.length === 0 ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full py-8 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-800/40 transition-all cursor-pointer group"
              >
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    <span className="text-xs font-semibold text-slate-200">
                      Clique para escolher todas as fotos do template
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Selecione até {totalSlotsNeeded} fotos de uma vez (JPG, PNG ou WebP)
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleUseDemo}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Preencher com Fotos Demo ({totalSlotsNeeded} fotos)</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="max-h-48 overflow-y-auto grid grid-cols-5 gap-1.5 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
                {selectedPhotos.map((p, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg overflow-hidden relative border border-slate-800 group"
                  >
                    <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] px-1 font-mono text-white">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  + Adicionar mais fotos
                </button>
                <button
                  type="button"
                  onClick={handleUseDemo}
                  className="text-xs text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Substituir por Demo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 flex items-center justify-between bg-slate-950/40 shrink-0">
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
          >
            Cancelar
          </button>

          <button
            onClick={handleApply}
            disabled={selectedPhotos.length === 0}
            className="min-h-[44px] px-5 py-2.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
          >
            <span>Carregar Fotos no Template</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
