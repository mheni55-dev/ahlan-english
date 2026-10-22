import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Supabase pauses free-tier projects after 7 days of low activity. This
// endpoint is hit by the Vercel cron in vercel.json so the project never
// crosses that threshold.
export async function GET() {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
