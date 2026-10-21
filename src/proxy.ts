import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { fetchOrCreateProfile } from "@/lib/supabase/profile";

function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export default async function proxy(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isDashboard = pathname.startsWith("/dashboard");

  // Protect admin routes
  if (isAdminPage || isAdminApi) {
    if (!user) {
      return isApi
        ? jsonError(401, "Unauthorized")
        : NextResponse.redirect(
            (() => {
              const url = request.nextUrl.clone();
              url.pathname = "/auth/login";
              return url;
            })()
          );
    }

    // Check the admin role from our users table
    let { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      // The profile row is missing — recreate it instead of locking the
      // account out of the admin panel.
      const recovered = await fetchOrCreateProfile(user);
      profile = recovered ? { role: recovered.role } : null;
    }

    if (!profile || profile.role !== "admin") {
      return isApi
        ? jsonError(403, "Forbidden")
        : NextResponse.redirect(
            (() => {
              const url = request.nextUrl.clone();
              url.pathname = "/";
              return url;
            })()
          );
    }
  }

  // Protect student dashboard
  if (isDashboard && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/dashboard/:path*",
    "/api/admin/:path*",
  ],
};
