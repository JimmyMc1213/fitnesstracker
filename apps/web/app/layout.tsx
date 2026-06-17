import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "New You AI — See Your Future Self",
    template: "%s · New You AI",
  },
  description:
    "Upload a photo and see your Future You. AI-powered fitness coach with workouts, nutrition, and habits.",
  metadataBase: new URL("https://newyouai.app"),
};

const SOCIAL = {
  instagram: "https://www.instagram.com/newyouai",
  tiktok: "https://www.tiktok.com/@newyouai",
  x: "https://x.com/newyouai",
} as const;

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
          <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-muted">
            <div className="flex flex-wrap gap-4">
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="mailto:support@newyouai.app">support@newyouai.app</a>
              <a href={SOCIAL.instagram} rel="noopener noreferrer" target="_blank">
                Instagram
              </a>
              <a href={SOCIAL.tiktok} rel="noopener noreferrer" target="_blank">
                TikTok
              </a>
              <a href={SOCIAL.x} rel="noopener noreferrer" target="_blank">
                X
              </a>
            </div>
            <p className="mt-4">© {new Date().getFullYear()} New You AI</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
