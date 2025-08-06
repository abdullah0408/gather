import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    staleTimes: {
      dynamic: 30, // cache dynamic pages and their data for 30 s
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com", // Clerk's image hosting
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com", // Uploadthing's image hosting
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`,
      },
      {
        protocol: "https",
        hostname: "utfs.io", // Uploadthing's image hosting
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`,
      },
      {
        protocol: "https",
        hostname: "3b6348acd4.ufs.sh", // Uploadthing's image hosting
      }
    ],
  },
};

export default nextConfig;
