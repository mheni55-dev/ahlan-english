import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("testimonials")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { approved } = await req.json();

    if (typeof approved !== "boolean") {
      return NextResponse.json({ error: "Invalid value" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("testimonials")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: testimonial, error } = await supabase
      .from("testimonials")
      .update({ approved })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(testimonial);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
