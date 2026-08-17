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
        const course = enrollment.courses as Record<string, unknown> | null;
        const courseId = course?.id;
        if (!courseId) return enrollment;

        const { count } = await supabase
          .from("course_contents")
          .select("*", { count: "exact", head: true })
          .eq("course_id", courseId);

        return {
          id: enrollment.id,
          userId: enrollment.user_id,
          courseId: enrollment.course_id,
          paymentStatus: enrollment.payment_status,
          paymentProof: enrollment.payment_proof,
          enrolledAt: enrollment.enrolled_at,
          updatedAt: enrollment.updated_at,
          course: course ? {
            id: course.id,
            title: course.title,
            titleAr: course.title_ar,
            description: course.description,
            descriptionAr: course.description_ar,
            price: course.price,
            level: course.level,
            duration: course.duration,
            thumbnail: course.thumbnail,
            promoVideo: course.promo_video,
            zoomLink: course.zoom_link,
            featured: course.featured,
            visible: course.visible,
            _count: { contents: count || 0 },
          } : null,
        };
      })
    );

    return NextResponse.json(coursesWithCount);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
