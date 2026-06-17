export const metadata = { title: "Pricing" };

const MONTHLY = 14.99;
const YEARLY = 69.99;
const yearlyPerMonth = (YEARLY / 12).toFixed(2);
const savingsPercent = Math.round(((MONTHLY * 12 - YEARLY) / (MONTHLY * 12)) * 100);

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold">Pricing</h1>
      <p className="mt-4 max-w-xl text-muted">
        One subscription unlocks Future You AI imagery and the full fitness coach — workouts,
        nutrition, progress, and habits. Subscribe in the app after onboarding.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="text-xl font-semibold">Monthly</h2>
          <p className="mt-2 text-3xl font-bold">${MONTHLY.toFixed(2)}<span className="text-lg font-normal text-muted">/mo</span></p>
          <p className="mt-2 text-muted">Billed monthly. No free trial.</p>
        </div>
        <div className="rounded-2xl border border-accent bg-card p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">{savingsPercent}% off</p>
          <h2 className="mt-1 text-xl font-semibold">Yearly</h2>
          <p className="mt-2 text-3xl font-bold">${yearlyPerMonth}<span className="text-lg font-normal text-muted">/mo</span></p>
          <p className="mt-2 text-muted">Billed at ${YEARLY.toFixed(2)}/yr. No free trial.</p>
        </div>
      </div>
      <p className="mt-8 max-w-xl text-sm text-muted">
        During onboarding you can upload a photo and see a blurred Future You preview before
        subscribing. Future You images are AI-generated illustrations, not medical predictions.
      </p>
    </div>
  );
}
