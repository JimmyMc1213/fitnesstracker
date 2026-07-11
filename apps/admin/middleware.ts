import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/auth/signout"];

function supabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
}

function anonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );
}

function allowlist(): string[] {
  return (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isDeployedEnv(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
}

function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = allowlist();
  if (allow.length === 0) return !isDeployedEnv();
  return allow.includes(email.toLowerCase());
}

function redirectToLogin(request: NextRequest, pathname: string, denied = false): NextResponse {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set("from", pathname);
  if (denied) redirectUrl.searchParams.set("denied", "1");
  return NextResponse.redirect(redirectUrl);
}

export async function middleware(request: NextRequest) {
  const url = supabaseUrl();
  const anon = anonKey();
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Deployed builds must have auth env configured — fail closed instead of passing through.
  if (!url || !anon) {
    if (isDeployedEnv()) return redirectToLogin(request, pathname);
    return NextResponse.next();
  }

  // Local dev without an allowlist: skip auth gate (not for production or preview).
  if (allowlist().length === 0 && !isDeployedEnv()) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAllowed(user.email)) {
    return redirectToLogin(request, pathname, Boolean(user && !isAllowed(user.email)));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|design|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)"],
};
