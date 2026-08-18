"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("جميع الحقول المطلوبة يجب ملؤها");
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone, role: "student" },
        },
      });

      if (authError) {
        setError(authError.message === "User already registered"
          ? "البريد الإلكتروني مسجل بالفعل"
          : "حدث خطأ أثناء التسجيل");
        setLoading(false);
        return;
      }

      router.push("/auth/login?registered=true");
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-border p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="أهلا إنجلش" className="w-20 h-20 rounded-full object-cover mb-4" />
          <h2 className="text-3xl font-bold text-navy">أهلا إنجلش</h2>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-navy text-center mb-6">
          إنشاء حساب جديد
        </h1>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="الاسم الكامل"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-5 py-3 rounded-full border border-navy/30 focus:border-navy focus:outline-none text-navy placeholder:text-muted bg-white transition-colors"
          />
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-5 py-3 rounded-full border border-navy/30 focus:border-navy focus:outline-none text-navy placeholder:text-muted bg-white transition-colors"
          />
          <input
            type="tel"
            placeholder="رقم الهاتف (اختياري)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-5 py-3 rounded-full border border-navy/30 focus:border-navy focus:outline-none text-navy placeholder:text-muted bg-white transition-colors"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-5 py-3 rounded-full border border-navy/30 focus:border-navy focus:outline-none text-navy placeholder:text-muted bg-white transition-colors"
          />
          <input
            type="password"
            placeholder="تأكيد كلمة المرور"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-5 py-3 rounded-full border border-navy/30 focus:border-navy focus:outline-none text-navy placeholder:text-muted bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gold text-navy font-bold text-lg hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {loading ? "جاري التسجيل..." : "تسجيل"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-muted">
          لديك حساب بالفعل؟{" "}
          <Link
            href="/auth/login"
            className="text-gold font-bold hover:text-gold-light transition-colors"
          >
            سجّلي الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
