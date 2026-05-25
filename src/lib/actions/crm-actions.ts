"use server";

import { validateAdmin } from "./admin-actions";
import { Client } from "@/types/database";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseAdmin: SupabaseClient | null = null;

function getAdminClient() {
  if (supabaseAdmin) return supabaseAdmin;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are missing in CRM Actions!");
    throw new Error("Supabase internal configuration error");
  }
  
  supabaseAdmin = createAdminClient(supabaseUrl, supabaseKey);
  return supabaseAdmin;
}

export async function getClientsList() {
  await validateAdmin();
  const admin = getAdminClient();

  const { data: clients, error } = await admin
    .from('clients')
    .select(`
      *,
      bookings (
        id,
        total_amount,
        paid_amount,
        status,
        booking_date
      )
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error("Erro ao listar clientes:", error);
    return { clients: [] };
  }

  // Process data to calculate LTV, total bookings, and last booking date
  const processedClients = clients.map((client: any) => {
    const bookings = client.bookings || [];
    const totalBookings = bookings.length;
    const ltv = bookings
      .filter((b: any) => b.status !== 'cancelled')
      .reduce((acc: number, b: any) => acc + (Number(b.paid_amount) || 0), 0);
    
    const totalBalanceDue = bookings
      .filter((b: any) => b.status !== 'cancelled')
      .reduce((acc: number, b: any) => acc + Math.max(0, (Number(b.total_amount) || 0) - (Number(b.paid_amount) || 0)), 0);
    
    const lastBooking = bookings.length > 0
      ? bookings.map((b: any) => b.booking_date).sort().pop()
      : null;

    return {
      ...client,
      total_bookings: totalBookings,
      ltv: ltv,
      total_balance_due: totalBalanceDue,
      last_booking_date: lastBooking
    };
  });

  return { clients: processedClients };
}

export async function getClientDetails(id: string) {
  await validateAdmin();
  const admin = getAdminClient();

  const { data: client, error } = await admin
    .from('clients')
    .select(`
      *,
      bookings (
        *,
        sessions (
          name,
          theme_color
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error("Erro ao carregar detalhes do cliente:", error);
    return { client: null };
  }

  // Sort client's bookings by date descending
  if (client.bookings) {
    client.bookings.sort((a: any, b: any) => b.booking_date.localeCompare(a.booking_date));
    
    const ltv = client.bookings
      .filter((b: any) => b.status !== 'cancelled')
      .reduce((acc: number, b: any) => acc + (Number(b.paid_amount) || 0), 0);
      
    const totalBalanceDue = client.bookings
      .filter((b: any) => b.status !== 'cancelled')
      .reduce((acc: number, b: any) => acc + Math.max(0, (Number(b.total_amount) || 0) - (Number(b.paid_amount) || 0)), 0);

    client.ltv = ltv;
    client.total_balance_due = totalBalanceDue;
  } else {
    client.ltv = 0;
    client.total_balance_due = 0;
  }

  return { client };
}

export async function updateClientCRM(id: string, updates: Partial<Client>) {
  await validateAdmin();
  const admin = getAdminClient();

  // Filter out read-only properties
  const { id: _, created_at: __, ...allowedUpdates } = updates as any;

  const { data, error } = await admin
    .from('clients')
    .update({
      ...allowedUpdates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar cliente:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true, client: data };
}

export async function createClientCRM(data: Omit<Client, 'id' | 'created_at'>) {
  await validateAdmin();
  const admin = getAdminClient();

  const { data: newClient, error } = await admin
    .from('clients')
    .insert([{
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar cliente:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true, client: newClient };
}
