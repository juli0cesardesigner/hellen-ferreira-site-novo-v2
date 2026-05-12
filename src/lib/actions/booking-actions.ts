"use server";

// Mercado Pago Payment Integration - Active for Pix and Credit Card

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { SESSIONS_DATA } from "@/lib/data/sessions";

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
export async function getAvailableSlots(dateStr: string, sessionId: string, isAdmin: boolean = false) {
  try {
    const date = new Date(dateStr);
    const dayOfWeek = date.getUTCDay();

    // 0. Buscar detalhes da sessão no banco para ter as datas de disponibilidade reais
    const { data: dbSession } = await getSupabase()
      .from('sessions')
      .select('is_active, is_perpetual, start_date, end_date, duration_slots')
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

    if (!schemaSlots || schemaSlots.length === 0) {
      return { slots: [], message: "Não há horários configurados para este dia." };
    }

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

    // 4.2 Antecedência Mínima
    const minNoticeHoursStr = await getSiteSetting('min_booking_notice_hours');
    const minNoticeHours = parseInt(minNoticeHoursStr || '12');
    const now = new Date();
    // Adicionamos a antecedência ao tempo atual
    const minBookingTime = new Date(now.getTime() + (minNoticeHours * 60 * 60 * 1000));

    // 5. Lógica de Disponibilidade Real
    const availableSlots = schemaSlots.map((slot: any) => {
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
    const [globalRes, specificRes] = await Promise.all([
      getSupabase().from('schema_slots').select('*').is('session_id', null).order('start_time'),
      getSupabase().from('schema_slots').select('*').eq('session_id', sessionId).order('start_time')
    ]);

    const globalSlots = globalRes.data || [];
    const specificSlots = specificRes.data || [];

    // Construir o mapa de slots finais baseados no merge por dia da semana
    const activeSlotsCount: Record<number, number> = {};
    const finalSlotsMap: Record<string, any> = {};

    globalSlots.forEach((gs: any) => {
      const key = `${gs.day_of_week}-${gs.start_time}`;
      finalSlotsMap[key] = gs;
    });

    specificSlots.forEach((ss: any) => {
      const key = `${ss.day_of_week}-${ss.start_time}`;
      finalSlotsMap[key] = ss;
    });

    Object.values(finalSlotsMap).forEach((s: any) => {
      if (s.is_active) {
        activeSlotsCount[s.day_of_week] = (activeSlotsCount[s.day_of_week] || 0) + 1;
      }
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
      const dayOfWeek = date.getUTCDay(); // Usar getUTCDay para consistência com o resto do sistema

      // Check if day is blocked
      const isBlocked = blockedDays?.some((b: any) => dateStr >= b.start_date && dateStr <= b.end_date);
      
      // Check session date restriction
      const isWithinRange = session.is_perpetual || (
        (!session.start_date || dateStr >= session.start_date) &&
        (!session.end_date || dateStr <= session.end_date)
      );

      const totalSlotsInDay = activeSlotsCount[dayOfWeek] || 0;
      
      if (isBlocked || totalSlotsInDay === 0 || !isWithinRange) {
        availabilityMap[dateStr] = false;
        continue;
      }

      // Check notice period for the day
      // Se a data é hoje ou amanhã, precisamos validar se ainda restam slots fora da zona de restrição
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

      const dayBookingsCount = bookings?.filter((b: any) => b.booking_date === dateStr).length || 0;
      
      // Se bookings >= slots totais, o dia está lotado
      availabilityMap[dateStr] = dayBookingsCount < totalSlotsInDay; 
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

  // 1. Pegamos a sessão para saber a duração e preços (incluindo pacotes)
  const session = SESSIONS_DATA[data.sessionId];

  if (!session) return { error: "Sessão não encontrada." };
  if (!session.is_active) return { error: "Este serviço está temporariamente pausado." };

  // 2. Pegar duração do banco
  const { data: dbSession } = await getSupabase().from('sessions').select('duration_slots').eq('id', data.sessionId).single();
  const durationSlots = dbSession?.duration_slots || session.duration_slots;

  // 3. Calcular End Time dinamicamente baseado na grade mestra (Master Grid)
  const dayOfWeek = new Date(data.bookingDate).getUTCDay();
  const { data: allDaySlots } = await getSupabase().from('schema_slots').select('start_time').eq('day_of_week', dayOfWeek).eq('is_active', true).order('start_time');
  const masterGrid = Array.from(new Set(allDaySlots?.map((s: any) => s.start_time) || [])).sort();
  
  // start_time do front geralmente vem como '15:30' ou '15:30:00'
  const timeCompare = data.startTime.length === 5 ? `${data.startTime}:00` : data.startTime;
  const masterIndex = masterGrid.indexOf(timeCompare);
  
  let endTimeDate = new Date();
  
  if (masterIndex !== -1 && masterGrid.length > 0) {
    // Pega o último slot consumido baseado na grade mestra absoluta
    const lastSlotIndex = Math.min(masterIndex + durationSlots - 1, masterGrid.length - 1);
    const lastSlotStartTime = masterGrid[lastSlotIndex] as string;
    const parts = lastSlotStartTime.split(':');
    endTimeDate.setHours(parseInt(parts[0]), parseInt(parts[1]) + 30, 0); // Adiciona 30 min no último horário
  } else {
    // Fallback absoluto
    const startParts = data.startTime.split(':');
    endTimeDate.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0);
    endTimeDate = new Date(endTimeDate.getTime() + (durationSlots * 90 * 60000));
  }
  
  const endTime = endTimeDate.toTimeString().split(' ')[0];

  // 3. Determinar os valores baseados no Tier_Order
  const selectedPackage = session.session_packages
    ?.filter((p: any) => p.is_active)
    ?.find((p: any) => p.tier_order === tier);
    
  if (!selectedPackage) return { error: "Pacote não encontrado ou inativo." };

  const packagePrice = data.packageType === 'digital' 
    ? selectedPackage.price_digital 
    : selectedPackage.price_print;
  
  const amountToPay = data.paymentType === 'deposit' ? session.deposit_price : packagePrice;

  // 4. Salvar no Banco como Pending
  const { data: booking, error } = await getSupabase().from('bookings').insert({
    session_id: data.sessionId,
    customer_name: data.clientName,
    customer_email: data.clientEmail,
    customer_phone: data.clientPhone,
    booking_date: data.bookingDate,
    start_time: data.startTime,
    end_time: endTime,
    status: 'pending',
    package_type: data.packageType,
    total_amount: packagePrice,
    paid_amount: amountToPay
  }).select().single();

  if (error) {
    console.error("Erro Supabase:", error);
    return { error: "Erro ao registrar agendamento." };
  }

  // 4. Integrar com Mercado Pago para Checkout Transparente / Modal
  try {
    const { mpClient } = await import('@/lib/utils/mercadopago');
    const { Preference } = await import('mercadopago');
    
    const preference = new Preference(mpClient);
    
    const response = await preference.create({
      body: {
        items: [
          {
            id: booking.id,
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
        external_reference: booking.id,
        metadata: {
          booking_id: booking.id,
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

    return { 
      success: true, 
      bookingId: booking.id,
      preferenceId: response.id, // Retornamos o ID para o Brick do frontend
    };
  } catch (mpError: any) {
    console.error("Erro ao criar preferência Mercado Pago:", mpError);
    return { 
      success: false, 
      error: "Ocorreu um erro ao iniciar o pagamento. Por favor, tente novamente." 
    };
  }
}

/**
 * Processa o pagamento real vindo do Brick (Transparent Checkout)
 */
export async function processPayment(paymentData: any, bookingId: string) {
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
          email: paymentData.payer.email,
          identification: {
            type: paymentData.payer.identification.type,
            number: paymentData.payer.identification.number,
          },
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
 * Busca os detalhes completos da sessão pelo ID (Modelo Estático)
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
      console.error("Session not found in DB for ID:", id);
      // Fallback para dados estáticos se necessário, mas o DB deve ser a fonte primária
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
 * Lista todas as sessões ativas (Modelo Estático)
 */
export async function listActiveSessions() {
  return Object.values(SESSIONS_DATA)
    .filter(s => s.is_active)
    .map(s => ({ id: s.id, name: s.name, slug: s.slug, is_active: s.is_active }));
}

/**
 * Busca os detalhes completos da sessão pelo SLUG (Modelo Estático)
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
