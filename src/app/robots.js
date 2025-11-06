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
          '/dashboard/',
          '/webhook/',
        ],
      },
    ],
    sitemap: 'https://www.eastwestoffroad.com/sitemap.xml',
  };
}
