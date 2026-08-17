import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_PHONE = 20;
const MAX_MESSAGE = 2000;

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createClient();

    const { data: messages, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length < 2 || name.length > MAX_NAME) {
      return NextResponse.json({ error: "الاسم غير صالح" }, { status: 400 });
    }

    if (typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > MAX_EMAIL) {
      return NextResponse.json(
        { error: "البريد الإلكتروني غير صالح" },
        { status: 400 }
      );
    }

    if (phone && (typeof phone !== "string" || phone.length > MAX_PHONE)) {
      return NextResponse.json({ error: "رقم الهاتف غير صالح" }, { status: 400 });
    }

    if (typeof message !== "string" || message.trim().length < 3 || message.length > MAX_MESSAGE) {
      return NextResponse.json(
        { error: "الرسالة يجب أن تكون بين 3 و 2000 حرف" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: contactMessage, error } = await supabase
      .from("contact_messages")
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        message: message.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(contactMessage, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
