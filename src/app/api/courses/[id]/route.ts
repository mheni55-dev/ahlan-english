import { NextRequest, NextResponse } from "next/server";
import { getUser, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();

    const supabase = await createClient();

    const { data: course, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const { data: contents } = await supabase
      .from("course_contents")
      .select("*")
      .eq("course_id", id)
      .order("order", { ascending: true });

    const { count: enrollmentCount } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("course_id", id);

    const courseWithContents = {
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
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      contents: (contents || []).map((c) => ({
        id: c.id,
        courseId: c.course_id,
        title: c.title,
        titleAr: c.title_ar,
        type: c.type,
        url: c.url,
        order: c.order,
        createdAt: c.created_at,
      })),
      _count: { enrollments: enrollmentCount || 0 },
    };

    const isAdmin = user
      ? (
          await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single()
        ).data?.role === "admin"
      : false;

    let isEnrolled = false;
    if (user) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", id)
        .eq("payment_status", "approved")
        .maybeSingle();
      isEnrolled = !!enrollment;
    }

    if (!isAdmin && !isEnrolled) {
      const { zoom_link: _, ...safeCourse } = courseWithContents as typeof courseWithContents & { zoom_link: string | null };
      return NextResponse.json(safeCourse);
    }

    return NextResponse.json(courseWithContents);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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

    const { data: course, error: fetchError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const VALID_LEVELS = ["مبتدئ", "متوسط", "متقدم"];

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
    const body = await req.json();
    const supabase = await createClient();

    const { data: course, error: fetchError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (body.level && !VALID_LEVELS.includes(body.level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    if (
      body.price !== undefined &&
      (typeof body.price !== "number" || body.price < 0 || !Number.isFinite(body.price))
    ) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      title: typeof body.title === "string" ? body.title.trim() : course.title,
      title_ar: typeof body.titleAr === "string" ? body.titleAr.trim() : course.title_ar,
      description: typeof body.description === "string" ? body.description.trim() : course.description,
      description_ar: typeof body.descriptionAr === "string" ? body.descriptionAr.trim() : course.description_ar,
      price: body.price != null ? Math.round(body.price) : course.price,
      level: body.level ?? course.level,
      duration: typeof body.duration === "string" ? body.duration.trim() : course.duration,
      featured: body.featured != null ? Boolean(body.featured) : course.featured,
      visible: body.visible != null ? Boolean(body.visible) : course.visible,
      thumbnail: body.thumbnail !== undefined ? (typeof body.thumbnail === "string" ? body.thumbnail : null) : course.thumbnail,
      promo_video: body.promoVideo !== undefined ? (typeof body.promoVideo === "string" ? body.promoVideo : null) : course.promo_video,
      zoom_link: body.zoomLink !== undefined ? (typeof body.zoomLink === "string" ? body.zoomLink.trim() : null) : course.zoom_link,
    };

    const { data: updated, error } = await supabase
      .from("courses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
