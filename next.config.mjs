/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/_next/static/sitemap.xml',
      },
      {
        source: '/robots.txt',
        destination: '/_next/static/robots.txt',
      },
    ];
  },
};

export default nextConfig;
