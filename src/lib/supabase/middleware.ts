import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("<your-project>")) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );


  // Skip remote network auth during prefetch to make page hover and routing instantaneous
  const isPrefetch =
    request.headers.get("x-middleware-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("next-router-prefetch") === "1";

  if (isPrefetch) {
    return supabaseResponse;
  }

  // Fast check: inspect cookie existence before initiating expensive remote HTTPS roundtrips
  const cookies = request.cookies.getAll();
  const hasAuthCookie = cookies.some(
    (c) => (c.name.startsWith("sb-") && c.name.endsWith("-auth-token")) || c.name === "sb-access-token"
  );
  const hasDemoSession = request.cookies.get("demo-session")?.value === "true";

  // Protect dashboard routes — redirect to login if not authenticated
  const isProtected =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/onboarding") ||
    request.nextUrl.pathname.startsWith("/github") ||
    request.nextUrl.pathname.startsWith("/certificates") ||
    request.nextUrl.pathname.startsWith("/passport") ||
    request.nextUrl.pathname.startsWith("/roadmap") ||
    request.nextUrl.pathname.startsWith("/settings");

  // Instant redirect for unauthenticated requests with no cookies — 0ms latency
  if (!hasAuthCookie && !hasDemoSession) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // If demo session is active, allow protected dashboard routes immediately
  if (hasDemoSession) {
    if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/tracker";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Refresh user session only when auth cookies are present
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Handle Onboarding Flow (Temporarily disabled for UI testing)
  if (user) {
    // const onboardingCompleted = user.user_metadata?.onboarding_completed;
    
    // if (!onboardingCompleted && request.nextUrl.pathname !== "/onboarding") {
    //   // Force user to onboarding if not completed
    //   const url = request.nextUrl.clone();
    //   url.pathname = "/onboarding";
    //   return NextResponse.redirect(url);
    // } else if (onboardingCompleted && request.nextUrl.pathname === "/onboarding") {
    //   // Prevent user from going back to onboarding if already done
    //   const url = request.nextUrl.clone();
    //   url.pathname = "/dashboard";
    //   return NextResponse.redirect(url);
    // }
  }

  // Redirect authenticated users away from root and login straight to dashboard tracker
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/tracker";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
