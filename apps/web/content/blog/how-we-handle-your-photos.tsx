import Link from "next/link";

import type { BlogPostMeta } from "../../lib/blog/types";

export const meta: BlogPostMeta = {
  slug: "how-we-handle-your-photos",
  title: "How we handle your photos",
  description:
    "Learn what NewYou AI does with your selfie and Future You previews: private storage, deletion, consent, and what we never do with your images.",
  publishedAt: "2026-07-22",
  readingTimeMinutes: 7,
};

export function Content() {
  return (
    <>
      <p>
        Uploading a selfie is a trust decision. Before you tap the button, you should know exactly what
        NewYou AI does with your photos. Here is the direct answer: your images stay private to your
        account, live in secure cloud storage, and can be deleted anytime. We do not sell your photos. We
        do not use your face to generate previews for other people.
      </p>

      <h2>What you upload</h2>
      <p>
        During onboarding, NewYou asks for <strong>one selfie</strong> to create your Future You preview.
        You may add progress photos later if you use that feature, but the selfie is the only photo
        required to get started with Future You.
      </p>
      <p>
        Before upload, you confirm that you are 18 or older and that you consent to AI-generated body
        imagery based on your photo. If you are not comfortable with that, skip the upload. You can still
        log workouts and track nutrition without Future You.
      </p>
      <p>
        For context on what the preview is (and is not), read{" "}
        <Link href="/blog/what-is-future-you">What is Future You?</Link>.
      </p>

      <h2>Where your photos are stored</h2>
      <p>
        Your selfie and generated previews sit in private cloud storage tied to your account. They are not
        open public URLs that anyone can find by guessing a link. Only you, signed in to your account, can
        view your images through the NewYou app.
      </p>
      <p>
        Generated previews are illustrative AI output built from your photo and goal settings. They are
        not reused as training material to create previews for other users.
      </p>

      <h2>What we never do with your images</h2>
      <ul>
        <li>Sell your photos or previews to third parties.</li>
        <li>Publish your images to a public social feed inside the app.</li>
        <li>Use your face to generate Future You previews for other accounts.</li>
        <li>Share your uploads with advertisers or data brokers.</li>
      </ul>
      <p>
        We also do not promise that every upload produces a perfect output. Unusual inputs may fail
        moderation. When that happens, you are not charged for a failed generation.
      </p>

      <h2>Deletion and your control</h2>
      <p>
        You can delete Future You images from inside the app. When you delete your account, associated
        photos and previews are removed as part of that process.
      </p>
      <p>
        If a generated preview looks wrong, offensive, or unlike you, report it in the app. We review
        flagged content and take action on repeat issues.
      </p>
      <p>
        Full legal terms live in our <Link href="/privacy">Privacy Policy</Link> and{" "}
        <Link href="/terms">Terms of Service</Link>.
      </p>

      <h2>How this fits Apple and App Store requirements</h2>
      <p>
        NewYou discloses AI body imagery during onboarding and in App Store review materials. The app
        includes an age gate, consent language, and in-app paths to delete images and report problems.
        That transparency is intentional: fitness photos are sensitive, and you deserve clear answers
        before you share them.
      </p>

      <h2>Frequently asked questions</h2>
      <p>
        <strong>Does NewYou train AI models on my selfie?</strong> Your uploads are used to generate your
        own previews. They are not shared across accounts to create images for other users.
      </p>
      <p>
        <strong>Can NewYou employees browse my photos?</strong> Access is limited to what is needed for
        support, security, and moderation when you report an issue. Day-to-day use of the app does not
        expose your images to a public audience.
      </p>
      <p>
        <strong>What if I change my mind after uploading?</strong> Delete the image in the app or contact{" "}
        <a href="mailto:support@newyouai.app">support@newyouai.app</a>. Account deletion removes
        associated media.
      </p>
      <p>
        <strong>Do I need a photo to use workouts and macros?</strong> No. Future You is optional. The
        training and nutrition features work without uploading a selfie.
      </p>
      <p>
        Still have questions? Email{" "}
        <a href="mailto:support@newyouai.app">support@newyouai.app</a> or visit our{" "}
        <Link href="/support">Support page</Link>.
      </p>
    </>
  );
}
