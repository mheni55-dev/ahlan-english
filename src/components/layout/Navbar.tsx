"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useUser, useSignOut } from "@/hooks/useUser";
import { useState, useEffect, useRef } from "react";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/courses", label: "دوراتنا التعليمية" },
  { href: "/testimonials", label: "آراء الطلاب" },
  { href: "/contact", label: "التواصل" },
];

const currencies = [
  { code: "DZD", symbol: "دج", name: "الدينار الجزائري", flag: "🇩🇿" },
  { code: "USD", symbol: "$", name: "الدولار الأمريكي", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "اليورو", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "الجنيه الإسترليني", flag: "🇬🇧" },
  { code: "SAR", symbol: "ر.س", name: "الريال السعودي", flag: "🇸🇦" },
  { code: "AED", symbol: "د.إ", name: "الدرهم الإماراتي", flag: "🇦🇪" },
  { code: "EGP", symbol: "ج.م", name: "الجنيه المصري", flag: "🇪🇬" },
  { code: "MAD", symbol: "د.م", name: "الدرهم المغربي", flag: "🇲🇦" },
  { code: "TND", symbol: "د.ت", name: "الدينار التونسي", flag: "🇹🇳" },
  { code: "LYD", symbol: "ل.د", name: "الدينار الليبي", flag: "🇱🇾" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user: session } = useUser();
  const signOut = useSignOut();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const currencyDesktopRef = useRef<HTMLDivElement>(null);
  const currencyMobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("currency");
    if (stored) {
      const found = currencies.find((c) => c.code === stored);
      if (found) setSelectedCurrency(found);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const inDesktop = currencyDesktopRef.current?.contains(target);
      const inMobile = currencyMobileRef.current?.contains(target);
      if (!inDesktop && !inMobile) {
        setCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectCurrency(currency: typeof currencies[number]) {
    setSelectedCurrency(currency);
    setCurrencyOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("currency", currency.code);
      window.dispatchEvent(new CustomEvent("currency-change", { detail: { code: currency.code } }));
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-navy-dark/90 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Far Right (RTL) */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="أهلا إنجلش" className="w-14 h-14 rounded-full object-cover" />
            <span className="text-xs font-bold text-navy dark:text-white leading-tight">أهلا إنجلش</span>
          </Link>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-navy text-white"
                    : "text-navy dark:text-white hover:bg-navy/10 dark:hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Left Side Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              className="w-9 h-9 rounded-full bg-navy dark:bg-white/10 flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-transform"
              title="اللغة"
            >
              EN
            </button>

            {/* Currency Selector */}
            <div className="relative hidden sm:block" ref={currencyDesktopRef}>
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 dark:bg-gold/20 text-gold text-xs font-bold border border-gold/30 hover:bg-gold/20 transition-colors"
              >
                <span className="text-sm">{selectedCurrency.flag}</span>
                <span>{selectedCurrency.code}</span>
                <svg className={`w-3 h-3 transition-transform ${currencyOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {currencyOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-navy border border-border shadow-xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <p className="text-xs text-muted px-2 py-1 font-medium">اختر العملة</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-1">
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => selectCurrency(currency)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          selectedCurrency.code === currency.code
                            ? "bg-gold/10 text-gold font-bold"
                            : "text-navy dark:text-white hover:bg-navy/5 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="text-lg">{currency.flag}</span>
                        <div className="flex-1 text-right">
                          <div className="font-medium">{currency.code} <span className="text-muted text-xs">({currency.symbol})</span></div>
                          <div className="text-xs text-muted">{currency.name}</div>
                        </div>
                        {selectedCurrency.code === currency.code && (
                          <svg className="w-4 h-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-full bg-navy dark:bg-white/10 flex items-center justify-center text-white hover:scale-105 transition-transform"
                title="الوضع الداكن"
              >
                {theme === "dark" ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}

            {/* Auth Buttons */}
            {session ? (
              <div className="hidden sm:flex items-center gap-2">
                {session.role === "admin" ? (
                  <Link
                    href="/admin"
                    className="px-4 py-2 rounded-full bg-gold text-navy text-sm font-bold hover:bg-gold-light transition-colors"
                  >
                    لوحة التحكم
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-full bg-navy text-white text-sm font-bold hover:bg-navy-light transition-colors"
                  >
                    حسابي
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-full border border-navy dark:border-white/30 text-navy dark:text-white text-sm font-medium hover:bg-navy/10 dark:hover:bg-white/10 transition-colors"
                >
                  خروج
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-full border border-navy dark:border-white/30 text-navy dark:text-white text-sm font-medium hover:bg-navy/10 dark:hover:bg-white/10 transition-colors"
                >
                  دخول
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-full bg-gold text-navy text-sm font-bold hover:bg-gold-light transition-colors"
                >
                  تسجيل
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-full bg-navy dark:bg-white/10 flex items-center justify-center text-white"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? "bg-navy text-white"
                      : "text-navy dark:text-white hover:bg-navy/10 dark:hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-2">
                {/* Mobile Currency Selector */}
                <div className="relative flex-1" ref={currencyMobileRef}>
                  <button
                    onClick={() => setCurrencyOpen(!currencyOpen)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gold/10 dark:bg-gold/20 text-gold text-sm font-bold border border-gold/30"
                  >
                    <span>{selectedCurrency.flag}</span>
                    <span>{selectedCurrency.code}</span>
                    <svg className={`w-3 h-3 transition-transform ${currencyOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {currencyOpen && (
                    <div className="absolute bottom-full mb-2 right-0 w-56 rounded-2xl bg-white dark:bg-navy border border-border shadow-xl z-50 overflow-hidden">
                      <div className="p-2 border-b border-border">
                        <p className="text-xs text-muted px-2 py-1 font-medium">اختر العملة</p>
                      </div>
                      <div className="max-h-60 overflow-y-auto p-1">
                        {currencies.map((currency) => (
                          <button
                            key={currency.code}
                            onClick={() => { selectCurrency(currency); setMobileOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                              selectedCurrency.code === currency.code
                                ? "bg-gold/10 text-gold font-bold"
                                : "text-navy dark:text-white hover:bg-navy/5 dark:hover:bg-white/5"
                            }`}
                          >
                            <span className="text-lg">{currency.flag}</span>
                            <div className="flex-1 text-right">
                              <div className="font-medium">{currency.code} <span className="text-muted text-xs">({currency.symbol})</span></div>
                              <div className="text-xs text-muted">{currency.name}</div>
                            </div>
                            {selectedCurrency.code === currency.code && (
                              <svg className="w-4 h-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                {session ? (
                  <>
                    <Link
                      href={session.role === "admin" ? "/admin" : "/dashboard"}
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center px-4 py-3 rounded-full bg-gold text-navy text-sm font-bold"
                    >
                      {session.role === "admin" ? "لوحة التحكم" : "حسابي"}
                    </Link>
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="flex-1 px-4 py-3 rounded-full border border-navy dark:border-white/30 text-navy dark:text-white text-sm font-medium"
                    >
                      خروج
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-3 rounded-full border border-navy dark:border-white/30 text-navy dark:text-white text-sm font-medium">
                      دخول
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-3 rounded-full bg-gold text-navy text-sm font-bold">
                      تسجيل
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
