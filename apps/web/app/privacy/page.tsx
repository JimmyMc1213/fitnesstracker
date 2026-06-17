export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: June 16, 2026</p>

      <section className="mt-8 space-y-4 text-muted leading-relaxed">
        <p>
          New You AI (&quot;we,&quot; &quot;us&quot;) operates the New You AI mobile application and
          newyouai.app. This policy describes how we collect, use, and protect your information.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Information we collect</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Account information (email, authentication provider) when you sign up.</li>
          <li>Fitness data you enter: workouts, nutrition logs, weight, habits, and progress photos.</li>
          <li>
            <strong>Future You photos:</strong> selfies or body photos you upload for AI-generated
            transformation previews.
          </li>
          <li>Device permissions you grant (camera, photo library, notifications).</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground">Future You and AI processing</h2>
        <p>
          When you use Future You, your uploaded photo is sent to our servers and processed by
          third-party AI services (including OpenAI) to generate an illustrative image. Images are
          stored in private cloud storage tied to your account. Future You output is{" "}
          <strong>illustrative only</strong> — not a medical prediction, guarantee, or health
          outcome.
        </p>
        <p>
          Future You is intended for users <strong>18 and older</strong>. We do not knowingly
          process transformation photos for users under 18.
        </p>

        <h2 className="text-xl font-semibold text-foreground">How we use your data</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Provide coaching, tracking, sync, and Future You features.</li>
          <li>Process subscriptions and support requests.</li>
          <li>Improve reliability and fix bugs.</li>
        </ul>
        <p>We do not sell your personal information.</p>

        <h2 className="text-xl font-semibold text-foreground">Retention and deletion</h2>
        <p>
          You can delete Future You transformations and your account from within the app. When you
          delete content or your account, we remove associated stored images and fitness data from
          our systems subject to reasonable backup retention periods.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Third-party services</h2>
        <p>
          We use Supabase (auth, database, storage), OpenAI (Future You generation), Apple App Store
          (subscriptions), and analytics/hosting providers necessary to operate the service. These
          providers process data under their own terms and our agreements with them.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Contact</h2>
        <p>
          Questions or deletion requests:{" "}
          <a href="mailto:support@newyouai.app" className="text-accent">
            support@newyouai.app
          </a>
        </p>
      </section>
    </article>
  );
}
