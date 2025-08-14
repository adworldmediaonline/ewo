'use client';

import * as React from 'react';

export interface MegaCategoryItem {
  _id: string;
  parent: string;
  status?: string;
  products?: unknown[];
  children?: string[];
}

export interface ShopMenuMegaContentProps {
  categories: MegaCategoryItem[];
  onSelectCategory: (parent: string) => void;
  onSelectSubcategory: (parent: string, child: string) => void;
}

// A minimal, text-first mega menu: columns with category headings and subcategory pills
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
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map(cat => (
          <div key={cat._id} className="rounded-lg border border-border/40 p-4">
            <button
              type="button"
              onClick={() => onSelectCategory(cat.parent)}
              className="mb-3 w-full text-left text-sm font-bold uppercase tracking-wider hover:text-primary"
            >
              {cat.parent}
            </button>
            {Array.isArray(cat.children) && cat.children.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {cat.children.slice(0, 10).map((child, idx) => (
                  <button
                    key={`${cat._id}-${idx}`}
                    type="button"
                    onClick={() => onSelectSubcategory(cat.parent, child)}
                    className="inline-flex items-center rounded-full border border-border/50 bg-muted/20 px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
                  >
                    {child}
                  </button>
                ))}
                {cat.children.length > 10 && (
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.parent)}
                    className="inline-flex items-center rounded-full border border-border/50 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    View all
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                No subcategories
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
