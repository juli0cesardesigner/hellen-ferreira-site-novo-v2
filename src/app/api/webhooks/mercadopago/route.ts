import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { mpClient } from '@/lib/utils/mercadopago';
import { Payment } from 'mercadopago';

// Configuração do Supabase (Usando Service Role para poder dar update no banco)
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📦 Webhook Mercado Pago recebido:', JSON.stringify(body));

    // Mercado Pago pode enviar notificações de diferentes formas dependendo da versão
    // 1. Notificações IPN (topic/id)
    // 2. Webhooks (type/data.id)
    
    let paymentId = '';
    
    if (body.type === 'payment' && body.data?.id) {
      paymentId = body.data.id;
    } else if (body.topic === 'payment' && body.id) {
      paymentId = body.id;
    }

    if (!paymentId) {
      return NextResponse.json({ received: true }); // Ignorar outros tópicos
    }

    // Buscar detalhes do pagamento no Mercado Pago
    const payment = new Payment(mpClient);
    const paymentData = await payment.get({ id: paymentId });

    const status = paymentData.status;
    const bookingId = paymentData.external_reference || paymentData.metadata?.booking_id;

    console.log(`💰 Status do Pagamento ${paymentId}: ${status} para Reserva: ${bookingId}`);

    if (bookingId) {
      const supabase = getSupabaseAdmin();
      
      if (status === 'approved' || status === 'authorized') {
        // Atualizar o status da reserva para confirmado
        const { error } = await supabase
          .from('bookings')
          .update({ 
            status: 'confirmed',
            paid_amount: paymentData.transaction_amount
          })
          .eq('id', bookingId);

        if (error) {
          console.error("❌ Erro ao atualizar agendamento no banco:", error);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }
        console.log(`✅ Agendamento ${bookingId} confirmado com sucesso!`);
      } else if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(status)) {
        // Marcar como cancelado se o pagamento falhou ou foi devolvido
        await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId);
        console.log(`⚠️ Agendamento ${bookingId} marcado como cancelado (Status: ${status})`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error(`❌ Erro no Webhook Mercado Pago: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
