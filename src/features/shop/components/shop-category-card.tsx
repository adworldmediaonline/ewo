'use client';

import Link from 'next/link';
import Image from 'next/image';
import { toSlug } from '@/lib/server-data';
import type { CategoryItem } from '@/lib/server-data';

const DESCRIPTION_MAX_LENGTH = 120;

interface ShopCategoryCardProps {
  category: CategoryItem;
  index?: number;
}

function truncateDescription(text: string | undefined, maxLen: number): string {
  if (!text?.trim()) return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen).trim()}…`;
}

export function ShopCategoryCard({ category, index = 0 }: ShopCategoryCardProps) {
  const imageUrl = category.image?.url || category.img;
  const imageAlt = category.image?.altText || category.image?.title || category.parent;
  const imageTitle = category.image?.title || category.parent;
  const imageFileName = category.image?.fileName;
  const hasImage = Boolean(imageUrl);
  const slug = toSlug(category.parent);
  const description = truncateDescription(
    category.description || category.bannerDescription,
    DESCRIPTION_MAX_LENGTH
  );

  return (
    <Link
      href={`/shop/${slug}`}
      className="group flex flex-col overflow-hidden rounded-lg sm:rounded-xl border border-border bg-card text-left shadow-sm transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-full"
      aria-label={`Browse ${category.parent}`}
    >
      <div className="relative w-full shrink-0 h-32 sm:h-40 md:h-48 lg:h-56">
        {hasImage ? (
          <div className="relative h-full w-full p-1.5 sm:p-2">
            <Image
              src={`/api/image?url=${encodeURIComponent(imageUrl as string)}&filename=${encodeURIComponent(imageFileName || `${slug}.webp`)}`}
              alt={imageAlt}
              title={imageTitle}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain"
              loading={index < 4 ? 'eager' : 'lazy'}
              priority={index < 4}
              unoptimized
            />
          </div>
        ) : (
          <div className="h-full w-full bg-linear-to-br from-muted to-muted/60" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-5">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold tracking-tight text-foreground mb-1 sm:mb-2 line-clamp-2">
          {category.parent}
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
