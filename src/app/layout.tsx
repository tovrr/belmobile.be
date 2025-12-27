import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://belmobile.be'),
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
      </body>
    </html>
  );
}
