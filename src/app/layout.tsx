import type { Metadata } from "next";
import { Syne, DM_Sans, Montserrat } from "next/font/google";
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

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
}

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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
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
    <html lang="fr" className={`${syne.variable} ${dmSans.variable} ${montserrat.variable}`}>
      <body className="antialiased" style={{ overflowX: 'hidden', maxWidth: '100vw' }}>{children}</body>
    </html>
  );
}
