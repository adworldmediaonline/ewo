'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CategoryItem, toSlug } from '@/lib/server-data';

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

const getCategoryBadge = (category: CategoryItem) => {
  const count = category.products?.length ?? 0;
  if (!count) {
    return null;
  }

  return (
    <Badge variant="secondary" className="text-xs">
      {count}
    </Badge>
  );
};

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
    <aside className="hidden w-64 flex-shrink-0 lg:block">
      <div className="sticky top-24 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Filters</p>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        <Separator />

        <ScrollArea className="h-[calc(100vh-200px)] max-h-[600px] pr-2">
          <div className="space-y-2 pb-4">
            {categories.map(category => {
              const categorySlug = toSlug(category.parent);
              const isActiveCategory = categorySlug === activeCategory;

              return (
                <div key={category._id} className="space-y-1">
                  <Button
                    type="button"
                    variant={isActiveCategory ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onToggleCategory(categorySlug)}
                    className={cn(
                      'w-full justify-between text-left font-medium',
                      isActiveCategory && 'shadow-sm'
                    )}
                  >
                    <span className="truncate">{category.parent}</span>
                    {getCategoryBadge(category)}
                  </Button>

                  {isActiveCategory && category.children?.length ? (
                    <div className="ml-3 space-y-1 border-l border-border/60 pl-3">
                      {category.children.map(child => {
                        const childSlug = toSlug(child);
                        const isActiveChild = childSlug === activeSubcategory;

                        return (
                          <Button
                            key={`${category._id}-${child}`}
                            type="button"
                            variant={isActiveChild ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => onToggleSubcategory(childSlug)}
                            className={cn(
                              'w-full justify-start text-xs font-medium',
                              isActiveChild && 'shadow-sm'
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
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
};

export default ShopSidebar;

