export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted">Last updated: June 16, 2026</p>

      <section className="mt-8 space-y-4 text-muted leading-relaxed">
        <p>
          By using New You AI, you agree to these Terms. If you do not agree, do not use the app.
        </p>

        <h2 className="text-xl font-semibold text-foreground">The service</h2>
        <p>
          New You AI provides fitness tracking (workouts, nutrition, habits, progress) and optional
          Future You AI-generated imagery based on photos you upload. The app is for personal
          wellness and motivation — not medical advice.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Future You disclaimer</h2>
        <p>
          Future You images are <strong>AI-generated illustrations</strong>. They are not medical
          advice, diagnoses, guaranteed outcomes, or predictions of your actual appearance. Do not
          use them to make health decisions. You must be <strong>18 or older</strong> to use Future
          You.
        </p>
        <p>
          You confirm you have the right to upload any photo you submit and consent to its processing
          for generation, storage, and display within your account.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Subscriptions</h2>
        <p>
          Access to the full app, including Future You unlock, requires an active subscription
          purchased through the Apple App Store. Prices are shown in the app before purchase.
          Subscriptions renew automatically unless cancelled in your Apple account settings. Refunds
          are handled by Apple per their policies.
        </p>
        <p>
          Future You regeneration may be limited (for example, once every two weeks) to manage
          service costs. Additional purchases may be offered later.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Acceptable use</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Do not upload images of other people without their consent.</li>
          <li>Do not upload illegal, abusive, or explicit content.</li>
          <li>Do not attempt to reverse-engineer, scrape, or abuse the service.</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground">Limitation of liability</h2>
        <p>
          The service is provided &quot;as is.&quot; To the fullest extent permitted by law, New You AI
          is not liable for indirect or consequential damages arising from your use of the app or
          reliance on AI-generated imagery.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Changes</h2>
        <p>
          We may update these Terms. Continued use after changes constitutes acceptance. Material
          changes will be reflected on this page with an updated date.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Contact</h2>
        <p>
          <a href="mailto:support@newyouai.app" className="text-accent">
            support@newyouai.app
          </a>
        </p>
      </section>
    </article>
  );
}
