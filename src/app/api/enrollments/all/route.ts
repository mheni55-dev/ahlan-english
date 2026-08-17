import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createClient();

    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("*, users(name, email), courses(title_ar, price)")
      .order("enrolled_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(enrollments);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
