import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s | La Promesse",
    default: "La Promesse — Canada-Afrique",
  },
  description: "Envoyez vos colis du Canada vers l'Afrique en toute sécurité. Suivi en temps réel, collecte à domicile, livraison porte-à-porte.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "La Promesse",
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">{children}</body>
    </html>
  );
}
