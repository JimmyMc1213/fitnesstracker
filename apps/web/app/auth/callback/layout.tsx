import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opening New You",
  robots: { index: false, follow: false },
};

export default function AuthCallbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
