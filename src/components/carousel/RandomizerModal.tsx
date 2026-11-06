'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Layers, ArrowRight, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { DEMO_PHOTOS } from '@/lib/carousel/demo-photos';
import { generateRandomProjectByImages, generateRandomProjectBySlideCount } from '@/lib/carousel/randomizer';
import { SlideDefinition, PhotoSlotData, CarouselTemplate } from '@/lib/carousel/types';

interface RandomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRandomProject: (template: CarouselTemplate, slotsData: Record<string, PhotoSlotData>) => void;
}

export const RandomizerModal: React.FC<RandomizerModalProps> = ({
  isOpen,
  onClose,
  onApplyRandomProject
}) => {
  const [selectedOption, setSelectedOption] = useState<'photos' | 'slides'>('photos');
  const [slideCount, setSlideCount] = useState<number>(5);
  const [uploadedPhotos, setUploadedPhotos] = useState<{ dataUrl: string; name: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fecha modal com a tecla Escape
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

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploadedPhotos((prev) => [...prev, ...results]);
      setIsProcessing(false);
    });

    e.target.value = '';
  };

  const handleGenerate = () => {
    if (selectedOption === 'photos') {
      if (uploadedPhotos.length === 0) return;
      const { slides, slotsData } = generateRandomProjectByImages(uploadedPhotos);
      const randomTemplate: CarouselTemplate = {
        id: `random_auto_${Date.now()}`,
        name: `Aleatório (${uploadedPhotos.length} fotos)`,
        description: `Carrossel gerado automaticamente com ${slides.length} lâminas aleatórias.`,
        slides
      };
      onApplyRandomProject(randomTemplate, slotsData);
      onClose();
    } else {
      const { slides, slotsData } = generateRandomProjectBySlideCount(slideCount);
      const randomTemplate: CarouselTemplate = {
        id: `random_slides_${Date.now()}`,
        name: `Aleatório (${slideCount} lâminas)`,
        description: `Carrossel gerado com ${slideCount} lâminas aleatórias.`,
        slides
      };
      onApplyRandomProject(randomTemplate, slotsData);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="randomizer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 motion-reduce:animate-none"
      style={{
        paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))',
        paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))'
      }}
    >
      <div className="w-full max-w-lg max-h-full bg-[#0F1420] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 id="randomizer-modal-title" className="font-bold text-sm text-white">
              Criar Carrossel Aleatório
            </h3>
            <p className="text-[11px] text-slate-400">Monte composições criativas automaticamente</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modo aleatório"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Escolha das 2 Opções */}
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Opção 1: Por Fotos */}
            <button
              onClick={() => setSelectedOption('photos')}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                selectedOption === 'photos'
                  ? 'border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-500/10'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Upload className={`w-5 h-5 ${selectedOption === 'photos' ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80">Opção 1</span>
              </div>
              <div>
                <p className="font-bold text-xs text-white">Subir Fotos</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Escolhe as lâminas exatas para comportar todas as fotos.
                </p>
              </div>
            </button>

            {/* Opção 2: Por Quantidade de Lâminas */}
            <button
              onClick={() => setSelectedOption('slides')}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                selectedOption === 'slides'
                  ? 'border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-500/10'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Layers className={`w-5 h-5 ${selectedOption === 'slides' ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80">Opção 2</span>
              </div>
              <div>
                <p className="font-bold text-xs text-white">Nº de Lâminas</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Define a quantidade de lâminas e o sistema sorteia o layout.
                </p>
              </div>
            </button>
          </div>

          {/* Área Dinâmica da Opção 1: Upload de Fotos */}
          {selectedOption === 'photos' && (
            <div className="flex flex-col gap-3 bg-slate-900/70 border border-slate-800/80 rounded-xl p-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleMultipleFilesChange}
                accept="image/*"
                multiple
                className="fixed -top-96 -left-96 w-1 h-1 opacity-0 pointer-events-none"
                tabIndex={-1}
                aria-hidden="true"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  Fotos selecionadas: <strong className="text-amber-400">{uploadedPhotos.length}</strong>
                </span>
                {uploadedPhotos.length > 0 && (
                  <button
                    onClick={() => setUploadedPhotos([])}
                    className="text-[11px] text-red-400 hover:underline cursor-pointer"
                  >
                    Limpar fotos
                  </button>
                )}
              </div>

              {uploadedPhotos.length === 0 ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full py-6 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-800/40 transition-all cursor-pointer group"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-slate-500 group-hover:text-amber-400 transition-colors" />
                        <span className="text-xs font-semibold text-slate-300">
                          Clique para selecionar várias fotos
                        </span>
                        <span className="text-[10px] text-slate-500">
                          O sistema calculará as lâminas necessárias automaticamente
                        </span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedPhotos(
                        DEMO_PHOTOS.map((p, idx) => ({
                          dataUrl: p.url,
                          name: `Foto Teste ${idx + 1}`
                        }))
                      );
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Carregar Fotos de Demonstração (8 fotos)</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="max-h-32 overflow-y-auto grid grid-cols-5 gap-1.5 p-1 bg-slate-950/60 rounded-lg">
                    {uploadedPhotos.map((p, idx) => (
                      <div key={idx} className="aspect-square rounded overflow-hidden relative border border-slate-800">
                        <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] px-1 font-mono text-white">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold self-start mt-1 flex items-center gap-1 cursor-pointer"
                  >
                    + Adicionar mais fotos
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Área Dinâmica da Opção 2: Quantidade de Lâminas */}
          {selectedOption === 'slides' && (
            <div className="flex flex-col gap-3 bg-slate-900/70 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Quantidade de lâminas:</span>
                <span className="text-base font-bold text-amber-400 font-mono">{slideCount}</span>
              </div>

              {/* Botões rápidos de quantidade */}
              <div className="flex items-center gap-2">
                {[3, 4, 5, 6, 7, 8, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSlideCount(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      slideCount === num
                        ? 'bg-amber-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="2"
                max="12"
                step="1"
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>2 lâminas</span>
                <span>12 lâminas</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer sem ícone de estrelas */}
        <div className="px-5 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleGenerate}
            disabled={selectedOption === 'photos' && uploadedPhotos.length === 0}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <span>Gerar Carrossel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
