import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@/types/database";

type ProfileRoleRow = { role: UserRole } | null;

const PUBLIC_PATHS = ["/", "/login", "/signup", "/api/auth"];
const ADMIN_PREFIX = "/admin";
const CLIENT_PREFIX = "/client";

function isPublicPath(pathname: string) {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/images")) return true;
  if (pathname.startsWith("/api/")) return true;
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith(ADMIN_PREFIX) || pathname.startsWith(CLIENT_PREFIX);

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isProtected) {
    const { data: profile } = (await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()) as { data: ProfileRoleRow };
    const role = profile?.role;

    if (pathname.startsWith(ADMIN_PREFIX) && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = role === "client" ? "/client/dashboard" : "/login";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith(CLIENT_PREFIX) && role !== "client") {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin/dashboard" : "/login";
      return NextResponse.redirect(url);
    }
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const { data: profile } = (await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()) as { data: ProfileRoleRow };
    const url = request.nextUrl.clone();
    url.pathname =
      profile?.role === "admin" ? "/admin/dashboard" : "/client/dashboard";
    return NextResponse.redirect(url);
  }

  // Reference isPublicPath so import stays meaningful for future expansion.
  void isPublicPath;

  return supabaseResponse;
}
