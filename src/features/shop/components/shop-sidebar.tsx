'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CategoryItem, toSlug } from '@/lib/server-data';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ShopSidebarProps {
  categories: CategoryItem[];
  activeCategory: string;
  activeSubcategory: string;
  onToggleCategory: (slug: string) => void;
  onToggleSubcategory: (slug: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
}

const ShopSidebar = ({
  categories,
  activeCategory,
  activeSubcategory,
  onToggleCategory,
  onToggleSubcategory,
  onReset,
  hasActiveFilters,
  activeFiltersCount,
}: ShopSidebarProps) => {
  if (!categories.length) {
    return null;
  }

  return (
    <aside className="hidden w-56 shrink-0 self-start border-r border-border pr-6 lg:block lg:sticky lg:top-[10rem]">
      <div className="py-1">
        <nav className="space-y-0.5" aria-label="Product categories">
          {categories.map((category) => {
            const categorySlug = toSlug(category.parent);
            const isActiveCategory = categorySlug === activeCategory;

            const hasChildren = Boolean(category.children?.length);

            return (
              <div key={category._id} className="space-y-0.5">
                <Button
                  type="button"
                  variant={isActiveCategory ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onToggleCategory(categorySlug)}
                  className={cn(
                    'min-h-9 h-auto w-full justify-between px-3 py-2 text-left text-sm font-medium whitespace-normal wrap-break-word gap-2',
                    isActiveCategory && 'shadow-sm',
                    !isActiveCategory && 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  <span>{category.parent}</span>
                  {hasChildren && (
                    <span
                      className={cn(
                        'shrink-0 flex items-center',
                        isActiveCategory ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      )}
                      aria-hidden
                    >
                      {isActiveCategory ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </Button>

                {isActiveCategory && category.children?.length ? (
                  <div className="ml-3 space-y-0.5 border-l-2 border-border/50 pl-3">
                    {category.children.map((child) => {
                      const childSlug = toSlug(child);
                      const activeSlugs = activeSubcategory
                        ? activeSubcategory.split(',').map((s) => s.trim()).filter(Boolean)
                        : [];
                      const isActiveChild = activeSlugs.includes(childSlug);

                      return (
                        <Button
                          key={`${category._id}-${child}`}
                          type="button"
                          variant={isActiveChild ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => onToggleSubcategory(childSlug)}
                          className={cn(
                            'min-h-8 h-auto w-full justify-start px-3 py-2 text-left text-xs font-medium whitespace-normal wrap-break-word',
                            !isActiveChild && 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          )}
                        >
                          {child}
                        </Button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default ShopSidebar;

