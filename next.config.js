/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TypeScript errors during build
  },
  swcMinify: true, // Enable SWC minification for faster builds
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Remove console.logs in production
  },
};

module.exports = nextConfig;
