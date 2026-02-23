"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "midnight" | "sunset";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
    children,
    defaultTheme = "light"
}: {
    children: React.ReactNode;
    defaultTheme?: Theme;
}) {
    // Attempt to read from localStorage first, fallback to defaultTheme (from DB)
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("iamautom_theme") as Theme;
            if (saved) return saved;
        }
        return defaultTheme;
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const root = window.document.documentElement;
            // Remove previous theme classes
            root.classList.remove("theme-light", "theme-dark", "theme-midnight", "theme-sunset");

            // Apply new theme (light is the default, so we don't strictly need a class, but we can add it for clarity)
            if (theme !== "light") {
                root.classList.add(`theme-${theme}`);
            }

            localStorage.setItem("iamautom_theme", theme);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
