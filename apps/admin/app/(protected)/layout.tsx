import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminAllowlist } from "@/lib/supabase-admin";
import { createServerSupabase } from "@/lib/supabase-server";

import { signOutAction } from "../login/actions";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/future-you", label: "Future You" },
  { href: "/community-foods", label: "Community foods" },
  { href: "/settings", label: "Settings" },
];

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (process.env.VERCEL_ENV === "production" && !process.env.ADMIN_ALLOWED_EMAILS?.trim()) {
    throw new Error("ADMIN_ALLOWED_EMAILS must be set for production admin deploys.");
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.toLowerCase();
  const allowlist = getAdminAllowlist();
  // Require a signed-in user; when an allowlist is configured, require membership.
  // (In production the guard above ensures the allowlist is always configured.)
  const authorized = Boolean(user && email && (allowlist.length === 0 || allowlist.includes(email)));
  if (!authorized) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-semibold">New You AI Admin</span>
          <nav className="flex items-center gap-4 text-sm text-muted">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
            <form action={signOutAction}>
              <button type="submit" className="hover:text-foreground">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
