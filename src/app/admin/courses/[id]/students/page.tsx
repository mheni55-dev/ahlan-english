"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Enrollment {
  id: string;
  paymentStatus: string;
  enrolledAt: string;
  courseId: string;
  user: { id: string; name: string; email: string; phone: string | null };
}

interface Course {
  id: string;
  titleAr: string;
  title: string;
  price: number;
  level: string;
  zoomLink: string | null;
}

export default function CourseStudentsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Zoom link state
  const [zoomInput, setZoomInput] = useState("");
  const [savingZoom, setSavingZoom] = useState(false);
  const [zoomSaved, setZoomSaved] = useState(false);

  // Send modal
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendStudent, setSendStudent] = useState<Enrollment | null>(null);
  const [sendCopied, setSendCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [courseRes, enrollRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`),
          fetch(`/api/enrollments/all`),
        ]);
        if (courseRes.ok) {
          const c = await courseRes.json();
          setCourse(c);
          setZoomInput(c.zoomLink || "");
        }
        if (enrollRes.ok) {
          const allEnrollments = await enrollRes.json();
          setEnrollments(allEnrollments.filter((e: Enrollment) => e.courseId === courseId));
        }
      } catch {
        console.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId]);

  async function saveZoomLink() {
    setSavingZoom(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoomLink: zoomInput || null }),
      });
      if (res.ok) {
        setCourse((prev) => prev ? { ...prev, zoomLink: zoomInput || null } : prev);
        setZoomSaved(true);
        setTimeout(() => setZoomSaved(false), 3000);
      }
    } catch {
      alert("حدث خطأ");
    } finally {
      setSavingZoom(false);
    }
  }

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

  function openSendModal(enrollment: Enrollment) {
    setSendStudent(enrollment);
    setSendCopied(false);
    setSendModalOpen(true);
  }

  async function copyLink() {
    if (!course?.zoomLink) return;
    try {
      await navigator.clipboard.writeText(course.zoomLink);
    } catch {
      const el = document.createElement("textarea");
      el.value = course.zoomLink!;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setSendCopied(true);
    setTimeout(() => setSendCopied(false), 2500);
  }

  const filtered = enrollments.filter((e) => {
    if (filter === "all") return true;
    return e.paymentStatus === filter;
  });

  const pendingCount = enrollments.filter((e) => e.paymentStatus === "pending").length;
  const approvedCount = enrollments.filter((e) => e.paymentStatus === "approved").length;
  const rejectedCount = enrollments.filter((e) => e.paymentStatus === "rejected").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "بانتظار الموافقة", color: "bg-gold/10 text-gold" },
    approved: { label: "موافق عليه", color: "bg-green-100 text-green-700" },
    rejected: { label: "مرفوض", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/courses" className="text-muted hover:text-navy transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </Link>
            <h1 className="text-2xl font-extrabold text-navy">إدارة طلاب الدورة</h1>
          </div>
          {course && (
            <p className="text-muted mr-8">
              {course.titleAr} — {course.level} — {course.price.toLocaleString("ar-DZ")} دج
            </p>
          )}
        </div>
      </div>

      {/* Zoom Link Section */}
      <div className="rounded-3xl bg-white border border-blue-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h3l3 3 3-3h5a2 2 0 002-2V5a2 2 0 00-2-2H4zm10 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-3.5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
            </svg>
          </div>
          <div>
            <h2 className="font-extrabold text-navy">رابط Zoom للدورة</h2>
            <p className="text-xs text-muted">الصق رابط اجتماع Zoom هنا، سيظهر للطلاب المسجلين في الدورة</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={zoomInput}
            onChange={(e) => setZoomInput(e.target.value)}
            type="url"
            placeholder="https://zoom.us/j/..."
            className="flex-1 px-4 py-2.5 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={saveZoomLink}
            disabled={savingZoom}
            className="px-6 py-2.5 rounded-full bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {savingZoom ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : zoomSaved ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : null}
            {zoomSaved ? "تم الحفظ" : "حفظ الرابط"}
          </button>
        </div>
        {course?.zoomLink && (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            الرابط محفوظ — يظهر للطلاب في لوحة تحكمهم
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-gold/10 border border-gold/20 text-center">
          <div className="text-2xl font-extrabold text-gold">{pendingCount}</div>
          <div className="text-xs text-muted mt-1">بانتظار الموافقة</div>
        </div>
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center">
          <div className="text-2xl font-extrabold text-green-600">{approvedCount}</div>
          <div className="text-xs text-muted mt-1">موافق عليها</div>
        </div>
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center">
          <div className="text-2xl font-extrabold text-red-500">{rejectedCount}</div>
          <div className="text-xs text-muted mt-1">مرفوضة</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all" as const, label: `الكل (${enrollments.length})` },
          { key: "pending" as const, label: `بانتظار الموافقة (${pendingCount})` },
          { key: "approved" as const, label: `موافق عليها (${approvedCount})` },
          { key: "rejected" as const, label: `مرفوضة (${rejectedCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === tab.key ? "bg-navy text-white" : "bg-gray-100 text-muted hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Enrollments Table */}
      <div className="rounded-3xl bg-white border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted">لا يوجد طلاب مسجلين في هذه الدورة بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy/5 border-b border-border">
                  <th className="text-right py-3 px-4 text-muted font-medium">الطالب</th>
                  <th className="text-right py-3 px-4 text-muted font-medium">البريد الإلكتروني</th>
                  <th className="text-right py-3 px-4 text-muted font-medium">الهاتف</th>
                  <th className="text-right py-3 px-4 text-muted font-medium">الحالة</th>
                  <th className="text-right py-3 px-4 text-muted font-medium">تاريخ التسجيل</th>
                  <th className="text-right py-3 px-4 text-muted font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((enrollment) => {
                  const status = statusConfig[enrollment.paymentStatus] || statusConfig.pending;
                  return (
                    <tr key={enrollment.id} className="border-b border-border last:border-0 hover:bg-navy/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {enrollment.user.name.charAt(0)}
                          </div>
                          <span className="font-medium text-navy">{enrollment.user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted">{enrollment.user.email}</td>
                      <td className="py-3 px-4 text-muted" dir="ltr">{enrollment.user.phone || "—"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted text-xs">
                        {new Date(enrollment.enrolledAt).toLocaleDateString("ar-DZ")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {enrollment.paymentStatus === "pending" && (
                            <>
                              <button
                                onClick={() => updateStatus(enrollment.id, "approved")}
                                disabled={actionLoading === enrollment.id}
                                className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                {actionLoading === enrollment.id ? (
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                )}
                                موافقة
                              </button>
                              <button
                                onClick={() => updateStatus(enrollment.id, "rejected")}
                                disabled={actionLoading === enrollment.id}
                                className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                {actionLoading === enrollment.id ? (
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                                رفض
                              </button>
                            </>
                          )}
                          {enrollment.paymentStatus === "approved" && (
                            <button
                              onClick={() => updateStatus(enrollment.id, "rejected")}
                              disabled={actionLoading === enrollment.id}
                              className="bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              إلغاء الموافقة
                            </button>
                          )}
                          {enrollment.paymentStatus === "rejected" && (
                            <button
                              onClick={() => updateStatus(enrollment.id, "approved")}
                              disabled={actionLoading === enrollment.id}
                              className="bg-green-100 text-green-600 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              إعادة الموافقة
                            </button>
                          )}
                          <button
                            onClick={() => openSendModal(enrollment)}
                            className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-blue-600 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                            أرسل الرابط
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Send Link Modal */}
      {sendModalOpen && sendStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSendModalOpen(false)}>
          <div
            className="bg-white dark:bg-navy-dark rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-navy dark:text-white">إرسال رابط Zoom</h2>
              <button onClick={() => setSendModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Student */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-navy/5 dark:bg-white/5">
              <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm shrink-0">
                {sendStudent.user.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-navy dark:text-white text-sm">{sendStudent.user.name}</p>
                <p className="text-muted text-xs">{sendStudent.user.email}</p>
              </div>
            </div>

            {!course?.zoomLink ? (
              <div className="p-4 rounded-2xl bg-gold/10 border border-gold/20 text-center">
                <p className="text-sm text-gold font-bold mb-1">لم تُضف رابط Zoom بعد</p>
                <p className="text-xs text-muted">الصق الرابط في الأعلى ثم اضغط حفظ</p>
              </div>
            ) : (
              <>
                {/* Link preview */}
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h3l3 3 3-3h5a2 2 0 002-2V5a2 2 0 00-2-2H4zm10 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-3.5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                    </svg>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">رابط Zoom</span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 break-all" dir="ltr">{course.zoomLink}</p>
                </div>

                <div className="space-y-2">
                  <a
                    href={`https://wa.me/${sendStudent.user.phone?.replace(/[^0-9]/g, "") || ""}?text=${encodeURIComponent("مرحباً، هذا رابط Zoom لدورة " + (course?.titleAr || "") + ":\n" + (course?.zoomLink || ""))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    إرسال عبر واتساب
                  </a>
                  <button
                    onClick={copyLink}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-gold text-navy font-bold text-sm hover:bg-gold-light transition-colors"
                  >
                    {sendCopied ? (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        تم النسخ بنجاح
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                        نسخ الرابط
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => setSendModalOpen(false)}
              className="w-full py-2.5 rounded-full border border-border text-muted font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Copy Toast */}
      {sendCopied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-green-500 text-white font-bold text-sm shadow-xl animate-bounce">
          تم نسخ رابط Zoom بنجاح
        </div>
      )}
    </div>
  );
}
