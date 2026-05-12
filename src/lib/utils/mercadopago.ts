import { MercadoPagoConfig } from 'mercadopago';

// Instanciar com uma string qualquer se não houver chave (apenas para evitar erro no build)
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

export const mpClient = new MercadoPagoConfig({ 
  accessToken: accessToken,
  options: { timeout: 5000 }
});
