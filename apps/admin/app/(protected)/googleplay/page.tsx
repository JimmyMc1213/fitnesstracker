export const dynamic = "force-dynamic";

export default function GooglePlayPage() {
  return (
    <div className="card">
      <div className="empty">
        <div className="iconchip neu">
          <i className="ph ph-google-play-logo" />
        </div>
        <h3>Google Play — stubbed for later</h3>
        <p>
          The Android Publisher API adapter (downloads, ratings, reviews via a service-account JSON) is scaffolded
          against the documented interface but intentionally inert for v1. App Store ships first; this slot goes live
          when you add credentials.
        </p>
        <span className="chip cgray" style={{ marginTop: 10 }}>
          <i className="ph ph-wrench" />
          Adapter scaffolded · not wired
        </span>
      </div>
    </div>
  );
}
