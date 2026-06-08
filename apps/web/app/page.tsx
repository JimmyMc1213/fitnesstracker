export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
        Personal Fitness OS
      </p>
      <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
        See your future self. Train like you mean it.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        Workouts, nutrition, habits, and AI-powered Future You — one app to coach you through
        every rep, meal, and check-in.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href="https://app.newyouai.app"
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white hover:opacity-90"
        >
          Get started
        </a>
        <a
          href="/pricing"
          className="rounded-full border border-border px-6 py-3 font-semibold hover:border-foreground"
        >
          View pricing
        </a>
      </div>
    </div>
  );
}
