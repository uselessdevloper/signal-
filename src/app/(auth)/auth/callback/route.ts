import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard/tracker";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const user = data.user;

      // Upsert profile in Supabase so previous data and state attach to this user
      try {
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Signal User";
        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null;

        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email,
            full_name: fullName,
            avatar_url: avatarUrl,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

        // Forward Google OAuth access token to FastAPI backend for live Gmail Pub/Sub sync
        const providerToken = (data.session as any)?.provider_token;
        if (providerToken && user.email) {
          try {
            await fetch("http://localhost:8000/api/gmail/token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                access_token: providerToken,
                email: user.email,
              }),
            });
          } catch (e) {
            // Non-blocking
          }
        }
      } catch (err) {
        console.warn("[Auth Callback] Profile sync warning:", err);
      }

      // Seamlessly redirect directly to real-time tracker dashboard
      const target = next.startsWith("/") ? `${origin}${next}` : `${origin}/dashboard/tracker`;
      return NextResponse.redirect(target);
    }
  }

  // Redirect to root with error if auth exchange fails
  return NextResponse.redirect(`${origin}/?error=auth_callback_failed`);
}
