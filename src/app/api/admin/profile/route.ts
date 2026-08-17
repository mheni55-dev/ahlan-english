import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_PHONE = 20;

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "الاسم والبريد مطلوبان" },
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

    const supabase = await createClient();

    const { error } = await supabase
      .from("users")
      .update({
        name: name.trim(),
        phone: phone?.trim() || null,
      })
      .eq("id", user.id);

    if (error) throw error;

    if (email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) {
        return NextResponse.json({ error: emailError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
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

    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "كلمة المرور الجديدة مطلوبة" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6 || newPassword.length > 128) {
      return NextResponse.json(
        { error: "كلمة المرور الجديدة يجب أن تكون بين 6 و 128 حرف" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
