"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

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
            if (saved === "light" || saved === "dark") return saved;
        }
        return defaultTheme;
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const root = window.document.documentElement;
            // Remove previous theme classes
            root.classList.remove("theme-light", "theme-dark", "dark");

            // Apply new theme (light is the default, so we don't strictly need a class, but we can add it for clarity)
            if (theme === "dark") {
                root.classList.add("theme-dark");
                // Enable Tailwind's built-in dark variant for all non-light themes
                root.classList.add("dark");
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
