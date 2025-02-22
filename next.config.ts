/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
      allowedOrigins: ['*'],
    },
  },
  dynamicParams: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.hive.blog',
      },
      {
        protocol: 'https',
        hostname: '**.peakd.com',
      },
      {
        protocol: 'https',
        hostname: 'images.hive.blog',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.skatehive.app',
        pathname: '/ipfs/**',
      },
    ],
    unoptimized: true, 
  }
};

export default nextConfig;