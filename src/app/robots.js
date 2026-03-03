export default function robots() {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        disallow: [],
      },
      {
        userAgent: 'Googlebot-image',
        disallow: [],
      },
      {
        userAgent: '*',
        allow: [
          '/api/image/',
          '/_next/image/',
          '/_next/static/',
        ],
        disallow: [
          '/blog/',
          '/sign-in',
          '/sign-up',
          '/api/',
          '/login',
          '/register',
          '/profile',
          '/cart',
          '/checkout',
          '/order',
          '/wishlist',
          '/compare',
          '/coupon',
          '/forgot',
          '/email-verify',
          '/forget-password',
          '/admin/',
          '/search',
          '/dashboard/',
          '/webhook/',
        ],
      },
    ],
    sitemap: 'https://www.eastwestoffroad.com/sitemap.xml',
  };
}
