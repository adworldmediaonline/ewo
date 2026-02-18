'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { processCategoriesForShowcase } from '@/lib/process-categories-for-showcase';
import type { CategoryItem } from '@/lib/server-data';
import { CategoryCard } from './categories/category-card';

export interface ShopMenuMegaContentProps {
  /** Raw categories from getCategoriesShow – same as homepage showcase */
  categories: CategoryItem[];
}

/**
 * Shop dropdown reuses the same category showcase as the Homepage for consistency.
 * Processes categories with showcaseGroups and renders CategoryCard grid.
 */
export default function ShopMenuMegaContent({
  categories,
}: ShopMenuMegaContentProps): React.ReactElement {
  const processed = processCategoriesForShowcase(categories);

  return (
    <div
      className="max-h-[min(80vh,28rem)] overflow-y-auto"
      role="menu"
      aria-label="Shop categories"
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3 xl:grid-cols-5">
        {processed.map((item, index) => (
          <CategoryCard key={item._id} item={item} index={index} />
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Link
          href="/shop"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          aria-label="Explore all categories"
        >
          Explore all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
