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

    const [
      { count: totalStudents },
      { count: totalCourses },
      { count: pendingPayments },
      approvedEnrollments,
    ] = await Promise.all([
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "student"),
      supabase
        .from("courses")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("payment_status", "pending"),
      supabase
        .from("enrollments")
        .select("courses(price)")
        .eq("payment_status", "approved"),
    ]);

    const totalRevenue = (approvedEnrollments.data || []).reduce(
      (sum: number, e: Record<string, unknown>) =>
        sum + ((e.courses as Record<string, unknown>)?.price as number || 0),
      0
    );

    return NextResponse.json({
      totalStudents: totalStudents || 0,
      totalCourses: totalCourses || 0,
      pendingPayments: pendingPayments || 0,
      totalRevenue,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
