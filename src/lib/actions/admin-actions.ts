"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { SESSIONS_DATA } from "@/lib/data/sessions";
import { redirect } from "next/navigation";

// Lazy initialization of Supabase client with Service Role for internal admin operations
let supabaseAdmin: any = null;

function getAdminClient() {
  if (supabaseAdmin) return supabaseAdmin;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are missing in Admin Actions!");
    throw new Error("Supabase internal configuration error");
  }
  
  supabaseAdmin = createAdminClient(supabaseUrl, supabaseKey);
  return supabaseAdmin;
}

/**
 * Helper para validar se o usuário atual é um administrador autorizado
 */
async function validateAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Não autorizado. Faça login como administrador.");
  }

  // Lista de e-mails autorizados (pode ser expandida se necessário)
  const authorizedEmails = ["hellen@hellenferreira.com"];
  
  if (!user.email || !authorizedEmails.includes(user.email)) {
    console.warn(`Tentativa de acesso não autorizado detectada: ${user.email}`);
    throw new Error("Acesso negado. Você não tem permissões de administrador.");
  }
  
  return user;
}

export async function getAdminStats() {
  await validateAdmin();
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const admin = getAdminClient();

  // Sessões de Hoje
  const { count: todayCount } = await admin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('booking_date', today)
    .neq('status', 'cancelled');

  // Sessões da Semana
  const { count: weekCount } = await admin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('booking_date', today)
    .lte('booking_date', nextWeekStr)
    .neq('status', 'cancelled');

  // Faturamento Confirmado (Soma do paid_amount das bookings)
  const { data: bookingsRevenue } = await admin
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
  await validateAdmin();
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await getAdminClient()
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
  await validateAdmin();
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await getAdminClient()
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
  await validateAdmin();
  const { data, error } = await getAdminClient()
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
  await validateAdmin();
  const { error } = await getAdminClient()
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
  await validateAdmin();
  const { data, error } = await getAdminClient()
    .from('blocked_dates')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error("[ADMIN ACTION] Erro ao remover bloqueio:", error);
    return { success: false, error: error.message };
  }
  
  if (!data || data.length === 0) {
    return { success: false, error: "Bloqueio não encontrado." };
  }

  revalidatePath('/agendar');
  revalidatePath('/admin');
  return { success: true };
}

export async function listSessions() {
  await validateAdmin();
  const { data, error } = await getAdminClient()
    .from('sessions')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error("Erro ao listar sessões:", error);
    return { sessions: [] };
  }

  return { sessions: data };
}

export async function createSession(data: any) {
  await validateAdmin();
  const { error } = await getAdminClient()
    .from('sessions')
    .insert([data]);

  if (error) {
    console.error("Erro ao criar sessão:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/agendar');
  return { success: true };
}

export async function updateSession(id: string, updates: any) {
  await validateAdmin();
  const { error } = await getAdminClient()
    .from('sessions')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error("Erro ao atualizar sessão:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/agendar');
  return { success: true };
}

export async function deleteSession(id: string) {
  await validateAdmin();
  const { error } = await getAdminClient()
    .from('sessions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Erro ao deletar sessão:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/agendar');
  return { success: true };
}

export async function listSchemaSlots(sessionId: string | null) {
  await validateAdmin();
  const admin = getAdminClient();

  // 1. Buscar Globais
  const { data: globalSlots } = await admin
    .from('schema_slots')
    .select('*')
    .is('session_id', null)
    .order('start_time');

  if (!sessionId || sessionId === "") {
    return { slots: globalSlots?.map((s: any) => ({ ...s, source: 'global' })) || [] };
  }

  // 2. Buscar Específicos
  const { data: specificSlots } = await admin
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
    const isGlobalOverride = !!finalMap[key];
    finalMap[key] = { 
      ...ss, 
      source: isGlobalOverride ? 'global' : 'specific',
      is_override: isGlobalOverride 
    };
  });

  const merged = Object.values(finalMap).sort((a: any, b: any) => {
    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
    return a.start_time.localeCompare(b.start_time);
  });

  return { slots: merged };
}

export async function addSchemaSlot(dayOfWeek: number, startTime: string, sessionId: string | null = null, isActive: boolean = true) {
  await validateAdmin();
  const { error } = await getAdminClient()
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

export async function deleteSchemaSlot(id: string) {
  await validateAdmin();
  const { error } = await getAdminClient()
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
  await validateAdmin();
  const admin = getAdminClient();

  // 1. Pegar a sessão para calcular o tempo final
  const session = SESSIONS_DATA[data.sessionId];
  const { data: dbSession } = await admin.from('sessions').select('duration_slots').eq('id', data.sessionId).single();

  const duration = dbSession?.duration_slots || session?.duration_slots || 1;

  // 2. Calcular End Time
  const dayOfWeek = new Date(data.booking_date).getUTCDay();
  const { data: allDaySlots } = await admin.from('schema_slots').select('start_time').eq('day_of_week', dayOfWeek).eq('is_active', true).order('start_time');
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
    const startParts = data.start_time.split(':');
    endTimeDate.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0);
    endTimeDate = new Date(endTimeDate.getTime() + (duration * 90 * 60000));
  }
  
  const end_time = endTimeDate.toTimeString().split(' ')[0];

  const { error } = await admin.from('bookings').insert([{
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
    bookingId: data.sessionId
  };
}

export async function updateBooking(id: string, updates: any) {
  await validateAdmin();
  const { error } = await getAdminClient().from('bookings').update(updates).eq('id', id);
  if (error) {
    console.error("Erro ao atualizar reserva:", error);
    return { success: false, error: error.message };
  }
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteBooking(id: string) {
  await validateAdmin();
  const { data, error } = await getAdminClient()
    .from('bookings')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error("[ADMIN ACTION] Erro ao remover reserva:", error);
    return { success: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return { success: false, error: "Reserva não encontrada." };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function updateSessionDuration(id: string, duration_slots: number) {
  await validateAdmin();
  const { error } = await getAdminClient().from('sessions').update({ duration_slots }).eq('id', id);
  if (error) {
    console.error("Erro ao atualizar duração:", error);
    return { success: false, error: error.message };
  }
  revalidatePath('/admin');
  revalidatePath('/agendar');
  return { success: true };
}

export async function getAllSessionSettings() {
  await validateAdmin();
  const { data } = await getAdminClient().from('sessions').select('id, duration_slots, theme_color');
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
  await validateAdmin();
  const { error } = await getAdminClient().from('sessions').update({ theme_color }).eq('id', id);
  if (error) {
    console.error("Erro ao atualizar cor:", error);
    return { success: false, error: error.message };
  }
  revalidatePath('/admin');
  return { success: true };
}

export async function runMigration(sql: string) {
  await validateAdmin();
  const { error } = await getAdminClient().rpc('exec_sql', { sql_string: sql });
  if (error) {
     console.error("Migration error:", error);
     return { success: false, error: error.message };
  }
  return { success: true };
}
