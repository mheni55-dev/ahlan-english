import { NextRequest, NextResponse } from "next/server";
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
      .select("*, courses(id, title_ar, title, level, duration, thumbnail, zoom_link)")
      .eq("user_id", user.id);

    if (error) throw error;

    const mapped = (enrollments || []).map((e) => ({
      id: e.id,
      userId: e.user_id,
      courseId: e.course_id,
      paymentStatus: e.payment_status,
      paymentProof: e.payment_proof,
      enrolledAt: e.enrolled_at,
      updatedAt: e.updated_at,
      course: e.courses ? {
        id: (e.courses as Record<string, unknown>).id,
        titleAr: (e.courses as Record<string, unknown>).title_ar,
        title: (e.courses as Record<string, unknown>).title,
        level: (e.courses as Record<string, unknown>).level,
        duration: (e.courses as Record<string, unknown>).duration,
        thumbnail: (e.courses as Record<string, unknown>).thumbnail,
        zoomLink: (e.courses as Record<string, unknown>).zoom_link,
      } : null,
    }));

    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();

    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
    }

    const { data: enrollment, error: insertError } = await supabase
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: courseId,
        payment_status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(enrollment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
