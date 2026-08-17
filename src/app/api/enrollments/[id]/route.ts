import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["pending", "approved", "rejected"];

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
    const { paymentStatus } = await req.json();

    if (!paymentStatus || !VALID_STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: enrollment, error } = await supabase
      .from("enrollments")
      .update({ payment_status: paymentStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(enrollment);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
