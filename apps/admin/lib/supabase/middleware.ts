import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip middleware check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  // Get user ID from JWT claims (sub is the standard claim for user ID)
  let userId = user?.sub || user?.id;
  
  // Fallback: if we don't have userId from claims, try getUser()
  if (!userId) {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    userId = authUser?.id;
  }

  // Define protected admin routes
  const protectedRoutes = [
    "/",
    "/orders",
    "/applications", 
    "/riders",
    "/tickets",
    "/customers",
    "/settings",
    "/profile"
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (
    (request.nextUrl.pathname !== "/" && !user) ||
    (isProtectedRoute && !user)
  ) {
    // Redirect to login if accessing protected routes without authentication
    if (!request.nextUrl.pathname.startsWith("/login") && 
        !request.nextUrl.pathname.startsWith("/auth")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Verify admin access for protected routes
  if (isProtectedRoute && userId) {
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", userId)
      .single();

    // If we can't fetch profile or user is not admin, deny access
    if (profileError || userProfile?.user_type !== "admin") {
      // Sign out the user
      await supabase.auth.signOut();
      
      // Redirect to login with error message
      // Make sure to copy cookies from supabaseResponse to include signOut cookies
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "admin_required");
      const redirectResponse = NextResponse.redirect(url);
      // Copy cookies from supabaseResponse to include any signOut cookie updates
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
