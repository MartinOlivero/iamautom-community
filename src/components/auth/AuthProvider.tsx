"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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

    const supabase = createClient();

    /** Fetch the user's profile from the profiles table */
    async function fetchProfile(userId: string) {
        try {
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
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    }

    useEffect(() => {
        // Get initial session
        async function init() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session?.user) {
                setUser(session.user);
                await fetchProfile(session.user.id);
            }
            setIsLoading(false);
        }

        init();

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
            }
            setIsLoading(false);
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
