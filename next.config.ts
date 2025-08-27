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
        hostname: "ik.imagekit.io", // ImageKit's image hosting
      },
      {
        protocol: "https",
        hostname: "img.clerk.com", // Clerk's image hosting
      },
    ],
  },
  rewrites: async () => {
    return [
      {
        source: "/hashtag/:hashtag",
        destination: "/search?q=%23:hashtag",
      },
    ];
  },
};

export default nextConfig;
