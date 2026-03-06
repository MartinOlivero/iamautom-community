"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/insforge/client";

/**
 * Detects when the user returns to the tab after being away (tab switch or inactivity).
 * Validates the session is still alive, reconnects realtime, and calls the refresh callback.
 * If the session expired (401), the AuthProvider will detect user=null and redirect to login.
 */
export function useVisibilityRefresh(onRefresh: () => void) {
    const lastVisibleRef = useRef(Date.now());
    const isRefreshingRef = useRef(false);

    useEffect(() => {
        const STALE_THRESHOLD = 30_000; // 30 seconds

        async function handleVisibilityChange() {
            if (document.visibilityState !== "visible") {
                lastVisibleRef.current = Date.now();
                return;
            }

            const elapsed = Date.now() - lastVisibleRef.current;
            if (elapsed <= STALE_THRESHOLD || isRefreshingRef.current) return;

            isRefreshingRef.current = true;
            try {
                const insforge = createClient();

                // Validate session is still valid — this triggers a token refresh.
                // If the refresh token expired, getCurrentSession will fail
                // and InsforgeBrowserProvider will set user to null,
                // which AuthProvider detects and redirects to login.
                await insforge.auth.getCurrentSession();

                // If session is still valid, reconnect realtime if needed
                if (insforge.realtime && !insforge.realtime.isConnected) {
                    insforge.realtime.connect().catch(() => {});
                }

                onRefresh();
            } catch {
                // Session refresh failed — AuthProvider handles redirect
            } finally {
                isRefreshingRef.current = false;
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [onRefresh]);
}
