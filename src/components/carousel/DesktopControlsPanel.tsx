'use client';

import React from 'react';
import { PhotoSlotData, PhotoSlotAdjustment } from '@/lib/carousel/types';
import { RotateCcw, ZoomIn, MoveHorizontal, MoveVertical, Image as ImageIcon } from 'lucide-react';

interface DesktopControlsPanelProps {
  activeSlot?: { id: string; label: string };
  data: PhotoSlotData;
  onChange: (newData: PhotoSlotData) => void;
  onPickImage: () => void;
}

export const DesktopControlsPanel: React.FC<DesktopControlsPanelProps> = ({
  activeSlot,
  data,
  onChange,
  onPickImage
}) => {
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

  if (!activeSlot) return null;

  return (
    <div className="bg-[#111827] border-l border-slate-800 p-5 w-80 lg:w-96 flex flex-col justify-between shrink-0 shadow-xl">
      <div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Controles de Desktop
            </h3>
            <span className="text-[11px] text-slate-400">{activeSlot.label}</span>
          </div>
          <button
            onClick={handleResetAdjustments}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            title="Resetar ajustes da foto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetar</span>
          </button>
        </div>

        {/* Botão de upload rápido na sidebar */}
        <div className="mb-6">
          <button
            onClick={onPickImage}
            className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Escolher Arquivo de Foto</span>
          </button>
        </div>

        {/* Sliders Analógicos */}
        <div className="space-y-4">
          {/* Zoom Slider */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex justify-between text-xs text-slate-300 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <ZoomIn className="w-4 h-4 text-amber-400" />
                Zoom da Imagem
              </span>
              <span className="font-mono text-amber-300 font-semibold">{data.adjustments.zoom}%</span>
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

          {/* Pan X Slider */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex justify-between text-xs text-slate-300 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <MoveHorizontal className="w-4 h-4 text-amber-400" />
                Posição Horizontal (X)
              </span>
              <span className="font-mono text-amber-300 font-semibold">{data.adjustments.x}%</span>
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

          {/* Pan Y Slider */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex justify-between text-xs text-slate-300 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <MoveVertical className="w-4 h-4 text-amber-400" />
                Posição Vertical (Y)
              </span>
              <span className="font-mono text-amber-300 font-semibold">{data.adjustments.y}%</span>
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

      <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">
        Dica: No celular, esses ajustes são feitos diretamente na tela arrastando o dedo ou fazendo pinça com dois dedos.
      </div>
    </div>
  );
};

