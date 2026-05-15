import { MercadoPagoConfig } from 'mercadopago';

// Lazy initialization: only create the client when actually needed,
// and fail with a clear error if the token is missing.
let _mpClient: MercadoPagoConfig | null = null;

function createMpClient(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      'MERCADOPAGO_ACCESS_TOKEN is not configured. Payment processing is unavailable.'
    );
  }
  return new MercadoPagoConfig({ 
    accessToken,
    options: { timeout: 5000 }
  });
}

export const mpClient = new Proxy({} as MercadoPagoConfig, {
  get(_, prop) {
    if (!_mpClient) {
      _mpClient = createMpClient();
    }
    return (_mpClient as unknown as Record<string, unknown>)[prop as string];
  }
});
