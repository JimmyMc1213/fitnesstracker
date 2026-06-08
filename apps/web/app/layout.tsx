import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "New You AI — Personal Fitness OS",
    template: "%s · New You AI",
  },
  description:
    "Workouts, nutrition, habits, and AI-powered Future You — one app to hit your goals.",
  metadataBase: new URL("https://newyouai.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <header className="border-b border-border">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <a href="/" className="text-lg font-semibold tracking-tight">
              New You AI
            </a>
            <div className="flex gap-6 text-sm text-muted">
              <a href="/about" className="hover:text-foreground">
                About
              </a>
              <a href="/pricing" className="hover:text-foreground">
                Pricing
              </a>
              <a
                href="https://app.newyouai.app"
                className="rounded-full bg-accent px-4 py-2 font-medium text-white hover:opacity-90"
              >
                Open app
              </a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="mt-24 border-t border-border">
          <div className="mx-auto flex max-w-5xl flex-wrap gap-4 px-6 py-8 text-sm text-muted">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/blog">Blog</a>
            <span className="ml-auto">© {new Date().getFullYear()} New You AI</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
