import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteCourseButton from "./DeleteCourseButton";

export const dynamic = "force-dynamic";

export default async function AdminCourses() {
  const supabase = await createClient();

  const { data: coursesRaw } = await supabase
    .from("courses")
    .select("*, enrollments:enrollments(id)")
    .order("created_at", { ascending: false });

  const courses = (coursesRaw || []).map((c) => ({
    ...c,
    _count: { enrollments: c.enrollments?.length || 0 },
  }));

  const levelColors: Record<string, string> = {
    مبتدئ: "bg-green-100 text-green-700",
    متوسط: "bg-blue-100 text-blue-700",
    متقدم: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">إدارة الدورات</h1>
        <Link href="/admin/courses/new" className="inline-flex items-center gap-2 bg-gold text-white px-5 py-2.5 rounded-full font-medium hover:bg-gold-dark transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          إضافة دورة جديدة
        </Link>
      </div>

      <div className="rounded-3xl bg-white border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy/5 border-b border-border">
                <th className="text-right py-3 px-4 text-muted font-medium">الدورة</th>
                <th className="text-right py-3 px-4 text-muted font-medium">المستوى</th>
                <th className="text-right py-3 px-4 text-muted font-medium">السعر</th>
                <th className="text-right py-3 px-4 text-muted font-medium">المدة</th>
                <th className="text-right py-3 px-4 text-muted font-medium">المسجلين</th>
                <th className="text-right py-3 px-4 text-muted font-medium">مميزة</th>
                <th className="text-right py-3 px-4 text-muted font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted">لا توجد دورات بعد</td></tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="border-b border-border last:border-0 hover:bg-navy/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-navy/10 shrink-0">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title_ar} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-navy">{course.title_ar}</p>
                          <p className="text-xs text-muted">{course.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${levelColors[course.level] || "bg-gray-100 text-gray-700"}`}>{course.level}</span>
                    </td>
                    <td className="py-3 px-4 font-medium">{course.price.toLocaleString("ar-DZ")} دج</td>
                    <td className="py-3 px-4 text-muted">{course.duration}</td>
                    <td className="py-3 px-4">{course._count.enrollments}</td>
                    <td className="py-3 px-4">{course.featured ? <span className="text-gold">★</span> : <span className="text-muted">—</span>}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/courses/${course.id}/students`} className="text-gold hover:text-gold-dark transition-colors text-xs font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                          </svg>
                          إدارة الطلاب
                        </Link>
                        <Link href={`/admin/courses/${course.id}/edit`} className="text-navy hover:text-gold transition-colors text-xs font-medium">تعديل</Link>
                        <DeleteCourseButton courseId={course.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
