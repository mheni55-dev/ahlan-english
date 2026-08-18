import type { Metadata } from "next";
import { Noto_Sans_Arabic, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "أهلا إنجلش أكاديمي | Ahlan English Academy",
  description: "أكاديمية أهلا إنجلش لتعلم اللغة الإنجليزية - دورات احترافية للمبتدئين والمتقدمين",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html dir="rtl" lang="ar" suppressHydrationWarning className={`${notoArabic.variable} ${inter.variable}`}>
      <body className={`min-h-screen flex flex-col ${notoArabic.className} ${inter.className}`}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
