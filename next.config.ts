import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy Pricing Redirects -> Specific Model Repair Page
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
      // Add more legacy redirects here as needed
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
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
  },
};

export default nextConfig;
