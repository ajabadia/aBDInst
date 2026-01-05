import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev
  register: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
      allowedOrigins: ['localhost:3000', '192.168.56.1:3000', '192.168.1.135:3000'],
    },
    // For older Next.js versions or specific flags
    // allowedDevOrigins: ['localhost:3000', '192.168.56.1:3000'], 
  },
  // Silence Turbopack/Webpack conflict error
  // @ts-ignore - The type definition might not be updated yet for this new property in Next.js 16
  turbopack: {},
};

export default withPWA(nextConfig);
