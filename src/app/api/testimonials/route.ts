import { NextRequest, NextResponse } from "next/server";
import { getUser, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";

    const supabase = await createClient();

    let query = supabase
      .from("testimonials")
      .select("*, users(id, name), courses(id, title_ar)")
      .order("created_at", { ascending: false });

    if (!showAll) {
      query = query.eq("approved", true);
    } else {
      const admin = await requireAdmin();
      if (!admin) {
        query = query.eq("approved", true);
      }
    }

    const { data: testimonials, error } = await query;

    if (error) throw error;

    return NextResponse.json(testimonials);
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

    const { courseId, rating, comment } = await req.json();

    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "التقييم يجب أن يكون بين 1 و 5" },
        { status: 400 }
      );
    }

    if (typeof comment !== "string" || comment.trim().length < 3 || comment.length > 1000) {
      return NextResponse.json(
        { error: "التعليق يجب أن يكون بين 3 و 1000 حرف" },
        { status: 400 }
      );
    }

    if (courseId && typeof courseId !== "string") {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: testimonial, error } = await supabase
      .from("testimonials")
      .insert({
        user_id: user.id,
        course_id: courseId || null,
        rating,
        comment: comment.trim(),
        approved: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(testimonial, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
