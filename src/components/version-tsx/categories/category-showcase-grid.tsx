'use cache';

import { cacheLife } from 'next/cache';
import { getCategoriesShow } from '@/server/categories';
import { toSlug } from '@/lib/server-data';
import { CategoryCard, type CategoryItem } from './category-card';

interface CategoryShowcaseGridProps {
  /** Optional custom order of category IDs. Categories not in this array appear after. */
  categoryOrder?: string[];
}

/**
 * Fetches categories from DB and renders the grid.
 * Handles DANA 60 special case (split from parent, dedicated card).
 */
export async function CategoryShowcaseGrid({ categoryOrder }: CategoryShowcaseGridProps) {
  cacheLife('minutes');
  const categories = await getCategoriesShow();
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

/** Process categories for showcase – DANA 60 split logic */
function processCategoriesForShowcase(categories: CategoryItem[]): CategoryItem[] {
  const processedCategories = [...categories];
  const dana60SubcategoryName = 'DANA 60';
  const parentCategorySlug = 'crossover-and-high-steer-kits';
  const dana60Slug = 'dana-60';

  const parentCategoryIndex = processedCategories.findIndex((item: CategoryItem) => {
    if (!item.parent) return false;
    const itemSlug = toSlug(item.parent);
    return itemSlug === parentCategorySlug;
  });

  if (parentCategoryIndex === -1) return processedCategories;

  const parentCategory = processedCategories[parentCategoryIndex];
  let dana60Category: (CategoryItem & { parentCategorySlug?: string; subcategorySlug?: string }) | null = null;

  if (parentCategory.children && Array.isArray(parentCategory.children)) {
    const dana60Index = parentCategory.children.findIndex((child: string) => {
      if (!child) return false;
      const childSlug = toSlug(child);
      return childSlug === dana60Slug;
    });

    if (dana60Index !== -1) {
      const updatedChildren = [...parentCategory.children];
      const dana60Name = updatedChildren[dana60Index];
      updatedChildren.splice(dana60Index, 1);

      const updatedParentCategory = {
        ...parentCategory,
        children: updatedChildren,
      };

      const dana60Exists = processedCategories.some((item: CategoryItem) => {
        if (!item.parent) return false;
        const itemSlug = toSlug(item.parent);
        return itemSlug === dana60Slug;
      });

      if (!dana60Exists) {
        const dana60ImageUrl = 'https://res.cloudinary.com/datdyxl7o/image/upload/v1768978611/dana_60_cybdcn.webp';
        dana60Category = {
          _id: `dana-60-standalone-${parentCategory._id}`,
          parent: parentCategory.parent,
          children: [dana60Name || dana60SubcategoryName],
          status: parentCategory.status || 'Show',
          description: parentCategory.description,
          img: dana60ImageUrl,
          image: { url: dana60ImageUrl, fileName: 'dana-60.webp', title: 'DANA 60', altText: 'DANA 60' },
          products: parentCategory.products,
          parentCategorySlug: parentCategorySlug,
          subcategorySlug: dana60Slug,
        };
      }

      processedCategories.splice(parentCategoryIndex, 1);

      const existingDana60Index = processedCategories.findIndex((item: CategoryItem) => {
        if (!item.parent) return false;
        const itemSlug = toSlug(item.parent);
        return itemSlug === dana60Slug;
      });

      if (existingDana60Index !== -1) {
        const existingDana60 = processedCategories[existingDana60Index];
        const dana60ImageUrl = 'https://res.cloudinary.com/datdyxl7o/image/upload/v1768978611/dana_60_cybdcn.webp';
        dana60Category = {
          ...existingDana60,
          parent: parentCategory.parent,
          children: [dana60Name || dana60SubcategoryName],
          img: dana60ImageUrl,
          image: { url: dana60ImageUrl, fileName: 'dana-60.webp', title: 'DANA 60', altText: 'DANA 60' },
          parentCategorySlug: parentCategorySlug,
          subcategorySlug: dana60Slug,
        } as CategoryItem & { parentCategorySlug?: string; subcategorySlug?: string };
        processedCategories.splice(existingDana60Index, 1);
      }

      if (dana60Category) {
        processedCategories.unshift(dana60Category);
      }
      processedCategories.unshift(updatedParentCategory);
    }
  }

  return processedCategories;
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
