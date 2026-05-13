// Global type declarations for third-party scripts

interface FacebookPixel {
  (action: 'track', event: string, params?: Record<string, unknown>): void;
  (action: 'init', pixelId: string): void;
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
    MercadoPago?: new (publicKey: string) => {
      bricks: () => {
        create: (type: string, containerId: string, settings: Record<string, unknown>) => Promise<void>;
      };
    };
    // Dynamic images deduplication
    _dynamic_images_used?: Record<string, string[]>;
  }
}

export {};
