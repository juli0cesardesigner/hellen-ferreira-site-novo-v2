// Global type declarations for third-party scripts

interface FacebookPixel {
  (action: 'track', event: string, params?: Record<string, unknown>): void;
  (action: 'init', pixelId: string, params?: Record<string, unknown>): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
}

declare global {
  interface Window {
    fbq?: FacebookPixel;
    _fbq?: FacebookPixel;
    // Mercado Pago SDK
    MercadoPago?: new (key: string | undefined) => { 
      bricks: () => {
        create: (brickName: string, containerId: string, settings: any) => Promise<any>;
      }
    };
    // Dynamic images deduplication
    _dynamic_images_used?: Record<string, string[]>;
  }
}

export {};
