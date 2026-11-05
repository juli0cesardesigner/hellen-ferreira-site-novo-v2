'use client';

import React, { useRef } from 'react';
import { PhotoSlotData, PhotoSlotAdjustment } from '@/lib/carousel/types';
import { Upload, RotateCcw, ZoomIn, MoveHorizontal, MoveVertical, Sparkles } from 'lucide-react';
import { getNextDemoPhoto } from '@/lib/carousel/demo-photos';

interface PhotoSlotEditorProps {
  slot: { id: string; label: string };
  data: PhotoSlotData;
  onChange: (newData: PhotoSlotData) => void;
}

export const PhotoSlotEditor: React.FC<PhotoSlotEditorProps> = ({ slot, data, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onChange({
        ...data,
        imageUrl: result
      });
    };
    reader.readAsDataURL(file);
  };

  const updateAdjustment = (key: keyof PhotoSlotAdjustment, value: number) => {
    onChange({
      ...data,
      adjustments: {
        ...data.adjustments,
        [key]: value
      }
    });
  };

  const handleResetAdjustments = () => {
    onChange({
      ...data,
      adjustments: {
        zoom: 100,
        x: 50,
        y: 50
      }
    });
  };

  return (
    <div className="bg-[#1E293B]/70 border border-slate-700/60 rounded-lg p-4 mb-4 text-slate-200">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
          {slot.label}
        </span>
        <button
          onClick={handleResetAdjustments}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          title="Resetar enquadramento"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Resetar</span>
        </button>
      </div>

      {/* Miniatura & Upload */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-16 h-16 rounded border border-slate-600 overflow-hidden bg-slate-900 flex-shrink-0 relative">
          {data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt="Miniatura"
              className="w-full h-full object-cover"
              style={{
                transform: `scale(${data.adjustments.zoom / 100})`,
                transformOrigin: `${data.adjustments.x}% ${data.adjustments.y}%`
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 text-center p-1">
              Padrão
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="fixed -top-96 -left-96 w-1 h-1 opacity-0 pointer-events-none"
            tabIndex={-1}
            aria-hidden="true"
          />
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Trocar Imagem</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const demoUrl = getNextDemoPhoto();
                onChange({ ...data, imageUrl: demoUrl });
              }}
              className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              title="Inserir foto de teste"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Foto Teste</span>
            </button>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            JPG, PNG ou WebP em alta resolução
          </span>
        </div>
      </div>

      {/* Sliders: Zoom, Pan X, Pan Y */}
      <div className="space-y-3 pt-2 border-t border-slate-700/60">
        {/* Zoom */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1 text-[11px]">
              <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
              Zoom
            </span>
            <span className="font-mono text-amber-300">{data.adjustments.zoom}%</span>
          </div>
          <input
            type="range"
            min={100}
            max={400}
            value={data.adjustments.zoom}
            onChange={(e) => updateAdjustment('zoom', Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Pan X */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1 text-[11px]">
              <MoveHorizontal className="w-3.5 h-3.5 text-amber-400" />
              Posição X
            </span>
            <span className="font-mono text-amber-300">{data.adjustments.x}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={data.adjustments.x}
            onChange={(e) => updateAdjustment('x', Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Pan Y */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1 text-[11px]">
              <MoveVertical className="w-3.5 h-3.5 text-amber-400" />
              Posição Y
            </span>
            <span className="font-mono text-amber-300">{data.adjustments.y}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={data.adjustments.y}
            onChange={(e) => updateAdjustment('y', Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

