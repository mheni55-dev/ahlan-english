import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mapKeys } from "@/lib/mapKeys";

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

    const mapped = (enrollments || []).map((e) => ({
      id: e.id,
      userId: e.user_id,
      courseId: e.course_id,
      paymentStatus: e.payment_status,
      paymentProof: e.payment_proof,
      enrolledAt: e.enrolled_at,
      updatedAt: e.updated_at,
      user: e.users ? { name: (e.users as Record<string, unknown>).name, email: (e.users as Record<string, unknown>).email } : null,
      course: e.courses ? { titleAr: (e.courses as Record<string, unknown>).title_ar, price: (e.courses as Record<string, unknown>).price } : null,
    }));

    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
