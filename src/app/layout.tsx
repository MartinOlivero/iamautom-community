import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IamAutom Community — Aprende, Automatiza, Crece",
  description:
    "Comunidad premium de IA y automatización. Cursos, eventos en vivo, networking y mentoría con Tincho Olivero.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "IamAutom Community",
    description:
      "Comunidad premium de IA y automatización. Aprende, automatiza, crece.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
