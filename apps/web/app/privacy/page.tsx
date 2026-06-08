export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-4 text-muted leading-relaxed">
        New You AI respects your privacy. This page will be updated with full legal copy before
        public launch. For Future You, body photos are processed server-side via OpenAI; images
        are not stored in client sync payloads long-term.
      </p>
      <p className="mt-4 text-sm text-muted">
        Questions: support@newyouai.app
      </p>
    </article>
  );
}
