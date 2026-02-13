/**
 * Product image metadata - matches backend ImageWithMeta schema
 */
export interface ImageWithMeta {
  url: string;
  fileName: string;
  title: string;
  altText: string;
  link?: string;
}

/**
 * Product with optional image metadata
 */
export interface ProductWithImageMeta {
  img?: string;
  image?: ImageWithMeta | null;
  imageURLs?: string[] | ImageWithMeta[];
  imageURLsWithMeta?: ImageWithMeta[];
  title: string;
}

/**
 * Get main product image URL.
 * Prefers product.image.url, falls back to product.img.
 */
export const getProductImageUrl = (product: ProductWithImageMeta): string => {
  return product.image?.url ?? product.img ?? '';
};

/**
 * Get image src for display. Always uses the /api/image proxy when we have a URL
 * so "Save Image As" uses a proper filename instead of random Cloudinary IDs.
 * Filename is derived from metadata, slug, or title.
 */
export const getProductImageSrc = (product: ProductWithImageMeta): string => {
  const url = getProductImageUrl(product);
  if (!url) return '';
  // Always use proxy so "Save Image As" gets correct filename (not random Cloudinary ID)
  const fileName =
    product.image?.fileName?.trim() ||
    (product as { slug?: string }).slug?.replace(/[^\w-]/g, '-') ||
    (product as { title?: string }).title
      ?.replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50) ||
    'product';
  const ext = fileName.includes('.') ? '' : '.webp';
  return `/api/image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName + ext)}`;
};

/**
 * Whether the image src is a proxy URL (needs different component than CldImage).
 */
export const isProductImageProxyUrl = (src: string): boolean => {
  return typeof src === 'string' && src.startsWith('/api/image?');
};

/**
 * Get main product image alt text for accessibility and SEO.
 * Uses product.image.altText when available, else product.image.title, else product.title.
 * Avoids random Cloudinary filenames.
 */
export const getProductImageAlt = (product: ProductWithImageMeta): string => {
  if (product.image?.altText?.trim()) return product.image.altText;
  if (product.image?.title?.trim()) return product.image.title;
  return product.title || 'Product image';
};

/**
 * Get main product image title (for title attribute / tooltip).
 */
export const getProductImageTitle = (product: ProductWithImageMeta): string => {
  if (product.image?.title?.trim()) return product.image.title;
  return product.title || '';
};

/**
 * Get gallery image URLs with proxy when metadata (fileName) exists.
 * Use for product details, quick-view, etc. so "Save Image As" uses correct filenames.
 */
export const getProductImageSrcsForGallery = (
  product: ProductWithImageMeta
): string[] => {
  const withMeta = product.imageURLsWithMeta;
  if (Array.isArray(withMeta) && withMeta.length > 0) {
    return withMeta.map((item) => {
      const url =
        typeof item === 'object' && item?.url ? item.url : String(item);
      if (typeof item === 'object' && item?.fileName?.trim()) {
        const fileName = item.fileName.trim();
        const ext = fileName.includes('.') ? '' : '.webp';
        return `/api/image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName + ext)}`;
      }
      return url;
    });
  }
  return getProductImageUrls(product);
};

/**
 * Normalize imageURLs to array of URLs (strings).
 * Handles both legacy string[] and ImageWithMeta[] (imageURLsWithMeta).
 */
export const getProductImageUrls = (product: ProductWithImageMeta): string[] => {
  const withMeta = product.imageURLsWithMeta;
  if (Array.isArray(withMeta) && withMeta.length > 0) {
    return withMeta.map((item) => (typeof item === 'object' && item?.url ? item.url : String(item)));
  }
  const urls = product.imageURLs;
  if (!Array.isArray(urls)) return [];
  return urls.map((item) =>
    typeof item === 'object' && item && 'url' in item ? (item as ImageWithMeta).url : String(item)
  );
};

/**
 * Get alt text for a variant/gallery image by index.
 */
export const getVariantImageAlt = (
  product: ProductWithImageMeta,
  index: number,
  url: string
): string => {
  const withMeta = product.imageURLsWithMeta;
  if (Array.isArray(withMeta) && withMeta[index]) {
    const meta = withMeta[index];
    if (typeof meta === 'object' && meta?.altText?.trim()) return meta.altText;
    if (typeof meta === 'object' && meta?.title?.trim()) return meta.title;
    if (typeof meta === 'object' && meta?.fileName?.trim()) return meta.fileName;
  }
  return getProductImageAlt(product) + (index > 0 ? ` - view ${index + 1}` : '');
};
