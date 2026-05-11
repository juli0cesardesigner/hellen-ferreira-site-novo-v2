import Stripe from 'stripe';

// Instanciar com uma string qualquer se não houver chave (apenas para evitar erro no build)
// No runtime, o createBooking validará se a chave real existe.
const key = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(key, {
  apiVersion: '2026-04-22.dahlia', 
  typescript: true,
});
