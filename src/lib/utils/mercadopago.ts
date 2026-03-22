import { MercadoPagoConfig, Preference } from 'mercadopago';

// Instância do Cliente do Mercado Pago
// O Access Token deve ser configurado como variável de ambiente no servidor
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' 
});

// Exporta o manipulador de preferências para ser usado nas Server Actions
export const mpPreference = new Preference(client);
