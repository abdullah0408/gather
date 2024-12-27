import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*', // This allows any domain with HTTPS protocol
        pathname: '/**', // This allows any path
      },
    ],
  },
};

export default nextConfig;
