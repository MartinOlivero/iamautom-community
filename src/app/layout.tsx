import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "IamAutom Lab — Aprende, Automatiza, Crece",
    template: "%s | IamAutom Lab",
  },
  description:
    "Comunidad premium de IA y automatización. Cursos, eventos en vivo, networking y mentoría exclusiva liderada por Tincho Olivero. Eleva tu negocio al siguiente nivel.",
  keywords: ["IA", "Automatización", "Make", "Zapier", "ChatGPT", "Comunidad", "Emprendimiento", "IamAutom", "Tincho Olivero"],
  authors: [{ name: "Tincho Olivero" }],
  creator: "Tincho Olivero",
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": "#0f1219",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://iamautom-community.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    title: "IamAutom Lab — Aprende, Automatiza, Crece",
    description: "Comunidad premium de IA y automatización. Cursos, eventos en vivo, networking y mentoría exclusiva liderada por Tincho Olivero.",
    siteName: "IamAutom Lab",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "IamAutom Lab — Comunidad de IA y Automatización",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IamAutom Lab — Aprende, Automatiza, Crece",
    description: "Comunidad premium de IA y automatización. Cursos, eventos en vivo, networking y mentoría exclusiva.",
    creator: "@TinchoOlivero",
    images: ["/og-image.jpg"],
  },
};

import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="theme-dark dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("iamautom_theme");if(t==="light"){document.documentElement.classList.remove("theme-dark","dark")}else{document.documentElement.classList.add("theme-dark","dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <SiteSettingsProvider>{children}</SiteSettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
