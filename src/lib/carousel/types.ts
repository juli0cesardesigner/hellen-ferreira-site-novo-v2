export type AspectRatio = '4:5' | '9:16';

export interface AspectRatioConfig {
  id: AspectRatio;
  label: string;
  width: number;
  height: number;
  cssAspectRatio: string;
}

export const ASPECT_RATIOS: Record<AspectRatio, AspectRatioConfig> = {
  '4:5': {
    id: '4:5',
    label: 'Carrossel (4:5)',
    width: 1080,
    height: 1350,
    cssAspectRatio: '4 / 5'
  },
  '9:16': {
    id: '9:16',
    label: 'Stories (9:16)',
    width: 1080,
    height: 1920,
    cssAspectRatio: '9 / 16'
  }
};

export interface PhotoSlotAdjustment {
  zoom: number; // 100 to 400 (%)
  x: number;    // 0 to 100 (%)
  y: number;    // 0 to 100 (%)
}

export interface PhotoSlotData {
  id: string;
  label: string;
  imageUrl?: string;
  adjustments: PhotoSlotAdjustment;
}

export interface SlideSlotDefinition {
  id: string;
  label: string;
  defaultPlaceholder: string;
}

export interface SlideProps {
  aspectRatio: AspectRatio;
  slotsData: Record<string, PhotoSlotData>;
  activeSlotId?: string;
  onSelectSlot: (slotId: string) => void;
  onUpdateAdjustments: (slotId: string, adj: PhotoSlotAdjustment) => void;
  onPickImage: (slotId: string) => void;
  isExport?: boolean;
}

export interface SlideDefinition {
  id: string;
  slideNumber: number;
  slots: SlideSlotDefinition[];
  thumbnailSvg?: string;
  // Componente React individual para cada lâmina
  component: React.ComponentType<SlideProps>;
}

export interface CarouselTemplate {
  id: string;
  name: string;
  description: string;
  slides: SlideDefinition[];
}

export interface CarouselProject {
  id: string;
  name: string;
  templateId: string;
  updatedAt: number;
  createdAt: number;
  aspectRatio: AspectRatio;
  slotsData: Record<string, PhotoSlotData>;
  coverThumbnail?: string;
}
