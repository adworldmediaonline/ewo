'use client';

import { ShopCategoryCard } from './shop-category-card';
import type { CategoryItem } from '@/lib/server-data';

interface ShopCategoryGridProps {
  categories: CategoryItem[];
}

export function ShopCategoryGrid({ categories }: ShopCategoryGridProps) {
  if (!categories?.length) return null;

  return (
    <section
      aria-label="Shop categories"
      className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
    >
      {categories.map((category, index) => (
        <ShopCategoryCard
          key={category._id}
          category={category}
          index={index}
        />
      ))}
    </section>
  );
}
