"use client";

import { useState, FormEvent } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gold/10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-gold text-sm font-bold mb-4">
            تواصلي معنا
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-navy dark:text-white mb-4">
            <span className="text-gold">تواصل</span> معنا
          </h1>
          <p className="text-muted max-w-2xl mx-auto text-lg leading-relaxed">
            نحن هنا لمساعدتك. أرسلي لنا استفسارك وسنرد عليك في أقرب وقت
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white dark:bg-navy/50 rounded-3xl p-8 border border-border">
              <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">
                أرسلي رسالة
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-navy dark:text-white mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-5 py-3 rounded-full border-2 border-border focus:border-gold focus:outline-none bg-gray-50 dark:bg-navy-dark/50 text-navy dark:text-white text-sm transition-colors"
                    placeholder="أدخل اسمك"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-navy dark:text-white mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-5 py-3 rounded-full border-2 border-border focus:border-gold focus:outline-none bg-gray-50 dark:bg-navy-dark/50 text-navy dark:text-white text-sm transition-colors"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-navy dark:text-white mb-2">
                    رقم الهاتف (اختياري)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-5 py-3 rounded-full border-2 border-border focus:border-gold focus:outline-none bg-gray-50 dark:bg-navy-dark/50 text-navy dark:text-white text-sm transition-colors"
                    placeholder="0555 123 456"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-navy dark:text-white mb-2">
                    رسالتك *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-border focus:border-gold focus:outline-none bg-gray-50 dark:bg-navy-dark/50 text-navy dark:text-white text-sm transition-colors resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                {status === "success" && (
                  <div className="px-4 py-3 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold text-center">
                    تم إرسال رسالتك بنجاح! سنتواصل معك قريباً
                  </div>
                )}
                {status === "error" && (
                  <div className="px-4 py-3 rounded-full bg-red-50 text-red-600 text-sm font-bold text-center">
                    حدث خطأ أثناء الإرسال. حاولي مرة أخرى
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3 rounded-full bg-gold text-navy font-bold text-sm hover:bg-gold-light transition-all duration-200 disabled:opacity-50"
                >
                  {status === "loading" ? "جاري الإرسال..." : "إرسال الرسالة"}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy dark:text-white mb-2">
                معلومات التواصل
              </h2>
              <p className="text-muted mb-8">
                يمكنك التواصل معنا مباشرة عبر أي من القنوات التالية
              </p>

              <div className="bg-white dark:bg-navy/50 rounded-3xl p-6 border border-border hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-muted mb-1">الهاتف</div>
                    <div className="text-lg font-bold text-navy dark:text-white" dir="ltr">
                      +213 555 123 456
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-navy/50 rounded-3xl p-6 border border-border hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-muted mb-1">البريد الإلكتروني</div>
                    <div className="text-lg font-bold text-navy dark:text-white" dir="ltr">
                      contact@ahlan-academy.dz
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-navy/50 rounded-3xl p-6 border border-border hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-muted mb-1">العنوان</div>
                    <div className="text-lg font-bold text-navy dark:text-white">
                      الجزائر العاصمة
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-navy/50 rounded-3xl p-6 border border-border hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-muted mb-1">ساعات العمل</div>
                    <div className="text-lg font-bold text-navy dark:text-white">
                      السبت - الخميس: 9:00 - 17:00
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
