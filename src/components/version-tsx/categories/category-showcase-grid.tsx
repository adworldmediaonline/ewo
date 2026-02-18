'use cache';

import { cacheLife } from 'next/cache';
import { getCategoriesShow } from '@/server/categories';
import { processCategoriesForShowcase } from '@/lib/process-categories-for-showcase';
import { CategoryCard, type CategoryItem } from './category-card';

interface CategoryShowcaseGridProps {
  /** Optional custom order of category IDs. Categories not in this array appear after. */
  categoryOrder?: string[];
  /** Pre-fetched categories; when provided, skips internal fetch (for parallel loading) */
  categories?: unknown[];
}

/**
 * Fetches categories from DB and renders the grid.
 * Uses showcaseGroups from each category (configured in Admin) for grouping/splitting.
 */
export async function CategoryShowcaseGrid({ categoryOrder, categories: categoriesProp }: CategoryShowcaseGridProps) {
  cacheLife('minutes');
  const categories = Array.isArray(categoriesProp)
    ? (categoriesProp as CategoryItem[])
    : await getCategoriesShow();
  const processed = processCategoriesForShowcase(categories);
  const processedCategories = sortByCategoryOrder(processed, categoryOrder);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3 xl:grid-cols-5">
      {processedCategories.map((item: CategoryItem, index: number) => (
        <CategoryCard key={item._id} item={item} index={index} />
      ))}
    </div>
  );
}

function sortByCategoryOrder(
  categories: CategoryItem[],
  order?: string[]
): CategoryItem[] {
  if (!order?.length) return categories;
  const orderMap = new Map(order.map((id, i) => [id, i]));
  return [...categories].sort((a, b) => {
    const idxA = orderMap.get(a._id) ?? order.length;
    const idxB = orderMap.get(b._id) ?? order.length;
    return idxA - idxB;
  });
}
