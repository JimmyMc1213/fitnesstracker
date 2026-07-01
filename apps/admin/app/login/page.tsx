import { Suspense } from "react";

import { LoginForm } from "../../components/LoginForm";
import { isAuthConfigured, isDevAuthBypass, isSupabaseConfigured } from "../../lib/env";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Suspense fallback={null}>
        <LoginForm
          authConfigured={isAuthConfigured()}
          devBypass={isDevAuthBypass()}
          supabaseConfigured={isSupabaseConfigured()}
        />
      </Suspense>
    </div>
  );
}
