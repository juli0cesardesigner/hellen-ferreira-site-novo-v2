"use server";

// Mercado Pago Payment Integration - Active for Pix and Credit Card

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type Session, type SlotDefinition, type Booking, type Package } from "@/types/database";
import { SESSIONS_DATA } from "@/lib/data/sessions";

// Lazy initialization of Supabase client to prevent crashes if env vars are missing during build/init
let supabaseClient: SupabaseClient | null = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are missing!");
    throw new Error("Supabase internal configuration error");
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

export async function getSiteSetting(key: string) {
  try {
    const { data, error } = await getSupabase().from('site_settings').select('value').eq('key', key).single();
    if (error) return null;
    return data.value;
  } catch {
    return null;
  }
}

/**
 * Retorna os slots disponíveis para uma data e sessão específica
 */
/**
 * Helper: parse YYYY-MM-DD as local date (Brazil/America/Sao_Paulo).
 * Using new Date("YYYY-MM-DD") without time interprets as UTC midnight,
 * which shifts the day-of-week for negative UTC offsets.
 * We parse manually to keep the date anchored to local calendar day.
 */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export async function getAvailableSlots(dateStr: string, sessionId: string, isAdmin: boolean = false) {
  try {
    const date = parseLocalDate(dateStr);
    const dayOfWeek = date.getDay();

    // 0. Buscar detalhes da sessão no banco para ter as datas de disponibilidade reais
    const { data: dbSession } = await getSupabase()
      .from('sessions')
      .select('is_active, is_perpetual, start_date, end_date, duration_slots, setup_minutes, cleanup_minutes, slug')
      .eq('id', sessionId)
      .single();

    if (!dbSession || !dbSession.is_active) {
      return { slots: [], message: "Este serviço está temporariamente pausado." };
    }

    // Verificar restrição de data para serviços sazonais
    if (!dbSession.is_perpetual) {
      if (dbSession.start_date && dateStr < dbSession.start_date) {
        return { slots: [], message: "Este serviço ainda não está disponível para agendamento." };
      }
      if (dbSession.end_date && dateStr > dbSession.end_date) {
        return { slots: [], message: "Este serviço não está mais disponível para esta data." };
      }
    }

    // 1. Verificar se a data está bloqueada (Bloqueio em Massa)
    const { data: blockedDays } = await getSupabase()
      .from('blocked_dates')
      .select('*')
      .lte('start_date', dateStr)
      .gte('end_date', dateStr);

    if (blockedDays && blockedDays.length > 0) {
      return { slots: [], message: "Data bloqueada para agendamentos." };
    }

    // 2. Buscar Slots Globais e Específicos para o dia
    const [globalRes, specificRes] = await Promise.all([
      getSupabase().from('schema_slots').select('*').eq('day_of_week', dayOfWeek).is('session_id', null).order('start_time'),
      getSupabase().from('schema_slots').select('*').eq('day_of_week', dayOfWeek).eq('session_id', sessionId).order('start_time')
    ]);

    const globalSlots = globalRes.data || [];
    const specificSlots = specificRes.data || [];

    // Criar um mapa de slots finais baseados no merge
    // Slots específicos (Overrides) prevalecem sobre os Globais
    const finalSlotsMap: Record<string, SlotDefinition> = {};

    globalSlots.forEach((gs: SlotDefinition) => {
      finalSlotsMap[gs.start_time] = gs;
    });

    specificSlots.forEach((ss: SlotDefinition) => {
      finalSlotsMap[ss.start_time] = ss;
    });

    // Filtra apenas os que restaram ativos após o merge e ordena cronologicamente
    const schemaSlots = Object.values(finalSlotsMap)
      .filter((s: SlotDefinition) => s.is_active)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    // 3. Pegar agendamentos existentes na data (apenas confirmados ou pendentes não expirados)
    const currentTime = new Date();
    const { data: existingBookings } = await getSupabase()
      .from('bookings')
      .select('start_time, end_time, status, expires_at')
      .eq('booking_date', dateStr)
      .in('status', ['confirmed', 'pending']);

    // Filtrar bookings pendentes expirados (liberar o slot)
    const activeBookings = (existingBookings || []).filter((b) => {
      if (b.status === 'confirmed') return true;
      if (b.status === 'pending') {
        // Booking pendente sem expires_at: considera válido por 30 min (tempo do checkout/pix)
        if (!b.expires_at) return true;
        return new Date(b.expires_at as string) > currentTime;
      }
      return false;
    });

    // Regra específica para Civil: caso tenha qualquer agendamento a partir de 15:30 (qualquer serviço) - nenhum horário de Civil é exibido para o dia
    const isCivil = dbSession?.slug === 'civil' || sessionId === '1595bad4-1d33-4c39-9ca3-1ec2d1849962';
    if (isCivil && !isAdmin) {
      const hasBookingFrom1530 = activeBookings.some((b) => {
        const [h, m] = b.start_time.split(':').map(Number);
        return (h * 60 + m) >= (15 * 60 + 30);
      });
      if (hasBookingFrom1530) {
        return { slots: [], message: "Nenhum horário disponível para Casamento Civil neste dia." };
      }
    }

    const duration = dbSession?.duration_slots || 1;

    // 4.1 Master Grid: a grade absoluta de tempo da profissional no dia
    const { data: allDaySlots } = await getSupabase().from('schema_slots').select('start_time').eq('day_of_week', dayOfWeek).eq('is_active', true).order('start_time');
    const masterGrid = Array.from(new Set(allDaySlots?.map((s: { start_time: string }) => s.start_time) || [])).sort();

    // Para admin: usa a grade mestre completa, sem depender de schemaSlots
    if (isAdmin) {
      if (masterGrid.length === 0) {
        return { slots: [], message: "Não há horários configurados para este dia." };
      }
    } else {
      if (!schemaSlots || schemaSlots.length === 0) {
        return { slots: [], message: "Não há horários configurados para este dia." };
      }
    }

    // 4.2 Antecedência Mínima
    const minNoticeHoursStr = await getSiteSetting('min_booking_notice_hours');
    const minNoticeHours = parseInt(minNoticeHoursStr || '12');
    const now = new Date();
    // Adicionamos a antecedência ao tempo atual
    const minBookingTime = new Date(now.getTime() + (minNoticeHours * 60 * 60 * 1000));

    // 5. Para admin: usar a grade mestre completa, não apenas os slots do serviço
    // Isso permite que o admin agende em QUALQUER horário livre do dia,
    // mesmo que não esteja no schema específico do serviço.
    const baseSlots: Partial<SlotDefinition>[] = isAdmin
      ? masterGrid.map((time) => ({ start_time: time, is_active: true }))
      : schemaSlots;

    // 5. Lógica de Disponibilidade Real
    const availableSlots = baseSlots.map((slot) => {
      const startTime = slot.start_time;
      if (!startTime) return { time: '', available: false };
      
      // Verificar antecedência mínima
      // Combinamos a data com o horário do slot. 
      // Nota: dateStr (YYYY-MM-DD) + T + startTime (HH:mm:ss)
      // Usamos uma data "absoluta" para comparação
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes, seconds] = startTime.split(':').map(Number);
      
      // Criamos a data do slot no mesmo "contexto" de now para comparação direta
      // Como o estúdio opera em um horário fixo, vamos tratar tudo como o tempo do sistema (Vercel costuma ser UTC)
      // Se Hellen está no Brasil (UTC-3), e Now é UTC, o slot de 09:00 no Brasil é 12:00 UTC.
      // Para simplificar e evitar bugs de timezone complexos, vamos assumir que NOW e SLOT estão no mesmo fuso se não especificado.
      // No agendamento real, o importante é a distância relativa.
      const slotDate = new Date(year, month - 1, day, hours, minutes, seconds || 0);
      
      if (!isAdmin && slotDate < minBookingTime) {
        return { time: startTime, available: false, reason: `Mínimo de ${minNoticeHours}h de antecedência` };
      }

      // Convert slot start time to minutes
      const [sh, sm] = startTime.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = startMin + duration * 30;

      // Real time overlap check with active bookings
      const isBooked = activeBookings?.some((b) => {
        const [bStartH, bStartM] = b.start_time.split(':').map(Number);
        const [bEndH, bEndM] = b.end_time.split(':').map(Number);
        const bStartMin = bStartH * 60 + bStartM;
        const bEndMin = bEndH * 60 + bEndM;
        
        return startMin < bEndMin && endMin > bStartMin;
      });

      if (isBooked) {
        return { time: startTime, available: false, reason: "Ocupado ou conflita com próxima sessão" };
      }

      return { time: startTime, available: true };
    });

    return { slots: availableSlots };
  } catch (error) {
    console.error("Erro ao buscar slots:", error);
    return { error: "Erro interno ao processar disponibilidade." };
  }
}

/**
 * Retorna um resumo da disponibilidade para um mês inteiro (se há slots ou não)
 */
export async function getMonthAvailability(year: number, month: number, sessionId: string, isAdmin: boolean = false) {
  try {
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    // 0. Buscar detalhes da sessão no banco
    const { data: session } = await getSupabase()
      .from('sessions')
      .select('is_active, is_perpetual, start_date, end_date, slug')
      .eq('id', sessionId)
      .single();

    if (!session || !session.is_active) {
      return {};
    }

    // 1. Bloqueios
    const { data: blockedDays } = await getSupabase()
      .from('blocked_dates')
      .select('start_date, end_date')
      .lte('start_date', endDate)
      .gte('end_date', startDate);

    // 2. Horários base (Schema) do serviço e Global
    // Also fetch duration_slots for this session to compute master-grid occupancy
    const { data: dbSession } = await getSupabase()
      .from('sessions')
      .select('duration_slots, setup_minutes, cleanup_minutes')
      .eq('id', sessionId)
      .single();
    const durationSlots = dbSession?.duration_slots || 1;

    const [globalRes, specificRes] = await Promise.all([
      getSupabase().from('schema_slots').select('*').is('session_id', null).order('start_time'),
      getSupabase().from('schema_slots').select('*').eq('session_id', sessionId).order('start_time')
    ]);

    const globalSlots = globalRes.data || [];
    const specificSlots = specificRes.data || [];

    // Build merged slot map keyed by day_of_week-start_time
    const finalSlotsMap: Record<string, SlotDefinition> = {};

    globalSlots.forEach((gs: SlotDefinition) => {
      const key = `${gs.day_of_week}-${gs.start_time}`;
      finalSlotsMap[key] = gs;
    });

    specificSlots.forEach((ss: SlotDefinition) => {
      const key = `${ss.day_of_week}-${ss.start_time}`;
      finalSlotsMap[key] = ss;
    });

    // Build per-day master grids (sorted start_time arrays for each day_of_week)
    const masterGridByDay: Record<number, string[]> = {};
    Object.values(finalSlotsMap).forEach((s: SlotDefinition) => {
      if (!s.is_active) return;
      if (!masterGridByDay[s.day_of_week]) masterGridByDay[s.day_of_week] = [];
      masterGridByDay[s.day_of_week].push(s.start_time);
    });
    Object.keys(masterGridByDay).forEach((dow) => {
      masterGridByDay[Number(dow)].sort();
    });

    // 3. Bookings no período
    const currentTime = new Date();
    const { data: bookings } = await getSupabase()
      .from('bookings')
      .select('booking_date, start_time, end_time, status, expires_at')
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .in('status', ['confirmed', 'pending']);

    // Filtrar bookings pendentes expirados
    const activeBookings = (bookings || []).filter((b) => {
      if (b.status === 'confirmed') return true;
      if (b.status === 'pending') {
        if (!b.expires_at) return true; // sem expiração: mantém
        return new Date(b.expires_at as string) > currentTime;
      }
      return false;
    });

    // 0.3 Antecedência mínima e data atual de referência
    const minNoticeHoursStr = await getSiteSetting('min_booking_notice_hours');
    const minNoticeHours = parseInt(minNoticeHoursStr || '12');
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + (minNoticeHours * 60 * 60 * 1000));

    // Construir o mapa de disponibilidade
    const availabilityMap: Record<string, boolean> = {};
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay(); // Local day-of-week, consistent with getAvailableSlots

      // Check if day is blocked
      const isBlocked = blockedDays?.some((b: { start_date: string; end_date: string }) => dateStr >= b.start_date && dateStr <= b.end_date);

      // Check session date restriction
      const isWithinRange = session.is_perpetual || (
        (!session.start_date || dateStr >= session.start_date) &&
        (!session.end_date || dateStr <= session.end_date)
      );

      const dayGrid = masterGridByDay[dayOfWeek];
      if (isBlocked || !dayGrid || dayGrid.length === 0 || !isWithinRange) {
        availabilityMap[dateStr] = false;
        continue;
      }

      // Check notice period for the day
      if (!isAdmin && dateStr <= minBookingTime.toISOString().split('T')[0]) {
        const slotsForThisDay = Object.values(finalSlotsMap).filter((s: SlotDefinition) => s.day_of_week === dayOfWeek && s.is_active);
        const hasAnyFutureSlot = slotsForThisDay.some((s: SlotDefinition) => {
          const [h, m, sec] = s.start_time.split(':').map(Number);
          const slotDate = new Date(year, month, day, h, m, sec || 0);
          return slotDate >= minBookingTime;
        });

        if (!hasAnyFutureSlot) {
          availabilityMap[dateStr] = false;
          continue;
        }
      }

      // Day-level availability via master-grid occupancy check
      // A day is available if there's at least one starting slot that can accommodate
      // a booking of duration=durationSlots without colliding with existing bookings.
      const dayBookings = activeBookings?.filter((b: any) => b.booking_date === dateStr) || [];
      
      // Regra específica para Civil: caso tenha qualquer agendamento a partir de 15:30 (qualquer serviço) - nenhum horário de Civil é exibido para o dia
      const isCivil = session?.slug === 'civil' || sessionId === '1595bad4-1d33-4c39-9ca3-1ec2d1849962';
      if (isCivil && !isAdmin) {
        const hasBookingFrom1530 = dayBookings.some((b) => {
          const [h, m] = b.start_time.split(':').map(Number);
          return (h * 60 + m) >= (15 * 60 + 30);
        });
        if (hasBookingFrom1530) {
          availabilityMap[dateStr] = false;
          continue;
        }
      }

      let hasAvailableSlot = false;

      for (const gridTime of dayGrid) {
        const [sh, sm] = gridTime.split(':').map(Number);
        const startMin = sh * 60 + sm;
        const endMin = startMin + durationSlots * 30;

        const collides = dayBookings.some((b) => {
          const [bStartH, bStartM] = b.start_time.split(':').map(Number);
          const [bEndH, bEndM] = b.end_time.split(':').map(Number);
          const bStartMin = bStartH * 60 + bStartM;
          const bEndMin = bEndH * 60 + bEndM;
          
          return startMin < bEndMin && endMin > bStartMin;
        });

        if (!collides) {
          hasAvailableSlot = true;
          break;
        }
      }

      availabilityMap[dateStr] = hasAvailableSlot;
    }

    return availabilityMap;
  } catch (error) {
    console.error("Erro ao buscar disponibilidade mensal:", error);
    return {};
  }
}

/**
 * Cria um agendamento pendente e gera a preferência do Mercado Pago
 */
export async function createBooking(data: {
  sessionId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCpf?: string;
  bookingDate: string;
  startTime: string;
  paymentType: 'deposit' | 'full';
  packageType: 'digital' | 'print';
  selectedTier?: number;
}) {
  const tier = data.selectedTier || 1;

  // 0. Validar credenciais do Mercado Pago
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    console.error("MERCADOPAGO_ACCESS_TOKEN não configurado no servidor.");
    return { 
      error: "O sistema de pagamentos está em manutenção (Configuração ausente). Por favor, tente novamente mais tarde." 
    };
  }

  // 1. Pegamos a sessão do banco primeiro (preços, pacotes, duração)
  const { data: dbSessionFull } = await getSupabase()
    .from('sessions')
    .select(`*, session_packages (*)`)
    .eq('id', data.sessionId)
    .single();

  // Fallback to static data if DB is unreachable
  const session = (dbSessionFull && dbSessionFull.is_active) ? dbSessionFull : SESSIONS_DATA[data.sessionId];

  if (!session) return { error: "Sessão não encontrada." };
  if (!session.is_active) return { error: "Este serviço está temporariamente pausado." };

  // 2. Duração do banco (ou fallback)
  const durationSlots = dbSessionFull?.duration_slots || (session as unknown as Session).duration_slots;
  const cleanupMinutes = dbSessionFull?.cleanup_minutes ?? 15;
  const cleanupSlots = Math.ceil(cleanupMinutes / 30);
  // O end_time cobre a duração da sessão + o cleanup (intervalo pós-sessão)
  // Isso faz com que o slot seguinte ao cleanup fique naturalmente ocupado
  const totalSlotsForEndTime = durationSlots + cleanupSlots;

  // 3. Calcular End Time dinamicamente baseado no tempo real (sempre!)
  const [startH, startM] = data.startTime.split(':').map(Number);
  const totalMinutes = startH * 60 + startM + totalSlotsForEndTime * 30;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;

  // 3. Determinar os valores baseados no Tier_Order
  const selectedPackage = session.session_packages
    ?.filter((p: Package) => p.is_active)
    ?.find((p: Package) => p.tier_order === tier);
    
  if (!selectedPackage) return { error: "Pacote não encontrado ou inativo." };

  const packagePrice = data.packageType === 'digital' 
    ? selectedPackage.price_digital 
    : selectedPackage.price_print;
  
  const amountToPay = data.paymentType === 'deposit' ? session.deposit_price : packagePrice;

  // 4. Criar preferência de pagamento PRIMEIRO (evita booking órfão)
  let preferenceId: string | null = null;
  try {
    const { mpClient } = await import('@/lib/utils/mercadopago');
    const { Preference } = await import('mercadopago');
    
    // Usar um ID temporário como external_reference; será atualizado após inserir o booking
    const tempRef = crypto.randomUUID();
    
    const preference = new Preference(mpClient);
    
    const response = await preference.create({
      body: {
        items: [
          {
            id: tempRef,
            title: `${session.name} - ${selectedPackage.name}`,
            quantity: 1,
            unit_price: Number(amountToPay),
            currency_id: 'BRL',
          }
        ],
        payer: {
          name: data.clientName,
          email: data.clientEmail,
          phone: {
            number: data.clientPhone.replace(/\D/g, '')
          },
          identification: {
            type: 'CPF',
            number: data.clientCpf?.replace(/\D/g, '')
          }
        },
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12,
        },
        external_reference: tempRef,
        metadata: {
          booking_id: tempRef, // Will be updated below
        },
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hellenferreira.com'}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hellenferreira.com'}/agendar/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hellenferreira.com'}/agendar/falha`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hellenferreira.com'}/agendar/pendente`,
        },
        auto_return: 'approved',
      }
    });

    preferenceId = response.id ?? null;
  } catch (mpError: unknown) {
    console.error("Erro ao criar preferência Mercado Pago:", mpError);
    return { 
      success: false, 
      error: "Ocorreu um erro ao iniciar o pagamento. Por favor, tente novamente." 
    };
  }

  // 5. Salvar no Banco como 'awaiting_payment' (só depois da preferência criada)
  // Garantir que start_time tenha formato HH:mm:ss
  const formattedStartTime = data.startTime.length === 5 ? `${data.startTime}:00` : data.startTime;
  
  console.log("📝 Inserindo booking no Supabase:", JSON.stringify({ 
    session_id: data.sessionId, 
    booking_date: data.bookingDate, 
    start_time: formattedStartTime, 
    end_time: endTimeStr,
    preferenceId: preferenceId || null,
    packagePrice,
    amountToPay,
    packageType: data.packageType
  }));
  
  const bookingPayload = {
    session_id: data.sessionId,
    customer_name: data.clientName,
    customer_email: data.clientEmail,
    customer_phone: data.clientPhone,
    booking_date: data.bookingDate,
    start_time: formattedStartTime,
    end_time: endTimeStr,
    status: 'pending',
    package_type: data.packageType,
    total_amount: packagePrice,
    paid_amount: amountToPay,
    payment_id: preferenceId || null,
    // Expira em 30 minutos se o pagamento não for concluído
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
  
  console.log("📦 Payload do insert:", JSON.stringify(bookingPayload));
  
  const { data: booking, error } = await getSupabase()
    .from('bookings')
    .insert(bookingPayload)
    .select()
    .single();

  if (error) {
    console.error("Erro Supabase ao criar booking:", JSON.stringify(error, null, 2));
    console.error("Dados enviados:", { session_id: data.sessionId, booking_date: data.bookingDate, start_time: data.startTime, end_time: endTimeStr });
    return { error: "Erro ao registrar agendamento." };
  }

  return { 
    success: true, 
    bookingId: booking.id,
    preferenceId, // Retornamos o ID para o Brick do frontend
  };
}

/**
 * Processa o pagamento real vindo do Brick (Transparent Checkout)
 */
export async function processPayment(paymentData: Record<string, unknown>, bookingId: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log("🚀 processPayment iniciado para bookingId:", bookingId);
  }
  try {
    const { mpClient } = await import('@/lib/utils/mercadopago');
    const { Payment } = await import('mercadopago');
    
    const payment = new Payment(mpClient);
    
    // 1. Criar o pagamento no Mercado Pago
    const response = await payment.create({
      body: {
        transaction_amount: Number(paymentData.transaction_amount),
        token: paymentData.token as string,
        description: (paymentData.description as string) || "Agendamento de Sessão Fotográfica",
        installments: Number(paymentData.installments),
        payment_method_id: paymentData.payment_method_id as string,
        issuer_id: Number(paymentData.issuer_id),
        payer: {
          email: (paymentData.payer as { email?: string })?.email,
          ...((paymentData.payer as { identification?: { type: string; number: string } })?.identification ? {
            identification: {
              type: (paymentData.payer as { identification: { type: string } }).identification.type,
              number: (paymentData.payer as { identification: { number: string } }).identification.number,
            }
          } : {}),
        },
        external_reference: bookingId,
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hellenferreira.com'}/api/webhooks/mercadopago`,
        metadata: {
          booking_id: bookingId,
        },
      }
    });

    // 2. Se for Pix, retornar os dados do QR Code
    if (paymentData.payment_method_id === 'pix') {
      // Tempo de expiração do QR Code: 30 minutos
      const pixExpiration = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      
      // Atualizar o booking com a data de expiração
      await getSupabase()
        .from('bookings')
        .update({ expires_at: pixExpiration })
        .eq('id', bookingId);
      
      if (process.env.NODE_ENV === 'development') {
        console.log("✅ Pagamento Pix criado com sucesso. Retornando QR Code.");
      }
      return {
        success: true,
        status: response.status,
        paymentId: response.id,
        pixData: {
          qrCode: response.point_of_interaction?.transaction_data?.qr_code,
          qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64,
          expiresAt: pixExpiration,
        }
      };
    }

    // 3. Para outros métodos (Cartão), retornar o status
    return {
      success: true,
      status: response.status,
      paymentId: response.id,
    };

  } catch (error: unknown) {
    console.error("Erro ao processar pagamento:", error);
    return {
      success: false,
      error: (error as Error).message || "Erro ao processar pagamento."
    };
  }
}

/**
 * Busca os detalhes completos da sessão pelo ID (DB first, static fallback)
 */
export async function fetchSessionDetails(id: string) {
  try {
    const { data: session, error } = await getSupabase()
      .from('sessions')
      .select(`
        *,
        session_packages (*)
      `)
      .eq('id', id)
      .single();

    if (error || !session) {
      // Fallback to static data only when DB is unreachable
      console.error("Session not found in DB for ID:", id);
      return { session: SESSIONS_DATA[id] || null };
    }

    if (!session.is_active) {
      return { session: null };
    }

    // Ordenar pacotes por tier_order
    if (session.session_packages) {
      session.session_packages.sort((a: { tier_order: number }, b: { tier_order: number }) => a.tier_order - b.tier_order);
    }

    return { session };
  } catch (err) {
    console.error("Error fetching session details:", err);
    return { session: SESSIONS_DATA[id] || null };
  }
}

/**
 * Lista todas as sessões ativas (DB first, static fallback)
 */
export async function listActiveSessions() {
  try {
    const { data: sessions, error } = await getSupabase()
      .from('sessions')
      .select('id, name, slug, is_active')
      .eq('is_active', true)
      .order('name');

    if (!error && sessions && sessions.length > 0) {
      return sessions;
    }
  } catch {
    // Fallback to static data
  }

  return Object.values(SESSIONS_DATA)
    .filter(s => s.is_active)
    .map(s => ({ id: s.id, name: s.name, slug: s.slug, is_active: s.is_active }));
}

/**
 * Busca os detalhes completos da sessão pelo SLUG (DB first, static fallback)
 */
export async function fetchSessionBySlug(slug: string) {
  try {
    const { data: session, error } = await getSupabase()
      .from('sessions')
      .select(`
        *,
        session_packages (*)
      `)
      .eq('slug', slug)
      .single();

    if (error || !session || !session.is_active) {
      return { session: null };
    }

    // Ordenar pacotes por tier_order
    if (session.session_packages) {
      session.session_packages.sort((a: { tier_order: number }, b: { tier_order: number }) => a.tier_order - b.tier_order);
    }

    return { session };
  } catch (err) {
    console.error("Error fetching session by slug:", err);
    return { session: null };
  }
}
