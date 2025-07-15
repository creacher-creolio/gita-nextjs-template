import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { localeUtils } from "@/i18n/locales";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: DO NOT REMOVE auth.getUser()

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Extract locale from pathname for locale-aware redirects
    const pathSegments = request.nextUrl.pathname.split("/");
    const hasLocale = pathSegments[1] && localeUtils.isSupported(pathSegments[1]);
    const locale = hasLocale ? pathSegments[1] : localeUtils.getDefault();
    const pathWithoutLocale = hasLocale ? "/" + pathSegments.slice(2).join("/") : request.nextUrl.pathname;

    // Clean up the path (remove trailing slashes, handle empty paths)
    const cleanPath = pathWithoutLocale === "/" || pathWithoutLocale === "" ? "/" : pathWithoutLocale;

    // Only redirect to login if:
    // 1. User is not authenticated
    // 2. Path is protected (not root, not auth pages)
    // 3. Not already on an auth page
    const isRootPath = cleanPath === "/";
    const isAuthPath = cleanPath.startsWith("/auth") || cleanPath.startsWith("/login");
    const isProtectedPath = !isRootPath && !isAuthPath;

    if (!user && isProtectedPath) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}/auth/login`;
        return NextResponse.redirect(url);
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
