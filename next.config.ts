import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    // Other experimental features can go here
  },
  async redirects() {
    return [
      // --- CRITICAL FIXES ---
      {
        source: '/tr/services/microsoldering',
        destination: '/tr/hizmetler/mikro-lehimleme',
        permanent: true,
      },
      {
        source: '/tr/services/data-recovery',
        destination: '/tr/hizmetler/veri-kurtarma',
        permanent: true,
      },
      // Generic product redirects removed to let [lang]/products/[...slug] handle smart matching
      {
        source: '/products/:slug+',
        destination: '/fr/products/:slug+',
        permanent: true,
      },
      {
        source: '/collections/:slug*',
        destination: '/fr/collections/:slug*',
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
        destination: '/nl/zakelijk',
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

      // --- MASS LEGACY MAPPING (High Traffic) ---
      // Generic /revendre-, /rachat-, /recyclage- rules removed to let Smart Redirector handle specific model matching

      // --- TOP PRIORITY LEGACY FIXES ---
      {
        source: '/pages/reparation-playstation-5',
        destination: '/fr/reparation/sony/playstation-5-disc',
        permanent: true,
      },
      {
        source: '/pages/reparation-playstation-:slug',
        destination: '/fr/reparation/sony/playstation-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-xbox-:slug',
        destination: '/fr/reparation/microsoft/xbox-:slug',
        permanent: true,
      },
      {
        source: '/pages/reparation-nintendo-:slug',
        destination: '/fr/reparation/nintendo/:slug',
        permanent: true,
      },

      // 1. General Lead Gen / City Landing Pages
      {
        source: '/pages/rachat-iphone-bruxelles',
        destination: '/fr/rachat/apple',
        permanent: true,
      },
      {
        source: '/pages/rachat-ipad-bruxelles',
        destination: '/fr/rachat/tablette/apple',
        permanent: true,
      },
      {
        source: '/pages/rachat-tablette-samsung-bruxelles',
        destination: '/fr/rachat/tablette/samsung',
        permanent: true,
      },
      {
        source: '/pages/rachat-gsm-bruxelles',
        destination: '/fr/rachat/bruxelles',
        permanent: true,
      },
      {
        source: '/pages/rachat-reprise-revendre-cash-appareils-high-tech-bruxelles',
        destination: '/fr/rachat/bruxelles',
        permanent: true,
      },
      {
        source: '/pages/reparation-iphone-13-prix',
        destination: '/fr/reparation/apple/iphone-13',
        permanent: true,
      },
      {
        source: '/pages/reparation-smartphone-bruxelles',
        destination: '/fr/reparation/bruxelles',
        permanent: true,
      },
      {
        source: '/pages/reparation-iphone-bruxelles',
        destination: '/fr/reparation/apple/iphone-bruxelles',
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

      // 7. Huawei Series
      {
        source: '/pages/reparation-p:series(\\d+)-:slug', // Match P20, P30, etc
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
      // Sony / PlayStation (Moved to top, removing duplicates)
      // Nintendo (Moved to top, removing duplicates)
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

      // --- CANONICAL LOCALIZED REDIRECTS (English -> Localized) ---
      // Stores
      { source: '/fr/stores', destination: '/fr/magasins', permanent: true },
      { source: '/nl/stores', destination: '/nl/winkels', permanent: true },
      { source: '/tr/stores', destination: '/tr/magazalar', permanent: true },
      { source: '/fr/stores/:slug*', destination: '/fr/magasins/:slug*', permanent: true },
      { source: '/nl/stores/:slug*', destination: '/nl/winkels/:slug*', permanent: true },
      { source: '/tr/stores/:slug*', destination: '/tr/magazalar/:slug*', permanent: true },

      // Sustainability (Moved from /about/)
      { source: '/en/about/sustainability', destination: '/en/sustainability', permanent: true },
      { source: '/fr/about/sustainability', destination: '/fr/sustainability', permanent: true },
      { source: '/nl/about/sustainability', destination: '/nl/sustainability', permanent: true },
      { source: '/tr/about/sustainability', destination: '/tr/sustainability', permanent: true },

      // About
      { source: '/fr/about', destination: '/fr/a-propos', permanent: true },
      { source: '/nl/about', destination: '/nl/over-ons', permanent: true },
      { source: '/tr/about', destination: '/tr/hakkimizda', permanent: true },

      // Business
      { source: '/nl/business', destination: '/nl/zakelijk', permanent: true },
      { source: '/tr/business', destination: '/tr/kurumsal', permanent: true },

      // Products
      { source: '/fr/products', destination: '/fr/produits', permanent: true },
      { source: '/nl/products', destination: '/nl/producten', permanent: true },
      { source: '/tr/products', destination: '/tr/urunler', permanent: true },
      { source: '/fr/products/:slug*', destination: '/fr/produits/:slug*', permanent: true },
      { source: '/nl/products/:slug*', destination: '/nl/producten/:slug*', permanent: true },
      { source: '/tr/products/:slug*', destination: '/tr/urunler/:slug*', permanent: true },

      // Repair & Buyback (Roots & Subpaths)
      { source: '/fr/repair/:path*', destination: '/fr/reparation/:path*', permanent: true },
      { source: '/nl/repair/:path*', destination: '/nl/reparatie/:path*', permanent: true },
      { source: '/tr/repair/:path*', destination: '/tr/onarim/:path*', permanent: true },
      { source: '/fr/buyback/:path*', destination: '/fr/rachat/:path*', permanent: true },
      { source: '/nl/buyback/:path*', destination: '/nl/inkoop/:path*', permanent: true },
      { source: '/tr/buyback/:path*', destination: '/tr/geri-alim/:path*', permanent: true },
      { source: '/fr/repair', destination: '/fr/reparation', permanent: true },
      { source: '/nl/repair', destination: '/nl/reparatie', permanent: true },
      { source: '/tr/repair', destination: '/tr/onarim', permanent: true },
      { source: '/fr/buyback', destination: '/fr/rachat', permanent: true },
      { source: '/nl/buyback', destination: '/nl/inkoop', permanent: true },
      { source: '/tr/buyback', destination: '/tr/geri-alim', permanent: true },

      // Legal & Footer Links
      { source: '/fr/warranty', destination: '/fr/garantie', permanent: true },
      { source: '/tr/warranty', destination: '/tr/garanti', permanent: true },
      { source: '/fr/privacy', destination: '/fr/vie-privee', permanent: true },
      { source: '/tr/privacy', destination: '/tr/gizlilik', permanent: true },
      { source: '/fr/terms', destination: '/fr/conditions-generales', permanent: true },
      { source: '/nl/terms', destination: '/nl/algemene-voorwaarden', permanent: true },
      { source: '/tr/terms', destination: '/tr/kosullar', permanent: true },
      { source: '/fr/track-order', destination: '/fr/suivi-commande', permanent: true },
      { source: '/nl/track-order', destination: '/nl/bestelling-volgen', permanent: true },
      { source: '/tr/track-order', destination: '/tr/siparis-takip', permanent: true },
      { source: '/fr/cookies', destination: '/fr/politique-cookies', permanent: true },
      { source: '/nl/cookies', destination: '/nl/cookiebeleid', permanent: true },
      { source: '/tr/cookies', destination: '/tr/cerez-politikasi', permanent: true },

      // Other Slugs
      { source: '/tr/franchise', destination: '/tr/bayilik', permanent: true },
      { source: '/fr/students', destination: '/fr/etudiants', permanent: true },
      { source: '/nl/students', destination: '/nl/studenten', permanent: true },
      { source: '/tr/students', destination: '/tr/ogrenciler', permanent: true },
      { source: '/fr/express-courier', destination: '/fr/coursier-express', permanent: true },
      { source: '/nl/express-courier', destination: '/nl/express-koerier', permanent: true },
      { source: '/tr/express-courier', destination: '/tr/ekspres-kurye', permanent: true },
      { source: '/fr/training', destination: '/fr/formation', permanent: true },
      { source: '/nl/training', destination: '/nl/opleiding', permanent: true },
      { source: '/tr/training', destination: '/tr/egitim', permanent: true },
      { source: '/tr/contact', destination: '/tr/iletisim', permanent: true },
      { source: '/tr/faq', destination: '/tr/sss', permanent: true },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 Year (Aggressive Caching for Bandwidth)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
      // --- TURKISH SERVICES ---
      {
        source: '/tr/hizmetler/mikro-lehimleme',
        destination: '/tr/services/microsoldering',
      },
      {
        source: '/tr/hizmetler/veri-kurtarma',
        destination: '/tr/services/data-recovery',
      },
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
      {
        source: '/tr/services/mikro-lehimleme',
        destination: '/tr/services/microsoldering',
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
      {
        source: '/tr/services/veri-kurtarma',
        destination: '/tr/services/data-recovery',
      },

      // --- SUSTAINABILITY SLUGS ---
      {
        source: '/fr/durabilite',
        destination: '/fr/sustainability',
      },
      {
        source: '/fr/a-propos/durabilite',
        destination: '/fr/sustainability',
      },
      {
        source: '/nl/duurzaamheid',
        destination: '/nl/sustainability',
      },
      {
        source: '/nl/om-ons/duurzaamheid',
        destination: '/nl/sustainability',
      },
      {
        source: '/nl/over-ons/duurzaamheid',
        destination: '/nl/sustainability',
      },
      {
        source: '/tr/surdurulebilirlik',
        destination: '/tr/sustainability',
      },
      {
        source: '/tr/hakkimizda/surdurulebilirlik',
        destination: '/tr/sustainability',
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
      {
        source: '/tr/hakkimizda',
        destination: '/tr/about',
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
      {
        source: '/tr/ogrenciler',
        destination: '/tr/students',
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
      {
        source: '/tr/ekspres-kurye',
        destination: '/tr/express-courier',
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
        source: '/tr/kariyer',
        destination: '/tr/careers',
      },

      {
        source: '/nl/diensten',
        destination: '/nl/services',
      },
      {
        source: '/tr/hizmetler',
        destination: '/tr/services',
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
      {
        source: '/tr/garanti',
        destination: '/tr/warranty',
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
      {
        source: '/tr/gizlilik',
        destination: '/tr/privacy',
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
      {
        source: '/tr/kosullar',
        destination: '/tr/terms',
      },
      // Cookies
      {
        source: '/fr/politique-cookies',
        destination: '/fr/cookies',
      },
      {
        source: '/nl/cookiebeleid',
        destination: '/nl/cookies',
      },
      {
        source: '/tr/cerez-politikasi',
        destination: '/tr/cookies',
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
      {
        source: '/tr/siparis-takip',
        destination: '/tr/track-order',
      },

      // Business
      {
        source: '/nl/zakelijk',
        destination: '/nl/business',
      },
      {
        source: '/tr/kurumsal',
        destination: '/tr/business',
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
      {
        source: '/tr/destek',
        destination: '/tr/support',
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
      {
        source: '/tr/bayilik',
        destination: '/tr/franchise',
      },
      {
        source: '/tr/partnerlik',
        destination: '/tr/franchise',
      },
      {
        source: '/tr/egitim',
        destination: '/tr/formation',
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
        source: '/tr/magazalar',
        destination: '/tr/stores',
      },
      {
        source: '/tr/magazalar/:slug*',
        destination: '/tr/stores/:slug*',
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
      {
        source: '/tr/urunler',
        destination: '/tr/products',
      },
      {
        source: '/tr/urunler/:slug*',
        destination: '/tr/products/:slug*',
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
