import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "لوحة التحكم | أهلا إنجلش أكاديمي",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-navy text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gold font-bold text-lg">
              أهلا إنجلش
            </Link>
            <span className="text-muted text-sm">| لوحة التحكم</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300 hidden sm:inline">
              {admin.name}
            </span>
            <Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">
              الموقع
            </Link>
          </div>
        </div>
      </header>
      <nav className="bg-navy-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
            <Link href="/admin" className="px-4 py-2 rounded-full text-sm whitespace-nowrap text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
              لوحة التحكم
            </Link>
            <Link href="/admin/courses" className="px-4 py-2 rounded-full text-sm whitespace-nowrap text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
              الدورات
            </Link>
            <Link href="/admin/students" className="px-4 py-2 rounded-full text-sm whitespace-nowrap text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
              الطلاب
            </Link>
            <Link href="/admin/payments" className="px-4 py-2 rounded-full text-sm whitespace-nowrap text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
              المدفوعات
            </Link>
            <Link href="/admin/testimonials" className="px-4 py-2 rounded-full text-sm whitespace-nowrap text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
              آراء الطلاب
            </Link>
            <Link href="/admin/contacts" className="px-4 py-2 rounded-full text-sm whitespace-nowrap text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
              الرسائل
            </Link>
            <Link href="/admin/settings" className="px-4 py-2 rounded-full text-sm whitespace-nowrap text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
              إعدادات الموقع
            </Link>
            <Link href="/admin/profile" className="px-4 py-2 rounded-full text-sm whitespace-nowrap text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
              حسابي
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
