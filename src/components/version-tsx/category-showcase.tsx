'use client';

import { Button } from '@/components/ui/button';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

interface ApiCategoryItem {
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

function toSlug(label: string): string {
  if (!label) return '';
  return label
    .toLowerCase()
    .replace(/&/g, 'and') // Replace & with 'and' for better URL readability
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

interface CategoryCardProps {
  item: ApiCategoryItem;
  onClick: (parent: string) => void;
  onClickChild: (parent: string, child: string) => void;
}

const CategoryCard = ({ item, onClick, onClickChild }: CategoryCardProps) => {
  const hasImage = Boolean(item.img);
  const childLabels = Array.isArray(item.children)
    ? item.children.slice(0, 3)
    : [];

  return (
    <button
      type="button"
      onClick={() => onClick(item.parent)}
      aria-label={`Browse ${item.parent}`}
      className="group relative overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative h-40 sm:h-48 md:h-56 w-full">
        {/* Background to avoid visible gaps when using object-contain */}
        <div className="absolute inset-0 bg-background" />
        {hasImage ? (
          <div className="absolute inset-0 p-2">
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
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-0 bottom-0 p-4 sm:p-5">
          <h3 className="text-white text-lg sm:text-xl font-semibold tracking-tight">
            {item.parent}
          </h3>
          {childLabels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {childLabels.map(child => (
                <span
                  key={child}
                  onClick={e => {
                    e.stopPropagation();
                    onClickChild(item.parent, child);
                  }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onClickChild(item.parent, child);
                    }
                  }}
                  className="inline-flex cursor-pointer items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-white"
                >
                  {child}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

const CategoryCardSkeleton = () => (
  <div className="relative h-40 sm:h-48 md:h-56 w-full overflow-hidden rounded-xl border border-border bg-muted/40 animate-pulse" />
);

export default function CategoryShowcase() {
  const { data, isLoading, isError } =
    useGetShowCategoryQuery('category-showcase');
  const router = useRouter();

  const items: ApiCategoryItem[] = React.useMemo(() => {
    const result = (data as any)?.result ?? (data as any) ?? [];
    return Array.isArray(result)
      ? (result as ApiCategoryItem[]).filter(
          c => (c.products?.length ?? 0) > 0 && c.status === 'Show'
        )
      : [];
  }, [data]);

  const handleParent = (parent: string) => {
    const slug = toSlug(parent);
    router.push(`/shop?category=${slug}`);
  };

  const handleChild = (parent: string, child: string) => {
    const parentSlug = toSlug(parent);
    const childSlug = toSlug(child);
    router.push(`/shop?category=${parentSlug}&subcategory=${childSlug}`);
  };

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
            <Link href="/shop" aria-label="Explore all categories">
              Explore all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isError && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
            Failed to load categories.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))
            : items.map(item => (
                <CategoryCard
                  key={item._id}
                  item={item}
                  onClick={handleParent}
                  onClickChild={handleChild}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
