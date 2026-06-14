import {configHeader} from '@/utils/constants';
import type {NextConfig} from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  allowedDevOrigins: ['10.0.0.9', '10.0.0.25'],
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  async headers() {
    return configHeader;
  },
  compress: true, 
  experimental: {
    optimizePackageImports: ["lodash", "date-fns"],
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default withNextIntl(nextConfig);