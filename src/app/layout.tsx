import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IamAutom Community — Aprende, Automatiza, Crece",
  description:
    "Comunidad premium de IA y automatización. Cursos, eventos en vivo, networking y mentoría exclusiva liderada por Tincho Olivero. Eleva tu negocio al siguiente nivel.",
  keywords: ["IA", "Automatización", "Make", "Zapier", "ChatGPT", "Comunidad", "Emprendimiento", "Skool", "Tincho Olivero"],
  authors: [{ name: "Tincho Olivero", url: "https://iamautom-community.vercel.app/" }],
  creator: "Tincho Olivero",
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://iamautom-community.vercel.app"),
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://iamautom-community.vercel.app/",
    title: "IamAutom Community | Premium AI & Automation",
    description: "Únete a la elite de automatizadores. Cursos, plantillas, y networking en una única plataforma.",
    siteName: "IamAutom",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "IamAutom Community Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IamAutom Community | Premium AI & Automation",
    description: "Únete a la elite de automatizadores. Aprende a escalar tu negocio usando IA.",
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
    <html lang="es" suppressHydrationWarning>
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
