import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, course:courses(*)")
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false });

  const allEnrollments = enrollments || [];
  const pendingCount = allEnrollments.filter((e) => e.payment_status === "pending").length;
  const approvedCount = allEnrollments.filter((e) => e.payment_status === "approved").length;

  // Get user profile for name
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user.id)
    .single();

  const userName = profile?.name || user.email;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-navy dark:text-white mb-8">
        مرحباً، {userName}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="rounded-2xl border border-border bg-white dark:bg-navy/40 p-5">
          <p className="text-muted text-sm mb-1">عدد الدورات المسجلة</p>
          <p className="text-2xl font-extrabold text-navy dark:text-white">{allEnrollments.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white dark:bg-navy/40 p-5">
          <p className="text-muted text-sm mb-1">بانتظار الموافقة</p>
          <p className="text-2xl font-extrabold text-gold">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white dark:bg-navy/40 p-5">
          <p className="text-muted text-sm mb-1">دورات مقبّلة</p>
          <p className="text-2xl font-extrabold text-emerald-600">{approvedCount}</p>
        </div>
      </div>

      {allEnrollments.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-border bg-white dark:bg-navy/40">
          <svg className="mx-auto w-16 h-16 text-gold/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-muted mb-6">لم تسجّلي في أي دورة بعد</p>
          <Link href="/courses" className="inline-block px-8 py-3 rounded-full bg-navy dark:bg-white/10 text-white font-bold hover:bg-gold hover:text-navy transition-all duration-200">
            تصفح الدورات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEnrollments.map((enrollment) => {
            const course = Array.isArray(enrollment.course) ? enrollment.course[0] : enrollment.course;
            const statusBadge = () => {
              if (enrollment.payment_status === "approved") {
                return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">مقبّلة</span>;
              }
              if (enrollment.payment_status === "pending") {
                return <span className="px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-xs font-bold">بانتظار الموافقة</span>;
              }
              return <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">مرفوضة</span>;
            };

            const actionButton = () => {
              if (enrollment.payment_status === "approved") {
                return (
                  <div className="space-y-2">
                    <Link href={`/dashboard/course/${enrollment.course_id}`} className="block w-full text-center py-2.5 rounded-full bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all duration-200">
                      دخول الدورة
                    </Link>
                    {course?.zoom_link && (
                      <a href={course.zoom_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all duration-200">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h3l3 3 3-3h5a2 2 0 002-2V5a2 2 0 00-2-2H4zm10 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-3.5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                        </svg>
                        انضم لجلسة Zoom
                      </a>
                    )}
                  </div>
                );
              }
              if (enrollment.payment_status === "pending") {
                return <div className="w-full text-center py-2.5 rounded-full bg-gold/10 text-gold font-bold text-sm">بانتظار الموافقة</div>;
              }
              return <div className="w-full text-center py-2.5 rounded-full bg-red-100 text-red-600 font-bold text-sm">مرفوض - يرجى التواصل مع الإدارة</div>;
            };

            return (
              <div key={enrollment.id} className="group bg-white dark:bg-navy/50 rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:border-gold/20 transition-all duration-300">
                <div className="h-36 bg-gradient-to-br from-navy to-navy/80 relative overflow-hidden">
                  {course?.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title_ar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gold/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gold text-navy text-xs font-bold">
                    {course?.level}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-navy dark:text-white mb-3 group-hover:text-gold transition-colors">
                    {course?.title_ar}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">{statusBadge()}</div>
                  {actionButton()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
