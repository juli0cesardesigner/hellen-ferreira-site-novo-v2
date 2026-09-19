import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Helper para obter cliente Supabase com Service Role
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, supabaseKey);
};

// Detecção simples de bots e crawlers
function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const botPattern = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|google|bing|yandex|baidu|duckduckbot/i;
  return botPattern.test(userAgent);
}

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get("user-agent");
    if (isBot(userAgent)) {
      return NextResponse.json({ ok: true, ignored: "bot" });
    }

    const payload = await req.json();
    const { type } = payload;
    const supabase = getSupabaseAdmin();

    if (type === "pageview") {
      const {
        sessionId,
        stepIndex = 1,
        path,
        title,
        referrer,
        source = "Direto",
        utmSource,
        utmMedium,
        utmCampaign,
        deviceType = "mobile"
      } = payload;

      // Não rastrear páginas internas administrativas
      if (path && typeof path === "string" && path.startsWith("/admin")) {
        return NextResponse.json({ ok: true, ignored: "admin" });
      }

      const { data, error } = await supabase
        .from("analytics_pageviews")
        .insert({
          session_id: sessionId,
          step_index: Number(stepIndex) || 1,
          path,
          title,
          referrer: referrer ? String(referrer).slice(0, 500) : null,
          source,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
          device_type: deviceType,
          duration_seconds: 0
        })
        .select("id")
        .single();

      if (error) {
        console.error("Erro ao registrar pageview:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, pageviewId: data?.id });
    }

    if (type === "duration") {
      const { pageviewId, durationSeconds } = payload;
      if (!pageviewId || typeof durationSeconds !== "number") {
        return NextResponse.json({ ok: false, error: "Invalid duration payload" }, { status: 400 });
      }

      // Atualiza o tempo na página garantindo teto razoável (ex: max 1 hora = 3600s para evitar abas esquecidas)
      const sanitizedDuration = Math.min(Math.max(1, Math.round(durationSeconds)), 3600);

      await supabase
        .from("analytics_pageviews")
        .update({ duration_seconds: sanitizedDuration })
        .eq("id", pageviewId);

      return NextResponse.json({ ok: true });
    }

    if (type === "event") {
      const { sessionId, eventName, eventTarget, path } = payload;
      if (!sessionId || !eventName || !path) {
        return NextResponse.json({ ok: false, error: "Missing event parameters" }, { status: 400 });
      }

      await supabase
        .from("analytics_events")
        .insert({
          session_id: sessionId,
          event_name: eventName,
          event_target: eventTarget || null,
          path
        });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
