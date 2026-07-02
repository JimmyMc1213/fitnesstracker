import Link from "next/link";

import { LegalFooter } from "../../components/marketing/MarketingFooter";
import { LegalNav } from "../../components/marketing/MarketingNav";

export const metadata = { title: "Terms of Service" };

const sections = [
  {
    title: "Using New You",
    body: "You must be at least 16 to use New You AI. You agree to use the app for your own personal, lawful purposes and to provide accurate information during onboarding so your plan and previews are useful. You are responsible for keeping your account secure.",
  },
  {
    title: "Future You and generated previews",
    body: "Future You previews are illustrated, motivational estimates generated from your selfie, goal, and pace. They are not a medical projection, a guarantee of results, or a promise that you will look a specific way. Results depend on many factors, including your own consistency. You agree not to upload photos of anyone other than yourself, or any content you do not have the right to use.",
  },
  {
    title: "Not medical advice",
    body: "New You AI provides general fitness and nutrition guidance for healthy adults. It is not a substitute for professional medical advice. Consult a qualified provider before starting any new training or nutrition program, especially if you have a health condition.",
  },
  {
    title: "Subscriptions and billing",
    body: (
      <>
        Some features, including the full Future You reveal, require a paid subscription.
        Subscriptions are billed through the App Store and renew automatically unless cancelled at
        least 24 hours before the period ends. You can manage or cancel your subscription in your
        App Store account settings. See the{" "}
        <Link href="/support" className="font-bold text-gold">
          support page
        </Link>{" "}
        for help.
      </>
    ),
  },
  {
    title: "Your content",
    body: (
      <>
        You keep ownership of the photos and information you provide. You grant New You a limited
        license to process them solely to operate the features you use, as described in our{" "}
        <Link href="/privacy" className="font-bold text-gold">
          Privacy Policy
        </Link>
        .
      </>
    ),
  },
  {
    title: "Limitation of liability",
    body: 'To the maximum extent permitted by law, New You AI is provided "as is," and we are not liable for indirect or consequential damages arising from your use of the app. Nothing in these terms limits rights that cannot be limited under applicable law.',
  },
  {
    title: "Changes and contact",
    body: (
      <>
        We may update these terms and will post changes here with a new date. Continued use after
        changes means you accept them. Questions? Visit the{" "}
        <Link href="/support" className="font-bold text-gold">
          support page
        </Link>
        .
      </>
    ),
  },
] as const;

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <LegalNav />
      <header className="border-b border-sand bg-white">
        <div className="mx-auto max-w-[820px] px-7 pb-12 pt-16">
          <div className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-gold">Legal</div>
          <h1 className="mt-3 text-[clamp(34px,5vw,52px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Terms of Service
          </h1>
          <p className="mt-3.5 text-base font-semibold text-stone">Last updated June 20, 2026</p>
        </div>
      </header>
      <main className="mx-auto max-w-[820px] px-7 pb-20 pt-14">
        <p className="text-pretty text-lg font-medium leading-relaxed text-ink-muted">
          Welcome to New You AI. By downloading or using the app you agree to these terms. Please
          read them. They cover how you can use New You, the Future You feature, subscriptions, and
          the limits of what we can promise.
        </p>
        <div>
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="mt-11 text-2xl font-extrabold tracking-tight">{section.title}</h2>
              <p className="mt-3 text-base font-medium leading-relaxed text-ink-secondary">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
