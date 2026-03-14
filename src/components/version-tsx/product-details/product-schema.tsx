import { getProductSingle } from '@/server/products';
import {
  getProductImageSrc,
  getProductImageSrcsForGallery,
  type ProductWithImageMeta,
} from '@/lib/product-image';
import { isOutOfStock } from '@/lib/product-stock';

const SITE_URL = 'https://www.eastwestoffroad.com';

interface ProductSchemaProps {
  productId: string;
}

/** Resolve relative URL to absolute for schema */
const toAbsoluteUrl = (url: string): string =>
  url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

/**
 * Renders JSON-LD Product schema for SEO (Schema.org).
 * Populates structured data from product details for rich snippets.
 */
export default async function ProductSchema({ productId }: ProductSchemaProps) {
  const product = await getProductSingle(productId);
  if (!product) return null;

  const slug = (product as { slug?: string }).slug || product._id;
  const productUrl = `${SITE_URL}/product/${slug}`;

  const productForImages: ProductWithImageMeta = {
    title: (product as { title?: string }).title ?? '',
    img: (product as { img?: string }).img,
    image: (product as { image?: ProductWithImageMeta['image'] }).image,
    imageURLs: (product as { imageURLs?: string[] }).imageURLs,
    imageURLsWithMeta: (product as { imageURLsWithMeta?: ProductWithImageMeta['imageURLsWithMeta'] }).imageURLsWithMeta,
  };

  const mainImgSrc = getProductImageSrc(productForImages);
  const gallerySrcs = getProductImageSrcsForGallery(productForImages);
  const images = [mainImgSrc, ...gallerySrcs.filter((u) => u && u !== mainImgSrc)].filter(Boolean);
  const imageSrcs = images.map(toAbsoluteUrl);

  const description = (product as { description?: string }).description
    ? String((product as { description?: string }).description)
      .replace(/<[^>]*>/g, '')
      .trim()
    : '';

  const price = (product as { finalPriceDiscount?: number; displayPrice?: number; price?: number })
    .finalPriceDiscount ??
    (product as { displayPrice?: number }).displayPrice ??
    (product as { price?: number }).price ??
    0;

  const reviews = (product as { reviews?: Array<{ rating?: number; comment?: string; createdAt?: string; userId?: { name?: string }; guestName?: string }> })
    .reviews ?? [];
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviewCount
      : 0;

  const schemaReviews = reviews.map((r) => {
    const authorName =
      (r.userId && typeof r.userId === 'object' && 'name' in r.userId
        ? (r.userId as { name?: string }).name
        : null) ??
      r.guestName ??
      'Customer';
    const datePublished = r.createdAt
      ? new Date(r.createdAt).toISOString().slice(0, 10)
      : undefined;
    return {
      '@type': 'Review' as const,
      author: {
        '@type': 'Person' as const,
        name: authorName,
      },
      ...(datePublished && { datePublished }),
      reviewRating: {
        '@type': 'Rating' as const,
        ratingValue: String(r.rating ?? 0),
      },
      ...(r.comment && { reviewBody: r.comment }),
    };
  });

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title ?? '',
    ...(imageSrcs.length > 0 && { image: imageSrcs }),
    ...(description && { description }),
    ...(product.sku && { sku: product.sku }),
    brand: {
      '@type': 'Brand',
      name: 'East West Off Road',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: String(price.toFixed(2)),
      availability: isOutOfStock(product)
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: String(avgRating.toFixed(1)),
        reviewCount: String(reviewCount),
      },
    }),
    ...(schemaReviews.length > 0 && { review: schemaReviews }),
  };

  const jsonLd = JSON.stringify(schema).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
