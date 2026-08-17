"use client";

import Link from "next/link";
import { useCurrency } from "@/hooks/useCurrency";
import { formatPrice } from "@/lib/currency";

type Course = {
  id: string;
  title: string;
  titleAr: string;
  descriptionAr: string;
  price: number;
  level: string;
  duration: string;
  thumbnail: string | null;
  promoVideo: string | null;
};

export default function FeaturedCourses({ courses }: { courses: Course[] }) {
  const currency = useCurrency();

  if (courses.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-gray-50/50 dark:bg-navy/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-bold mb-4">دوراتنا</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy dark:text-white mb-4">
            الدورات <span className="text-gold">المميزة</span>
          </h2>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            اختر من بين دوراتنا المتنوعة المصممة بعناية لتلبية احتياجاتك التعليمية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group bg-white dark:bg-navy/50 rounded-3xl overflow-hidden border border-border hover:shadow-xl hover:shadow-gold/5 hover:border-gold/20 transition-all duration-300"
            >
              <div className="h-48 bg-gradient-to-br from-navy to-navy-light relative overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.titleAr} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gold/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gold text-navy text-xs font-bold">
                  {course.level}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-navy dark:text-white mb-2 group-hover:text-gold transition-colors">
                  {course.titleAr}
                </h3>
                <p className="text-muted text-sm mb-4 line-clamp-2">{course.descriptionAr}</p>
                <div className="flex items-center justify-between text-sm text-muted mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.duration}
                  </span>
                  <span className="font-extrabold text-gold text-lg">{formatPrice(course.price, currency)}</span>
                </div>
                <Link
                  href="/courses"
                  className="block w-full text-center py-3 rounded-full bg-navy dark:bg-white/10 text-white font-bold text-sm hover:bg-gold hover:text-navy transition-all duration-200"
                >
                  التسجيل في الدورة
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-navy dark:border-white/30 text-navy dark:text-white font-bold hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy transition-all duration-200"
          >
            عرض جميع الدورات
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
