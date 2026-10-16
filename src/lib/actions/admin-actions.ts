"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
// revalidatePath is used to invalidate Next.js server cache.
// Note: the admin page is "use client" and uses Supabase realtime for live updates,
// so revalidatePath does NOT trigger client re-renders. It is kept for SSR cache hygiene.
import { revalidatePath } from "next/cache";
import { SESSIONS_DATA } from "@/lib/data/sessions";
import crypto from "crypto";

import { Session, SlotDefinition, Booking, Expense, ChecklistItem, NatalConfig } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

// Lazy initialization of Supabase client with Service Role for internal admin operations
let supabaseAdmin: SupabaseClient | null = null;

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
export async function validateAdmin() {
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
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Próxima semana
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  // Início e Fim do Mês atual
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const admin = getAdminClient();

  // Sessões de Hoje
  await admin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('booking_date', today)
    .neq('status', 'cancelled');
 
  // Sessões da Semana
  await admin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('booking_date', today)
    .lte('booking_date', nextWeekStr)
    .neq('status', 'cancelled');

  // Faturamento MENSAL (Regra 2026: Concluído = Total | Outros = Entrada)
  const { data: monthlyRevenueData } = await admin
    .from('bookings')
    .select('status, total_amount, paid_amount')
    .gte('booking_date', firstDayOfMonth)
    .lte('booking_date', lastDayOfMonth);

  const totalRevenue = monthlyRevenueData?.reduce((acc: number, curr: { status: string; total_amount: number; paid_amount: number }) => {
    // Regra 2026: Bruto é sempre o valor total do contrato (exceto cancelados se necessário, mas aqui mantemos o potencial)
    if (curr.status === 'cancelled') return acc;
    return acc + (Number(curr.total_amount) || 0);
  }, 0) || 0;

  return {
    totalRevenue
  };
}

export async function getFinanceDetailedStats(month: number, year: number) {
  await validateAdmin();
  const admin = getAdminClient();

  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data: bookings, error } = await admin
    .from('bookings')
    .select(`
      *,
      sessions (
        name,
        theme_color
      )
    `)
    .gte('booking_date', startDate)
    .lte('booking_date', endDate)
    .order('booking_date', { ascending: true });

  if (error) {
    console.error("Erro ao carregar dados financeiros:", error);
    return { totalGross: 0, totalReceived: 0, byCategory: {}, bookings: [] };
  }

  const byCategory: Record<string, { totalGross: number, totalReceived: number, count: number, color?: string }> = {};
  let totalGross = 0;
  let totalReceived = 0;

  bookings?.forEach((booking: Booking & { sessions?: { name: string; theme_color?: string } }) => {
    const sessionName = booking.sessions?.name || 'Outros';
    const gross = booking.status !== 'cancelled' ? (Number(booking.total_amount) || 0) : 0;
    const received = Number(booking.paid_amount) || 0;
    
    totalGross += gross;
    totalReceived += received;

    if (!byCategory[sessionName]) {
      byCategory[sessionName] = { totalGross: 0, totalReceived: 0, count: 0, color: booking.sessions?.theme_color };
    }
    byCategory[sessionName].totalGross += gross;
    byCategory[sessionName].totalReceived += received;
    byCategory[sessionName].count += 1;
  });

  return {
    totalGross,
    totalReceived,
    byCategory,
    bookings: bookings || []
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
    .neq('status', 'pending')
    .order('booking_date', { ascending: true })
    .limit(50);

  if (error) {
    console.error("Erro ao carregar reservas:", error);
    return { bookings: [] };
  }

  return { bookings: data };
}

export async function getAllBookingsList(filter: 'all' | 'past' | 'future' = 'all') {
  await validateAdmin();
  const today = new Date().toISOString().split('T')[0];
  const admin = getAdminClient();
  
  let query = admin
    .from('bookings')
    .select(`
      *,
      sessions (
        name,
        theme_color
      )
    `)
    .neq('status', 'pending');

  if (filter === 'past') {
    query = query.lt('booking_date', today).order('booking_date', { ascending: false });
  } else if (filter === 'future') {
    query = query.gte('booking_date', today).order('booking_date', { ascending: true });
  } else {
    query = query.order('booking_date', { ascending: false });
  }

  const { data, error } = await query.limit(200);

  if (error) {
    console.error("Erro ao carregar lista geral:", error);
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

export async function getDashboardData(year: number, month: number) {
  await validateAdmin();
  const admin = getAdminClient();

  // Use the requested year/month for ALL queries — not the current month
  const startTargetMonth = new Date(year, month, 1).toISOString().split('T')[0];
  const endTargetMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const pStats = admin
    .from('bookings')
    .select('status, total_amount, paid_amount')
    .gte('booking_date', startTargetMonth)
    .lte('booking_date', endTargetMonth)
    .neq('status', 'pending');

  const pBookings = admin
    .from('bookings')
    .select(`
      *,
      sessions (
        name,
        theme_color
      )
    `)
    .gte('booking_date', startTargetMonth)
    .lte('booking_date', endTargetMonth)
    .order('booking_date', { ascending: true })
    .limit(300);

  const pGrid = admin
    .from('schema_slots')
    .select('*')
    .eq('is_active', true)
    .order('start_time', { ascending: true });

  const pBlocks = admin
    .from('blocked_dates')
    .select('*')
    .order('start_date', { ascending: true });

  const [resStats, resBookings, resGrid, resBlocks] = await Promise.all([pStats, pBookings, pGrid, pBlocks]);

  const totalRevenue = resStats.data?.reduce((acc: number, curr: { status: string; total_amount: number; paid_amount: number }) => {
    if (curr.status === 'cancelled') return acc;
    return acc + (Number(curr.total_amount) || 0);
  }, 0) || 0;

  const currentTime = new Date();
  const activeBookings = (resBookings.data || []).filter((b) => {
    if (b.status === 'cancelled') return false;
    if (b.status !== 'pending') return true;
    if (!b.expires_at) return true;
    return new Date(b.expires_at as string) > currentTime;
  });

  const uniqueSlots = Array.from(new Map(resGrid.data?.map((s: SlotDefinition) => [`${s.day_of_week}-${s.start_time}`, s])).values());

  return {
    stats: { totalRevenue },
    bookings: { bookings: activeBookings },
    grid: { slots: uniqueSlots as SlotDefinition[] },
    blocks: { blocks: resBlocks.data || [] }
  };
}

export async function syncSessionColors() {
  await validateAdmin();
  const admin = getAdminClient();

  // Pull sessions from DB first; fall back to static data only if DB is empty
  const { data: dbSessions } = await admin.from('sessions').select('id, theme_color');
  const source = (dbSessions && dbSessions.length > 0) ? dbSessions : Object.values(SESSIONS_DATA);

  const updates = source.map((session: any) =>
    admin.from('sessions').update({ theme_color: session.theme_color }).eq('id', session.id)
  );

  await Promise.all(updates);
  revalidatePath('/admin');
  return { success: true };
}

// --- Expenses Actions ---

export async function getExpenses(month: number, year: number) {
  // month is 0-indexed (JS Date convention)
  await validateAdmin();
  const admin = getAdminClient();
  
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data, error } = await admin
    .from('expenses')
    .select('*')
    .gte('due_date', startDate)
    .lte('due_date', endDate)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createExpense(expense: Omit<Expense, 'id' | 'created_at'> & { type: string; installments?: number; status?: string }) {
  await validateAdmin();
  const admin = getAdminClient();
  const groupId = crypto.randomUUID();
  const baseDate = new Date(expense.due_date + 'T12:00:00');
  
  const numInstallments = expense.installments ?? 1;
  
  if (expense.type === 'installment' && numInstallments > 1) {
    const batch = [];
    const parcelAmount = Number((expense.amount / numInstallments).toFixed(2));
    
    for (let i = 0; i < numInstallments; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(baseDate.getMonth() + i);
      
      batch.push({
        description: `${expense.description} (${i + 1}/${numInstallments})`,
        amount: parcelAmount,
        due_date: dueDate.toISOString().split('T')[0],
        type: 'installment',
        status: expense.status || 'pending',
        group_id: groupId,
        installment_number: i + 1,
        total_installments: expense.installments
      });
    }
    
    const { error } = await admin.from('expenses').insert(batch);
    if (error) throw error;
  } else if (expense.type === 'fixed') {
    // Para fixas, gera para os próximos 36 meses (3 anos)
    const fixedBatch = [];
    for (let i = 0; i < 36; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(baseDate.getMonth() + i);
      
      fixedBatch.push({
        description: expense.description,
        amount: expense.amount,
        due_date: dueDate.toISOString().split('T')[0],
        type: 'fixed',
        status: i === 0 ? (expense.status || 'pending') : 'pending',
        group_id: groupId
      });
    }
    const { error: fixedError } = await admin.from('expenses').insert(fixedBatch);
    if (fixedError) throw fixedError;
  } else {
    const { error } = await admin.from('expenses').insert({
      description: expense.description,
      amount: expense.amount,
      due_date: expense.due_date,
      type: expense.type,
      status: expense.status || 'pending'
    });
    if (error) throw error;
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function updateExpense(id: string, updates: Partial<Expense> & { description?: string; amount?: number }, updateFuture: boolean = false) {
  await validateAdmin();
  const admin = getAdminClient();

  if (updateFuture) {
    const { data: current } = await admin.from('expenses').select('group_id, installment_number, due_date').eq('id', id).single();
    
    if (current?.group_id) {
      // Atualiza esta e as próximas (por data ou número de parcela)
      const query = admin
        .from('expenses')
        .update({
          description: updates.description,
          amount: updates.amount
        })
        .eq('group_id', current.group_id);

      if (current.installment_number) {
        query.gte('installment_number', current.installment_number);
      } else {
        query.gte('due_date', current.due_date);
      }
      
      const { error } = await query;
      if (error) throw error;
    }
  } else {
    const { error } = await admin.from('expenses').update(updates).eq('id', id);
    if (error) throw error;
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function updateExpenseStatus(id: string, status: string) {
  await validateAdmin();
  const { error } = await getAdminClient()
    .from('expenses')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteExpense(id: string, deleteAllInGroup: boolean = false) {
  await validateAdmin();
  const admin = getAdminClient();

  if (deleteAllInGroup) {
    const { data: expense } = await admin.from('expenses').select('group_id').eq('id', id).single();
    if (expense?.group_id) {
      await admin.from('expenses').delete().eq('group_id', expense.group_id);
    }
  } else {
    await admin.from('expenses').delete().eq('id', id);
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function getFinanceSummary(month: number, year: number) {
  // month is 0-indexed (JS Date convention)
  await validateAdmin();
  const admin = getAdminClient();
  
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data: bookings } = await admin
    .from('bookings')
    .select('total_amount, paid_amount, status')
    .gte('booking_date', startDate)
    .lte('booking_date', endDate);

  const { data: expenses } = await admin
    .from('expenses')
    .select('amount, status')
    .gte('due_date', startDate)
    .lte('due_date', endDate);

  const totalGross = bookings?.reduce((acc: number, b: { status: string; total_amount: number }) => {
    if (b.status === 'cancelled') return acc;
    return acc + (Number(b.total_amount) || 0);
  }, 0) || 0;

  const totalReceived = bookings?.reduce((acc: number, b: { status: string; paid_amount: number }) => {
    if (b.status === 'cancelled') return acc;
    return acc + (Number(b.paid_amount) || 0);
  }, 0) || 0;

  const totalExpenses = expenses?.reduce((acc: number, e: { amount: number }) => acc + (Number(e.amount) || 0), 0) || 0;

  return {
    totalGross,
    totalReceived,
    totalExpenses,
    netProfit: totalReceived - totalExpenses
  };
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

export async function createSession(data: Omit<Session, 'id'>) {
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
  revalidatePath('/ensaios');
  return { success: true };
}

export async function updateSession(id: string, updates: Partial<Session>) {
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
  revalidatePath('/ensaios');
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
    return { slots: globalSlots?.map((s: SlotDefinition) => ({ ...s, source: 'global' })) || [] };
  }

  // 2. Buscar Específicos
  const { data: specificSlots } = await admin
    .from('schema_slots')
    .select('*')
    .eq('session_id', sessionId)
    .order('start_time');

  // 3. Mesclar
  const finalMap: Record<string, SlotDefinition & { source: string; is_override?: boolean }> = {};
  
  globalSlots?.forEach((gs: SlotDefinition) => {
    const key = `${gs.day_of_week}-${gs.start_time}`;
    finalMap[key] = { ...gs, source: 'global' };
  });

  specificSlots?.forEach((ss: SlotDefinition) => {
    const key = `${ss.day_of_week}-${ss.start_time}`;
    const isGlobalOverride = !!finalMap[key];
    finalMap[key] = { 
      ...ss, 
      source: isGlobalOverride ? 'global' : 'session',
      is_override: isGlobalOverride 
    };
  });

  const merged = Object.values(finalMap).sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
    return a.start_time.localeCompare(b.start_time);
  });

  return { slots: merged };
}

export async function addSchemaSlot(dayOfWeek: number, startTime: string, sessionId: string | null = null, isActive: boolean = true) {
  await validateAdmin();
  const admin = getAdminClient();

  const formattedSessionId = sessionId === "" ? null : sessionId;

  // Verificar se já existe um slot com este day_of_week, start_time e session_id
  let query = admin
    .from('schema_slots')
    .select('id')
    .eq('day_of_week', dayOfWeek)
    .eq('start_time', startTime);

  if (formattedSessionId) {
    query = query.eq('session_id', formattedSessionId);
  } else {
    query = query.is('session_id', null);
  }

  const { data: existing } = await query.maybeSingle();

  if (existing) {
    const { error: updateError } = await admin
      .from('schema_slots')
      .update({ is_active: isActive })
      .eq('id', existing.id);

    if (updateError) {
      console.error("Erro ao atualizar slot:", updateError);
      return { success: false, error: updateError.message };
    }
  } else {
    const { error: insertError } = await admin
      .from('schema_slots')
      .insert([{ 
        session_id: formattedSessionId, 
        day_of_week: dayOfWeek, 
        start_time: startTime,
        is_active: isActive
      }]);
      
    if (insertError) {
      console.error("Erro ao adicionar slot:", insertError);
      return { success: false, error: insertError.message };
    }
  }

  revalidatePath('/agendar');
  return { success: true };
}

export async function resetSessionSlots(sessionId: string) {
  await validateAdmin();
  const { error } = await getAdminClient()
    .from('schema_slots')
    .delete()
    .eq('session_id', sessionId);
    
  if (error) {
    console.error("Erro ao restaurar slots da sessão:", error);
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
  location_type?: 'estudio' | 'externo';
  location_details?: string;
}) {
  await validateAdmin();
  const admin = getAdminClient();

  // 1. Pegar a sessão para calcular o tempo final
  const session = SESSIONS_DATA[data.sessionId];
  const { data: dbSession } = await admin.from('sessions').select('duration_slots, cleanup_minutes').eq('id', data.sessionId).single();

  const duration = dbSession?.duration_slots || session?.duration_slots || 1;
  const cleanupMinutes = dbSession?.cleanup_minutes ?? 15;
  const cleanupSlots = Math.ceil(cleanupMinutes / 30);
  const totalSlotsForEndTime = duration + cleanupSlots;

  // 2. Calcular End Time dinamicamente baseado no tempo real (sempre!)
  const [startH, startM] = data.start_time.split(':').map(Number);
  const totalMinutes = startH * 60 + startM + totalSlotsForEndTime * 30;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  const end_time = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;

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
    location_type: data.location_type || 'estudio',
    location_details: data.location_details || null,
    total_amount: data.total_amount,
    paid_amount: data.paid_amount,
    notified_at: data.status === 'confirmed' ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }]);

  if (error) {
    console.error("Erro no manual booking:", error);
    return { success: false, error: error.message };
  }

  // Disparar notificação push para a administradora se estiver confirmado
  if (data.status === 'confirmed') {
    try {
      const { notifyAdminByPush } = await import('./push-actions');
      const [y, m, d] = data.booking_date.split('-');
      const formattedDate = `${d}/${m}/${y}`;
      const formattedTime = data.start_time.slice(0, 5) + 'h';
      const sessionName = session?.name || 'Ensaio';

      await notifyAdminByPush({
        title: '✍️ Novo Agendamento Manual!',
        body: `Cliente: ${data.customer_name}\nServiço: ${sessionName}\nData: ${formattedDate} às ${formattedTime}`,
        url: `/admin`
      });
    } catch (pushErr) {
      console.error('Erro ao enviar notificação push do agendamento manual:', pushErr);
    }
  }

  revalidatePath('/admin');
  revalidatePath('/agendar');
  
  return { 
    success: true, 
    status: data.status,
    bookingId: data.sessionId
  };
}

export async function updateBooking(id: string, updates: Partial<Booking>) {
  await validateAdmin();
  const admin = getAdminClient();

  if (updates.start_time) {
    try {
      const { data: currentBooking, error: fetchBookingError } = await admin
        .from('bookings')
        .select('session_id, start_time')
        .eq('id', id)
        .single();

      if (fetchBookingError) {
        throw new Error("Reserva não encontrada: " + fetchBookingError.message);
      }

      const sessionId = updates.session_id || currentBooking.session_id;
      const startTime = updates.start_time || currentBooking.start_time;

      if (sessionId && startTime) {
        const { data: dbSession } = await admin
          .from('sessions')
          .select('duration_slots, cleanup_minutes')
          .eq('id', sessionId)
          .single();

        const session = SESSIONS_DATA[sessionId];
        const durationSlots = dbSession?.duration_slots || session?.duration_slots || 1;
        const cleanupMinutes = dbSession?.cleanup_minutes ?? 15;
        const cleanupSlots = Math.ceil(cleanupMinutes / 30);
        const totalSlotsForEndTime = durationSlots + cleanupSlots;

        const [startH, startM] = startTime.split(':').map(Number);
        const totalMinutes = startH * 60 + startM + totalSlotsForEndTime * 30;
        const endH = Math.floor(totalMinutes / 60);
        const endM = totalMinutes % 60;
        const end_time = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;

        updates.end_time = end_time;
      }
    } catch (calcError) {
      console.error("Erro ao recalcular end_time no updateBooking:", calcError);
    }
  }

  const { error } = await admin.from('bookings').update(updates).eq('id', id);
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
  data?.forEach((d: { id: string; duration_slots: number; theme_color: string }) => { 
    settingsMap[d.id] = { 
      duration: d.duration_slots, 
      color: d.theme_color || 'zinc' 
    }; 
  });
  return settingsMap;
}

export async function listSessionPackages(sessionId: string) {
  await validateAdmin();
  const { data, error } = await getAdminClient()
    .from('session_packages')
    .select('*')
    .eq('session_id', sessionId)
    .order('tier_order', { ascending: true });

  if (error) {
    console.error("Erro ao listar pacotes:", error);
    return { packages: [] };
  }

  return { packages: data };
}

export async function createSessionPackage(sessionId: string, data: {
  name: string;
  slug: string;
  description?: string;
  tier_order: number;
  price_digital: number;
  price_print: number;
  upgrade_label?: string;
  features?: string[];
  is_active?: boolean;
}) {
  await validateAdmin();
  const { error } = await getAdminClient()
    .from('session_packages')
    .insert([{
      session_id: sessionId,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      tier_order: data.tier_order,
      price_digital: data.price_digital,
      price_print: data.price_print,
      upgrade_label: data.upgrade_label || "",
      features: data.features || [],
      is_active: data.is_active ?? true,
    }]);

  if (error) {
    console.error("Erro ao criar pacote:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/agendar');
  revalidatePath('/ensaios');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function updateSessionPackage(id: string, updates: {
  name?: string;
  slug?: string;
  description?: string;
  tier_order?: number;
  price_digital?: number;
  price_print?: number;
  upgrade_label?: string;
  features?: string[];
  is_active?: boolean;
}) {
  await validateAdmin();
  const { error } = await getAdminClient()
    .from('session_packages')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error("Erro ao atualizar pacote:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/agendar');
  revalidatePath('/ensaios');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteSessionPackage(id: string) {
  await validateAdmin();
  const { error } = await getAdminClient()
    .from('session_packages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Erro ao deletar pacote:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/agendar');
  revalidatePath('/ensaios');
  revalidatePath('/', 'layout');
  return { success: true };
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

export async function getDayMasterGrid(dayOfWeek: number) {
  await validateAdmin();
  const { data, error } = await getAdminClient()
    .from('schema_slots')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
    .order('start_time', { ascending: true });

  if (error) {
    console.error("Erro ao carregar grade do dia:", error);
    return { slots: [] };
  }

  // Remove duplicates by time (caso existam por erro de configuração)
  const uniqueSlots = Array.from(new Map(data?.map((s: SlotDefinition) => [s.start_time, s])).values());
  return { slots: uniqueSlots };
}

export async function getSiteSetting(key: string) {
  const admin = getAdminClient();
  const { data, error } = await admin.from('site_settings').select('value').eq('key', key).single();
  if (error) return null;
  return data.value;
}

export async function updateSiteSetting(key: string, value: string) {
  await validateAdmin();
  const admin = getAdminClient();
  const { error } = await admin.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) {
    console.error("Erro ao atualizar configuração:", error);
    return { success: false, error: error.message };
  }
  revalidatePath('/agendar');
  return { success: true };
}

export async function getNatalConfigAdmin(): Promise<NatalConfig> {
  const raw = await getSiteSetting('natal_seasonal_config');
  if (!raw) {
    return {
      enabled: false,
      startDate: "",
      endDate: "",
      defaultLocationOverride: 'all',
      sessionRules: {}
    };
  }
  try {
    return JSON.parse(raw) as NatalConfig;
  } catch {
    return {
      enabled: false,
      startDate: "",
      endDate: "",
      defaultLocationOverride: 'all',
      sessionRules: {}
    };
  }
}

export async function saveNatalConfigAdmin(config: NatalConfig) {
  await validateAdmin();
  const res = await updateSiteSetting('natal_seasonal_config', JSON.stringify(config));
  if (res.success) {
    revalidatePath('/agendar');
    revalidatePath('/admin');
  }
  return res;
}

export async function blockSlot(date: string, time: string, reason: string) {
  await validateAdmin();
  const admin = getAdminClient();

  const blockReason = reason?.trim() || "Bloqueio";

  // Calculate end_time (30 min default)
  const [hours, minutes] = time.split(':').map(Number);
  const endDate = new Date();
  endDate.setHours(hours, minutes + 30, 0);
  const end_time = endDate.toTimeString().split(' ')[0];

  const { error } = await admin.from('bookings').insert([{
    customer_name: `BLOQUEIO: ${blockReason}`,
    customer_email: 'admin@hellenferreira.com',
    booking_date: date,
    start_time: time,
    end_time: end_time,
    status: 'confirmed',
    package_type: 'Bloqueio Manual',
    total_amount: 0,
    paid_amount: 0
  }]);

  if (error) {
    console.error("Erro ao bloquear horário:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/agendar');
  return { success: true };
}

export async function scanAndReconcilePayments() {
  await validateAdmin();
  const admin = getAdminClient();

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return {
      success: false,
      error: "MERCADOPAGO_ACCESS_TOKEN não configurado no servidor."
    };
  }

  try {
    // 1. Buscar agendamentos pendentes ou cancelados
    const { data: bookings, error } = await admin
      .from('bookings')
      .select('id, customer_name, customer_email, booking_date, start_time, status, payment_id, paid_amount')
      .in('status', ['pending', 'cancelled']);

    if (error) {
      console.error("Erro ao buscar agendamentos para reconciliação:", error);
      return { success: false, error: "Erro ao buscar agendamentos no banco." };
    }

    if (!bookings || bookings.length === 0) {
      return { success: true, reconciledCount: 0, details: [] };
    }

    const reconciledList: Array<{
      bookingId: string;
      customerName: string;
      date: string;
      time: string;
      statusBefore: string;
      paymentId: string;
      amount: number;
    }> = [];

    // 2. Para cada agendamento, consultar o Mercado Pago
    for (const booking of bookings) {
      const paymentId = booking.payment_id;
      let approvedPayment: any = null;

      // 2.1 Buscar por external_reference (padrão do Checkout Transparente / Pix Brick)
      try {
        const urlByRef = `https://api.mercadopago.com/v1/payments/search?external_reference=${booking.id}`;
        const resByRef = await fetch(urlByRef, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (resByRef.ok) {
          const dataByRef = await resByRef.json();
          const results = dataByRef.results || [];
          approvedPayment = results.find(
            (p: { status: string }) => p.status === 'approved' || p.status === 'authorized'
          );
        }
      } catch (err) {
        console.warn(`Erro ao buscar pagamento por external_reference para booking ${booking.id}:`, err);
      }

      // 2.2 Se não encontrou por external_reference, buscar por preference_id (Checkout Pro)
      if (!approvedPayment && paymentId) {
        try {
          const urlByPref = `https://api.mercadopago.com/v1/payments/search?preference_id=${paymentId}`;
          const resByPref = await fetch(urlByPref, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (resByPref.ok) {
            const dataByPref = await resByPref.json();
            const results = dataByPref.results || [];
            approvedPayment = results.find(
              (p: { status: string }) => p.status === 'approved' || p.status === 'authorized'
            );
          }
        } catch (err) {
          console.warn(`Erro ao buscar pagamento por preference_id ${paymentId}:`, err);
        }
      }

      if (approvedPayment) {
        const transactionAmount = Number(approvedPayment.transaction_amount) || 0;
        
        // 3. Atualizar o agendamento no Supabase
        const { error: updateError } = await admin
          .from('bookings')
          .update({
            status: 'confirmed',
            paid_amount: transactionAmount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.id);

        if (updateError) {
          console.error(`Erro ao atualizar agendamento ${booking.id}:`, updateError);
          continue;
        }

        reconciledList.push({
          bookingId: booking.id,
          customerName: booking.customer_name,
          date: booking.booking_date,
          time: booking.start_time,
          statusBefore: booking.status,
          paymentId: approvedPayment.id ? String(approvedPayment.id) : (paymentId || ''),
          amount: transactionAmount,
        });
      }
    }

    if (reconciledList.length > 0) {
      revalidatePath('/admin');
      revalidatePath('/agendar');
    }

    return {
      success: true,
      reconciledCount: reconciledList.length,
      details: reconciledList,
    };
  } catch (err) {
    console.error("Erro durante a varredura de pagamentos:", err);
    return { success: false, error: (err as Error).message };
  }
}

/**
 * ─────────────────────────────────────────────────────────────
 * CHECKLIST DE MELHORIAS & NOTAS
 * ─────────────────────────────────────────────────────────────
 */

export async function getChecklistItems(): Promise<{ success: boolean; data?: ChecklistItem[]; error?: string }> {
  try {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from('admin_checklist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao buscar itens de checklist:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error("Erro em getChecklistItems:", err);
    return { success: false, error: (err as Error).message };
  }
}

export async function createChecklistItem(item: {
  title: string;
  description?: string | null;
  category?: 'improvement' | 'change' | 'add' | 'remove' | 'fix';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  target_area?: string | null;
}): Promise<{ success: boolean; data?: ChecklistItem; error?: string }> {
  try {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from('admin_checklist')
      .insert({
        title: item.title.trim(),
        description: item.description?.trim() || null,
        category: item.category || 'improvement',
        priority: item.priority || 'medium',
        status: 'pending',
        target_area: item.target_area?.trim() || 'Geral',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error("Erro ao criar item de checklist:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Erro em createChecklistItem:", err);
    return { success: false, error: (err as Error).message };
  }
}

export async function updateChecklistItem(
  id: string,
  updates: Partial<ChecklistItem>
): Promise<{ success: boolean; data?: ChecklistItem; error?: string }> {
  try {
    const admin = getAdminClient();
    const payload: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (updates.status === 'completed' && !updates.completed_at) {
      payload.completed_at = new Date().toISOString();
    } else if (updates.status && updates.status !== 'completed') {
      payload.completed_at = null;
    }

    const { data, error } = await admin
      .from('admin_checklist')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error("Erro ao atualizar item de checklist:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Erro em updateChecklistItem:", err);
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteChecklistItem(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = getAdminClient();
    const { error } = await admin
      .from('admin_checklist')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao excluir item de checklist:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Erro em deleteChecklistItem:", err);
    return { success: false, error: (err as Error).message };
  }
}

