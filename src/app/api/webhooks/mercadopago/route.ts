import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Configuração do Supabase (Usando Service Role para poder dar update no banco)
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, supabaseKey);
};

// Configuração do Mercado Pago
const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' 
});

const paymentClient = new Payment(mpClient);

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('data.id') || searchParams.get('id');
    const type = searchParams.get('type');

    console.log(`Webhook recebido: ID=${id}, Type=${type}`);

    // Só processamos se for uma notificação de pagamento
    if (type === 'payment' && id) {
      // 1. Buscar detalhes do pagamento no Mercado Pago
      const payment = await paymentClient.get({ id });
      
      const status = payment.status;
      const externalReference = payment.external_reference; // Esse é o UUID do nosso agendamento

      console.log(`Pagamento ${id} - Status: ${status}, Ref: ${externalReference}`);

      if (status === 'approved' && externalReference) {
        // 2. Atualizar o banco de dados
        const supabase = getSupabaseAdmin();
        const { error } = await supabase
          .from('bookings')
          .update({ 
            status: 'confirmed',
            paid_amount: payment.transaction_amount // Garante que registramos o valor real pago
          })
          .eq('id', externalReference);

        if (error) {
          console.error("Erro ao atualizar agendamento:", error);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }

        console.log(`✓ Agendamento ${externalReference} confirmado com sucesso!`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Erro no Webhook Mercado Pago:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
