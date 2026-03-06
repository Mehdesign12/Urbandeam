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

const BASE_URL = 'https://www.urbandeam.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Urbandeam — Templates Excel, PDF & Notion',
    template: '%s | Urbandeam',
  },
  description:
    "Templates digitaux premium (Excel, PDF, Notion) pour booster votre productivité et atteindre vos objectifs personnels.",
  keywords: [
    "template excel développement personnel",
    "notion template productivité",
    "planner pdf",
    "tracker habitudes excel",
    "template gestion finances",
    "digital templates",
    "productivity templates",
    "excel templates",
    "notion templates",
  ],
  authors: [{ name: 'Urbandeam', url: BASE_URL }],
  creator: 'Urbandeam',
  publisher: 'Urbandeam',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
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
    alternateLocale: ["en_US", "en_GB"],
    siteName: "Urbandeam",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Urbandeam — Templates Excel, PDF & Notion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@urbandeam',
    creator: '@urbandeam',
    images: [`${BASE_URL}/og-image.png`],
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'fr': `${BASE_URL}/fr`,
      'en': `${BASE_URL}/en`,
      'x-default': BASE_URL,
    },
  },
};

/* ── JSON-LD global : Organization + WebSite ── */
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Urbandeam',
  url: BASE_URL,
  logo: `${BASE_URL}/web-app-manifest-512x512.png`,
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@urbandeam.com',
    contactType: 'customer service',
    availableLanguage: ['French', 'English'],
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Urbandeam',
  url: BASE_URL,
  description: 'Templates digitaux premium (Excel, PDF, Notion) pour booster votre productivité.',
  inLanguage: ['fr', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/fr/products?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${syne.variable} ${dmSans.variable} ${montserrat.variable}`}>
      <head>
        {/* ── Favicons ── */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0A0A0A" />

        {/* ── hreflang global (x-default + fr + en) ── */}
        <link rel="alternate" hrefLang="x-default" href={BASE_URL} />
        <link rel="alternate" hrefLang="fr" href={`${BASE_URL}/fr`} />
        <link rel="alternate" hrefLang="en" href={`${BASE_URL}/en`} />

        {/* ── JSON-LD : Organization ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* ── JSON-LD : WebSite ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="antialiased" style={{ overflowX: 'hidden', maxWidth: '100vw' }}>{children}</body>
    </html>
  );
}
