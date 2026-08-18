"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push("/");
      else setChecking(false);
    });
  }, [router]);

  if (checking) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-border p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="أهلا إنجلش" className="w-20 h-20 rounded-full object-cover mb-4" />
          <h2 className="text-3xl font-bold text-navy">أهلا إنجلش</h2>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-navy text-center mb-6">
          تسجيل الدخول
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
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gold text-navy font-bold text-lg hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center mt-6 text-muted">
          ليس لديك حساب؟{" "}
          <Link
            href="/auth/register"
            className="text-gold font-bold hover:text-gold-light transition-colors"
          >
            سجّلي الآن
          </Link>
        </p>
      </div>
    </div>
  );
}
