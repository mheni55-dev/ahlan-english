"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";

export default function LoginPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Returns the landing page for the signed-in account, or null when nobody
  // is signed in. Admins must land on /admin, students on /dashboard.
  const resolveDestination = useCallback(async (): Promise<string | null> => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return profile?.role === "admin" ? "/admin" : "/dashboard";
  }, []);

  useEffect(() => {
    let active = true;
    resolveDestination().then((destination) => {
      if (!active) return;
      if (destination) router.push(destination);
      else setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [router, resolveDestination]);

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
      setError(t(lang, "auth.loginError"));
      return;
    }

    const destination = await resolveDestination();
    window.location.href = destination ?? "/";
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-border p-8">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Ahlan English" className="w-64 h-64 object-contain mb-4 dark:invert" />
          <h2 className="text-3xl font-bold text-navy">أهلا إنجلش</h2>
        </div>

        <h1 className="text-2xl font-bold text-navy text-center mb-6">
          {t(lang, "auth.loginTitle")}
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t(lang, "auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gold text-navy font-bold text-lg hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {loading ? t(lang, "auth.loggingIn") : t(lang, "auth.loginBtn")}
          </button>
        </form>

        <p className="text-center mt-6 text-muted">
          {t(lang, "auth.noAccount")}{" "}
          <Link
            href="/auth/register"
            className="text-gold font-bold hover:text-gold-light transition-colors"
          >
            {t(lang, "auth.registerNow")}
          </Link>
        </p>
      </div>
    </div>
  );
}
