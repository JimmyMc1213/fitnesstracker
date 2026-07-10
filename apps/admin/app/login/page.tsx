import { signInAction } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Enter your email and password.",
  forbidden: "This account is not authorized for admin access.",
  invalid: "Invalid email or password.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? ERROR_MESSAGES[error] ?? "Could not sign in." : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">Staff sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Sign in with an allowlisted staff account (<code>ADMIN_ALLOWED_EMAILS</code>).
      </p>

      {message ? (
        <p className="mt-4 rounded-md border border-border px-3 py-2 text-sm text-foreground" role="alert">
          {message}
        </p>
      ) : null}

      <form action={signInAction} className="mt-6 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="rounded-md border border-border bg-transparent px-3 py-2 text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="rounded-md border border-border bg-transparent px-3 py-2 text-foreground"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:text-foreground"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
