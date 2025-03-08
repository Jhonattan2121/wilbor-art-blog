import { removeUrlProtocol } from '@/utility/url';
import type { NextConfig } from 'next';
import { RemotePattern } from 'next/dist/shared/lib/image-config';

const VERCEL_BLOB_STORE_ID = process.env.BLOB_READ_WRITE_TOKEN?.match(
  /^vercel_blob_rw_([a-z0-9]+)_[a-z0-9]+$/i,
)?.[1].toLowerCase();

const HOSTNAME_VERCEL_BLOB = VERCEL_BLOB_STORE_ID
  ? `${VERCEL_BLOB_STORE_ID}.public.blob.vercel-storage.com`
  : undefined;

const HOSTNAME_CLOUDFLARE_R2 =
  process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN;

const HOSTNAME_AWS_S3 =
  process.env.NEXT_PUBLIC_AWS_S3_BUCKET &&
    process.env.NEXT_PUBLIC_AWS_S3_REGION
    // eslint-disable-next-line max-len
    ? `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION}.amazonaws.com`
    : undefined;

const generateRemotePattern = (hostname: string) =>
({
  protocol: 'https',
  hostname: removeUrlProtocol(hostname)!,
  port: '',
  pathname: '/**',
} as const);

const remotePatterns: RemotePattern[] = [];

if (HOSTNAME_VERCEL_BLOB) {
  remotePatterns.push(generateRemotePattern(HOSTNAME_VERCEL_BLOB));
}
if (HOSTNAME_CLOUDFLARE_R2) {
  remotePatterns.push(generateRemotePattern(HOSTNAME_CLOUDFLARE_R2));
}
if (HOSTNAME_AWS_S3) {
  remotePatterns.push(generateRemotePattern(HOSTNAME_AWS_S3));
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
      allowedOrigins: ['*'],
    },
  },
  images: {
    domains: [
      'ipfs.skatehive.app',
      'lime-useful-snake-714.mypinata.cloud'
    ],
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.skatehive.app',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'lime-useful-snake-714.mypinata.cloud',
        pathname: '/ipfs/**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/ipfs/:path*',
        destination: 'https://ipfs.skatehive.app/ipfs/:path*'
      },
      {
        source: '/pinata/:path*',
        destination: 'https://lime-useful-snake-714.mypinata.cloud/ipfs/:path*'
      }
    ];
  },
  env: {
    PINATA_JWT: process.env.PINATA_JWT,
  }
};

export default nextConfig;
