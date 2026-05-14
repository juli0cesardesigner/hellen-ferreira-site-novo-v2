import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SESSIONS_DATA } from "@/lib/data/sessions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const supabase = await createClient();
    const { data: session, error } = await supabase
      .from("sessions")
      .select(
        `
        *,
        session_packages (*)
      `
      )
      .eq("slug", slug)
      .single();

    if (error || !session) {
      // Fallback to static data
      const staticSession = Object.values(SESSIONS_DATA).find(
        (s) => s.slug === slug
      );
      if (!staticSession) {
        return NextResponse.json({ session: null }, { status: 404 });
      }
      return NextResponse.json({ session: staticSession });
    }

    // Sort packages by tier_order
    if (session.session_packages) {
      session.session_packages.sort(
        (a: any, b: any) => a.tier_order - b.tier_order
      );
    }

    return NextResponse.json({ session });
  } catch (err) {
    console.error("Error fetching session by slug:", err);
    // Fallback to static data
    const staticSession = Object.values(SESSIONS_DATA).find(
      (s) => s.slug === slug
    );
    if (!staticSession) {
      return NextResponse.json({ session: null }, { status: 404 });
    }
    return NextResponse.json({ session: staticSession });
  }
}
