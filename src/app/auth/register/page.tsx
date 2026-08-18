"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";

export default function RegisterPage() {
  const router = useRouter();
  const { lang } = useLanguage();
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
      setError(lang === "ar" ? "جميع الحقول المطلوبة يجب ملؤها" : "All required fields must be filled");
      return;
    }

    if (password !== confirmPassword) {
      setError(lang === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError(lang === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
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
          ? (lang === "ar" ? "البريد الإلكتروني مسجل بالفعل" : "Email already registered")
          : t(lang, "auth.registerError"));
        setLoading(false);
        return;
      }

      router.push("/auth/login?registered=true");
    } catch {
      setError(t(lang, "auth.registerError"));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-border p-8">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Ahlan English" className="w-36 h-36 object-contain mb-4" style={{ filter: "url(#remove-white)" }} />
          <h2 className="text-3xl font-bold text-navy">أهلا إنجلش</h2>
        </div>

        <h1 className="text-2xl font-bold text-navy text-center mb-6">
          {t(lang, "auth.registerTitle")}
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={t(lang, "auth.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-5 py-3 rounded-full border border-navy/30 focus:border-navy focus:outline-none text-navy placeholder:text-muted bg-white transition-colors"
          />
          <input
            type="email"
            placeholder={t(lang, "auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-5 py-3 rounded-full border border-navy/30 focus:border-navy focus:outline-none text-navy placeholder:text-muted bg-white transition-colors"
          />
          <input
            type="tel"
            placeholder={lang === "ar" ? "رقم الهاتف (اختياري)" : "Phone (optional)"}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-5 py-3 rounded-full border border-navy/30 focus:border-navy focus:outline-none text-navy placeholder:text-muted bg-white transition-colors"
          />
          <input
            type="password"
            placeholder={t(lang, "auth.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-5 py-3 rounded-full border border-navy/30 focus:border-navy focus:outline-none text-navy placeholder:text-muted bg-white transition-colors"
          />
          <input
            type="password"
            placeholder={t(lang, "auth.confirmPassword")}
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
            {loading ? t(lang, "auth.registering") : t(lang, "auth.registerBtn")}
          </button>
        </form>

        <p className="text-center mt-6 text-muted">
          {t(lang, "auth.hasAccount")}{" "}
          <Link
            href="/auth/login"
            className="text-gold font-bold hover:text-gold-light transition-colors"
          >
            {t(lang, "auth.loginHere")}
          </Link>
        </p>
      </div>
    </div>
  );
}
