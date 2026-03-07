import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | PromessTrack",
    default: "PromessTrack — Suivi de colis import-export",
  },
  description:
    "Système de gestion et de suivi des colis pour entreprise d'import-export.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
