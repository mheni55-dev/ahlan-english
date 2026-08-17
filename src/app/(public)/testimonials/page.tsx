import { createClient } from "@/lib/supabase/server";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating ? "text-gold" : "text-gray-300 dark:text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function TestimonialsPage() {
  const supabase = await createClient();

  const { data: testimonialsRaw } = await supabase
    .from("testimonials")
    .select("*, user:users(name), course:courses(title_ar)")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  const testimonials = (testimonialsRaw || []).map((t) => {
    const user = Array.isArray(t.user) ? t.user[0] : t.user;
    const course = Array.isArray(t.course) ? t.course[0] : t.course;
    return {
      id: t.id,
      rating: t.rating,
      comment: t.comment,
      user: user ? { name: user.name } : null,
      course: course ? { titleAr: course.title_ar } : null,
    };
  });

  return (
    <div>
      <section className="bg-gold/10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-gold text-sm font-bold mb-4">آراء الطلاب</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-navy dark:text-white mb-4">
            ماذا يقول <span className="text-gold">طلابنا</span>
          </h1>
          <p className="text-muted max-w-2xl mx-auto text-lg leading-relaxed">نفخر بآراء طلابنا ونجاحاتهم في تعلم اللغة الإنجليزية</p>
        </div>
      </section>
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {testimonials.length === 0 ? (
            <div className="text-center py-20 text-muted">لا توجد شهادات متاحة حالياً</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="p-6 rounded-3xl bg-white dark:bg-navy/50 border border-border hover:shadow-lg transition-all duration-300">
                  <StarRating rating={t.rating} />
                  <p className="text-sm text-muted mt-4 mb-6 leading-relaxed line-clamp-4">{t.comment}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy dark:bg-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {t.user?.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-navy dark:text-white truncate">{t.user?.name}</div>
                      {t.course && <div className="text-xs text-muted truncate">{t.course.titleAr}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
