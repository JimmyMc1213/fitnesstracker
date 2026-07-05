"use client";

import { useState } from "react";

import { LegalFooter } from "../../components/marketing/MarketingFooter";
import { LegalNav } from "../../components/marketing/MarketingNav";

const faqs = [
  {
    q: "How does the Future You preview work?",
    a: "During onboarding you upload one selfie and pick what you're working toward. NewYou generates an illustrated preview of you at your goal, tied to a realistic timeline based on your goal weight and pace. You get a blurred teaser first, and the full image unlocks once you subscribe.",
  },
  {
    q: "Is the Future You image a guarantee of results?",
    a: "No. It's a motivational, illustrated estimate, not a medical projection or a promise. Real results depend on many factors, including your own consistency with the plan.",
  },
  {
    q: "How often can I generate a new preview?",
    a: "You can generate a fresh You in 3 months preview every couple of weeks as you progress, and revisit past previews anytime from the NewYou tab.",
  },
  {
    q: "What's included in a subscription?",
    a: "Your personalized training plan, nutrition and hydration targets, progress tracking, coaching nudges, and the full Future You reveal. Subscriptions are billed through the App Store.",
  },
  {
    q: "How do I cancel?",
    a: "Open your Apple account settings, tap Subscriptions, choose NewYou AI, and cancel. You'll keep access until the end of your current billing period.",
  },
  {
    q: "Are my photos private?",
    a: "Yes. Your selfie and generated previews are private to your account. We don't sell them or use your face to train models for other people. You can delete them anytime.",
  },
] as const;

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <LegalNav />
      <header className="border-b border-sand bg-white">
        <div className="mx-auto max-w-[900px] px-7 pb-[52px] pt-16">
          <div className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-gold">
            We&apos;re here to help
          </div>
          <h1 className="mt-3 text-[clamp(34px,5vw,52px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Support
          </h1>
          <p className="mt-3.5 max-w-[560px] text-lg font-medium leading-relaxed text-ink-secondary">
            Questions about your plan, your Future You previews, or your subscription? Start here, or
            reach a human directly.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-[900px] px-7 pb-20 pt-12">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
          <ContactCard
            title="Email us"
            body="We answer within one business day."
            action={
              <a href="mailto:hello@newyouai.app" className="mt-3 inline-block text-[14.5px] font-extrabold text-gold">
                hello@newyouai.app
              </a>
            }
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9C7C3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            }
          />
          <ContactCard
            title="In-app chat"
            body="Open Settings, then Help in the app to chat with the team."
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9C7C3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
          />
          <ContactCard
            id="subscription"
            title="Manage subscription"
            body="Subscriptions are billed through the App Store. Cancel or change anytime in your Apple account settings."
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9C7C3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            }
          />
        </div>

        <h2 className="mt-16 text-[clamp(26px,3.4vw,36px)] font-extrabold tracking-[-0.03em]">
          Frequently asked
        </h2>
        <div className="mt-6 flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div key={faq.q} className="overflow-hidden rounded-[18px] border border-sand bg-white">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-[22px] py-5 text-left"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                >
                  <span className="text-[16.5px] font-bold tracking-tight">{faq.q}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-border bg-gold-wash text-lg font-bold text-gold">
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open ? (
                  <div className="px-[22px] pb-[22px] text-[15.5px] font-medium leading-relaxed text-ink-secondary">
                    {faq.a}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}

function ContactCard({
  title,
  body,
  action,
  icon,
  id,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
  icon: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="rounded-[20px] border border-sand bg-white p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-[13px] border border-gold-border bg-gold-wash">
        {icon}
      </div>
      <div className="mt-4 text-lg font-extrabold tracking-tight">{title}</div>
      <p className="mt-1.5 text-[14.5px] font-medium leading-snug text-ink-secondary">{body}</p>
      {action}
    </div>
  );
}
