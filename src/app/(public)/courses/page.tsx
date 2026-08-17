"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
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
};

type EnrollmentMap = Record<
  string,
  { id: string; paymentStatus: string } | null
>;

function CourseCard({
  course,
  enrollment,
  onEnroll,
  enrolling,
  currency,
}: {
  course: Course;
  enrollment: EnrollmentMap[string];
  onEnroll: (courseId: string) => void;
  enrolling: boolean;
  currency: string;
}) {
  const statusButton = () => {
    if (!enrollment) {
      return (
        <button
          onClick={() => onEnroll(course.id)}
          disabled={enrolling}
          className="block w-full text-center py-3 rounded-full bg-navy dark:bg-white/10 text-white font-bold text-sm hover:bg-gold hover:text-navy transition-all duration-200 disabled:opacity-50"
        >
          {enrolling ? "جاري التسجيل..." : "سجّلي الآن"}
        </button>
      );
    }

    if (enrollment.paymentStatus === "pending") {
      return (
        <div className="block w-full text-center py-3 rounded-full bg-gold/10 text-gold font-bold text-sm">
          بانتظار الموافقة
        </div>
      );
    }

    if (enrollment.paymentStatus === "approved") {
      return (
        <Link
          href={`/dashboard/course/${course.id}`}
          className="block w-full text-center py-3 rounded-full bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all duration-200"
        >
          ادخلي المحتوى
        </Link>
      );
    }

    if (enrollment.paymentStatus === "rejected") {
      return (
        <div className="block w-full text-center py-3 rounded-full bg-red-100 text-red-600 font-bold text-sm">
          مرفوض
        </div>
      );
    }

    return null;
  };

  return (
    <div className="group bg-white dark:bg-navy/50 rounded-3xl overflow-hidden border border-border hover:shadow-xl hover:shadow-gold/5 hover:border-gold/20 transition-all duration-300">
      <div className="h-48 bg-gradient-to-br from-navy to-navy-light relative overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.titleAr}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gold/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
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
        <p className="text-muted text-sm mb-4 line-clamp-2">
          {course.descriptionAr}
        </p>
        <div className="flex items-center justify-between text-sm text-muted mb-4">
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {course.duration}
          </span>
          <span className="font-extrabold text-gold text-lg">
            {formatPrice(course.price, currency)}
          </span>
        </div>
        {statusButton()}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const { user: session } = useUser();
  const currency = useCurrency();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentMap>({});
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!session) return;
    fetch("/api/enrollments")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { courseId: string; id: string; paymentStatus: string }[]) => {
        const map: EnrollmentMap = {};
        data.forEach((e) => {
          map[e.courseId] = { id: e.id, paymentStatus: e.paymentStatus };
        });
        setEnrollments(map);
      })
      .catch(() => {});
  }, [session]);

  const handleEnroll = async (courseId: string) => {
    setEnrollingId(courseId);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        setEnrollments((prev) => ({
          ...prev,
          [courseId]: { id: "pending", paymentStatus: "pending" },
        }));
      }
    } catch {
      // silent
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gold/10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-gold text-sm font-bold mb-4">
            دوراتنا
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-navy dark:text-white mb-4">
            دوراتنا <span className="text-gold">التعليمية</span>
          </h1>
          <p className="text-muted max-w-2xl mx-auto text-lg leading-relaxed">
            اختر من بين دوراتنا المتنوعة المصممة بعناية لتلبية احتياجاتك التعليمية
          </p>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 text-muted">
              لا توجد دورات متاحة حالياً
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollment={enrollments[course.id] ?? null}
                  onEnroll={handleEnroll}
                  enrolling={enrollingId === course.id}
                  currency={currency}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
