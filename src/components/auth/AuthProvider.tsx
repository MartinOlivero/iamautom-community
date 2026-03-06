"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/insforge/client";
import { InsforgeBrowserProvider, useUser, useAuth as useInsforgeAuth } from "@insforge/nextjs";
import type { Profile } from "@/types";

interface AuthContextValue {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any | null;
    profile: Profile | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    profile: null,
    isLoading: true,
    signOut: async () => { },
    refreshProfile: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

function AuthDataWrapper({ children }: { children: React.ReactNode }) {
    const { user: insforgeUser, isLoaded } = useUser();
    const { signOut: insforgeSignOut } = useInsforgeAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const hadUserRef = useRef(false);
    const router = useRouter();
    const pathname = usePathname();

    async function fetchProfile(userId: string) {
        try {
            const insforge = createClient();
            const { data, error } = await insforge
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
                setProfile(null);
                return;
            }

            setProfile(data as Profile | null);
        } catch (err) {
            console.error("Exception fetching profile:", err);
            setProfile(null);
        } finally {
            setIsProfileLoading(false);
        }
    }

    async function refreshProfile() {
        if (insforgeUser) {
            await fetchProfile(insforgeUser.id);
        }
    }

    async function signOut() {
        hadUserRef.current = false;
        await insforgeSignOut();
        setProfile(null);
    }

    useEffect(() => {
        if (!isLoaded) return;

        if (insforgeUser) {
            hadUserRef.current = true;
            fetchProfile(insforgeUser.id);
        } else {
            setProfile(null);
            setIsProfileLoading(false);

            // Session expired: user was logged in but refresh token failed (401).
            // Redirect to login instead of showing a broken state.
            const isProtectedRoute = pathname.startsWith("/app") || pathname.startsWith("/admin");
            if (hadUserRef.current && isProtectedRoute) {
                hadUserRef.current = false;
                router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
            }
        }
    }, [insforgeUser, isLoaded, pathname, router]);

    return (
        <AuthContext.Provider
            value={{
                user: insforgeUser,
                profile,
                isLoading: !isLoaded || isProfileLoading,
                signOut,
                refreshProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const client = createClient();
    return (
        <InsforgeBrowserProvider client={client} afterSignInUrl="/app/feed">
            <AuthDataWrapper>{children}</AuthDataWrapper>
        </InsforgeBrowserProvider>
    );
}
