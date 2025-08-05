async function fetchProducts() {
  try {
    // Use internal API URL for server-side calls to avoid external network issues
    const apiBaseUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:7000';

    const response = await fetch(`${apiBaseUrl}/api/product/all`, {
      next: { revalidate: 86400 }, // Cache for 24 hours instead of 1 hour
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Extract products from API response
    const products = data?.data || [];

    return products;
  } catch (error) {
    // Return empty array to ensure sitemap still works with static pages
    return [];
  }
}

export default async function sitemap() {
  const baseUrl = 'https://www.eastwestoffroad.com';
  const currentDate = new Date();

  // Fetch all products from the database
  const products = await fetchProducts();

  if (products.length > 0) {
  }

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/category`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/history`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Generate product pages from database
  const productPages = products.map(product => ({
    url: `${baseUrl}/product/${product.slug || product._id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Debug final sitemap
  const finalSitemap = [...staticPages, ...productPages];

  // Combine static pages and product pages
  return finalSitemap;
}
