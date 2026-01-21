import { Button } from '@/components/ui/button';
import { getCategoriesShow } from '@/server/categories';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CategoryCard, CategoryItem } from './categories/category-card';
import { toSlug } from '@/lib/server-data';

export default function CategoryShowcase() {
  return (
    <section
      aria-labelledby="category-heading"
      className="w-full py-8 md:py-10"
    >
      <div className="container mx-auto px-3 md:px-6">
        <div className="mb-4 md:mb-6 flex items-end justify-between gap-3">
          <h2
            id="category-heading"
            className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight"
          >
            Shop by Category
          </h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link
              scroll={true}
              href="/shop"
              aria-label="Explore all categories"
            >
              Explore all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <GetCategoriesShowItems />

      </div>
    </section>
  );
}

async function GetCategoriesShowItems() {
  "use cache";
  const categories = await getCategoriesShow();

  // Process categories to handle Dana 60 as a separate card
  const processedCategories = [...categories];
  const dana60SubcategoryName = "DANA 60";

  // Target slugs for matching
  const parentCategorySlug = 'crossover-and-high-steer-kits';
  const dana60Slug = 'dana-60';

  // Find the parent category by matching slug
  const parentCategoryIndex = processedCategories.findIndex(
    (item: CategoryItem) => {
      if (!item.parent) return false;
      const itemSlug = toSlug(item.parent);
      return itemSlug === parentCategorySlug;
    }
  );

  if (parentCategoryIndex !== -1) {
    const parentCategory = processedCategories[parentCategoryIndex];

    // Check if DANA 60 is in the children array by matching slug
    if (parentCategory.children && Array.isArray(parentCategory.children)) {
      const dana60Index = parentCategory.children.findIndex(
        (child: string) => {
          if (!child) return false;
          const childSlug = toSlug(child);
          return childSlug === dana60Slug;
        }
      );

      if (dana60Index !== -1) {
        // Remove Dana 60 from parent category's children
        const updatedChildren = [...parentCategory.children];
        const dana60Name = updatedChildren[dana60Index];
        updatedChildren.splice(dana60Index, 1);

        // Update the parent category with filtered children
        processedCategories[parentCategoryIndex] = {
          ...parentCategory,
          children: updatedChildren,
        };

        // Check if DANA 60 already exists as a parent category by matching slug
        const dana60Exists = processedCategories.some(
          (item: CategoryItem) => {
            if (!item.parent) return false;
            const itemSlug = toSlug(item.parent);
            return itemSlug === dana60Slug;
          }
        );

        // If Dana 60 doesn't exist as a parent category, create a separate card for it
        if (!dana60Exists) {
          const dana60Category: CategoryItem & { parentCategorySlug?: string; subcategorySlug?: string } = {
            _id: `dana-60-standalone-${parentCategory._id}`, // Generate a stable unique ID
            parent: dana60Name || dana60SubcategoryName,
            children: [], // No subcategories for Dana 60
            status: parentCategory.status || 'Show',
            // Preserve other properties if they exist
            description: parentCategory.description,
            img: 'https://res.cloudinary.com/datdyxl7o/image/upload/v1768978611/dana_60_cybdcn.webp', // Use the dedicated DANA 60 image from Cloudinary
            products: parentCategory.products, // Preserve products reference if needed
            // Add metadata for custom URL handling
            parentCategorySlug: parentCategorySlug,
            subcategorySlug: dana60Slug,
          };

          // Insert Dana 60 category after the parent category
          processedCategories.splice(parentCategoryIndex + 1, 0, dana60Category);
        }
      }
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3 xl:grid-cols-5">
      {processedCategories.map((item: CategoryItem, index: number) => (
        <CategoryCard key={item._id} item={item} index={index} />
      ))}
    </div>
  );
}
