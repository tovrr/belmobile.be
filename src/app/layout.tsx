import { SpeedInsights } from "@vercel/speed-insights/next";
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

export const metadata: Metadata = {
  title: "Belmobile.be - Buyback & Repair Service",
  description: "The best place to sell your old device or get it repaired in Brussels. Fast, reliable, and eco-friendly.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
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
      </body>
    </html>
  );
}
