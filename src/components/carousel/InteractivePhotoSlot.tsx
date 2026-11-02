'use client';

import React, { useRef } from 'react';
import { PhotoSlotAdjustment } from '@/lib/carousel/types';

interface InteractivePhotoSlotProps {
  slotId: string;
  imageUrl?: string;
  defaultPlaceholder: string;
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

  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isExport) return;
    onSelectSlot();

    if (e.touches.length === 2) {
      touchState.current.initialDistance = getDistance(e.touches);
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
    if (isExport) return;
    if (e.touches.length === 2 && touchState.current.initialDistance > 0) {
      e.preventDefault();
      const currentDist = getDistance(e.touches);
      const scaleFactor = currentDist / touchState.current.initialDistance;
      const newZoom = Math.min(400, Math.max(100, Math.round(touchState.current.initialZoom * scaleFactor)));

      onUpdateAdjustments({
        ...adjustments,
        zoom: newZoom
      });
    } else if (e.touches.length === 1 && touchState.current.isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = e.touches[0].clientX - touchState.current.startX;
      const deltaY = e.touches[0].clientY - touchState.current.startY;

      const currentZoom = adjustments.zoom || 100;
      // Quando zoom = 100%, o range de movimento permitido é 0 (imagem ocupa 100% da máscara).
      // Quando zoom > 100%, o deslocamento máximo permitido antes de vazar a borda é (zoom - 100) / (2 * zoom).
      // Em coordenadas percentuais de (x, y) centradas em 50:
      const maxOffset = Math.max(0, (currentZoom - 100) / 2);
      const minBound = 50 - maxOffset;
      const maxBound = 50 + maxOffset;

      const percentDeltaX = -(deltaX / rect.width) * 50;
      const percentDeltaY = -(deltaY / rect.height) * 50;

      const newX = Math.min(maxBound, Math.max(minBound, Math.round(touchState.current.initialPosX + percentDeltaX)));
      const newY = Math.min(maxBound, Math.max(minBound, Math.round(touchState.current.initialPosY + percentDeltaY)));

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

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        if (isExport) return;
        e.stopPropagation();
        onSelectSlot();
      }}
      className={`relative w-full h-full overflow-hidden select-none ${
        isExport ? '' : 'touch-none cursor-pointer'
      } ${
        !isExport && isActive ? 'ring-2 ring-amber-500 ring-inset shadow-inner' : ''
      }`}
    >
      <div
        className="w-full h-full"
        style={{
          transform: `scale(${adjustments.zoom / 100}) translate(${50 - adjustments.x}%, ${50 - adjustments.y}%)`,
          transformOrigin: 'center center'
        }}
      >
        <img
          src={imageUrl || defaultPlaceholder}
          alt=""
          draggable={false}
          className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
        />
      </div>
    </div>
  );
};
