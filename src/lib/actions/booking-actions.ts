"use server";

// Mercado Pago Payment Integration - Active for Pix and Credit Card

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { SESSIONS_DATA } from "@/lib/data/sessions";
import crypto from "crypto";

// Lazy initialization of Supabase client to prevent crashes if env vars are missing during build/init
let supabaseClient: any = null;

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
  } catch (e) {
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
      .select('is_active, is_perpetual, start_date, end_date, duration_slots, setup_minutes, cleanup_minutes')
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
    const finalSlotsMap: Record<string, any> = {};

    globalSlots.forEach((gs: any) => {
      finalSlotsMap[gs.start_time] = gs;
    });

    specificSlots.forEach((ss: any) => {
      finalSlotsMap[ss.start_time] = ss;
    });

    // Filtra apenas os que restaram ativos após o merge
    const schemaSlots = Object.values(finalSlotsMap).filter((s: any) => s.is_active);

    // 3. Pegar agendamentos existentes na data (apenas confirmados ou pendentes)
    const { data: existingBookings } = await getSupabase()
      .from('bookings')
      .select('start_time, end_time')
      .eq('booking_date', dateStr)
      .in('status', ['confirmed', 'pending']);

    const duration = dbSession?.duration_slots || 1;

    // 4.1 Master Grid: a grade absoluta de tempo da profissional no dia
    const { data: allDaySlots } = await getSupabase().from('schema_slots').select('start_time').eq('day_of_week', dayOfWeek).eq('is_active', true).order('start_time');
    const masterGrid = Array.from(new Set(allDaySlots?.map((s: any) => s.start_time) || [])).sort();

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
    const baseSlots: any[] = isAdmin
      ? masterGrid.map((time) => ({ start_time: time, is_active: true }))
      : schemaSlots;

    // 5. Lógica de Disponibilidade Real
    const availableSlots = baseSlots.map((slot: any) => {
      const startTime = slot.start_time;
      
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

      const masterIndex = masterGrid.indexOf(startTime);
      if (masterIndex === -1) return { time: startTime, available: false, reason: "Erro de grade" };

      // O cliente só vê os horários disponíveis — a duração considera apenas
      // os slots da sessão (sem setup/cleanup). O bloqueio do slot seguinte
      // ocorre apenas no momento da criação do agendamento (createBooking).
      
      // Verifica se a profissional tem blocos suficientes no dia para a duração do ensaio
      if (masterIndex + duration > masterGrid.length) {
        return { time: startTime, available: false, reason: "Tempo insuficiente no fim do dia" };
      }

      // Varre todos os blocos na grade mestra que este ensaio vai consumir
      for (let i = 0; i < duration; i++) {
        const gridTime = masterGrid[masterIndex + i] as string;
        
        const isBooked = existingBookings?.some((b: any) => 
          gridTime >= b.start_time && gridTime < b.end_time
        );
        
        // Se qualquer bloco intermediário bater num agendamento existente
        if (isBooked) {
           return { time: startTime, available: false, reason: i === 0 ? "Ocupado" : "Conflita com próxima sessão" };
        }
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
      .select('is_active, is_perpetual, start_date, end_date')
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
    const finalSlotsMap: Record<string, any> = {};

    globalSlots.forEach((gs: any) => {
      const key = `${gs.day_of_week}-${gs.start_time}`;
      finalSlotsMap[key] = gs;
    });

    specificSlots.forEach((ss: any) => {
      const key = `${ss.day_of_week}-${ss.start_time}`;
      finalSlotsMap[key] = ss;
    });

    // Build per-day master grids (sorted start_time arrays for each day_of_week)
    const masterGridByDay: Record<number, string[]> = {};
    Object.values(finalSlotsMap).forEach((s: any) => {
      if (!s.is_active) return;
      if (!masterGridByDay[s.day_of_week]) masterGridByDay[s.day_of_week] = [];
      masterGridByDay[s.day_of_week].push(s.start_time);
    });
    Object.keys(masterGridByDay).forEach((dow) => {
      masterGridByDay[Number(dow)].sort();
    });

    // 3. Bookings no período
    const { data: bookings } = await getSupabase()
      .from('bookings')
      .select('booking_date, start_time, end_time')
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .in('status', ['confirmed', 'pending']);

    // 0.1 Buscar antecedência mínima
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
      const isBlocked = blockedDays?.some((b: any) => dateStr >= b.start_date && dateStr <= b.end_date);

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
        const slotsForThisDay = Object.values(finalSlotsMap).filter((s: any) => s.day_of_week === dayOfWeek && s.is_active);
        const hasAnyFutureSlot = slotsForThisDay.some((s: any) => {
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
      const dayBookings = bookings?.filter((b: any) => b.booking_date === dateStr) || [];
      let hasAvailableSlot = false;

      for (let gi = 0; gi <= dayGrid.length - durationSlots; gi++) {
        let slotAvailable = true;
        for (let offset = 0; offset < durationSlots; offset++) {
          const gridTime = dayGrid[gi + offset];
          const collides = dayBookings.some((b: any) =>
            gridTime >= b.start_time && gridTime < b.end_time
          );
          if (collides) {
            slotAvailable = false;
            break;
          }
        }
        if (slotAvailable) {
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
  const durationSlots = dbSessionFull?.duration_slots || (session as any).duration_slots;
  const cleanupMinutes = dbSessionFull?.cleanup_minutes ?? 15;
  const cleanupSlots = Math.ceil(cleanupMinutes / 30);
  // O end_time cobre a duração da sessão + o cleanup (intervalo pós-sessão)
  // Isso faz com que o slot seguinte ao cleanup fique naturalmente ocupado
  const totalSlotsForEndTime = durationSlots + cleanupSlots;

  // 3. Calcular End Time dinamicamente baseado na grade mestra (Master Grid)
  const dayOfWeek = parseLocalDate(data.bookingDate).getDay();
  const { data: allDaySlots } = await getSupabase().from('schema_slots').select('start_time').eq('day_of_week', dayOfWeek).eq('is_active', true).order('start_time');
  const masterGrid = Array.from(new Set(allDaySlots?.map((s: any) => s.start_time) || [])).sort();
  
  // start_time do front geralmente vem como '15:30' ou '15:30:00'
  const timeCompare = data.startTime.length === 5 ? `${data.startTime}:00` : data.startTime;
  const masterIndex = masterGrid.indexOf(timeCompare);
  
  let endTimeStr: string;
  
  if (masterIndex !== -1 && masterGrid.length > 0) {
    // Pega o último slot consumido: duração da sessão + cleanup
    const lastSlotIndex = Math.min(masterIndex + totalSlotsForEndTime - 1, masterGrid.length - 1);
    const lastSlotStartTime = masterGrid[lastSlotIndex] as string;
    const [h, m] = lastSlotStartTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + 30; // Adiciona 30 min no último horário
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
  } else {
    // Fallback: calcula baseado no startTime + totalSlots
    const [startH, startM] = data.startTime.split(':').map(Number);
    const totalMinutes = startH * 60 + startM + totalSlotsForEndTime * 30;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
  }

  // 3. Determinar os valores baseados no Tier_Order
  const selectedPackage = session.session_packages
    ?.filter((p: any) => p.is_active)
    ?.find((p: any) => p.tier_order === tier);
    
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
  } catch (mpError: any) {
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
    payment_preference_id: preferenceId || null,
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
export async function processPayment(paymentData: any, bookingId: string) {
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
        token: paymentData.token,
        description: paymentData.description || "Agendamento de Sessão Fotográfica",
        installments: Number(paymentData.installments),
        payment_method_id: paymentData.payment_method_id,
        issuer_id: paymentData.issuer_id,
        payer: {
          email: paymentData.payer?.email,
          ...(paymentData.payer?.identification ? {
            identification: {
              type: paymentData.payer.identification.type,
              number: paymentData.payer.identification.number,
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
        }
      };
    }

    // 3. Para outros métodos (Cartão), retornar o status
    return {
      success: true,
      status: response.status,
      paymentId: response.id,
    };

  } catch (error: any) {
    console.error("Erro ao processar pagamento:", error);
    return {
      success: false,
      error: error.message || "Erro ao processar pagamento."
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
      session.session_packages.sort((a: any, b: any) => a.tier_order - b.tier_order);
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
  } catch (e) {
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
      session.session_packages.sort((a: any, b: any) => a.tier_order - b.tier_order);
    }

    return { session };
  } catch (err) {
    console.error("Error fetching session by slug:", err);
    return { session: null };
  }
}
