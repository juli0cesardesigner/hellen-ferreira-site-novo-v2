import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { stripe } from '@/lib/utils/stripe';

// Configuração do Supabase (Usando Service Role para poder dar update no banco)
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`❌ Erro de assinatura do Webhook Stripe: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Processar o evento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const bookingId = session.client_reference_id || session.metadata?.bookingId;

    console.log(`💰 Pagamento Stripe confirmado para Reserva: ${bookingId}`);

    if (bookingId) {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          paid_amount: session.amount_total / 100 // Stripe está em centavos
        })
        .eq('id', bookingId);

      if (error) {
        console.error("❌ Erro ao atualizar agendamento no banco:", error);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      console.log(`✅ Agendamento ${bookingId} confirmado com sucesso via Stripe!`);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
