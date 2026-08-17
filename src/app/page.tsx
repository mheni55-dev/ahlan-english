import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import TestimonialsPreview from "@/components/home/TestimonialsPreview";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredCourses } = await supabase
    .from("courses")
    .select("*")
    .eq("featured", true)
    .eq("visible", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: testimonialsRaw } = await supabase
    .from("testimonials")
    .select("*, user:users(name, image), course:courses(titleAr)")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const testimonials = (testimonialsRaw || []).map((t) => ({
    ...t,
    user: Array.isArray(t.user) ? t.user[0] : t.user,
    course: Array.isArray(t.course) ? t.course[0] : t.course,
  }));

  return (
    <div>
      <Hero />
      <About />
      <FeaturedCourses courses={featuredCourses || []} />
      <TestimonialsPreview testimonials={testimonials} />
    </div>
  );
}
