'use client';

import Image from 'next/image';
import * as React from 'react';

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
          const hasImage = Boolean(cat.img);
          const childLabels = Array.isArray(cat.children)
            ? cat.children.slice(0, 3)
            : [];

          return (
            <div key={cat._id} className="group">
              <button
                type="button"
                onClick={() => onSelectCategory(cat.parent)}
                aria-label={`Browse ${cat.parent}`}
                className="relative w-full overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="relative h-40 sm:h-48 md:h-56 w-full">
                  {/* Background to avoid visible gaps when using object-contain */}
                  <div className="absolute inset-0 bg-background" />
                  {hasImage ? (
                    <div className="absolute inset-0 p-2">
                      <Image
                        src={cat.img as string}
                        alt={cat.parent}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 200px"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        priority={false}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/60" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute left-0 bottom-0 p-4 sm:p-5">
                    <h3 className="text-white text-lg sm:text-xl font-semibold tracking-tight">
                      {cat.parent}
                    </h3>
                    {childLabels.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {childLabels.map(child => (
                          <span
                            key={child}
                            onClick={e => {
                              e.stopPropagation();
                              onSelectSubcategory(cat.parent, child);
                            }}
                            role="link"
                            tabIndex={0}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelectSubcategory(cat.parent, child);
                              }
                            }}
                            className="inline-flex cursor-pointer items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-white transition-colors duration-200"
                          >
                            {child}
                          </span>
                        ))}
                        {cat.children && cat.children.length > 3 && (
                          <span
                            onClick={e => {
                              e.stopPropagation();
                              onSelectCategory(cat.parent);
                            }}
                            role="link"
                            tabIndex={0}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelectCategory(cat.parent);
                              }
                            }}
                            className="inline-flex cursor-pointer items-center rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-foreground/80 hover:bg-white hover:text-foreground transition-colors duration-200"
                          >
                            +{cat.children.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
