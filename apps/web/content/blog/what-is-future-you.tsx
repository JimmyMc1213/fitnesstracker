import Link from "next/link";

import type { BlogPostMeta } from "../../lib/blog/types";

export const meta: BlogPostMeta = {
  slug: "what-is-future-you",
  title: "What is Future You?",
  description:
    "Future You is NewYou AI's illustrated preview of you at your goal weight and pace. Learn how it works, what it is not, and how to use it for motivation.",
  publishedAt: "2026-07-22",
  readingTimeMinutes: 7,
};

export function Content() {
  return (
    <>
      <p>
        <strong>Future You</strong> is NewYou AI&apos;s illustrated preview of what you could look like at
        your goal. You upload one selfie during onboarding, pick cut, bulk, or maintain, and NewYou builds
        a motivational image tied to your goal weight, pace, and training plan. It is not a stock photo, a
        social filter, or a medical prediction. It is a private visual anchor you can revisit when
        discipline gets hard.
      </p>

      <h2>Why we built Future You</h2>
      <p>
        Most fitness apps excel at numbers: calories left, sets logged, streak counts. Those metrics
        matter, but they feel abstract on a rough morning. Future You gives you something concrete to
        look at: a preview of the version of you that you said you wanted to become.
      </p>
      <p>
        The image reflects your actual plan. Goal weight, weekly pace, and the motivation you picked
        (leaner, more muscular, wedding-ready, and similar options) all shape what you see. It is yours,
        not a generic before-and-after pulled from the internet.
      </p>

      <h2>How Future You works in NewYou AI</h2>
      <ol>
        <li>
          <strong>Upload one selfie</strong> during onboarding. That single photo is all NewYou needs to
          generate your first preview.
        </li>
        <li>
          <strong>Pick your goal and pace.</strong> Choose cut, bulk, or maintain, then select what you
          are working toward (visible abs, broader shoulders, beach-ready, and other motivations).
        </li>
        <li>
          <strong>See a blurred teaser first.</strong> Onboarding shows a preview before you subscribe so
          you know what you are unlocking.
        </li>
        <li>
          <strong>Unlock the full reveal.</strong> After you subscribe, the full Future You image opens
          on your Meet your Future You screen.
        </li>
        <li>
          <strong>Revisit and refresh.</strong> Return whenever you need a push. You can generate a fresh
          preview every couple of weeks as your body and goals change.
        </li>
      </ol>
      <p>
        Not sure which goal to pick? Read our guide to{" "}
        <Link href="/blog/cut-vs-bulk-vs-maintain">cut, bulk, or maintain</Link> before you start.
      </p>

      <h2>What Future You is not</h2>
      <p>
        Future You is an <strong>illustrated estimate for motivation</strong>, not a guarantee of results.
        Real outcomes depend on how consistently you train, eat, sleep, and recover. Those are the same
        habits the rest of NewYou helps you track.
      </p>
      <p>
        We do not reshape your face to make you look like someone else. Changes in the preview stay below
        the neck. Your identity stays yours.
      </p>
      <p>
        Future You also does not replace professional medical advice. If you have health conditions or
        dietary restrictions, talk to a qualified provider before changing your routine.
      </p>

      <h2>Where Future You lives in the app</h2>
      <p>
        Your previews sit on the NewYou tab next to your plan. They are private to your account and are
        not posted to a public feed inside the app. You choose if and when to share anything outside
        NewYou.
      </p>
      <p>
        For details on storage and deletion, read{" "}
        <Link href="/blog/how-we-handle-your-photos">how we handle your photos</Link> or our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Frequently asked questions</h2>
      <p>
        <strong>Is Future You a guarantee I will look exactly like the preview?</strong> No. It is an
        illustrated motivational estimate based on your photo and goals. Your real results depend on
        consistency, genetics, sleep, and many other factors NewYou cannot control.
      </p>
      <p>
        <strong>Do I need Future You to use the rest of the app?</strong> No. Workouts, nutrition
        tracking, and habit coaching work without uploading a selfie. Future You is optional motivation
        for people who want a visual anchor.
      </p>
      <p>
        <strong>Can I generate a new preview later?</strong> Yes. You can refresh your Future You preview
        every couple of weeks as you progress. Past previews stay available on the NewYou tab so you can
        compare where you started with where you are headed.
      </p>
      <p>
        <strong>Who can see my Future You images?</strong> Only you when signed in to your account.
        NewYou does not publish your previews to other users. See{" "}
        <Link href="/support">Support</Link> if you need help with privacy or deletion.
      </p>
    </>
  );
}
