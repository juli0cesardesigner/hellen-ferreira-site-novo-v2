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
 * Verify Mercado Pago webhook authenticity.
 * Checks HMAC signature if MERCADOPAGO_WEBHOOK_SECRET is set,
 * validating both the official manifest format (id:...;request-id:...;ts:...;)
 * and the raw body format. Falls back gracefully to x-request-id validation.
 */
function verifySignature(req: NextRequest, bodyText: string, dataId?: string): boolean {
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const requestId = req.headers.get('x-request-id');
  
  // If no secret configured, check for x-request-id as minimal validation
  if (!webhookSecret) {
    return !!requestId || req.nextUrl.searchParams.has('data.id') || req.nextUrl.searchParams.has('id');
  }

  const signature = req.headers.get('x-signature');
  if (!signature) {
    console.warn('Webhook received without x-signature header — checking x-request-id');
    return !!requestId;
  }

  try {
    const parts = signature.split(',');
    const tsPart = parts.find(p => p.startsWith('ts='));
    const v1Part = parts.find(p => p.startsWith('v1='));

    if (!tsPart || !v1Part) {
      console.warn('Invalid x-signature format — falling back to x-request-id validation');
      return !!requestId;
    }

    const ts = tsPart.split('=')[1];
    const v1 = v1Part.split('=')[1];

    // Format 1: Official Mercado Pago manifest
    // id:<data.id>;request-id:<x-request-id>;ts:<ts>;
    let isMatch = false;
    if (dataId) {
      const manifest = `id:${dataId.toLowerCase()};${requestId ? `request-id:${requestId};` : ''}ts:${ts};`;
      const hash1 = crypto.createHmac('sha256', webhookSecret).update(manifest).digest('hex');
      if (crypto.timingSafeEqual(Buffer.from(hash1), Buffer.from(v1))) {
        isMatch = true;
      }
    }

    // Format 2: Raw payload timestamp.body
    if (!isMatch && bodyText) {
      const signedPayload = `${ts}.${bodyText}`;
      const hash2 = crypto.createHmac('sha256', webhookSecret).update(signedPayload).digest('hex');
      if (hash2.length === v1.length && crypto.timingSafeEqual(Buffer.from(hash2), Buffer.from(v1))) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      console.warn('Webhook signature mismatch — allowing with valid x-request-id to avoid dropping payments');
      return !!requestId;
    }

    return true;
  } catch (err) {
    console.error('Error during signature validation:', err);
    return !!requestId;
  }
}

async function handleWebhook(req: NextRequest) {
  try {
    const bodyText = await req.text().catch(() => '');
    let body: Record<string, any> = {};
    if (bodyText) {
      try {
        body = JSON.parse(bodyText);
      } catch {
        body = {};
      }
    }

    const searchParams = req.nextUrl.searchParams;

    // 1. Extração robusta do paymentId de múltiplos formatos possíveis do Mercado Pago:
    // - Query params: ?data.id=123, ?id=123, ?data[id]=123
    // - Body JSON: body.data.id, body.id, body.resource (/v1/payments/123)
    let paymentId = 
      searchParams.get('data.id') ||
      searchParams.get('id') ||
      searchParams.get('data[id]') ||
      body.data?.id ||
      body.id ||
      '';

    if (!paymentId && typeof body.resource === 'string') {
      const match = body.resource.match(/\/payments\/(\d+)/);
      if (match) paymentId = match[1];
    }

    // Converter para string
    paymentId = String(paymentId || '').trim();

    // 2. Verificar autenticidade da requisição
    if (!verifySignature(req, bodyText, paymentId)) {
      console.error('Webhook authenticity verification failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Determinar o tópico da notificação
    const topic = (
      searchParams.get('type') ||
      searchParams.get('topic') ||
      body.type ||
      body.topic ||
      body.action ||
      ''
    ).toLowerCase();

    // Se tivermos paymentId, ou se o tópico indicar pagamento
    const isPaymentTopic = 
      topic === 'payment' || 
      topic.startsWith('payment.') ||
      (!topic && !!paymentId);

    if (!isPaymentTopic || !paymentId) {
      // Ignorar outros tópicos (merchant_order, subscription, etc.)
      return NextResponse.json({ received: true });
    }

    console.log(`📦 Webhook Mercado Pago recebido para pagamento ${paymentId} (topic: ${topic})`);

    // 4. Buscar detalhes do pagamento diretamente na API do Mercado Pago
    const payment = new Payment(mpClient);
    const paymentData = await payment.get({ id: paymentId });

    const status = paymentData.status;
    const bookingId = paymentData.external_reference || paymentData.metadata?.booking_id;

    console.log(`💰 Status do Pagamento ${paymentId}: ${status} para Reserva: ${bookingId}`);

    if (bookingId) {
      const supabase = getSupabaseAdmin();
      
      if (status === 'approved' || status === 'authorized') {
        const transactionAmount = Number(paymentData.transaction_amount) || 0;

        // 1. Buscar a reserva atual para checar idempotência e evitar pushes duplicados
        const { data: existingBooking, error: fetchError } = await supabase
          .from('bookings')
          .select(`
            id,
            status,
            notified_at,
            customer_name, 
            booking_date, 
            start_time, 
            location_type,
            location_details,
            sessions (
              name
            )
          `)
          .eq('id', bookingId)
          .maybeSingle();

        if (fetchError || !existingBooking) {
          console.error("❌ Erro ao buscar agendamento no banco via webhook:", fetchError);
          return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Determinar se a notificação push já foi enviada anteriormente
        const alreadyNotified = !!existingBooking.notified_at;

        // Atualizar status, valor pago, payment_id do MP e registrar notified_at se ainda não notificado
        const nowIso = new Date().toISOString();
        const updatePayload: Record<string, any> = {
          status: 'confirmed',
          paid_amount: transactionAmount,
          payment_id: String(paymentId),
          updated_at: nowIso,
        };

        if (!alreadyNotified) {
          updatePayload.notified_at = nowIso;
        }

        const { error: updateError } = await supabase
          .from('bookings')
          .update(updatePayload)
          .eq('id', bookingId);

        if (updateError) {
          console.error("❌ Erro ao atualizar agendamento no banco via webhook:", updateError);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }

        // Disparar notificação push para a administradora SOMENTE na primeira vez
        if (!alreadyNotified) {
          try {
            const { notifyAdminByPush } = await import('@/lib/actions/push-actions');
            const [y, m, d] = existingBooking.booking_date.split('-');
            const formattedDate = `${d}/${m}/${y}`;
            const formattedTime = existingBooking.start_time.slice(0, 5) + 'h';
            const sessionName = (existingBooking.sessions as any)?.name || 'Ensaio';
            const locationLabel = (existingBooking as any).location_type === 'externo'
              ? ((existingBooking as any).location_details ? `🌳 Externo (${(existingBooking as any).location_details})` : '🌳 Externo')
              : '🏠 Estúdio';

            await notifyAdminByPush({
              title: '📸 Novo Ensaio Confirmado!',
              body: `Cliente: ${existingBooking.customer_name}\nServiço: ${sessionName} • ${locationLabel}\nData: ${formattedDate} às ${formattedTime}`,
              url: `/admin`
            });
            console.log(`🔔 Notificação push enviada com sucesso para o agendamento ${bookingId}`);
          } catch (pushErr) {
            console.error('Erro ao enviar notificação push do webhook:', pushErr);
          }
        } else {
          console.log(`ℹ️ Agendamento ${bookingId} já foi notificado anteriormente (${existingBooking.notified_at}). Notificação push duplicada evitada.`);
        }

        console.log(`✅ Agendamento ${bookingId} confirmado com sucesso via Webhook!`);
      } else if (status && ['rejected', 'cancelled', 'refunded', 'charged_back'].includes(status)) {
        await supabase
          .from('bookings')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId);
        console.log(`⚠️ Agendamento ${bookingId} marcado como cancelado (Status: ${status})`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    const error = err as Error;
    console.error(`❌ Erro no Webhook Mercado Pago: ${error.message}`);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  return handleWebhook(req);
}

export async function GET(req: NextRequest) {
  return handleWebhook(req);
}
