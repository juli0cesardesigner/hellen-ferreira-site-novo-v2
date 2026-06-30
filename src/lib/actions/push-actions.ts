"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { validateAdmin } from "./admin-actions";
import { sendNotificationToDevice } from "@/lib/utils/webpush";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createAdminClient(supabaseUrl, supabaseKey);
}

export async function savePushSubscription(subscriptionJson: string) {
  try {
    const adminUser = await validateAdmin();
    const email = adminUser.email;
    if (!email) throw new Error("Usuário sem e-mail cadastrado.");

    const subscription = JSON.parse(subscriptionJson);
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return { success: false, error: "Assinatura Push inválida." };
    }

    const admin = getAdminClient();
    
    const { error } = await admin
      .from('push_subscriptions')
      .upsert({
        user_email: email,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'endpoint'
      });

    if (error) {
      console.error("Erro ao salvar assinatura push no banco:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro em savePushSubscription:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
}

export async function removePushSubscription(endpoint: string) {
  try {
    await validateAdmin();
    const admin = getAdminClient();

    const { error } = await admin
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      console.error("Erro ao deletar assinatura push:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro em removePushSubscription:", error);
    return { success: false, error: error.message };
  }
}

export async function notifyAdminByPush(payload: { title: string; body: string; url?: string }) {
  try {
    const targetEmail = "hellen@hellenferreira.com";
    const admin = getAdminClient();

    const { data: subscriptions, error } = await admin
      .from('push_subscriptions')
      .select('*')
      .eq('user_email', targetEmail);

    if (error) {
      console.error("Erro ao carregar assinaturas para push:", error);
      return { success: false, error: error.message };
    }

    if (!subscriptions || subscriptions.length === 0) {
      return { success: true, sentCount: 0 };
    }

    let sentCount = 0;
    for (const sub of subscriptions) {
      const deviceSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      const res = await sendNotificationToDevice(deviceSub, payload);
      
      if (res.success) {
        sentCount++;
      } else if (res.expired) {
        console.log(`Removendo assinatura push expirada: ${sub.endpoint}`);
        await admin
          .from('push_subscriptions')
          .delete()
          .eq('id', sub.id);
      }
    }

    return { success: true, sentCount };
  } catch (error: any) {
    console.error("Erro em notifyAdminByPush:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
}

export async function getRecentBookingsForNotifications(limit: number = 10) {
  try {
    await validateAdmin();
    const admin = getAdminClient();

    const { data: bookings, error } = await admin
      .from('bookings')
      .select(`
        id,
        customer_name,
        booking_date,
        start_time,
        status,
        created_at,
        sessions (
          name
        )
      `)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Erro ao carregar notificações de agendamento:", error);
      return { success: false, error: error.message };
    }

    return { success: true, bookings: bookings || [] };
  } catch (error: any) {
    console.error("Erro em getRecentBookingsForNotifications:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
}
