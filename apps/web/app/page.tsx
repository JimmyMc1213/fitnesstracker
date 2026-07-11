export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
        AI fitness coach
      </p>
      <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
        Upload a photo. See your future self.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        New You AI combines AI-powered Future You imagery with structured workouts, nutrition
        tracking, and habit coaching — one app to stay motivated through your transformation.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href="/pricing"
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white hover:opacity-90"
        >
          View pricing
        </a>
      </div>
      <p className="mt-8 max-w-lg text-sm text-muted">
        Native iOS app coming to the App Store soon. Complete onboarding, upload a selfie, and
        unlock your Future You preview plus the full fitness coach.
      </p>
    </div>
  );
}
