'use client';

import React from 'react';
import { SlideProps } from '@/lib/carousel/types';
import { InteractivePhotoSlot } from '@/components/carousel/InteractivePhotoSlot';

export const Slide05: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false
}) => {
  const slotId = 's5_slot1';
  const data = slotsData[slotId] || {
    id: slotId,
    label: 'Slot 1',
    adjustments: { zoom: 100, x: 50, y: 50 }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
      <InteractivePhotoSlot
        slotId={slotId}
        imageUrl={data.imageUrl}
        defaultPlaceholder=""
        adjustments={data.adjustments}
        isActive={activeSlotId === slotId}
        onSelectSlot={() => onSelectSlot(slotId)}
        onUpdateAdjustments={(adj) => onUpdateAdjustments(slotId, adj)}
        onPickImage={() => onPickImage(slotId)}
        isExport={isExport}
      />
    </div>
  );
};
