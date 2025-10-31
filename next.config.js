/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Cache Components for explicit opt-in caching
  // This changes the paradigm: routes are dynamic by default, use "use cache" to opt-in to caching
  cacheComponents: true,
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'www.facebook.com',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
