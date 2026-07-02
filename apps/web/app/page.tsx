import Image from "next/image";
import Link from "next/link";

import { AppStoreBadge, AppStorePill } from "../components/marketing/AppStoreBadge";
import { MarketingFooter } from "../components/marketing/MarketingFooter";
import { MarketingNav } from "../components/marketing/MarketingNav";
import { HeroPhones, RevealPhone } from "../components/marketing/HeroPhones";
import {
  BarbellIcon,
  CheckIcon,
  DropletIcon,
  KitchenIcon,
  TrendIcon,
} from "../components/marketing/icons";

const steps = [
  {
    n: "1",
    title: "Upload a selfie",
    body: "A single photo during onboarding. That's all New You needs to get started.",
    featured: false,
  },
  {
    n: "2",
    title: "Pick what you're working toward",
    body: "Leaner, more muscular, or wedding ready. We set targets and a realistic pace.",
    featured: false,
  },
  {
    n: "3",
    title: "See your Future You",
    body: "An illustrated preview of you at your goal, tied to a real timeline. Yours to revisit anytime.",
    featured: true,
  },
] as const;

const features = [
  {
    icon: <BarbellIcon className="h-10 w-10 text-ink" />,
    title: "Workouts",
    body: "A personalized training plan that adapts to your level and the days you can actually train.",
  },
  {
    icon: <KitchenIcon className="h-10 w-9 text-ink" />,
    title: "Macros",
    body: "Nutrition targets dialed to your goal. Log meals and watch protein, carbs, and fat fall into place.",
  },
  {
    icon: <DropletIcon className="h-[38px] w-[43px] text-ink" />,
    title: "Hydration",
    body: "A daily water target and gentle nudges so the easy thing to forget never slips.",
  },
  {
    icon: <TrendIcon className="h-11 w-[37px] text-ink" />,
    title: "Progress",
    body: "Weight, streaks, and milestones in clear charts, with coaching nudges right when you need them.",
  },
] as const;

const revealPoints = [
  "Tied to your goal weight and pace, not a stock photo",
  "A New You preview as you progress",
  "Saved alongside your real plan on the New You tab",
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <MarketingNav />

      <section id="top" className="relative">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-12 px-7 pb-20 pt-16">
          <div className="min-w-[320px] flex-1 basis-[440px]">
            <h1 className="mt-6 text-[clamp(40px,6vw,68px)] font-extrabold leading-[1.02] tracking-[-0.035em]">
              New You.
              <br />
              <span className="text-gold">See your Future You.</span>
            </h1>
            <p className="mt-[22px] max-w-[520px] text-pretty text-[clamp(17px,1.6vw,20px)] font-medium leading-relaxed text-ink-secondary">
              One app to train, eat, and track toward the body you want. Upload a selfie, pick your
              goal, and see the version of you that you are working toward. Not a generic before and
              after. Yours.
            </p>
            <div id="download" className="mt-8 flex flex-wrap items-center gap-3.5">
              <AppStorePill size="lg" label="Download the app" />
              <Link
                href="#future"
                className="inline-flex items-center gap-2 px-4 py-3.5 text-[15px] font-bold text-ink"
              >
                See how it works
                <span className="translate-y-px">→</span>
              </Link>
            </div>
            <div className="mt-[30px] flex flex-wrap items-center gap-6">
              <Stat label="Private" sub="your photos stay yours" />
              <Divider />
              <Stat label="1 app" sub="train, eat & track" />
              <Divider />
              <Stat label="Coach" sub="here to guide you" />
            </div>
          </div>
          <HeroPhones />
        </div>
      </section>

      <section className="border-y border-sand bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-3.5 px-7 py-[26px] text-center">
          <span className="text-[15px] font-semibold text-ink-secondary">
            Stop juggling a workout app, a food app, and a tracker.
          </span>
          <span className="text-[15px] font-extrabold text-ink">
            New You AI is all of it, pointed at one goal.
          </span>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-[1180px] px-7 pb-10 pt-24">
        <div className="mx-auto max-w-[640px] text-center">
          <div className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-gold">
            How Future You works
          </div>
          <h2 className="mt-3 text-[clamp(30px,4vw,46px)] font-extrabold leading-[1.08] tracking-[-0.03em]">
            Three steps to see where you&apos;re headed
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
          {steps.map((step) => (
            <div
              key={step.n}
              className={
                step.featured
                  ? "rounded-[22px] border border-ink bg-[#21201E] p-7 text-white"
                  : "rounded-[22px] border border-sand bg-white p-7"
              }
            >
              <div
                className={
                  step.featured
                    ? "flex h-11 w-11 items-center justify-center rounded-[13px] bg-gold-light text-[17px] font-extrabold text-ink"
                    : "flex h-11 w-11 items-center justify-center rounded-[13px] border border-gold-border bg-white text-[17px] font-extrabold text-gold"
                }
              >
                {step.n}
              </div>
              <div className="mt-[18px] text-xl font-extrabold tracking-tight">{step.title}</div>
              <p
                className={
                  step.featured
                    ? "mt-2 text-[15px] font-medium leading-relaxed text-[#C9C6BC]"
                    : "mt-2 text-[15px] font-medium leading-relaxed text-ink-secondary"
                }
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="future" className="relative mt-[60px]">
        <div className="absolute inset-0 bg-[#161514]" />
        <div className="relative mx-auto flex max-w-[1180px] flex-wrap items-center gap-14 px-7 py-[90px] text-white">
          <div className="min-w-[300px] flex-1 basis-[380px]">
            <div className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-gold-light">
              The reveal
            </div>
            <h2 className="mt-3.5 text-[clamp(30px,4.4vw,50px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
              Motivation you can actually look at
            </h2>
            <p className="mt-[18px] max-w-[480px] text-pretty text-[clamp(16px,1.6vw,19px)] font-medium leading-relaxed text-[#C9C6BC]">
              During onboarding you get a blurred teaser. The day you start, the full image unlocks
              on your Meet your Future You screen. Come back to it whenever you need a reason to keep
              going, and generate a fresh preview every couple of weeks as you change.
            </p>
            <div className="mt-7 flex flex-col gap-3.5">
              {revealPoints.map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-[15.5px] font-semibold text-[#E7E4DA]">{point}</span>
                </div>
              ))}
            </div>
          </div>
          <RevealPhone />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1180px] px-7 pb-10 pt-24">
        <div className="mx-auto max-w-[640px] text-center">
          <div className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-gold">
            Everything in one place
          </div>
          <h2 className="mt-3 text-[clamp(30px,4vw,46px)] font-extrabold leading-[1.08] tracking-[-0.03em]">
            The whole plan, not just a tracker
          </h2>
          <p className="mt-3.5 text-[17px] font-medium leading-relaxed text-ink-secondary">
            Built around your goal, your experience, and your schedule. Cut, bulk, or maintain.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[22px] border border-sand bg-white p-[26px] shadow-[0_6px_20px_rgba(23,21,14,0.03)]"
            >
              {feature.icon}
              <div className="mt-[18px] text-[19px] font-extrabold tracking-tight">{feature.title}</div>
              <p className="mt-2 text-[14.5px] font-medium leading-relaxed text-ink-secondary">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-7 pb-24 pt-[60px]">
        <div className="relative overflow-hidden rounded-[30px] bg-[#1B1B19] px-[clamp(40px,6vw,72px)] py-[clamp(40px,6vw,72px)] text-center">
          <Image
            src="/assets/newyou-logo.png"
            alt=""
            width={120}
            height={58}
            className="mx-auto h-[58px] w-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
          />
          <h2 className="mx-auto mt-[22px] max-w-[620px] text-balance text-[clamp(28px,4.2vw,46px)] font-extrabold leading-[1.08] tracking-[-0.03em] text-white">
            Your Future You is already waiting. Go meet them.
          </h2>
          <p className="mx-auto mt-3.5 max-w-[460px] text-[17px] font-medium text-[#C9C6BC]">
            Download New You AI, upload one photo, and start building toward the version of you that
            you actually want.
          </p>
          <div className="mt-[30px] flex flex-wrap items-center justify-center gap-3.5">
            <AppStoreBadge variant="light" />
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function Stat({ label, sub }: { label: string; sub: string }) {
  return (
    <div>
      <div className="text-[22px] font-extrabold tracking-tight">{label}</div>
      <div className="text-[13px] font-semibold text-stone">{sub}</div>
    </div>
  );
}

function Divider() {
  return <div className="hidden h-[34px] w-px bg-sand sm:block" />;
}
