import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const typeLabel: Record<string, string> = {
  video: "فيديو",
  file: "ملف",
  link: "رابط",
};

export default async function CourseContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", id)
    .single();

  if (!enrollment || enrollment.payment_status !== "approved") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <svg className="mx-auto w-16 h-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <h1 className="text-xl font-bold text-navy dark:text-white mb-2">غير مصرح بالدخول</h1>
        <p className="text-muted mb-6">لم تتم الموافقة على تسجيلك في هذه الدورة بعد</p>
        <Link href="/dashboard" className="inline-block px-6 py-2.5 rounded-full bg-navy dark:bg-white/10 text-white font-bold text-sm hover:bg-gold hover:text-navy transition-all duration-200">
          العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  const { data: contents } = await supabase
    .from("course_contents")
    .select("*")
    .eq("course_id", id)
    .order("order", { ascending: true });

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-navy dark:text-white mb-2">الدورة غير موجودة</h1>
        <Link href="/dashboard" className="inline-block px-6 py-2.5 rounded-full bg-navy dark:bg-white/10 text-white font-bold text-sm hover:bg-gold hover:text-navy transition-all duration-200">
          العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  const courseContents = contents || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted hover:text-gold transition-colors mb-4">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          العودة للوحة التحكم
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy dark:text-white">{course.title_ar}</h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="px-3 py-1 rounded-full bg-gold text-navy text-xs font-bold">{course.level}</span>
          <span className="text-sm text-muted">{course.duration}</span>
          <span className="text-sm text-muted">
            {courseContents.length} {courseContents.length === 1 ? "محتوى" : "محتويات"}
          </span>
        </div>
      </div>

      {course.zoom_link && (
        <div className="mb-8 rounded-2xl border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h3l3 3 3-3h5a2 2 0 002-2V5a2 2 0 00-2-2H4zm10 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-3.5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-navy dark:text-white text-lg mb-1">رابط اجتماع Zoom</h3>
              <p className="text-sm text-muted mb-3">انضم لجلسة البث المباشر مع المعلم</p>
              <a href={course.zoom_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h3l3 3 3-3h5a2 2 0 002-2V5a2 2 0 00-2-2H4zm10 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-3.5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                </svg>
                انضم للجلسة
              </a>
            </div>
          </div>
        </div>
      )}

      {courseContents.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-border bg-white dark:bg-navy/40">
          <p className="text-muted">لم يُضف محتوى لهذه الدورة بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courseContents.map((content, index) => (
            <div key={content.id} className="bg-white dark:bg-navy/50 rounded-2xl border border-border p-5 hover:border-gold/20 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-navy dark:bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-navy dark:text-white mb-1">{content.title_ar}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs font-bold">
                      {typeLabel[content.type] ?? content.type}
                    </span>
                  </div>
                  {content.type === "video" && (
                    <div className="aspect-video rounded-xl bg-navy/5 dark:bg-white/5 flex items-center justify-center mb-3">
                      <svg className="w-16 h-16 text-gold/40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  <a href={content.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-gold hover:underline">
                    {content.type === "video" ? "شاهد الفيديو" : content.type === "file" ? "تحميل الملف" : "فتح الرابط"}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
