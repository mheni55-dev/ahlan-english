import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const MAX_FIELD = 500;

function sanitize(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_FIELD ? trimmed : null;
}

export async function GET() {
  try {
    const supabase = await createClient();

    let { data: settings } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "singleton")
      .maybeSingle();

    if (!settings) {
      const { data: created } = await supabase
        .from("site_settings")
        .insert({ id: "singleton" })
        .select()
        .single();
      settings = created;
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const supabase = await createClient();

    const updateData = {
      phone: sanitize(body.phone),
      email: sanitize(body.email),
      address: sanitize(body.address),
      facebook: sanitize(body.facebook),
      telegram: sanitize(body.telegram),
      whatsapp: sanitize(body.whatsapp),
      tiktok: sanitize(body.tiktok),
      instagram: sanitize(body.instagram),
      youtube: sanitize(body.youtube),
      twitter: sanitize(body.twitter),
    };

    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("id", "singleton")
      .maybeSingle();

    let settings;

    if (existing) {
      const { data } = await supabase
        .from("site_settings")
        .update(updateData)
        .eq("id", "singleton")
        .select()
        .single();
      settings = data;
    } else {
      const { data } = await supabase
        .from("site_settings")
        .insert({ id: "singleton", ...updateData })
        .select()
        .single();
      settings = data;
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
