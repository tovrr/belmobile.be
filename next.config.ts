import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // --- COLLECTIONS ---
      {
        source: '/collections/:slug*',
        destination: '/fr/produits',
        permanent: true,
      },

      // --- BLOG ---
      {
        source: '/blogs/blog-high-tech/:slug*',
        destination: '/fr/blog/:slug*',
        permanent: true,
      },

      // --- REPAIR (Explicit & Regex) ---
      // 0. Tarifs Support (Legacy)
      {
        source: '/pages/tarifs-reparation-iphone-:slug',
        destination: '/fr/reparation/apple/iphone-:slug',
        permanent: true,
      },
      {
        source: '/pages/tarifs-reparation-ipad-:slug',
        destination: '/fr/reparation/apple/ipad-:slug',
        permanent: true,
      },

      // 1. Apple Devices
      {
        source: '/pages/reparation-iphone-:slug', // Removed * to fix build error
        destination: '/fr/reparation/apple/iphone-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-ipad-:slug',
        destination: '/fr/reparation/apple/ipad-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-apple-watch-:slug',
        destination: '/fr/reparation/apple/apple-watch-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-macbook-:slug',
        destination: '/fr/reparation/apple/macbook-:slug',
        permanent: true,
      },

      // 2. Android & Other Repairs
      {
        source: '/pages/reparation-samsung-:slug',
        destination: '/fr/reparation/samsung/:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-huawei-:slug',
        destination: '/fr/reparation/huawei/:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-xiaomi-:slug',
        destination: '/fr/reparation/xiaomi/:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-oppo-:slug',
        destination: '/fr/reparation/oppo/:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-oneplus-:slug',
        destination: '/fr/reparation/oneplus/:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-google-pixel-:slug',
        destination: '/fr/reparation/google/pixel-:slug',
        permanent: true,
      },

      // --- BUYBACK / RESALE (Revendre/Rachat) ---
      {
        source: '/pages/revendre-iphone-:slug',
        destination: '/fr/rachat/apple/iphone-:slug',
        permanent: true,
      },
      {
        source: '/pages/revendre-samsung-:slug',
        destination: '/fr/rachat/samsung/:slug',
        permanent: true,
      },
      {
        source: '/pages/revendre-:slug',
        destination: '/fr/rachat',
        permanent: true,
      },
      {
        source: '/pages/rachat-:slug',
        destination: '/fr/rachat',
        permanent: true,
      },
      {
        source: '/pages/recyclage-:slug',
        destination: '/fr/rachat',
        permanent: true,
      },
      // --- UNMAPPED / SPECIFIC PAGES ---
      // Blogs (Dutch)
      {
        source: '/nl/blogs/hightech-blog/:slug*',
        destination: '/nl/blog/:slug*',
        permanent: true,
      },

      // 4. Legacy Product Sales URLs
      {
        source: '/products/:slug',
        destination: '/fr/acheter/smartphone/:slug',
        permanent: true,
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
