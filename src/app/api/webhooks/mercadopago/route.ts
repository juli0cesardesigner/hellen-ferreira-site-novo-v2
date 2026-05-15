import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { mpClient } from '@/lib/utils/mercadopago';
import { Payment } from 'mercadopago';
import crypto from 'crypto';

// Configuração do Supabase (Usando Service Role para poder dar update no banco)
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, supabaseKey);
};

/**
 * Verify Mercado Pago webhook signature.
 * Uses x-signature header with HMAC-SHA256 of the request body + webhook secret.
 * Falls back to x-request-id verification if secret is not configured.
 */
function verifySignature(req: NextRequest, body: string): boolean {
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  
  // If no secret configured, check for x-request-id as minimal validation
  if (!webhookSecret) {
    const requestId = req.headers.get('x-request-id');
    console.warn('MERCADOPAGO_WEBHOOK_SECRET not set — using x-request-id as minimal validation');
    return !!requestId; // At minimum, require the Mercado Pago request ID header
  }

  const signature = req.headers.get('x-signature');
  if (!signature) {
    console.error('Missing x-signature header in webhook request');
    return false;
  }

  // Mercado Pago signature format: "ts=1234567890,v1=<hmac_sha256_hex>"
  const parts = signature.split(',');
  const tsPart = parts.find(p => p.startsWith('ts='));
  const v1Part = parts.find(p => p.startsWith('v1='));

  if (!tsPart || !v1Part) {
    console.error('Invalid x-signature format');
    return false;
  }

  const ts = tsPart.split('=')[1];
  const v1 = v1Part.split('=')[1];

  // The signed payload is: ts + "." + body
  const signedPayload = `${ts}.${body}`;
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(v1)
  );
}

export async function POST(req: NextRequest) {
  try {
    // Clone the request to read the body for signature verification
    const bodyText = await req.text();
    
    // Verify webhook authenticity
    if (!verifySignature(req, bodyText)) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = JSON.parse(bodyText);
    if (process.env.NODE_ENV === 'development') {
      console.log('📦 Webhook Mercado Pago recebido:', JSON.stringify(body));
    }

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

    if (process.env.NODE_ENV === 'development') {
      console.log(`💰 Status do Pagamento ${paymentId}: ${status} para Reserva: ${bookingId}`);
    }

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
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Agendamento ${bookingId} confirmado com sucesso!`);
        }
      } else if (status && ['rejected', 'cancelled', 'refunded', 'charged_back'].includes(status)) {
        // Marcar como cancelado se o pagamento falhou ou foi devolvido
        await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId);
        if (process.env.NODE_ENV === 'development') {
          console.log(`⚠️ Agendamento ${bookingId} marcado como cancelado (Status: ${status})`);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    const error = err as Error;
    console.error(`❌ Erro no Webhook Mercado Pago: ${error.message}`);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }
}
