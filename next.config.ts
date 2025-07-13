import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    staleTimes: {
      dynamic: 30, // cache dynamic pages and their data for 30 s
    },
  },
  images: {
    domains: ["img.clerk.com"], // Allow images from Clerk's domain
  },
};

export default nextConfig;
