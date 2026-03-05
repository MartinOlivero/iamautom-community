import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/insforge/middleware";

/**
 * Next.js Middleware
 * Runs on every request. Handles:
 * 1. Supabase session refresh (keeps auth tokens alive)
 * 2. Auth protection — redirects unauthenticated users to /login
 * 3. Subscription gating — redirects users without active sub to /planes
 * 4. Admin protection — only admins can access /admin routes
 */
export async function middleware(request: NextRequest) {
    const { supabase, supabaseResponse } = await createClient(request);
    const { pathname } = request.nextUrl;

    // ── Always refresh the session ──────────────────────────
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // ── Public routes — no protection needed ────────────────
    const isPublicRoute =
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/callback" ||
        pathname === "/planes" ||
        pathname.startsWith("/api/");

    if (isPublicRoute) {
        // If logged in and going to /login, redirect to app
        if (user && pathname === "/login") {
            const url = request.nextUrl.clone();
            url.pathname = "/app/feed";
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    // ── Protected routes — require authentication ───────────
    const isProtectedRoute =
        pathname.startsWith("/app") || pathname.startsWith("/admin");

    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    // ── Subscription & role checks (only for /app and /admin) ─
    if (user && isProtectedRoute) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_status, plan_type, role")
            .eq("id", user.id)
            .single();

        if (profile) {
            // Admin route check
            if (pathname.startsWith("/admin") && profile.role !== "admin") {
                const url = request.nextUrl.clone();
                url.pathname = "/app/feed";
                return NextResponse.redirect(url);
            }

            // Subscription check (skip for admins)
            if (
                pathname.startsWith("/app") &&
                profile.role !== "admin" &&
                profile.subscription_status !== "active" &&
                profile.subscription_status !== "trialing"
            ) {
                const url = request.nextUrl.clone();
                url.pathname = "/planes";
                url.searchParams.set("reason", "inactive");
                return NextResponse.redirect(url);
            }

            // Inner Circle route check
            if (
                pathname.startsWith("/app/chat/inner-circle") &&
                profile.plan_type !== "inner_circle" &&
                profile.role !== "admin"
            ) {
                const url = request.nextUrl.clone();
                url.pathname = "/app/feed";
                url.searchParams.set("upgrade", "inner_circle");
                return NextResponse.redirect(url);
            }
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon)
         * - public folder files
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
