import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

// Where the /stats proxy forwards to. Browsers hit budgero.app/stats through
// Cloudflare, and this proxy passes the visitor's cf-connecting-ip /
// cf-ipcountry headers on to Umami. The upstream must NOT be behind Cloudflare
// itself: a second Cloudflare hop rewrites those headers to this server's own
// IP and country. In production set UMAMI_ORIGIN (a build arg — rewrites are
// baked in at build time) to Umami's internal address, e.g. http://umami:3000.
const UMAMI_ORIGIN = (process.env.UMAMI_ORIGIN || 'https://stats.budgero.app').replace(/\/+$/, '');

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/stats/script.js',
        destination: `${UMAMI_ORIGIN}/script.js`,
      },
      {
        source: '/stats/api/send',
        destination: `${UMAMI_ORIGIN}/api/send`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/docs/budgero-core-vs-cloud',
        destination: '/self-hostable',
        permanent: true,
      },
      {
        source: '/free-ynab-alternative',
        destination: '/vs-ynab',
        permanent: true,
      },
      {
        source: '/budgeting-multiple-currencies',
        destination: '/multi-currency-budgeting',
        permanent: true,
      },
      {
        source: '/blog/budgero-vs-ynab',
        destination: '/vs-ynab',
        permanent: true,
      },
    ];
  },
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    // Silence workspace root warning by pinning root to package dir
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  eslint: {
    // Lint in CI if you want, but don't fail production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // We run tsc separately in CI; don't fail Next build on TS issues
    ignoreBuildErrors: true,
  },
};
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
