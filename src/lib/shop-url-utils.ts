/**
 * Utilities for SEO-friendly shop category URLs.
 * Maps between path-based URLs (/shop/[category]/[subcategory]) and backend slugs.
 */

import { toSlug } from '@/lib/server-data';
import { processCategoriesForShowcase } from '@/lib/process-categories-for-showcase';
import type { CategoryItem } from '@/lib/server-data';

/** Convert backend subcategory slug (comma-separated) to URL path segment (hyphenated). */
export function toSubcategoryUrlSlug(subcategorySlug: string): string {
  if (!subcategorySlug?.trim()) return '';
  return subcategorySlug.trim().replace(/,/g, '-');
}

/**
 * Resolve URL subcategory slug back to backend subcategorySlug.
 * Prefer single-child match first to avoid collision with grouped slugs.
 */
export function fromSubcategoryUrlSlug(
  urlSlug: string,
  category: CategoryItem
): string | null {
  if (!urlSlug?.trim() || !category) return null;

  const children = Array.isArray(category.children) ? category.children : [];
  const childSlugs = children.map((c) => toSlug(c)).filter(Boolean);

  // Single-child match first (avoids collision: "dana-44-10-bolt-kits" as single vs grouped)
  const singleMatch = childSlugs.find((s) => s === urlSlug.trim());
  if (singleMatch) return singleMatch;

  // Grouped match: check processCategoriesForShowcase output for this category
  const processed = processCategoriesForShowcase([category]);
  for (const item of processed) {
    const subcategorySlug = item.subcategorySlug;
    if (!subcategorySlug) continue;
    const urlForm = toSubcategoryUrlSlug(subcategorySlug);
    if (urlForm === urlSlug.trim()) return subcategorySlug;
  }

  return null;
}

/** Find category by parent slug. */
export function getCategoryBySlug(
  categories: CategoryItem[],
  slug: string
): CategoryItem | undefined {
  if (!slug?.trim() || !categories?.length) return undefined;
  return categories.find((c) => toSlug(c.parent) === slug.trim());
}

/** All valid category paths for sitemap and generateStaticParams. */
export interface CategoryPath {
  category: string;
  subcategory?: string;
}

export function getAllCategoryPaths(categories: CategoryItem[]): CategoryPath[] {
  const paths: CategoryPath[] = [];

  for (const cat of categories) {
    const parentSlug = toSlug(cat.parent);
    if (!parentSlug) continue;

    paths.push({ category: parentSlug });

    const processed = processCategoriesForShowcase([cat]);
    for (const item of processed) {
      const subcategorySlug = item.subcategorySlug;
      if (!subcategorySlug) continue;
      const urlSubcategorySlug = toSubcategoryUrlSlug(subcategorySlug);
      if (urlSubcategorySlug) {
        paths.push({ category: parentSlug, subcategory: urlSubcategorySlug });
      }
    }
  }

  return paths;
}
