import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalStudents },
    { count: totalCourses },
    { count: pendingPayments },
    { data: approvedEnrollments },
    { data: recentEnrollments },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("payment_status", "pending"),
    supabase.from("enrollments").select("course:courses(price)").eq("payment_status", "approved"),
    supabase.from("enrollments").select("*, user:users(name), course:courses(title_ar)").order("enrolled_at", { ascending: false }).limit(5),
  ]);

  const totalRevenue = (approvedEnrollments || []).reduce((sum, e) => {
    const course = Array.isArray(e.course) ? e.course[0] : e.course;
    return sum + (course?.price || 0);
  }, 0);

  const stats = [
    { label: "إجمالي الطلاب", value: totalStudents || 0, icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>), color: "text-gold" },
    { label: "إجمالي الدورات", value: totalCourses || 0, icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>), color: "text-navy" },
    { label: "المدفوعات المعلقة", value: pendingPayments || 0, icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), color: "text-gold", accent: (pendingPayments || 0) > 0 },
    { label: "الإيرادات", value: `${totalRevenue.toLocaleString("ar-DZ")} دج`, icon: (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), color: "text-navy" },
  ];

  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: "معلق", className: "bg-yellow-100 text-yellow-700" },
    approved: { label: "موافق", className: "bg-green-100 text-green-700" },
    rejected: { label: "مرفوض", className: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">لوحة التحكم</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-3xl bg-navy p-5 text-white shadow-lg ${stat.accent ? "ring-2 ring-gold" : ""}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gold">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-300 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy">آخر التسجيلات</h2>
          <Link href="/admin/students" className="text-sm text-gold hover:text-gold-dark transition-colors">عرض الكل</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right py-3 px-3 text-muted font-medium">الطالب</th>
                <th className="text-right py-3 px-3 text-muted font-medium">الدورة</th>
                <th className="text-right py-3 px-3 text-muted font-medium">الحالة</th>
                <th className="text-right py-3 px-3 text-muted font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {(!recentEnrollments || recentEnrollments.length === 0) ? (
                <tr><td colSpan={4} className="text-center py-8 text-muted">لا توجد تسجيلات بعد</td></tr>
              ) : (
                recentEnrollments.map((enrollment) => {
                  const user = Array.isArray(enrollment.user) ? enrollment.user[0] : enrollment.user;
                  const course = Array.isArray(enrollment.course) ? enrollment.course[0] : enrollment.course;
                  const status = statusMap[enrollment.payment_status] || statusMap.pending;
                  return (
                    <tr key={enrollment.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-3 font-medium">{user?.name}</td>
                      <td className="py-3 px-3">{course?.title_ar}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>{status.label}</span>
                      </td>
                      <td className="py-3 px-3 text-muted">
                        {new Date(enrollment.enrolled_at).toLocaleDateString("ar-DZ")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
