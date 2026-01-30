/** @type {import('next').NextConfig} */
const nextConfig = {

  async redirects() {
    return [

      {
        source: '/product/ewo-chevy-10-bolt-complete-1-ton-crossover-high-steer-kit',
        destination: '/product/ewo-chevy-10-bolt-complete-crossover-high-steer-kit',
        permanent: true,
      },
      {
        source: '/product/gmchevy-dana-44-1-ton-crossover-high-steer-kit-wknuckle-with-dom-tubing',
        destination: '/product/gmchevy-dana-44-crossover-high-steer-kit-wknuckle-with-dom-tubing',
        permanent: true,
      },
      {
        source: '/product/dana-60-gmchevy-3%22-drop-pitman-arm-for-crossover-steering',
        destination: '/product/dana-60-gmchevy-3%22-drop-pitman-arm-for-gm-tie-rod-ends-%28es-2234-res-2234-l%29',
        permanent: true,
      },
      {
        source: '/product/dana-44-gmchevy-3%22-drop-pitman-arm-for-crossover-steering',
        destination: '/product/dana-44-gmchevy-3%22-drop-pitman-arm-for-gm-tie-rod-ends-%28es-2234-r-es-2234-l%29',
        permanent: true,
      }
    ]
  },

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
