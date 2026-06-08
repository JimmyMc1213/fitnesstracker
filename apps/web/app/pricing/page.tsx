export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold">Pricing</h1>
      <p className="mt-4 max-w-xl text-muted">
        Pro features including Future You AI imagery. Subscriptions via the app when IAP ships.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-2 text-muted">Core tracking — workouts, nutrition, progress.</p>
        </div>
        <div className="rounded-2xl border border-accent bg-card p-8">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="mt-2 text-muted">Future You AI, advanced coaching, and more.</p>
        </div>
      </div>
    </div>
  );
}
