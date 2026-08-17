"use client";

import { useEffect, useState } from "react";

interface Enrollment {
  id: string;
  paymentStatus: string;
  enrolledAt: string;
  user: { name: string; email: string };
  course: { titleAr: string; price: number };
  courseId: string;
}

export default function AdminPayments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>("all");

  async function fetchEnrollments() {
    try {
      const res = await fetch("/api/enrollments/all");
      if (res.ok) {
        setEnrollments(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function updateStatus(id: string, paymentStatus: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/enrollments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) {
        setEnrollments((prev) =>
          prev.map((e) => (e.id === id ? { ...e, paymentStatus } : e))
        );
      }
    } catch {
      alert("حدث خطأ");
    } finally {
      setActionLoading(null);
    }
  }

  const courseFiltered = courseFilter === "all"
    ? enrollments
    : enrollments.filter((e) => e.courseId === courseFilter);

  const pending = courseFiltered.filter((e) => e.paymentStatus === "pending");
  const approved = courseFiltered.filter((e) => e.paymentStatus === "approved");
  const rejected = courseFiltered.filter((e) => e.paymentStatus === "rejected");

  const uniqueCourses = Array.from(
    new Map(enrollments.map((e) => [e.courseId, e.course])).entries()
  ).map(([id, course]) => ({ id, ...course }));

  function renderSection(title: string, items: Enrollment[], actions?: boolean) {
    return (
      <div className="rounded-3xl bg-white border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-navy/5">
          <h2 className="font-bold text-navy">{title} ({items.length})</h2>
        </div>
        {items.length === 0 ? (
          <p className="text-center py-8 text-muted text-sm">لا توجد عناصر</p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between px-5 py-3 hover:bg-navy/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs">
                    {enrollment.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy">{enrollment.user.name}</p>
                    <p className="text-xs text-muted">{enrollment.course.titleAr} — {enrollment.course.price.toLocaleString("ar-DZ")} دج</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted hidden sm:inline">
                    {new Date(enrollment.enrolledAt).toLocaleDateString("ar-DZ")}
                  </span>
                  {actions && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateStatus(enrollment.id, "approved")}
                        disabled={actionLoading === enrollment.id}
                        className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === enrollment.id ? "..." : "موافقة"}
                      </button>
                      <button
                        onClick={() => updateStatus(enrollment.id, "rejected")}
                        disabled={actionLoading === enrollment.id}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === enrollment.id ? "..." : "رفض"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">إدارة المدفوعات</h1>

      {/* Course Filter */}
      {uniqueCourses.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted font-medium">تصفية حسب الدورة:</span>
          <button
            onClick={() => setCourseFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              courseFilter === "all"
                ? "bg-navy text-white"
                : "bg-gray-100 text-muted hover:bg-gray-200"
            }`}
          >
            جميع الدورات
          </button>
          {uniqueCourses.map((c) => (
            <button
              key={c.id}
              onClick={() => setCourseFilter(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                courseFilter === c.id
                  ? "bg-navy text-white"
                  : "bg-gray-100 text-muted hover:bg-gray-200"
              }`}
            >
              {c.titleAr}
            </button>
          ))}
        </div>
      )}

      {renderSection("المدفوعات المعلقة", pending, true)}
      {renderSection("المدفوعات الموافق عليها", approved)}
      {renderSection("المدفوعات المرفوضة", rejected)}
    </div>
  );
}
