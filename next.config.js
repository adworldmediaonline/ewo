/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Cache Components for explicit opt-in caching
  // This changes the paradigm: routes are dynamic by default, use "use cache" to opt-in to caching
  cacheComponents: true,
  reactCompiler: true,

  // Compiler optimizations
  compiler: {
    // Remove console.log in production builds
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep error and warn logs
    } : false,
  },

  experimental: {
    turbopackFileSystemCacheForDev: true,
    // Optimize package imports for better tree-shaking
    optimizePackageImports: ['react', 'react-dom', 'lodash', 'lucide-react'],
  },

  images: {
    // Prioritize modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 90, 95, 100],
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

  // Enable SWC minification (faster than Terser)
  swcMinify: true,
};

module.exports = nextConfig;
