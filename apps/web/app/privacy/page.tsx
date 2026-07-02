import Link from "next/link";

import { LegalFooter } from "../../components/marketing/MarketingFooter";
import { LegalNav } from "../../components/marketing/MarketingNav";

export const metadata = { title: "Privacy Policy" };

const sections = [
  {
    title: "What we collect",
    body: "To build your plan and your Future You preview, we collect information you provide during onboarding: your goal (cut, bulk, or maintain), experience level, schedule, body metrics, and the selfie you choose to upload. As you use the app we also process the workouts, meals, hydration, and progress you log.",
  },
  {
    title: "Your photos and Future You",
    body: "The selfie you upload is used to generate your illustrated Future You previews and to let you revisit them over time. Your photos are private to your account. We do not sell them, and we do not use your face to train models for other users. You can delete a photo or your generated previews at any time from the New You tab, and deleting your account removes them.",
  },
  {
    title: "How we use your information",
    body: "We use your data to set your training and nutrition targets, generate and update your Future You previews, send coaching nudges, and improve the quality and safety of the product. We process information on the basis of providing the service you signed up for and your consent for optional features.",
  },
  {
    title: "Sharing",
    body: "We share data only with service providers that help us run New You (for example, cloud hosting and image generation), under contracts that limit them to our instructions. We may disclose information if required by law. We never sell your personal information.",
  },
  {
    title: "Your choices and rights",
    body: "You can access, correct, export, or delete your data from within the app, or by contacting support. Depending on where you live, you may have additional rights under laws such as the GDPR or CCPA. We honor verified requests within the timelines those laws require.",
  },
  {
    title: "Data retention and security",
    body: "We keep your information for as long as your account is active and delete it within a reasonable period after you close your account. We protect your data with encryption in transit and at rest and limit internal access to those who need it.",
  },
  {
    title: "Children",
    body: "New You AI is not intended for anyone under 16. We do not knowingly collect data from children.",
  },
  {
    title: "Changes and contact",
    body: (
      <>
        We will post any material changes to this policy here and update the date above. Questions?
        Reach us through the{" "}
        <Link href="/support" className="font-bold text-gold">
          support page
        </Link>
        .
      </>
    ),
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <LegalNav />
      <header className="border-b border-sand bg-white">
        <div className="mx-auto max-w-[820px] px-7 pb-12 pt-16">
          <div className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-gold">Legal</div>
          <h1 className="mt-3 text-[clamp(34px,5vw,52px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Privacy Policy
          </h1>
          <p className="mt-3.5 text-base font-semibold text-stone">Last updated June 20, 2026</p>
        </div>
      </header>
      <main className="mx-auto max-w-[820px] px-7 pb-20 pt-14">
        <p className="text-pretty text-lg font-medium leading-relaxed text-ink-muted">
          New You AI (&quot;New You,&quot; &quot;we,&quot; &quot;us&quot;) builds a personalized fitness
          experience, including the Future You feature. This policy explains what we collect, how we
          use it, and the choices you have. We wrote it to be readable. If anything is unclear, reach
          us at{" "}
          <Link href="/support" className="font-bold text-gold">
            support
          </Link>
          .
        </p>
        <div className="mt-2">
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
