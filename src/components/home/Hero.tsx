"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";

export default function Hero() {
  const { lang } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-white via-white to-gold/5 dark:from-navy-dark dark:via-navy-dark dark:to-gold/10 py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy/5 dark:bg-white/10 border border-navy/10 dark:border-white/10 mb-8">
          <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
          </svg>
          <span className="text-sm font-medium text-navy dark:text-white/80">{t(lang, "hero.badge")}</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          <span className="text-navy dark:text-white">AHLAN English</span>
          <br />
          <span className="text-gold">Academy</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          {t(lang, "hero.description")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gold text-navy font-bold text-lg hover:bg-gold-light hover:scale-105 transition-all duration-200 shadow-lg shadow-gold/25"
          >
            {t(lang, "hero.cta")}
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/courses"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-navy dark:border-white/30 text-navy dark:text-white font-bold text-lg hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy transition-all duration-200"
          >
            اكتشفي دوراتنا
            <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div>
            <div className="text-3xl font-extrabold text-gold">+500</div>
            <div className="text-sm text-muted mt-1">{t(lang, "hero.stats1")}</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gold">+20</div>
            <div className="text-sm text-muted mt-1">{t(lang, "hero.stats2")}</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gold">98%</div>
            <div className="text-sm text-muted mt-1">{t(lang, "hero.stats3")}</div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-navy/5 rounded-full blur-3xl" />
    </section>
  );
}
