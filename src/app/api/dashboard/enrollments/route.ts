import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("*, courses(*)")
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false });

    if (error) throw error;

    const coursesWithCount = await Promise.all(
      (enrollments || []).map(async (enrollment: Record<string, unknown>) => {
        const courseId = (enrollment.courses as Record<string, unknown>)?.id;
        if (!courseId) return enrollment;

        const { count } = await supabase
          .from("course_contents")
          .select("*", { count: "exact", head: true })
          .eq("course_id", courseId);

        return {
          ...enrollment,
          courses: {
            ...(enrollment.courses as Record<string, unknown>),
            _count: { contents: count || 0 },
          },
        };
      })
    );

    return NextResponse.json(coursesWithCount);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
