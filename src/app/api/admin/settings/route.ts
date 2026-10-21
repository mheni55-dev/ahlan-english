import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const MAX_FIELD = 500;

const EMPTY_SETTINGS = {
  id: "singleton",
  phone: null,
  email: null,
  address: null,
  facebook: null,
  telegram: null,
  whatsapp: null,
  tiktok: null,
  instagram: null,
  youtube: null,
  twitter: null,
};

function sanitize(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_FIELD ? trimmed : null;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: settings } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "singleton")
      .maybeSingle();

    if (settings) {
      return NextResponse.json(settings);
    }

    // The singleton row is missing. Create it with the service role: the
    // RLS insert policy only allows admins, and this endpoint is public.
    const service = createServiceClient();
    if (service) {
      const { data: created } = await service
        .from("site_settings")
        .upsert({ id: "singleton" }, { onConflict: "id" })
        .select()
        .maybeSingle();

      if (created) {
        return NextResponse.json(created);
      }
    }

    // Never answer with `null` — clients would crash reading its fields.
    return NextResponse.json(EMPTY_SETTINGS);
  } catch {
    return NextResponse.json(EMPTY_SETTINGS);
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
