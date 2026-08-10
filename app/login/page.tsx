import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; forbidden?: string; authError?: string }>;
}) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/users";

  let isAuthConfigured = true;
  let user = null;
  try {
    const supabase = await createClient();
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    isAuthConfigured = false;
  }
  if (user) redirect(next);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="card w-full max-w-sm p-8">
        <BrandMark size={40} />
        <p className="mt-4 text-xs font-bold uppercase tracking-[.18em] text-brand-dark">Yotool Admin</p>
        <h1 className="mt-2 text-2xl font-black tracking-[-.02em] text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Sign in with your Yotool Google account to continue.</p>

        {params.forbidden === "1" && (
          <p role="alert" className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">
            You don&apos;t have admin access.
          </p>
        )}

        {params.authError === "1" && (
          <p role="alert" className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">
            Google sign-in was not completed. Please try again.
          </p>
        )}

        {isAuthConfigured ? (
          <GoogleSignInButton next={next} />
        ) : (
          <p role="alert" className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">
            Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
          </p>
        )}
      </div>
    </main>
  );
}
