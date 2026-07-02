import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "New You AI — See Your Future Self",
    template: "%s · New You AI",
  },
  description:
    "Upload a photo and see your Future You. One app to train, eat, and track toward the body you want.",
  metadataBase: new URL("https://newyouai.app"),
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/assets/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "New You AI",
    images: [{ url: "/assets/newyou-logo.png", width: 953, height: 1024, alt: "New You AI" }],
  },
  twitter: {
    card: "summary",
    images: ["/assets/newyou-logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
