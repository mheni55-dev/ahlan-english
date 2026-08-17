import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { mapKeys } from "@/lib/mapKeys";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import TestimonialsPreview from "@/components/home/TestimonialsPreview";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredCoursesRaw } = await supabase
    .from("courses")
    .select("*")
    .eq("featured", true)
    .eq("visible", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const featuredCourses = (featuredCoursesRaw || []).map((c) => mapKeys(c as Record<string, unknown>));

  const { data: testimonialsRaw } = await supabase
    .from("testimonials")
    .select("*, user:users(name, image), course:courses(title_ar)")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const testimonials = (testimonialsRaw || []).map((t) => ({
    ...mapKeys(t as Record<string, unknown>),
    user: Array.isArray(t.user) ? mapKeys(t.user[0] as Record<string, unknown>) : mapKeys(t.user as Record<string, unknown>),
    course: Array.isArray(t.course) ? mapKeys(t.course[0] as Record<string, unknown>) : t.course ? mapKeys(t.course as Record<string, unknown>) : null,
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
