import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import TestimonialsPreview from "@/components/home/TestimonialsPreview";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: coursesRaw } = await supabase
    .from("courses")
    .select("*")
    .eq("visible", true)
    .order("created_at", { ascending: false });

  const courses = (coursesRaw || []).map((c) => ({
    id: c.id,
    title: c.title,
    titleAr: c.title_ar,
    descriptionAr: c.description_ar,
    price: c.price,
    level: c.level,
    duration: c.duration,
    thumbnail: c.thumbnail,
    promoVideo: c.promo_video,
  }));

  const { data: testimonialsRaw } = await supabase
    .from("testimonials")
    .select("*, user:users(name, image), course:courses(title_ar)")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const testimonials = (testimonialsRaw || []).map((t) => {
    const user = Array.isArray(t.user) ? t.user[0] : t.user;
    const course = Array.isArray(t.course) ? t.course[0] : t.course;
    return {
      id: t.id,
      rating: t.rating,
      comment: t.comment,
      user: user ? { name: user.name, image: user.image } : null,
      course: course ? { titleAr: course.title_ar } : null,
    };
  });

  return (
    <div>
      <Hero />
      <About />
      <FeaturedCourses courses={courses} />
      <TestimonialsPreview testimonials={testimonials} />
    </div>
  );
}
