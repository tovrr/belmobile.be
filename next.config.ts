// import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Other experimental features can go here
  },
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
  async headers() {
    const isStaging = process.env.NEXT_PUBLIC_BASE_URL?.includes('dev.') || process.env.VERCEL_ENV !== 'production';

    const headers = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      }
    ];

    if (isStaging) {
      headers.push({
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow'
      });
    }

    return [
      {
        source: '/:path*',
        headers: headers
      }
    ]
  }
};

// export default withSentryConfig(nextConfig, {
//   // For all available options, see:
//   // https://www.npmjs.com/package/@sentry/webpack-plugin#options

//   org: "tovrr",

//   project: "belmobile-next-platform",

//   // Only print logs for uploading source maps in CI
//   silent: !process.env.CI,

//   // For all available options, see:
//   // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

//   // Upload a larger set of source maps for prettier stack traces (increases build time)
//   widenClientFileUpload: true,

//   // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
//   // This can increase your server load as well as your hosting bill.
//   // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
//   // side errors will fail.
//   tunnelRoute: "/monitoring",

//   // Hides source maps from generated client bundles
//   sourcemaps: {
//     disable: true,
//   },

//   webpack: {
//     // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
//     // See the following for more information:
//     // https://docs.sentry.io/product/crons/
//     // https://vercel.com/docs/cron-jobs
//     automaticVercelMonitors: true,

//     // Tree-shaking options for reducing bundle size
//     treeshake: {
//       // Automatically tree-shake Sentry logger statements to reduce bundle size
//       removeDebugLogging: true,
//     },
//   }
// });

export default nextConfig;
