import Link from "next/link";

type Testimonial = {
  id: string;
  rating: number;
  comment: string;
  user: { name: string; image: string | null } | null;
  course: { titleAr: string } | null;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-gold" : "text-gray-300 dark:text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsPreview({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-navy-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-bold mb-4">آراء الطلاب</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy dark:text-white mb-4">
            ماذا يقول <span className="text-gold">طلابنا</span>
          </h2>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            نفخر بآراء طلابنا ونجاحاتهم في تعلم اللغة الإنجليزية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-3xl bg-white dark:bg-navy/50 border border-border hover:shadow-lg transition-all duration-300"
            >
              <StarRating rating={t.rating} />
              <p className="text-sm text-muted mt-4 mb-6 leading-relaxed line-clamp-4">{t.comment}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy dark:bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                  {t.user?.name?.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-navy dark:text-white">{t.user?.name}</div>
                  {t.course && <div className="text-xs text-muted">{t.course.titleAr}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-navy dark:border-white/30 text-navy dark:text-white font-bold hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy transition-all duration-200"
          >
            عرض جميع الآراء
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
