'use client';

import { NavigationMenuLink } from '@/components/ui/navigation-menu';
import * as React from 'react';
import { CldImage } from 'next-cloudinary';

export interface MegaCategoryItem {
  _id: string;
  parent: string;
  status?: string;
  products?: unknown[];
  children?: string[];
  img?: string;
}

export interface ShopMenuMegaContentProps {
  categories: MegaCategoryItem[];
  onSelectCategory: (parent: string) => void;
  onSelectSubcategory: (parent: string, child: string) => void;
}

// Beautiful card-based mega menu matching the category showcase design
export default function ShopMenuMegaContent({
  categories,
  onSelectCategory,
  onSelectSubcategory,
}: ShopMenuMegaContentProps): React.ReactElement {
  return (
    <div
      className="max-h-[min(80vh,28rem)] overflow-y-auto"
      role="menu"
      aria-label="Shop categories"
    >
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {categories.map(cat => {
          const imageUrl = cat.img;
          const hasImage = Boolean(imageUrl);
          const childLabels = Array.isArray(cat.children)
            ? cat.children.slice(0, 3)
            : [];
          const isCloudinaryAsset =
            typeof imageUrl === 'string' &&
            imageUrl.startsWith('https://res.cloudinary.com/') &&
            imageUrl.includes('/upload/');

          return (
            <div key={cat._id} className="group">
              <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <NavigationMenuLink asChild className="block">
                  <a href={`/shop?category=${cat.parent}`}>
                    <div className="relative h-40 sm:h-48 md:h-56 w-full">
                      {/* Background to avoid visible gaps when using object-contain */}
                      <div className="absolute inset-0 bg-background" />
                      {hasImage ? (
                        <div className="absolute inset-0 p-2">
                          <CldImage
                            src={imageUrl as string}
                            alt={cat.parent}
                            fill
                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 200px"
                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                            preserveTransformations={isCloudinaryAsset}
                            deliveryType={isCloudinaryAsset ? undefined : 'fetch'}
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-muted to-muted/60" />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute left-0 bottom-0 p-4 sm:p-5">
                        <h3 className="text-white text-lg sm:text-xl font-semibold tracking-tight">
                          {cat.parent}
                        </h3>
                      </div>
                    </div>
                  </a>
                </NavigationMenuLink>

                {/* Subcategories - positioned below the main card, outside the anchor tag */}
                {childLabels.length > 0 && (
                  <div className="p-4 sm:p-5 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {childLabels.map((child, index) => (
                        <NavigationMenuLink
                          key={index}
                          asChild
                          className="inline-flex cursor-pointer items-center rounded-full bg-muted/80 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
                        >
                          <a
                            href={`/shop?category=${cat.parent}&subcategory=${child}`}
                            onClick={e => {
                              e.stopPropagation();
                              onSelectSubcategory(cat.parent, child);
                            }}
                          >
                            {child}
                          </a>
                        </NavigationMenuLink>
                      ))}
                      {cat.children && cat.children.length > 3 && (
                        <NavigationMenuLink
                          asChild
                          className="inline-flex cursor-pointer items-center rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground/80 hover:bg-muted hover:text-foreground transition-colors duration-200"
                        >
                          <a
                            href={`/shop?category=${cat.parent}`}
                            onClick={e => {
                              e.stopPropagation();
                              onSelectCategory(cat.parent);
                            }}
                          >
                            +{cat.children.length - 3} more
                          </a>
                        </NavigationMenuLink>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
