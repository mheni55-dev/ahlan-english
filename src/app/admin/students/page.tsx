import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export default async function AdminStudents() {
  const supabase = await createClient();

  const { data: studentsRaw } = await supabase
    .from("users")
    .select("*, enrollments:enrollments(*, course:courses(title_ar, price))")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  const students = (studentsRaw || []) as AnyRecord[];

  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: "معلق", className: "bg-yellow-100 text-yellow-700" },
    approved: { label: "موافق", className: "bg-green-100 text-green-700" },
    rejected: { label: "مرفوض", className: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">إدارة الطلاب</h1>
        <span className="text-sm text-muted">{students.length} طالب</span>
      </div>
      <div className="space-y-3">
        {students.length === 0 ? (
          <div className="rounded-3xl bg-white border border-border p-12 text-center text-muted">لا يوجد طلاب بعد</div>
        ) : (
          students.map((student: AnyRecord) => {
            const enrollments: AnyRecord[] = (student.enrollments || []).map((e: AnyRecord) => ({
              ...e,
              course: Array.isArray(e.course) ? e.course[0] : e.course,
            })).sort((a: AnyRecord, b: AnyRecord) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime());

            return (
              <details key={student.id} className="rounded-3xl bg-white border border-border overflow-hidden group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-navy/5 transition-colors list-none">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-navy">{student.name}</p>
                      <p className="text-xs text-muted">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted hidden sm:inline">{student.phone || "—"}</span>
                    <span className="bg-navy/10 text-navy px-2.5 py-1 rounded-full text-xs font-medium">
                      {enrollments.length} دورة
                    </span>
                    <svg className="w-5 h-5 text-muted transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                <div className="border-t border-border px-5 py-3 bg-navy/5">
                  <p className="text-xs text-muted mb-2">تاريخ التسجيل: {new Date(student.created_at).toLocaleDateString("ar-DZ")}</p>
                  {enrollments.length === 0 ? (
                    <p className="text-sm text-muted py-2">لم يسجل في أي دورة بعد</p>
                  ) : (
                    <div className="space-y-2">
                      {enrollments.map((enrollment: AnyRecord) => {
                        const status = statusMap[enrollment.payment_status] || statusMap.pending;
                        return (
                          <div key={enrollment.id} className="flex items-center justify-between bg-white rounded-2xl px-4 py-2.5 border border-border">
                            <div>
                              <p className="text-sm font-medium text-navy">{enrollment.course?.title_ar}</p>
                              <p className="text-xs text-muted">
                                {new Date(enrollment.enrolled_at).toLocaleDateString("ar-DZ")} — {enrollment.course?.price.toLocaleString("ar-DZ")} دج
                              </p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>{status.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </details>
            );
          })
        )}
      </div>
    </div>
  );
}
