import Link from "next/link";

import { AppStorePill } from "./AppStoreBadge";
import { Logo } from "./Logo";

const links = [
  { href: "/#future", label: "Future You" },
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/blog", label: "Blog" },
] as const;

export function MarketingNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-sand bg-white/82 backdrop-blur-[14px] backdrop-saturate-[180%]">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-6 px-7 py-3.5">
        <Logo href="/#top" />
        <div className="hidden items-center gap-8 md:flex">
          <div className="flex items-center gap-7 text-[15px] font-semibold text-ink-muted">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="opacity-85 transition-opacity hover:opacity-100">
                {link.label}
              </Link>
            ))}
          </div>
          <AppStorePill />
        </div>
        <div className="md:hidden">
          <AppStorePill />
        </div>
      </div>
    </nav>
  );
}

export function LegalNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-sand bg-white/82 backdrop-blur-[14px] backdrop-saturate-[180%]">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-6 px-7 py-3.5">
        <Logo href="/" />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[14.5px] font-bold text-ink-muted hover:text-ink"
        >
          <span aria-hidden>←</span> Back to home
        </Link>
      </div>
    </nav>
  );
}
