import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length < 2 || name.length > 100) {
      return NextResponse.json({ error: "الاسم غير صالح" }, { status: 400 });
    }

    if (typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json({ error: "البريد الإلكتروني غير صالح" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون بين 6 و 128 حرف" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        phone: phone?.trim() || null,
        role: "student",
      },
    });

    if (error) {
      if (error.message.includes("already")) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مسجل بالفعل" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "حدث خطأ أثناء التسجيل" }, { status: 500 });
    }

    return NextResponse.json(
      { message: "تم إنشاء الحساب بنجاح", userId: data.user?.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
