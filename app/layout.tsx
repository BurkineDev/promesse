import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="fr" className={inter.variable}>
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">{children}</body>
    </html>
  );
}
