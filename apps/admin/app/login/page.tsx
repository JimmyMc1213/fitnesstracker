export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">Staff sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Wire Supabase Auth + <code>ADMIN_ALLOWED_EMAILS</code> allowlist in a follow-up. Server
        routes use <code>SUPABASE_SERVICE_ROLE_KEY</code> only.
      </p>
    </div>
  );
}
