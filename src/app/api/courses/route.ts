import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .eq("visible", true);

    if (error) throw error;

    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id");

    const countMap = new Map<string, number>();
    enrollments?.forEach((e: { course_id: string }) => {
      countMap.set(e.course_id, (countMap.get(e.course_id) || 0) + 1);
    });

    const coursesWithCount =
      courses?.map((c) => ({
        ...c,
        _count: { enrollments: countMap.get(c.id) || 0 },
      })) || [];

    return NextResponse.json(coursesWithCount);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      titleAr,
      description,
      descriptionAr,
      price,
      level,
      duration,
      featured,
      visible,
      thumbnail,
      promoVideo,
      zoomLink,
    } = body;

    if (
      !title ||
      !titleAr ||
      !description ||
      !descriptionAr ||
      price == null ||
      !level ||
      !duration
    ) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    if (
      typeof title !== "string" ||
      typeof titleAr !== "string" ||
      typeof description !== "string" ||
      typeof descriptionAr !== "string"
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (typeof price !== "number" || price < 0 || !Number.isFinite(price)) {
      return NextResponse.json({ error: "السعر غير صالح" }, { status: 400 });
    }

    const VALID_LEVELS = ["مبتدئ", "متوسط", "متقدم"];
    if (!VALID_LEVELS.includes(level)) {
      return NextResponse.json({ error: "المستوى غير صالح" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        title: title.trim(),
        title_ar: titleAr.trim(),
        description: description.trim(),
        description_ar: descriptionAr.trim(),
        price: Math.round(price),
        level,
        duration: String(duration).trim(),
        featured: Boolean(featured),
        visible: visible !== false,
        thumbnail: typeof thumbnail === "string" ? thumbnail : null,
        promo_video: typeof promoVideo === "string" ? promoVideo : null,
        zoom_link: typeof zoomLink === "string" ? zoomLink.trim() : null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(course, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
