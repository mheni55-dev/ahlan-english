"use client";

import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminProfilePage() {
  const { user: session } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (session) {
      setForm((prev) => ({
        ...prev,
        name: session.name || "",
        email: session.email || "",
        phone: session.phone || "",
      }));
    }
  }, [session]);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      const { error: profileError } = await supabase
        .from("users")
        .update({ name: form.name, phone: form.phone || null, updated_at: new Date().toISOString() })
        .eq("id", session!.id);

      if (profileError) {
        setError("حدث خطأ أثناء تحديث المعلومات");
        setLoading(false);
        return;
      }

      if (form.email !== session!.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: form.email });
        if (emailError) {
          setError("حدث خطأ أثناء تحديث البريد الإلكتروني");
          setLoading(false);
          return;
        }
      }

      setSuccess("تم تحديث المعلومات بنجاح");
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      setLoading(false);
      return;
    }

    if (form.newPassword.length < 6) {
      setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: pwError } = await supabase.auth.updateUser({ password: form.newPassword });

      if (pwError) {
        setError(pwError.message || "حدث خطأ أثناء تغيير كلمة المرور");
      } else {
        setSuccess("تم تغيير كلمة المرور بنجاح");
        setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      }
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">حساب المدير</h1>

      {success && <div className="bg-green-50 text-green-600 p-3 rounded-2xl text-sm text-center">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-sm text-center">{error}</div>}

      {/* Profile Info */}
      <form onSubmit={handleProfileUpdate} className="rounded-3xl bg-white border border-border p-6 space-y-4">
        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
          <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          المعلومات الشخصية
        </h2>

        <div>
          <label className="block text-sm font-bold text-navy mb-1.5">الاسم</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-4 py-2.5 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-navy mb-1.5">البريد الإلكتروني</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full px-4 py-2.5 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-navy mb-1.5">رقم الهاتف</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="اختياري"
            className="w-full px-4 py-2.5 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gold text-navy px-6 py-2.5 rounded-full font-bold hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </form>

      {/* Password Change */}
      <form onSubmit={handlePasswordUpdate} className="rounded-3xl bg-white border border-border p-6 space-y-4">
        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
          <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          تغيير كلمة المرور
        </h2>

        <div>
          <label className="block text-sm font-bold text-navy mb-1.5">كلمة المرور الجديدة</label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            required
            minLength={6}
            className="w-full px-4 py-2.5 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-navy mb-1.5">تأكيد كلمة المرور</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
            className="w-full px-4 py-2.5 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-navy text-white px-6 py-2.5 rounded-full font-bold hover:bg-navy-light transition-colors disabled:opacity-50"
        >
          {loading ? "جاري التغيير..." : "تغيير كلمة المرور"}
        </button>
      </form>
    </div>
  );
}
