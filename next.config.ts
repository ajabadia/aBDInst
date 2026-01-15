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
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
      allowedOrigins: ['localhost:3000', '192.168.56.1:3000', '192.168.1.135:3000'],
    },
  },
  turbopack: {},
};

import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withSentryConfig(withPWA(withNextIntl(nextConfig)), {
  silent: true,
  org: "instrument-collector",
  project: "instrument-collector",
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
