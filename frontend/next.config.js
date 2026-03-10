/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  },
  images: {
    domains: [
      'corex-design-studio-dev.s3.amazonaws.com',
      'corex-design-studio.s3.amazonaws.com',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent Konva's canvas dependency from breaking server-side builds
      config.externals = [...(config.externals || []), 'canvas'];
    }
    return config;
  },
};

module.exports = nextConfig;
