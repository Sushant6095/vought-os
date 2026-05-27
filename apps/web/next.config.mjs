/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@vought/design-system', '@vought/motion', '@vought/ui'],
  // NOTE: optimizePackageImports was removed. Combined with transpilePackages on
  // the same workspace packages it caused webpack server-chunk desync in dev
  // ("Cannot find module './NNN.js'"), 500-ing any route that imported @vought/ui.
  poweredByHeader: false,
  // Image optimization: serve AVIF + WebP instead of source formats.
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.vought.com' },
    ],
  },
  // Security + transport headers · Blueprint §11
  async headers() {
    return [
      // Security headers on all routes.
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      // Long-lived immutable cache on static assets and fonts.
      {
        source: '/(.+)\\.(jpg|jpeg|png|webp|avif|svg|ico|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
