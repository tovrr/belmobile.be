import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { sanitizeUrl } from "../utils/i18n-helpers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://belmobile.be';
const isStaging = baseUrl.includes('dev.') || baseUrl.includes('vercel.app') || process.env.VERCEL_ENV !== 'production';

export const metadata: Metadata = {
  title: "Belmobile.be - Buyback & Repair Service",
  description: "The best place to sell your old device or get it repaired in Brussels. Fast, reliable, and eco-friendly.",
  robots: isStaging ? { index: false, follow: false } : { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-icon.png',
      },
    ],
  },
  manifest: '/manifest.json',
  metadataBase: new URL(sanitizeUrl(process.env.NEXT_PUBLIC_BASE_URL)),
  alternates: {
    canonical: './',
    languages: {
      'fr-BE': '/fr',
      'nl-BE': '/nl',
      'en-BE': '/en',
      'tr-BE': '/tr',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_BE',
    url: 'https://belmobile.be',
    siteName: 'Belmobile',
    title: 'Belmobile.be - Rachat & Réparation',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@belmobile',
    creator: '@belmobile',
  },
};

export const viewport = {
  themeColor: '#2563eb',
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Script
          src="https://embed.sendcloud.sc/spp/1.0.0/api.min.js"
          strategy="lazyOnload"
        />
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-M3D46BYRSX'}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-M3D46BYRSX'}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
