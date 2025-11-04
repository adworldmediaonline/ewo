import { Button } from '@/components/ui/button';
import { getCategoriesShow } from '@/server/categories';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CategoryCard, CategoryItem } from './categories/category-card';

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {categories.map((item: CategoryItem, index: number) => (
        <CategoryCard key={item._id} item={item} index={index} />
      ))}
    </div>
  );
}
