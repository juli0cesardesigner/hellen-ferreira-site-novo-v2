import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://*.mercadopago.com https://sdk.mercadopago.com https://www.googletagmanager.com https://*.google-analytics.com https://http2.mlstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://www.facebook.com https://*.google-analytics.com https://*.mercadopago.com https://*.mlstatic.com https://*.mercadolibre.com https://*.mercadolivre.com.br https://*.mercadolivre.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://api.mercadopago.com https://*.google-analytics.com https://*.analytics.google.com https://www.facebook.com https://*.facebook.com https://connect.facebook.net https://*.mercadolibre.com https://*.mercadolivre.com.br https://*.mercadolivre.com https://http2.mlstatic.com https://api.mercadolibre.com",
              "frame-src 'self' https://www.mercadopago.com https://*.mercadopago.com https://www.mercadolibre.com https://*.mercadolivre.com.br https://*.mercadolivre.com https://*.facebook.com https://www.facebook.com",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://www.facebook.com https://*.mercadopago.com https://*.mercadolibre.com https://*.mercadolivre.com.br https://*.mercadolivre.com",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Image optimization with sharp
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
};

export default nextConfig;
