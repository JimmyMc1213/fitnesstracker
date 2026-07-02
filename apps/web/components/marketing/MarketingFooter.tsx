import Link from "next/link";

import { Logo } from "./Logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-sand bg-white">
      <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-12 px-7 pb-10 pt-14">
        <div className="max-w-[300px]">
          <Logo href="/#top" />
          <p className="mt-3.5 text-sm font-medium leading-relaxed text-stone">
            Train, eat, and track toward the version of you that you&apos;re working toward. See your
            Future You.
          </p>
          <div className="mt-4 text-[13px] font-semibold text-stone-light">newyouai.app</div>
        </div>
        <div className="flex flex-wrap gap-14">
          <div>
            <div className="text-[13px] font-extrabold uppercase tracking-wider text-ink">Product</div>
            <div className="mt-4 flex flex-col gap-2.5 text-[14.5px] font-semibold text-ink-secondary">
              <Link href="/#future" className="opacity-90 hover:opacity-100">
                Future You
              </Link>
              <Link href="/#features" className="opacity-90 hover:opacity-100">
                Features
              </Link>
              <Link href="/#how" className="opacity-90 hover:opacity-100">
                How it works
              </Link>
              <Link href="/#download" className="opacity-90 hover:opacity-100">
                Download
              </Link>
            </div>
          </div>
          <div>
            <div className="text-[13px] font-extrabold uppercase tracking-wider text-ink">Company</div>
            <div className="mt-4 flex flex-col gap-2.5 text-[14.5px] font-semibold text-ink-secondary">
              <Link href="/support" className="opacity-90 hover:opacity-100">
                Support
              </Link>
              <Link href="/privacy" className="opacity-90 hover:opacity-100">
                Privacy Policy
              </Link>
              <Link href="/terms" className="opacity-90 hover:opacity-100">
                Terms of Service
              </Link>
              <Link href="/support#subscription" className="opacity-90 hover:opacity-100">
                Manage subscription
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-sand">
        <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-3 px-7 py-5 text-[13px] font-semibold text-stone-light">
          <span>© {new Date().getFullYear()} New You AI. All rights reserved.</span>
          <span>Made for people becoming someone new.</span>
        </div>
      </div>
    </footer>
  );
}

export function LegalFooter() {
  return (
    <footer className="border-t border-sand bg-white">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-7 py-7 text-[13.5px] font-semibold text-stone">
        <Logo href="/" size="sm" />
        <div className="flex gap-6">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/support">Support</Link>
        </div>
        <span>© {new Date().getFullYear()} New You AI</span>
      </div>
    </footer>
  );
}
