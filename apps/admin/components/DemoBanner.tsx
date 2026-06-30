"use client";

export function ConfigBanner({ show, message }: { show: boolean; message?: string }) {
  if (!show) return null;
  return (
    <div className="demobar">
      <i className="ph ph-info" />
      {message ??
        "Live data unavailable — add SUPABASE_SERVICE_ROLE_KEY to the monorepo root .env (see apps/admin/.env.example)."}
    </div>
  );
}

/** @deprecated use ConfigBanner */
export const DemoBanner = ConfigBanner;
