import { SignIn } from "@clerk/nextjs";

function toPathOnly(url) {
  if (!url || url.startsWith("/")) return url || "/dashboard";
  try {
    const u = new URL(url, "http://localhost");
    return u.pathname || "/dashboard";
  } catch {
    return "/dashboard";
  }
}

export default async function SignInPage({ searchParams }) {
  const params =
    typeof searchParams?.then === "function"
      ? await searchParams
      : (searchParams ?? {});
  const redirectUrl = toPathOnly(params.redirect_url) || "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-800 to-indigo-500">
      <div className="mx-auto w-full max-w-lg">
        <div className="mx-auto max-w-md space-y-3">
          <SignIn
            forceRedirectUrl={redirectUrl}
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
