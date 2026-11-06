'use client';

import React, { useState, useEffect } from 'react';
import { RenderedSlideResult, triggerDownload } from '@/lib/carousel/exporter';
import { X, Download, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface ExportResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: RenderedSlideResult[];
}

export const ExportResultModal: React.FC<ExportResultModalProps> = ({
  isOpen,
  onClose,
  results
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [downloadedMap, setDownloadedMap] = useState<Record<number, boolean>>({});
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Reseta o índice selecionado ao receber novos resultados
  useEffect(() => {
    setSelectedIndex(0);
    setDownloadedMap({});
  }, [results]);

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

  if (!isOpen || results.length === 0) return null;

  const currentItem = results[selectedIndex] || results[0];

  const handleDownloadSingle = (item: RenderedSlideResult) => {
    triggerDownload(item.dataUrl, item.filename, item.blob);
    setDownloadedMap((prev) => ({ ...prev, [item.number]: true }));
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    for (let i = 0; i < results.length; i++) {
      const item = results[i];
      triggerDownload(item.dataUrl, item.filename, item.blob);
      setDownloadedMap((prev) => ({ ...prev, [item.number]: true }));
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    setIsDownloadingAll(false);
  };

  const currentSizeKb = Math.round(currentItem.blob.size / 1024);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-result-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 motion-reduce:animate-none"
      style={{
        paddingTop: 'max(0.75rem, calc(env(safe-area-inset-top, 0px) + 0.5rem))',
        paddingBottom: 'max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))'
      }}
    >
      <div className="bg-[#10141E] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-full shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 id="export-result-title" className="font-bold text-sm sm:text-base text-white">
                Carrossel Pronto!
              </h3>
              <p className="text-[11px] text-slate-400">
                {results.length} {results.length === 1 ? 'lâmina renderizada' : 'lâminas renderizadas'} em alta resolução (1080p)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar prévia de exportação"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg bg-slate-800/80 active:bg-slate-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Prévia da Imagem Selecionada */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center gap-4">
          {/* Visualizador da Lâmina Ativa */}
          <div className="relative w-full max-w-xs sm:max-w-sm aspect-[4/5] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center">
            <img
              src={currentItem.dataUrl}
              alt={`Lâmina #${currentItem.number}`}
              className="w-full h-full object-contain select-auto"
              style={{
                WebkitTouchCallout: 'default',
                WebkitUserSelect: 'auto',
                userSelect: 'auto'
              }}
            />

            {/* Navegação entre lâminas com touch targets confortáveis */}
            {results.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))}
                  aria-label="Lâmina anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
                  title="Anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))}
                  aria-label="Próxima lâmina"
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden"
                  title="Próxima"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm py-1 px-2.5 rounded-lg text-[10px] text-slate-300 flex items-center justify-between font-mono pointer-events-none">
              <span>Lâmina {selectedIndex + 1} de {results.length}</span>
              <span className={currentSizeKb > 50 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {currentSizeKb} KB
              </span>
            </div>
          </div>

          {/* Dica para iPhone */}
          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              📱 <strong>Dica para Celular / iPhone:</strong> Toque e segure na imagem acima e escolha <strong>&quot;Salvar em Fotos&quot;</strong> para guardar direto na sua galeria, ou clique nos botões de download abaixo.
            </p>
          </div>

          {/* Miniaturas das Lâminas */}
          <div className="w-full">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              {results.length === 1 ? 'Lâmina gerada:' : 'Todas as lâminas geradas:'}
            </span>
            <div className="grid grid-cols-5 gap-2">
              {results.map((r, idx) => (
                <button
                  key={r.number}
                  onClick={() => setSelectedIndex(idx)}
                  className={`aspect-[4/5] rounded-lg overflow-hidden border-2 relative transition-all cursor-pointer ${
                    selectedIndex === idx
                      ? 'border-amber-500 scale-105 shadow-md'
                      : 'border-slate-800 hover:border-slate-600 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={r.dataUrl} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] font-mono px-1 text-white">
                    #{r.number}
                  </span>
                  {downloadedMap[r.number] && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => handleDownloadSingle(currentItem)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Baixar Lâmina #{currentItem.number} (.png)</span>
          </button>

          {results.length > 1 && (
            <button
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isDownloadingAll ? (
                <span>Baixando arquivos...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar Todas as {results.length} Lâminas</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
