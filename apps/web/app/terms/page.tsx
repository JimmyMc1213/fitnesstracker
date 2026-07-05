import Link from "next/link";

import { LegalFooter } from "../../components/marketing/MarketingFooter";
import { LegalNav } from "../../components/marketing/MarketingNav";

export const metadata = { title: "Terms of Service" };

const EFFECTIVE_DATE = "July 2, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <LegalNav />
      <header className="border-b border-sand bg-white">
        <div className="mx-auto max-w-[820px] px-7 pb-12 pt-16">
          <div className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-gold">Legal</div>
          <h1 className="mt-3 text-[clamp(34px,5vw,52px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Terms of Service
          </h1>
          <p className="mt-3.5 text-base font-semibold text-stone">Last updated {EFFECTIVE_DATE}</p>
        </div>
      </header>
      <main className="mx-auto max-w-[820px] px-7 pb-20 pt-14">
        <section className="space-y-4 text-base font-medium leading-relaxed text-ink-secondary">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of the NewYou AI mobile
            application, the website at newyouai.app, and the web app at app.newyouai.app (together, the
            &quot;Service&quot;), operated by <strong>James R. McCarthy Jr.</strong>, a sole proprietorship based
            in Mesa, Arizona, United States (&quot;NewYou AI,&quot; &quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;). By using the Service, you agree to these Terms. If you do not agree, do not
            use the Service.
          </p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">1. Eligibility</h2>
          <p>
            You must be at least 13 years old to use the Service. You must be <strong>18 or older</strong>{" "}
            to use the Future You feature. If you are under the age of majority in your jurisdiction, you
            may use the Service only with the involvement of a parent or legal guardian. By using the
            Service, you represent that you meet these requirements.
          </p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">2. The service</h2>
          <p>
            NewYou AI provides fitness tracking (workouts, nutrition, habits, and progress) and an
            optional Future You feature that produces AI-generated imagery based on photos you upload.
            The Service is for personal wellness and motivation only and does <strong>not</strong>{" "}
            provide medical, nutritional, or professional advice. Always consult a qualified professional
            before making health, diet, or exercise decisions.
          </p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">3. Your account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials and for all
            activity under your account. Provide accurate information and keep it current. Notify us
            promptly of any unauthorized use. You may delete your account at any time from within the
            app.
          </p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">4. Future You disclaimer</h2>
          <p>
            Future You images are <strong>AI-generated illustrations</strong>. They are not medical
            advice, diagnoses, guaranteed outcomes, or predictions of your actual appearance, and must
            not be used to make health decisions. You must be <strong>18 or older</strong> to use Future
            You.
          </p>
          <p>
            By uploading a photo, you confirm that the photo is of yourself, that you have the right to
            upload it, and that you consent to its processing for generation, storage, and display within
            your account, as described in our{" "}
            <Link href="/privacy" className="font-bold text-gold">
              Privacy Policy
            </Link>
            . AI output can be inaccurate or unexpected; regeneration may be rate-limited (for example,
            once every two weeks) to manage service costs.
          </p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">5. Acceptable use</h2>
          <p>You agree that you will not:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Upload photos of other people without their consent, or images of minors.</li>
            <li>Upload illegal, abusive, harassing, sexually explicit, or infringing content.</li>
            <li>Use the Service to violate any law or the rights of others.</li>
            <li>Attempt to reverse-engineer, scrape, overload, or interfere with the Service.</li>
            <li>Resell, sublicense, or commercially exploit the Service without our permission.</li>
          </ul>
          <p>We may suspend or terminate accounts that violate these rules.</p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">6. Subscriptions and billing</h2>
          <p>
            Full access to the Service, including the Future You unlock, requires an active subscription
            purchased through the Apple App Store. Current pricing is $14.99 per month or $69.99 per year,
            with no free trial; prices are shown in the app before you purchase and may change with
            notice.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Payment is charged to your Apple ID at confirmation of purchase.</li>
            <li>
              Subscriptions renew automatically unless you cancel at least 24 hours before the end of the
              current period.
            </li>
            <li>
              You manage and cancel subscriptions in your Apple account settings; deleting the app does
              not cancel a subscription.
            </li>
            <li>Refunds are handled by Apple in accordance with Apple&apos;s policies.</li>
          </ul>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">
            7. Intellectual property and your content
          </h2>
          <p>
            The Service, including its software, design, and content (excluding your content), is owned by
            NewYou AI and protected by intellectual property laws. We grant you a limited, non-exclusive,
            non-transferable, revocable license to use the Service for personal, non-commercial purposes.
          </p>
          <p>
            You retain ownership of the photos and data you upload. You grant us a limited license to
            host, process, and display that content solely to operate and provide the Service to you. You
            are responsible for the content you upload and for ensuring you have the rights to it.
          </p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">8. Third-party services</h2>
          <p>
            The Service relies on third parties including Apple (payments and sign-in), OpenAI (Future You
            generation), Supabase (authentication, database, and storage), and RevenueCat (subscription
            management). Your use of the Service may also be subject to their terms. We are not
            responsible for third-party services we do not control.
          </p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">9. Disclaimers</h2>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of
            any kind, whether express or implied, including implied warranties of merchantability, fitness
            for a particular purpose, and non-infringement. We do not warrant that the Service will be
            uninterrupted, error-free, or that AI-generated output will meet your expectations.
          </p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">10. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, NewYou AI will not be liable for any indirect,
            incidental, special, consequential, or punitive damages, or for any loss of data, profits, or
            goodwill, arising from your use of or inability to use the Service or reliance on AI-generated
            imagery. To the extent liability cannot be excluded, our total liability is limited to the
            amount you paid us in the twelve months before the claim. Some jurisdictions do not allow
            certain limitations, so some of these may not apply to you.
          </p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless NewYou AI from any claims, damages, liabilities, and
            expenses (including reasonable legal fees) arising from your content, your use of the Service,
            or your violation of these Terms or applicable law.
          </p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">12. Termination</h2>
          <p>
            You may stop using the Service and delete your account at any time. We may suspend or terminate
            your access if you violate these Terms or if we discontinue the Service. Sections that by their
            nature should survive termination (including intellectual property, disclaimers, limitation of
            liability, and indemnification) will survive.
          </p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">13. Governing law and disputes</h2>
          <p>
            These Terms are governed by the laws of the State of Arizona, United States, without regard to
            conflict-of-law rules. Before filing a formal claim, you agree to first contact us at{" "}
            <a href="mailto:support@newyouai.app" className="font-bold text-gold">
              support@newyouai.app
            </a>{" "}
            to seek an informal resolution. Any disputes not resolved informally will be subject to the
            exclusive jurisdiction of the state and federal courts located in Maricopa County, Arizona,
            unless applicable consumer-protection law grants you the right to bring a claim elsewhere.
          </p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">14. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. Material changes will be reflected on this page
            with an updated &quot;Last updated&quot; date. Continued use of the Service after changes take
            effect constitutes acceptance of the updated Terms.
          </p>

          <h2 className="mt-11 text-xl font-extrabold tracking-tight text-ink">15. Contact</h2>
          <p>
            <a href="mailto:support@newyouai.app" className="font-bold text-gold">
              support@newyouai.app
            </a>
          </p>

          <p className="text-sm text-stone">
            This document is provided for transparency and is not legal advice. Have it reviewed by a
            qualified attorney for your jurisdiction before relying on it.
          </p>
        </section>
      </main>
      <LegalFooter />
    </div>
  );
}
