import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy Pricing Redirects
      {
        source: '/pages/tarifs-reparation-iphone-11',
        destination: '/fr/reparation/apple/iphone-11',
        permanent: true,
      },
      {
        source: '/pages/reparation-iphone-x',
        destination: '/fr/reparation/apple/iphone-x',
        permanent: true,
      },
      {
        source: '/pages/reparation-playstation-5',
        destination: '/fr/reparation/game-console/sony/playstation-5',
        permanent: true,
      },

      // --- STATIC PAGES ---
      {
        source: '/pages/contactez-nous',
        destination: '/fr/contact',
        permanent: true,
      },
      {
        source: '/pages/jobs',
        destination: '/fr/jobs',
        permanent: true,
      },
      {
        source: '/pages/avis-des-clients',
        destination: '/fr', // Redirect to home or specific reviews section if available
        permanent: true,
      },
      {
        source: '/pages/entreprises',
        destination: '/fr/business',
        permanent: true,
      },

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
      // Exact matches for base paths without slug
      {
        source: '/pages/recyclage-iphone',
        destination: '/fr/rachat/apple', // Broad redirect to Apple buyback
        permanent: true,
      },
      {
        source: '/nl/pages/recyclage-iphone',
        destination: '/nl/inkoop/apple',
        permanent: true,
      },

      // --- UNMAPPED / SPECIFIC PAGES ---
      // Dutch Mappings
      {
        source: '/nl/pages/inkoop-ipad-brussel',
        destination: '/nl/inkoop/apple/ipad',
        permanent: true,
      },
      {
        source: '/nl/pages/rachat-macbook-bruxelles',
        destination: '/nl/inkoop/apple/macbook',
        permanent: true,
      },
      {
        source: '/nl/pages/verkopen',
        destination: '/nl/inkoop',
        permanent: true,
      },
      {
        source: '/nl/pages/winkel-informatica-brussel',
        destination: '/nl/contact',
        permanent: true,
      },
      {
        source: '/nl/pages/avis-des-clients',
        destination: '/nl',
        permanent: true,
      },
      {
        source: '/nl/pages/jobs',
        destination: '/nl/jobs',
        permanent: true,
      },
      // Service Specifics
      {
        source: '/pages/desoxydation-smartphone-bruxelles',
        destination: '/fr/reparation', // General repair
        permanent: true,
      },
      {
        source: '/pages/microsolderen-moederbord-iphone', // Hypothetical based on patterns
        destination: '/fr/reparation',
        permanent: true,
      },
      {
        source: '/nl/pages/iphone-moederbord-microsolderen-brussel',
        destination: '/nl/reparatie',
        permanent: true,
      },
      {
        source: '/pages/reparations-pc-portable-laptop',
        destination: '/fr/reparation/computer',
        permanent: true,
      },
      {
        source: '/pages/activation-sim',
        destination: '/fr/contact', // Service likely in-store
        permanent: true,
      },
      {
        source: '/pages/ups-access-point-belmobile-be',
        destination: '/fr/contact',
        permanent: true,
      },
      {
        source: '/nl/pages/ups-access-point-belmobile-be',
        destination: '/nl/contact',
        permanent: true,
      },
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
