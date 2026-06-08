import Link from "next/link";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/future-you", label: "Future You" },
  { href: "/community-foods", label: "Community foods" },
  { href: "/settings", label: "Settings" },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (process.env.VERCEL_ENV === "production" && !process.env.ADMIN_ALLOWED_EMAILS?.trim()) {
    throw new Error("ADMIN_ALLOWED_EMAILS must be set for production admin deploys.");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-semibold">New You AI Admin</span>
          <nav className="flex gap-4 text-sm text-muted">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
