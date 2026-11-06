'use client';

import React, { useRef } from 'react';
import { PhotoSlotAdjustment } from '@/lib/carousel/types';
import { Plus } from 'lucide-react';

interface InteractivePhotoSlotProps {
  slotId: string;
  imageUrl?: string;
  defaultPlaceholder?: string;
  adjustments: PhotoSlotAdjustment;
  isActive?: boolean;
  onSelectSlot: () => void;
  onUpdateAdjustments: (adj: PhotoSlotAdjustment) => void;
  onPickImage: () => void;
  isExport?: boolean;
}

export const InteractivePhotoSlot: React.FC<InteractivePhotoSlotProps> = ({
  slotId,
  imageUrl,
  defaultPlaceholder,
  adjustments,
  isActive,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Rastreamento de gestos touch
  const touchState = useRef<{
    isDragging: boolean;
    initialDistance: number;
    initialZoom: number;
    startX: number;
    startY: number;
    initialPosX: number;
    initialPosY: number;
    lastTap: number;
  }>({
    isDragging: false,
    initialDistance: 0,
    initialZoom: 100,
    startX: 0,
    startY: 0,
    initialPosX: 50,
    initialPosY: 50,
    lastTap: 0
  });

  const getDistance = (t1: React.Touch, t2: React.Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isExport) return;
    onSelectSlot();

    const now = Date.now();
    if (now - touchState.current.lastTap < 300) {
      onPickImage();
    }
    touchState.current.lastTap = now;

    if (e.touches.length === 2) {
      touchState.current.initialDistance = getDistance(e.touches[0], e.touches[1]);
      touchState.current.initialZoom = adjustments.zoom;
    } else if (e.touches.length === 1) {
      touchState.current.isDragging = true;
      touchState.current.startX = e.touches[0].clientX;
      touchState.current.startY = e.touches[0].clientY;
      touchState.current.initialPosX = adjustments.x;
      touchState.current.initialPosY = adjustments.y;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isExport || !containerRef.current) return;

    if (e.touches.length === 2) {
      const currentDist = getDistance(e.touches[0], e.touches[1]);
      if (touchState.current.initialDistance > 0) {
        const factor = currentDist / touchState.current.initialDistance;
        const newZoom = Math.min(400, Math.max(100, Math.round(touchState.current.initialZoom * factor)));
        onUpdateAdjustments({
          ...adjustments,
          zoom: newZoom
        });
      }
    } else if (e.touches.length === 1 && touchState.current.isDragging) {
      const rect = containerRef.current.getBoundingClientRect();
      const dx = e.touches[0].clientX - touchState.current.startX;
      const dy = e.touches[0].clientY - touchState.current.startY;

      const pxChange = -(dx / rect.width) * 100;
      const pyChange = -(dy / rect.height) * 100;

      const newX = Math.min(100, Math.max(0, Math.round(touchState.current.initialPosX + pxChange)));
      const newY = Math.min(100, Math.max(0, Math.round(touchState.current.initialPosY + pyChange)));

      onUpdateAdjustments({
        ...adjustments,
        x: newX,
        y: newY
      });
    }
  };

  const handleTouchEnd = () => {
    if (isExport) return;
    touchState.current.isDragging = false;
    touchState.current.initialDistance = 0;
  };

  const hasImage = Boolean(imageUrl || (defaultPlaceholder && defaultPlaceholder.startsWith('data:')));

  return (
    <div
      ref={containerRef}
      role={isExport ? undefined : 'button'}
      tabIndex={isExport ? undefined : 0}
      aria-label={`Slot ${slotId}: ${hasImage ? 'Foto preenchida. Pressione Enter para selecionar' : 'Slot vazio. Pressione Enter para carregar foto'}`}
      onKeyDown={(e) => {
        if (isExport) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectSlot();
          if (!hasImage) onPickImage();
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        if (isExport) return;
        e.stopPropagation();
        onSelectSlot();
      }}
      className={`relative w-full h-full overflow-hidden select-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
        isExport ? '' : 'touch-none cursor-pointer'
      } ${
        !isExport && isActive ? 'ring-2 ring-amber-500 ring-inset shadow-inner' : ''
      }`}
    >
      <div className="w-full h-full relative">
        {hasImage ? (
          <img
            src={imageUrl || defaultPlaceholder}
            alt={`Foto posicionada no slot ${slotId}`}
            draggable={false}
            data-slot-id={slotId}
            data-slot-zoom={adjustments.zoom}
            data-slot-x={adjustments.x}
            data-slot-y={adjustments.y}
            className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
            style={{
              transform: `scale(${adjustments.zoom / 100})`,
              transformOrigin: `${adjustments.x}% ${adjustments.y}%`,
              objectPosition: `${adjustments.x}% ${adjustments.y}%`
            }}
          />
        ) : (
          /* Slot Vazio: Fundo neutro limpo, 100% autossuficiente e sem requisição de rede */
          <div
            className={`w-full h-full flex flex-col items-center justify-center transition-colors ${
              isExport
                ? 'bg-[#EAEAEA]'
                : isActive
                ? 'bg-amber-500/10 hover:bg-amber-500/15'
                : 'bg-slate-200/80 hover:bg-slate-300/80'
            }`}
          >
            {!isExport && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPickImage();
                }}
                aria-label={`Carregar foto no slot ${slotId}`}
                className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-hidden ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : 'bg-slate-300/80 text-slate-600 hover:bg-slate-400/80'
                }`}
                title="Toque para carregar foto"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
