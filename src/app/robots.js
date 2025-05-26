export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
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
        '/_next/',
        '/admin/',
        '/dashboard/',
        '*.json',
        '/webhook/',
      ],
    },
    sitemap: 'https://www.eastwestoffroad.com/sitemap.xml',
  };
}
