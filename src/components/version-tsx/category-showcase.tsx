'use client';

import { Button } from '@/components/ui/button';

import { toSlug } from '@/lib/server-data';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CategoryItem {
  _id: string;
  parent: string;
  description?: string;
  img?: string;
  status?: string;
  products?: unknown[];
  children?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryShowcaseProps {
  categories: CategoryItem[];
}

interface CategoryCardProps {
  item: CategoryItem;
}

const CategoryCard = ({ item }: CategoryCardProps) => {
  const router = useRouter();
  const hasImage = Boolean(item.img);
  const childLabels = Array.isArray(item.children)
    ? item.children.slice(0, 3)
    : [];

  const handleSubcategoryClick = (
    e: React.MouseEvent,
    parent: string,
    child: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const parentSlug = toSlug(parent);
    const childSlug = toSlug(child);
    router.push(`/shop?category=${parentSlug}&subcategory=${childSlug}`);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-full">
      {/* Main category link - covers the image and title area */}
      <Link
        href={`/shop?category=${toSlug(item.parent)}`}
        className="flex-1 flex flex-col"
        aria-label={`Browse ${item.parent}`}
      >
        {/* Image section */}
        <div className="relative h-40 sm:h-48 md:h-56 w-full flex-shrink-0">
          {hasImage ? (
            <div className="h-full w-full p-2">
              <Image
                src={item.img as string}
                alt={item.parent}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-contain"
                priority={false}
              />
            </div>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-muted to-muted/60" />
          )}
        </div>

        {/* Unified text section with dark background - covers entire remaining area */}
        <div className="bg-gradient-to-t from-black/80 via-black/60 to-transparent px-4 sm:px-5 py-4 sm:py-5 text-center flex flex-col justify-end flex-1">
          <h3 className="text-white text-lg sm:text-xl font-semibold tracking-tight mb-3">
            {item.parent}
          </h3>

          {/* Subcategory tags integrated within the same dark background */}
          {childLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {childLabels.map(child => (
                <span
                  key={child}
                  onClick={e => handleSubcategoryClick(e, item.parent, child)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSubcategoryClick(e as any, item.parent, child);
                    }
                  }}
                  className="inline-flex cursor-pointer items-center rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-foreground hover:bg-white"
                >
                  {child}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default function CategoryShowcase({
  categories,
}: CategoryShowcaseProps) {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {categories.map(item => (
            <CategoryCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
