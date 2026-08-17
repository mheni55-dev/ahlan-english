"use client";

import { useEffect, useState } from "react";

type Testimonial = {
  id: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
  user: { name: string; email: string };
  course: { titleAr: string } | null;
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const res = await fetch("/api/testimonials?all=true");
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error("Failed to fetch testimonials");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    await fetch(`/api/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    fetchTestimonials();
  }

  async function handleReject(id: string) {
    await fetch(`/api/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: false }),
    });
    fetchTestimonials();
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا الرأي؟")) return;
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    fetchTestimonials();
  }

  const filtered = testimonials.filter((t) => {
    if (filter === "approved") return t.approved;
    if (filter === "pending") return !t.approved;
    return true;
  });

  const pendingCount = testimonials.filter((t) => !t.approved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-navy dark:text-white">إدارة آراء الطلاب</h1>
          <p className="text-muted mt-1">{pendingCount} رأي بانتظار المراجعة</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all" as const, label: "الكل" },
          { key: "pending" as const, label: `بانتظار المراجعة (${pendingCount})` },
          { key: "approved" as const, label: "المعتمدة" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === tab.key
                ? "bg-navy text-white"
                : "bg-gray-100 dark:bg-white/10 text-muted hover:bg-gray-200 dark:hover:bg-white/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted">لا توجد آراء</div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className={`p-6 rounded-2xl border transition-all ${
                t.approved
                  ? "bg-white dark:bg-navy/50 border-green-200 dark:border-green-800"
                  : "bg-gold/5 border-gold/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-navy dark:bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                      {t.user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-navy dark:text-white">{t.user.name}</div>
                      <div className="text-xs text-muted">{t.user.email}</div>
                    </div>
                    {t.course && (
                      <span className="px-3 py-1 rounded-full bg-navy/5 dark:bg-white/10 text-xs text-muted">
                        {t.course.titleAr}
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        t.approved
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gold/10 text-gold"
                      }`}
                    >
                      {t.approved ? "معتمد" : "بانتظار المراجعة"}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < t.rating ? "text-gold" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-muted text-sm leading-relaxed">{t.comment}</p>
                  <p className="text-xs text-muted/60 mt-2">
                    {new Date(t.createdAt).toLocaleDateString("ar-DZ")}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mr-4">
                  {!t.approved && (
                    <button
                      onClick={() => handleApprove(t.id)}
                      className="px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors"
                    >
                      موافقة
                    </button>
                  )}
                  {t.approved && (
                    <button
                      onClick={() => handleReject(t.id)}
                      className="px-3 py-1.5 rounded-full bg-gold text-navy text-xs font-bold hover:bg-gold-light transition-colors"
                    >
                      إلغاء الاعتماد
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
