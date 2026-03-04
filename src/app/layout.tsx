import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

/* ── Fonts Urbandeam ── */
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Urbandeam — Templates Excel, PDF & Notion pour le développement personnel",
  description:
    "Découvrez nos templates digitaux premium (Excel, PDF, Notion) pour booster votre productivité et atteindre vos objectifs personnels.",
  keywords: [
    "template excel développement personnel",
    "notion template productivité",
    "planner pdf",
    "tracker habitudes excel",
    "template gestion finances",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Urbandeam",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
