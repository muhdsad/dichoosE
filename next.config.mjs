/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
    ],
  },
  experimental: {
    // any other experimental options if needed
  },
  // Configure Turbopack root at the top level for Next.js 16+
  // This replaces the deprecated experimental.turbo configuration.
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
