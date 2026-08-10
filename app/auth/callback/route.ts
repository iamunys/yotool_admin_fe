import { NextResponse, type NextRequest } from "next/server";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/users";

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const accessToken = data.session?.access_token;
        if (accessToken && (await isForbidden(accessToken))) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?forbidden=1`);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // Redirect below with a user-safe error state.
    }
  }

  return NextResponse.redirect(`${origin}/login?next=${encodeURIComponent(next)}&authError=1`);
}

async function isForbidden(accessToken: string): Promise<boolean> {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) return false;
  try {
    const response = await fetch(`${apiBaseUrl}/admin/users?limit=1`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.status === 403;
  } catch {
    return false;
  }
}
