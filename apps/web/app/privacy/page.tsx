export const metadata = { title: "Privacy Policy" };

const EFFECTIVE_DATE = "July 2, 2026";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {EFFECTIVE_DATE}</p>

      <section className="mt-8 space-y-4 text-muted leading-relaxed">
        <p>
          This Privacy Policy explains how <strong>James R. McCarthy Jr.</strong>, a sole proprietorship based
          in Mesa, Arizona, United States (&quot;New You AI,&quot; &quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;), collects, uses, shares, and protects your information when you use the New
          You AI mobile application, the website at newyouai.app, and the web app at app.newyouai.app
          (together, the &quot;Service&quot;).
        </p>
        <p>
          By using the Service you agree to this Privacy Policy. If you do not agree, do not use the
          Service. This policy is written to align with the EU General Data Protection Regulation
          (GDPR), the UK GDPR, the California Consumer Privacy Act as amended by the California Privacy
          Rights Act (CCPA/CPRA), and the U.S. Children&apos;s Online Privacy Protection Act (COPPA).
        </p>

        <h2 className="text-xl font-semibold text-foreground">1. Who we are and how to contact us</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Data controller:</strong> James R. McCarthy Jr. (sole proprietor), Mesa, Arizona, USA.
          </li>
          <li>
            <strong>Postal address:</strong> Mesa, Arizona.
          </li>
          <li>
            <strong>Privacy, legal, and support contact:</strong>{" "}
            <a href="mailto:support@newyouai.app" className="text-accent">
              support@newyouai.app
            </a>
            .
          </li>
          <li>
            <strong>EU/UK representative (GDPR Art. 27):</strong> [EU REP if required].
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground">2. Scope</h2>
        <p>
          This policy covers the New You AI iOS app, the marketing site (newyouai.app), and the
          progressive web app (app.newyouai.app). It does not cover third-party services that have
          their own privacy policies, which we link to in Section 7.
        </p>

        <h2 className="text-xl font-semibold text-foreground">3. Information we collect</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Account and identity data:</strong> email address and authentication identifiers
            when you sign up with email/password or Sign in with Apple. If you use Sign in with Apple
            with private email relay, we receive only the relay address.
          </li>
          <li>
            <strong>Fitness and health-related data you enter:</strong> workouts, nutrition and
            calorie logs, body weight, habits, streaks, goals, and progress notes.
          </li>
          <li>
            <strong>Progress photos:</strong> optional photos you attach to weigh-ins to track visual
            change over time.
          </li>
          <li>
            <strong>Future You photos:</strong> the selfie or body photo you upload for an
            AI-generated transformation preview, and the resulting AI-generated image.
          </li>
          <li>
            <strong>Subscription and purchase status:</strong> whether you have an active
            subscription and related entitlement data. Payment card details are handled by Apple and
            are never collected or stored by us.
          </li>
          <li>
            <strong>Device permissions you grant:</strong> camera, photo library, and notifications.
            You can change these at any time in your device settings.
          </li>
          <li>
            <strong>Limited technical data:</strong> basic information needed to operate and secure
            the Service, such as app version and error/diagnostic events. We do not use third-party
            advertising or analytics tracking (see Section 12).
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground">4. Future You and AI processing</h2>
        <p>
          When you use Future You, the photo you upload is sent to our servers and processed by
          third-party AI services (including OpenAI) to generate an illustrative image of a possible
          future physique. Uploaded photos and generated images are stored in private, access-
          controlled cloud storage tied to your account.
        </p>
        <p>
          Future You output is <strong>illustrative only</strong> — it is not a medical prediction,
          diagnosis, guarantee, or health outcome, and should not be used to make health decisions.
        </p>
        <p>
          Future You is intended for users <strong>18 and older</strong>. We do not knowingly process
          transformation photos for users under 18. We do not use your Future You photos to train
          third-party AI models except as strictly necessary to generate your image, and we seek
          no-retention or limited-retention terms with AI vendors where available.
        </p>

        <h2 className="text-xl font-semibold text-foreground">5. Sensitive data</h2>
        <p>
          Body photos and health/fitness information may be considered sensitive personal data (or a
          special category of data) under GDPR, UK GDPR, and CPRA. We process this data only with your
          explicit consent, only to provide the features you request, and we minimize what we collect.
          You can withdraw consent at any time by deleting the relevant content or your account (see
          Section 8). We do not use sensitive data to infer characteristics for advertising.
        </p>

        <h2 className="text-xl font-semibold text-foreground">6. How we use your data and legal bases</h2>
        <p>We use your data to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Provide coaching, tracking, sync, and Future You features.</li>
          <li>Create, secure, and support your account.</li>
          <li>Process and manage subscriptions.</li>
          <li>Respond to support and rights requests.</li>
          <li>Maintain reliability, prevent abuse, and fix bugs.</li>
          <li>Comply with legal obligations.</li>
        </ul>
        <p>Where GDPR/UK GDPR applies, our legal bases are:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Contract (Art. 6(1)(b)):</strong> to deliver the Service you sign up for.
          </li>
          <li>
            <strong>Consent (Art. 6(1)(a) and Art. 9(2)(a)):</strong> for progress photos, Future You
            photos, and other sensitive data.
          </li>
          <li>
            <strong>Legitimate interests (Art. 6(1)(f)):</strong> to secure the Service and prevent
            abuse, balanced against your rights.
          </li>
          <li>
            <strong>Legal obligation (Art. 6(1)(c)):</strong> where we must retain or disclose data by
            law.
          </li>
        </ul>
        <p>We do not sell your personal information and we do not share it for cross-context behavioral advertising.</p>

        <h2 className="text-xl font-semibold text-foreground">7. Service providers and international transfers</h2>
        <p>
          We share data only with service providers (processors) who help us operate the Service, under
          contracts that require them to protect your data and use it only on our instructions:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Supabase</strong> — authentication, database, and file storage (
            <a href="https://supabase.com/privacy" className="text-accent" rel="noopener noreferrer" target="_blank">
              privacy
            </a>
            ).
          </li>
          <li>
            <strong>OpenAI</strong> — Future You image generation (
            <a href="https://openai.com/policies/privacy-policy" className="text-accent" rel="noopener noreferrer" target="_blank">
              privacy
            </a>
            ).
          </li>
          <li>
            <strong>Apple</strong> — App Store subscriptions and Sign in with Apple (
            <a href="https://www.apple.com/legal/privacy" className="text-accent" rel="noopener noreferrer" target="_blank">
              privacy
            </a>
            ).
          </li>
          <li>
            <strong>RevenueCat</strong> — subscription management (
            <a href="https://www.revenuecat.com/privacy" className="text-accent" rel="noopener noreferrer" target="_blank">
              privacy
            </a>
            ).
          </li>
          <li>
            <strong>Vercel</strong> — website and web app hosting (
            <a href="https://vercel.com/legal/privacy-policy" className="text-accent" rel="noopener noreferrer" target="_blank">
              privacy
            </a>
            ).
          </li>
        </ul>
        <p>
          These providers may process data in the United States and other countries. Where we transfer
          personal data out of the EEA or UK, we rely on appropriate safeguards such as the European
          Commission&apos;s Standard Contractual Clauses. We may also disclose data to comply with law,
          enforce our terms, or protect rights and safety.
        </p>

        <h2 className="text-xl font-semibold text-foreground">8. Retention and deletion</h2>
        <p>
          We keep personal data only as long as needed for the purposes above or as required by law.
          You can delete individual Future You transformations and your entire account from within the
          app. When you delete Future You content, we remove the associated source photo and generated
          images. When you delete your account, we remove your associated fitness data and photos from
          our active systems, subject to reasonable backup retention periods and legal requirements.
        </p>
        <p>
          To request deletion or ask questions about your data, email{" "}
          <a href="mailto:support@newyouai.app" className="text-accent">
            support@newyouai.app
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold text-foreground">9. Your rights (GDPR / UK GDPR)</h2>
        <p>If you are in the EEA or UK, you have the right to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Access a copy of your personal data.</li>
          <li>Correct inaccurate data.</li>
          <li>Delete your data (right to erasure).</li>
          <li>Restrict or object to certain processing.</li>
          <li>Data portability.</li>
          <li>Withdraw consent at any time, without affecting prior lawful processing.</li>
          <li>Lodge a complaint with your local data protection supervisory authority.</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground">10. Your rights (California — CCPA/CPRA)</h2>
        <p>If you are a California resident, you have the right to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Know what personal information we collect, use, and disclose.</li>
          <li>Delete personal information we hold about you.</li>
          <li>Correct inaccurate personal information.</li>
          <li>Limit use and disclosure of sensitive personal information.</li>
          <li>Opt out of sale or sharing — note that we do not sell or share your personal information.</li>
          <li>Not be discriminated against for exercising your rights.</li>
        </ul>
        <p>
          To exercise any of these rights, contact{" "}
          <a href="mailto:support@newyouai.app" className="text-accent">
            support@newyouai.app
          </a>
          . We will verify your request and respond within the timeframes required by law. You may use
          an authorized agent where permitted.
        </p>

        <h2 className="text-xl font-semibold text-foreground">11. Children&apos;s privacy</h2>
        <p>
          The Service is not directed to children under 13, and we do not knowingly collect personal
          information from children under 13 (or under the applicable age of digital consent, which is
          16 in parts of the EU). Future You requires users to be <strong>18 or older</strong>. If you
          believe a child has provided us personal data, contact us and we will delete it.
        </p>

        <h2 className="text-xl font-semibold text-foreground">12. Cookies and local storage</h2>
        <p>
          We do not use advertising, analytics, or third-party tracking cookies. The marketing site
          sets no tracking cookies. To provide core functionality, the web app stores strictly
          necessary data in your browser&apos;s local storage — such as your authentication session
          and onboarding progress — and our hosting provider may set essential security cookies. This
          storage is required for the Service to work and is not used to track you across sites. If we
          introduce analytics in the future, we will update this policy and provide any consent
          controls required by law.
        </p>

        <h2 className="text-xl font-semibold text-foreground">13. Security</h2>
        <p>
          We use administrative and technical safeguards, including encryption in transit, access
          controls, and private storage for photos, to protect your information. No method of
          transmission or storage is completely secure, so we cannot guarantee absolute security.
        </p>

        <h2 className="text-xl font-semibold text-foreground">14. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected on
          this page with a new &quot;Last updated&quot; date. Continued use of the Service after changes
          take effect constitutes acceptance of the updated policy.
        </p>

        <h2 className="text-xl font-semibold text-foreground">15. Contact us</h2>
        <p>
          Questions, rights requests, or deletion requests:{" "}
          <a href="mailto:support@newyouai.app" className="text-accent">
            support@newyouai.app
          </a>
          .
        </p>

        <p className="text-sm text-muted">
          This document is provided for transparency and is not legal advice. Have it reviewed by a
          qualified attorney for your jurisdiction before relying on it.
        </p>
      </section>
    </article>
  );
}
