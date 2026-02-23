"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { triggerXPAward } from "@/lib/xpClient";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
    user: User | null;
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

/**
 * AuthProvider wraps the app and provides user session + profile
 * data to all client components via React Context.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /** Fetch the user's profile from the profiles table */
    async function fetchProfile(userId: string) {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
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
        }
    }

    /** Refresh profile data (call after updates) */
    async function refreshProfile() {
        if (user) {
            await fetchProfile(user.id);
        }
    }

    /** Sign out and clear state */
    async function signOut() {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    }

    useEffect(() => {
        console.log("[AuthProvider] Starting init...");
        const supabase = createClient();

        console.log("[AuthProvider] Calling getUser()...");
        supabase.auth.getUser().then(({ data: { user: currentUser }, error }) => {
            console.log("[AuthProvider] getUser() complete:", { currentUser, error });
            if (currentUser) {
                setUser(currentUser);
                fetchProfile(currentUser.id).finally(() => {
                    setIsLoading(false);
                    triggerXPAward("ping");
                });
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth state changes (login, logout, token refresh)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("[AuthProvider] Auth event:", event, session?.user?.id);
            if (session?.user) {
                setUser(session.user);
                // Fire and forget fetchProfile, DO NOT AWAIT IT!
                // Awaiting here causes a deadlock with the GoTrue client's internal session lock.
                fetchProfile(session.user.id).finally(() => {
                    setIsLoading(false);
                    triggerXPAward("ping");
                });
            } else {
                setUser(null);
                setProfile(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, profile, isLoading, signOut, refreshProfile }}
        >
            {children}
        </AuthContext.Provider>
    );
}
