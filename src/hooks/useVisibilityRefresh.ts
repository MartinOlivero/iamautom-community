"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/insforge/client";

const TAB_RESUMED_EVENT = "insforge:tab-resumed";

/**
 * Coordinator hook: detects when the user returns to the tab after inactivity,
 * validates the session, reconnects realtime, calls the refresh callback,
 * and emits a custom event so subscriber hooks can re-fetch data
 * AFTER the token has been refreshed (eliminating the race condition).
 *
 * Only use this in the root protected layout.
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

                // Validate session — triggers token refresh if needed.
                await insforge.auth.getCurrentSession();

                // Reconnect realtime if disconnected
                if (insforge.realtime && !insforge.realtime.isConnected) {
                    insforge.realtime.connect().catch(() => {});
                }

                // Refresh the layout's own data (e.g. profile)
                onRefresh();

                // Notify all subscriber hooks that the session is valid
                // and they can safely re-fetch their data.
                window.dispatchEvent(new CustomEvent(TAB_RESUMED_EVENT));
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

/**
 * Subscriber hook: listens for the custom "tab-resumed" event emitted by
 * useVisibilityRefresh after a successful session refresh.
 * Pages use this to re-fetch their data without triggering their own
 * session validation (which caused the race condition).
 */
export function useRefreshOnTabReturn(callback: () => void) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const stableHandler = useCallback(() => {
        callbackRef.current();
    }, []);

    useEffect(() => {
        window.addEventListener(TAB_RESUMED_EVENT, stableHandler);
        return () => {
            window.removeEventListener(TAB_RESUMED_EVENT, stableHandler);
        };
    }, [stableHandler]);
}
