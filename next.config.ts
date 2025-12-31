import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    // Other experimental features can go here
  },
  async redirects() {
    return [
      // --- CRITICAL FIXES ---
      // 1. Products: Redirect deep links to main catalog (Prevent Buyback Wizard hijack)
      {
        source: '/:lang/products/:slug+',
        destination: '/:lang/products',
        permanent: true,
      },
      // 2. Legacy Shopify Products (Unlocalized)
      {
        source: '/products/:slug*',
        destination: '/fr/products',
        permanent: true, // Legacy URLs should permanently move
      },
      // 3. Collections
      {
        source: '/collections/:slug*',
        destination: '/fr/products',
        permanent: true,
      },
      {
        source: '/:lang/collections/:slug*',
        destination: '/:lang/products',
        permanent: true,
      },

      // --- BLOG ---
      // Fix specific broken blog link reported by user
      {
        source: '/:lang/blog/reparation-face-id-iphone-prix-bruxelles',
        destination: '/:lang/blog/face-id-repair-iphone-xs-11-12-13-pro-max-brussels',
        permanent: true,
      },
      {
        source: '/blogs/blog-high-tech/:slug*',
        destination: '/fr/blog/:slug*',
        permanent: true,
      },

      // --- B2B & WHOLESALE ---
      {
        source: '/pages/grossiste-:slug',
        destination: '/fr/business', // High priority B2B
        permanent: true,
      },
      {
        source: '/:lang/pages/grossiste-:slug', // Language-aware
        destination: '/:lang/business',
        permanent: true,
      },
      {
        source: '/nl/pages/groothandel-:slug', // catch 'groothandel-gsm-...'
        destination: '/nl/business',
        permanent: true,
      },
      {
        source: '/pages/lot-de-:slug',
        destination: '/fr/business',
        permanent: true,
      },
      {
        source: '/:lang/pages/lot-de-:slug',
        destination: '/:lang/business',
        permanent: true,
      },

      // ... (Legacy Repair Mapping was inserted here) ...

      // --- BUYBACK / RESALE (Revendre/Rachat) ---
      {
        source: '/pages/revendre-iphone-:slug',
        destination: '/fr/rachat/apple/iphone-:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/revendre-iphone-:slug',
        destination: '/:lang/rachat/apple/iphone-:slug',
        permanent: true,
      },
      {
        source: '/pages/revendre-samsung-:slug',
        destination: '/fr/rachat/samsung/:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/revendre-samsung-:slug',
        destination: '/:lang/rachat/samsung/:slug',
        permanent: true,
      },
      {
        source: '/pages/revendre-:slug',
        destination: '/fr/rachat',
        permanent: true,
      },
      {
        source: '/:lang/pages/revendre-:slug',
        destination: '/:lang/rachat',
        permanent: true,
      },
      {
        source: '/pages/rachat-:slug',
        destination: '/fr/rachat',
        permanent: true,
      },
      {
        source: '/:lang/pages/rachat-:slug',
        destination: '/:lang/rachat',
        permanent: true,
      },
      {
        source: '/pages/recyclage-:slug',
        destination: '/fr/rachat',
        permanent: true,
      },
      {
        source: '/:lang/pages/recyclage-:slug',
        destination: '/:lang/rachat',
        permanent: true,
      },

      // --- MASS LEGACY MAPPING (High Traffic) ---

      // 1. General Lead Gen / City Landing Pages
      {
        source: '/pages/rachat-gsm-bruxelles',
        destination: '/fr/rachat',
        permanent: true,
      },
      {
        source: '/pages/rachat-iphone-bruxelles',
        destination: '/fr/rachat/apple/iphone',
        permanent: true,
      },
      {
        source: '/pages/rachat-reprise-revendre-cash-appareils-high-tech-bruxelles',
        destination: '/fr/rachat',
        permanent: true,
      },
      {
        source: '/pages/reparation-smartphone-bruxelles',
        destination: '/fr/reparation',
        permanent: true,
      },
      {
        source: '/pages/magasin-informatique-bruxelles',
        destination: '/fr/stores',
        permanent: true,
      },
      {
        source: '/pages/reparation-ordinateur-bruxelles',
        destination: '/fr/reparation', // Or laptop specific if available
        permanent: true,
      },
      {
        source: '/pages/reparation-ecran-iphone-bruxelles',
        destination: '/fr/reparation/apple/iphone',
        permanent: true,
      },

      // 2. Samsung "Galaxy" Prefix (Missing 'samsung' in URL)
      {
        source: '/pages/reparation-galaxy-:slug',
        destination: '/fr/reparation/samsung/galaxy-:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-galaxy-:slug',
        destination: '/:lang/reparation/samsung/galaxy-:slug',
        permanent: true,
      },

      // 3. Consoles (Xbox, etc)
      {
        source: '/pages/reparation-xbox-:slug',
        destination: '/fr/reparation/microsoft/xbox-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-console',
        destination: '/fr/reparation',
        permanent: true,
      },
      {
        source: '/nl/pages/reparatie-gameconsole',
        destination: '/nl/reparation',
        permanent: true,
      },

      // 4. Dutch Specific Top Hits
      {
        source: '/nl/pages/iphone-11-tarieven-reparatie',
        destination: '/nl/reparation/apple/iphone-11',
        permanent: true,
      },
      {
        source: '/nl/pages/samsung-galaxy-s22-ultra-reparatie',
        destination: '/nl/reparation/samsung/galaxy-s22-ultra',
        permanent: true,
      },
      {
        source: '/nl/pages/iphone-12-tarieven-reparatie',
        destination: '/nl/reparation/apple/iphone-12',
        permanent: true,
      },
      {
        source: '/nl/pages/iphone-13-reparatie-prijs',
        destination: '/nl/reparation/apple/iphone-13',
        permanent: true,
      },
      {
        source: '/nl/pages/samsung-galaxy-a14-reparatie',
        destination: '/nl/reparation/samsung/galaxy-a14',
        permanent: true,
      },


      // 5. Short Slugs (Brand Inference)
      // Xiaomi Sub-brands
      {
        source: '/pages/reparation-redmi-:slug',
        destination: '/fr/reparation/xiaomi/redmi-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-mi-:slug',
        destination: '/fr/reparation/xiaomi/mi-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-poco-:slug',
        destination: '/fr/reparation/xiaomi/poco-:slug',
        permanent: true,
      },
      // Huawei Series
      {
        source: '/pages/reparation-p:series-:slug', // Simplified regex
        destination: '/fr/reparation/huawei/p:series-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-mate-:slug',
        destination: '/fr/reparation/huawei/mate-:slug',
        permanent: true,
      },

      // 6. Buyback Brand Specifics
      {
        source: '/pages/revendre-galaxy-:slug',
        destination: '/fr/rachat/samsung/galaxy-:slug',
        permanent: true,
      },
      {
        source: '/pages/revendre-huawei-:slug',
        destination: '/fr/rachat/huawei/:slug',
        permanent: true,
      },


      // --- REPAIR (Explicit Brand Mappings - Keep for safety) ---
      // 0. Tarifs Support (Legacy)
      {
        source: '/pages/tarifs-reparation-iphone-:slug',
        destination: '/fr/reparation/apple/iphone-:slug',
        permanent: true,
      },
      // 1. Apple Devices
      {
        source: '/pages/reparation-iphone-:slug',
        destination: '/fr/reparation/apple/iphone-:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-iphone-:slug',
        destination: '/:lang/reparation/apple/iphone-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-ipad-:slug',
        destination: '/fr/reparation/apple/ipad-:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-ipad-:slug',
        destination: '/:lang/reparation/apple/ipad-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-apple-watch-:slug',
        destination: '/fr/reparation/apple/apple-watch-:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-apple-watch-:slug',
        destination: '/:lang/reparation/apple/apple-watch-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-macbook-:slug',
        destination: '/fr/reparation/apple/macbook-:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-macbook-:slug',
        destination: '/:lang/reparation/apple/macbook-:slug',
        permanent: true,
      },

      // 2. Android & Other Repairs
      {
        source: '/pages/reparation-samsung-:slug',
        destination: '/fr/reparation/samsung/:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-samsung-:slug',
        destination: '/:lang/reparation/samsung/:slug',
        permanent: true,
      },
      // Sony / PlayStation
      {
        source: '/pages/reparation-playstation-5',
        destination: '/fr/reparation/sony/playstation-5-disc',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-playstation-5',
        destination: '/:lang/reparation/sony/playstation-5-disc',
        permanent: true,
      },
      {
        source: '/pages/reparation-playstation-:slug',
        destination: '/fr/reparation/sony/playstation-:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-playstation-:slug',
        destination: '/:lang/reparation/sony/playstation-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-ps4-:slug', // Legacy short variant
        destination: '/fr/reparation/sony/playstation-4-:slug', // Guessing PS4 intent
        permanent: true,
      },
      // Nintendo
      {
        source: '/pages/reparation-3ds-2ds-xl-bruxelles',
        destination: '/fr/reparation/nintendo/new-3ds-xl',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-3ds-2ds-xl-bruxelles',
        destination: '/:lang/reparation/nintendo/new-3ds-xl',
        permanent: true,
      },
      {
        source: '/pages/reparation-nintendo-:slug',
        destination: '/fr/reparation/nintendo/:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-switch-:slug',
        destination: '/fr/reparation/nintendo/switch-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-huawei-:slug',
        destination: '/fr/reparation/huawei/:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-huawei-:slug',
        destination: '/:lang/reparation/huawei/:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-xiaomi-:slug',
        destination: '/fr/reparation/xiaomi/:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-xiaomi-:slug',
        destination: '/:lang/reparation/xiaomi/:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-oppo-:slug',
        destination: '/fr/reparation/oppo/:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-oppo-:slug',
        destination: '/:lang/reparation/oppo/:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-oneplus-:slug',
        destination: '/fr/reparation/oneplus/:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-oneplus-:slug',
        destination: '/:lang/reparation/oneplus/:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-google-pixel-:slug',
        destination: '/fr/reparation/google/pixel-:slug',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-google-pixel-:slug',
        destination: '/:lang/reparation/google/pixel-:slug',
        permanent: true,
      },


      // --- LEGACY REPAIR PAGES (Smart Regex Mapping) ---
      // Map specific intents to the repair page
      {
        source: '/pages/reparation-ecran-:slug',
        destination: '/fr/reparation',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-ecran-:slug', // Language-aware
        destination: '/:lang/reparation',
        permanent: true,
      },
      {
        source: '/pages/remplacement-batterie-:slug',
        destination: '/fr/reparation',
        permanent: true,
      },
      {
        source: '/:lang/pages/remplacement-batterie-:slug',
        destination: '/:lang/reparation',
        permanent: true,
      },
      {
        source: '/pages/desoxydation-:slug',
        destination: '/fr/reparation',
        permanent: true,
      },
      {
        source: '/:lang/pages/desoxydation-:slug',
        destination: '/:lang/reparation',
        permanent: true,
      },
      {
        source: '/pages/microsoudure-:slug',
        destination: '/fr/reparation',
        permanent: true,
      },
      {
        source: '/:lang/pages/microsoudure-:slug',
        destination: '/:lang/reparation',
        permanent: true,
      },
      {
        source: '/pages/deblocage-:slug',
        destination: '/fr/reparation',
        permanent: true,
      },
      {
        source: '/:lang/pages/deblocage-:slug',
        destination: '/:lang/reparation',
        permanent: true,
      },
      {
        source: '/pages/recuperation-donnees-:slug',
        destination: '/fr/reparation',
        permanent: true,
      },
      {
        source: '/:lang/pages/recuperation-donnees-:slug',
        destination: '/:lang/reparation',
        permanent: true,
      },
      {
        source: '/pages/reparation-connecteur-:slug',
        destination: '/fr/reparation',
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-connecteur-:slug',
        destination: '/:lang/reparation',
        permanent: true,
      },
      // Catch-all for other /pages/reparation-*
      {
        source: '/pages/reparation-:slug',
        destination: '/fr/reparation', // Fallback
        permanent: true,
      },
      {
        source: '/:lang/pages/reparation-:slug',
        destination: '/:lang/reparation',
        permanent: true,
      },





      // --- STATIC PAGES ---
      {
        source: '/pages/contact-us',
        destination: '/fr/contact',
        permanent: true,
      },
      {
        source: '/pages/about-us',
        destination: '/fr/stores',
        permanent: true,
      },
      {
        source: '/policies/:slug*',
        destination: '/fr/legal',
        permanent: true,
      },

      // --- UNMAPPED FALLBACK ---
      // Blogs (Dutch)
      {
        source: '/nl/blogs/hightech-blog/:slug*',
        destination: '/nl/blog/:slug*',
        permanent: true,
      },
      {
        source: '/reparation/:path*',
        destination: '/fr/reparation/:path*',
        permanent: true,
      },
      {
        source: '/rachat/:path*',
        destination: '/fr/rachat/:path*',
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
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Add custom headers to allow PDF downloads in iframes if needed
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      // --- LOCALIZED SERVICE SLUGS ---
      // Microsoldering
      {
        source: '/fr/services/microsoudure',
        destination: '/fr/services/microsoldering',
      },
      {
        source: '/nl/diensten/microsolderen',
        destination: '/nl/services/microsoldering',
      },
      {
        source: '/nl/services/microsolderen',
        destination: '/nl/services/microsoldering',
      },
      // Data Recovery
      {
        source: '/fr/services/recuperation-donnees',
        destination: '/fr/services/data-recovery',
      },
      {
        source: '/fr/services/recuperation-de-donnees',
        destination: '/fr/services/data-recovery',
      },
      {
        source: '/nl/diensten/data-recovery',
        destination: '/nl/services/data-recovery',
      },
      {
        source: '/nl/services/data-recovery',
        destination: '/nl/services/data-recovery',
      },

      // --- SUSTAINABILITY SLUGS ---
      {
        source: '/fr/a-propos/durabilite',
        destination: '/fr/about/sustainability',
      },
      {
        source: '/fr/about/durabilite',
        destination: '/fr/about/sustainability',
      },
      {
        source: '/nl/over-ons/duurzaamheid',
        destination: '/nl/about/sustainability',
      },
      {
        source: '/nl/about/duurzaamheid',
        destination: '/nl/about/sustainability',
      },
      // About Page
      {
        source: '/fr/a-propos',
        destination: '/fr/about',
      },
      {
        source: '/nl/over-ons',
        destination: '/nl/about',
      },

      // Students
      {
        source: '/fr/etudiants',
        destination: '/fr/students',
      },
      {
        source: '/nl/studenten',
        destination: '/nl/students',
      },

      // Express Courier
      {
        source: '/fr/coursier-express',
        destination: '/fr/express-courier',
      },
      {
        source: '/nl/express-koerier',
        destination: '/nl/express-courier',
      },

      // Careers
      {
        source: '/fr/carrieres',
        destination: '/fr/careers',
      },
      {
        source: '/nl/vacatures',
        destination: '/nl/careers',
      },

      {
        source: '/nl/diensten',
        destination: '/nl/services',
      },

      // --- LEGAL & SUPPORT ---
      // Warranty
      {
        source: '/fr/garantie',
        destination: '/fr/warranty',
      },
      {
        source: '/nl/garantie',
        destination: '/nl/warranty',
      },
      // Privacy
      {
        source: '/fr/vie-privee',
        destination: '/fr/privacy',
      },
      {
        source: '/nl/privacy', // Already Dutch, but good to be explicit or if we want 'privacybeleid'
        destination: '/nl/privacy',
      },
      // Terms
      {
        source: '/fr/conditions-generales',
        destination: '/fr/terms',
      },
      {
        source: '/nl/algemene-voorwaarden',
        destination: '/nl/terms',
      },
      // Cookies
      {
        source: '/fr/cookies', // Same in FR/EN often, but 'politique-cookies' maybe? Keeping simple for now unless requested
        destination: '/fr/cookies',
      },
      // Track Order
      {
        source: '/fr/suivi-commande',
        destination: '/fr/track-order',
      },
      {
        source: '/nl/bestelling-volgen',
        destination: '/nl/track-order',
      },

      // Business
      {
        source: '/nl/zakelijk',
        destination: '/nl/business',
      },

      // Support Hub
      {
        source: '/fr/support', // Common term in FR tech, or 'aide'
        destination: '/fr/support',
      },
      {
        source: '/nl/ondersteuning',
        destination: '/nl/support',
      },
      {
        source: '/nl/support',
        destination: '/nl/support',
      },

      // Franchise
      {
        source: '/fr/devenir-partenaire',
        destination: '/fr/franchise',
      },
      {
        source: '/nl/word-partner',
        destination: '/nl/franchise',
      },

      // Stores
      {
        source: '/fr/magasins',
        destination: '/fr/stores',
      },
      {
        source: '/nl/winkels',
        destination: '/nl/stores',
      },
      // Deep links for stores (e.g. /fr/magasins/bruxelles)
      {
        source: '/fr/magasins/:slug*',
        destination: '/fr/stores/:slug*',
      },
      {
        source: '/nl/winkels/:slug*',
        destination: '/nl/stores/:slug*',
      },

      {
        source: '/nl/winkels/:slug*',
        destination: '/nl/stores/:slug*',
      },

      // Products
      {
        source: '/fr/produits',
        destination: '/fr/products',
      },
      {
        source: '/nl/producten',
        destination: '/nl/products',
      },
      // Deep links for products
      {
        source: '/fr/produits/:slug*',
        destination: '/fr/products/:slug*',
      },
      {
        source: '/nl/producten/:slug*',
        destination: '/nl/products/:slug*',
      },

      // Franchise - common word, but ensuring consistency
      {
        source: '/nl/franchising', // Optional alias
        destination: '/nl/franchise',
      },
    ];
  },
};


// Check if Sentry Auth Token is present to avoid build warnings
const isSentryBuildEnabled = !!process.env.SENTRY_AUTH_TOKEN;

export default isSentryBuildEnabled ? withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "tovrr",
  project: "belmobile-next-platform",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  sourcemaps: {
    disable: true,
  },

  // Webpack-based configuration (replaces deprecated options)
  webpack: {
    treeshake: {
      removeDebugLogging: true, // Replaces disableLogger
    },
    automaticVercelMonitors: true, // Moved from root level
  },
}) : nextConfig;
