import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Redirect legacy shop URLs to SEO-friendly path-based URLs.
 * /shop?category=x -> /shop/x
 * /shop?category=x&subcategory=y -> /shop/x/y (subcategory: comma -> hyphen)
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname !== '/shop') {
    return NextResponse.next();
  }

  const category = searchParams.get('category')?.trim();
  const subcategory = searchParams.get('subcategory')?.trim();

  if (!category) {
    return NextResponse.next();
  }

  const categorySlug = category;
  const subcategoryUrlSlug = subcategory
    ? subcategory.replace(/,/g, '-')
    : '';

  const newPath = subcategoryUrlSlug
    ? `/shop/${categorySlug}/${subcategoryUrlSlug}`
    : `/shop/${categorySlug}`;

  const url = request.nextUrl.clone();
  url.pathname = newPath;
  url.searchParams.delete('category');
  url.searchParams.delete('subcategory');
  // Preserve other params (e.g. search) for category page filtering
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: '/shop',
};
