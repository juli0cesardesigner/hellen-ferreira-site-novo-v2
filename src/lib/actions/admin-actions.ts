"use server";

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
    console.error("Supabase environment variables are missing in Admin Actions!");
    throw new Error("Supabase internal configuration error");
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

export async function getAdminStats() {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  // Sessões de Hoje
  const { count: todayCount } = await getSupabase()
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('booking_date', today)
    .neq('status', 'cancelled');

  // Sessões da Semana
  const { count: weekCount } = await getSupabase()
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('booking_date', today)
    .lte('booking_date', nextWeekStr)
    .neq('status', 'cancelled');

  // Faturamento Confirmado (Soma do paid_amount das bookings)
  const { data: bookingsRevenue } = await getSupabase()
    .from('bookings')
    .select('paid_amount')
    .neq('status', 'cancelled');

  const totalRevenue = bookingsRevenue?.reduce((acc: number, curr: { paid_amount: number }) => acc + (Number(curr.paid_amount) || 0), 0) || 0;

  return {
    todaySessions: todayCount || 0,
    weekSessions: weekCount || 0,
    totalRevenue
  };
}

export async function getBookingsList() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await getSupabase()
    .from('bookings')
    .select(`
      *,
      sessions (
        name,
        theme_color
      )
    `)
    .gte('booking_date', today)
    .order('booking_date', { ascending: true })
    .limit(50);

  if (error) {
    console.error("Erro ao carregar reservas:", error);
    return { bookings: [] };
  }

  return { bookings: data };
}

export async function getPastBookingsList() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await getSupabase()
    .from('bookings')
    .select(`
      *,
      sessions (
        name,
        theme_color
      )
    `)
    .lt('booking_date', today)
    .order('booking_date', { ascending: false })
    .limit(100);

  if (error) {
    console.error("Erro ao carregar histórico:", error);
    return { bookings: [] };
  }

  return { bookings: data };
}

export async function getBlockedDates() {
  const { data, error } = await getSupabase()
    .from('blocked_dates')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) {
    console.error("Erro ao carregar bloqueios:", error);
    return { blocks: [] };
  }

  return { blocks: data };
}

export async function addBlockedDate(startDate: string, endDate: string, reason: string) {
  const { error } = await getSupabase()
    .from('blocked_dates')
    .insert([{ start_date: startDate, end_date: endDate, reason }]);

  if (error) {
    console.error("Erro ao adicionar bloqueio:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/agendar');
  return { success: true };
}

export async function removeBlockedDate(id: string) {
  const { error } = await getSupabase()
    .from('blocked_dates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Erro ao remover bloqueio:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/agendar');
  return { success: true };
}


/**
 * Lista os slots padrão (schema) para uma sessão específica
 */
export async function listSchemaSlots(sessionId: string | null) {
  // 1. Buscar Globais
  const { data: globalSlots } = await getSupabase()
    .from('schema_slots')
    .select('*')
    .is('session_id', null)
    .order('start_time');

  if (!sessionId || sessionId === "") {
    return { slots: globalSlots?.map((s: any) => ({ ...s, source: 'global' })) || [] };
  }

  // 2. Buscar Específicos
  const { data: specificSlots } = await getSupabase()
    .from('schema_slots')
    .select('*')
    .eq('session_id', sessionId)
    .order('start_time');

  // 3. Mesclar
  const finalMap: Record<string, any> = {};
  
  globalSlots?.forEach((gs: any) => {
    const key = `${gs.day_of_week}-${gs.start_time}`;
    finalMap[key] = { ...gs, source: 'global' };
  });

  specificSlots?.forEach((ss: any) => {
    const key = `${ss.day_of_week}-${ss.start_time}`;
    finalMap[key] = { ...ss, source: 'specific' };
  });

  const merged = Object.values(finalMap).sort((a: any, b: any) => {
    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
    return a.start_time.localeCompare(b.start_time);
  });

  return { slots: merged };
}

/**
 * Adiciona um slot padrão para uma sessão e dia da semana
 */
export async function addSchemaSlot(dayOfWeek: number, startTime: string, sessionId: string | null = null, isActive: boolean = true) {
  const { error } = await getSupabase()
    .from('schema_slots')
    .insert([{ 
      session_id: (sessionId === "" ? null : sessionId), 
      day_of_week: dayOfWeek, 
      start_time: startTime,
      is_active: isActive
    }]);
    
  if (error) {
    console.error("Erro ao adicionar slot:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/agendar');
  return { success: true };
}

/**
 * Remove um slot padrão
 */
export async function deleteSchemaSlot(id: string) {
  const { error } = await getSupabase()
    .from('schema_slots')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error("Erro ao remover slot:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/agendar');
  return { success: true };
}

/**
 * Cria um agendamento manual via painel admin (especial)
 */
export async function createManualBooking(data: {
  sessionId: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  package_type: string;
  total_amount: number;
  paid_amount: number;
  status: 'pending' | 'confirmed';
}) {
  // 1. Pegar a sessão para calcular o tempo final (90 min por slot)
  const session = SESSIONS_DATA[data.sessionId];
  const { data: dbSession } = await getSupabase().from('sessions').select('duration_slots').eq('id', data.sessionId).single();

  const duration = dbSession?.duration_slots || session?.duration_slots || 1;

  // 2. Calcular End Time dinamicamente baseado na grade mestra (Master Grid)
  const dayOfWeek = new Date(data.booking_date).getUTCDay();
  const { data: allDaySlots } = await getSupabase().from('schema_slots').select('start_time').eq('day_of_week', dayOfWeek).eq('is_active', true).order('start_time');
  const masterGrid = Array.from(new Set(allDaySlots?.map((s: any) => s.start_time) || [])).sort();
  
  const timeCompare = data.start_time.length === 5 ? `${data.start_time}:00` : data.start_time;
  const masterIndex = masterGrid.indexOf(timeCompare);
  
  let endTimeDate = new Date();
  
  if (masterIndex !== -1 && masterGrid.length > 0) {
    const lastSlotIndex = Math.min(masterIndex + duration - 1, masterGrid.length - 1);
    const lastSlotStartTime = masterGrid[lastSlotIndex] as string;
    const parts = lastSlotStartTime.split(':');
    endTimeDate.setHours(parseInt(parts[0]), parseInt(parts[1]) + 30, 0); 
  } else {
    // Fallback absoluto
    const startParts = data.start_time.split(':');
    endTimeDate.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0);
    endTimeDate = new Date(endTimeDate.getTime() + (duration * 90 * 60000));
  }
  
  const end_time = endTimeDate.toTimeString().split(' ')[0];

  const { error } = await getSupabase().from('bookings').insert([{
    session_id: data.sessionId,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    booking_date: data.booking_date,
    start_time: data.start_time,
    end_time: end_time,
    date_time: `${data.booking_date}T${data.start_time}`,
    status: data.status,
    package_type: data.package_type,
    total_amount: data.total_amount,
    paid_amount: data.paid_amount,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }]);

  if (error) {
    console.error("Erro no manual booking:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/agendar');
  
  return { 
    success: true, 
    status: data.status,
    bookingId: data.sessionId, // Simplificado
    paymentUrl: data.status === 'pending' ? `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=manual_${Date.now()}` : null
  };
}

/**
 * Atualiza os dados de uma sessão existente
 */
export async function updateBooking(id: string, updates: any) {
  const { error } = await getSupabase().from('bookings').update(updates).eq('id', id);
  if (error) {
    console.error("Erro ao atualizar reserva:", error);
    return { success: false, error: error.message };
  }
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteBooking(id: string) {
  const { error } = await getSupabase().from('bookings').delete().eq('id', id);
  if (error) {
    console.error("Erro ao remover reserva:", error);
    return { success: false, error: error.message };
  }
  revalidatePath('/admin');
  return { success: true };
}

export async function updateSessionDuration(id: string, duration_slots: number) {
  const { error } = await getSupabase().from('sessions').update({ duration_slots }).eq('id', id);
  if (error) {
    console.error("Erro ao atualizar duração:", error);
    return { success: false, error: error.message };
  }
  revalidatePath('/admin');
  revalidatePath('/agendar');
  return { success: true };
}

export async function getAllSessionSettings() {
  const { data } = await getSupabase().from('sessions').select('id, duration_slots, theme_color');
  const settingsMap: Record<string, { duration: number, color: string }> = {};
  data?.forEach((d: any) => { 
    settingsMap[d.id] = { 
      duration: d.duration_slots, 
      color: d.theme_color || 'zinc' 
    }; 
  });
  return settingsMap;
}

export async function updateSessionColor(id: string, theme_color: string) {
  const { error } = await getSupabase().from('sessions').update({ theme_color }).eq('id', id);
  if (error) {
    console.error("Erro ao atualizar cor:", error);
    return { success: false, error: error.message };
  }
  revalidatePath('/admin');
  return { success: true };
}

export async function runMigration(sql: string) {
  const { error } = await getSupabase().rpc('exec_sql', { sql_string: sql });
  if (error) {
     // fallback if exec_sql rpc doesn't exist
     console.error("Migration error:", error);
     return { success: false, error: error.message };
  }
  return { success: true };
}

