'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CategoryItem, toSlug } from '@/lib/server-data';
import { Filter } from 'lucide-react';

interface ShopMobileFiltersProps {
  categories: CategoryItem[];
  activeCategory: string;
  activeSubcategory: string;
  onToggleCategory: (slug: string) => void;
  onToggleSubcategory: (slug: string) => void;
  onReset: () => void;
  activeFiltersCount: number;
  hasActiveFilters: boolean;
}

const ShopMobileFilters = ({
  categories,
  activeCategory,
  activeSubcategory,
  onToggleCategory,
  onToggleSubcategory,
  onReset,
  activeFiltersCount,
  hasActiveFilters,
}: ShopMobileFiltersProps) => {
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    onReset();
    setOpen(false);
  };

  const handleCategoryClick = (slug: string) => {
    onToggleCategory(slug);
  };

  const handleSubcategoryClick = (slug: string) => {
    onToggleSubcategory(slug);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs px-3">
          <Filter className="h-3.5 w-3.5" />
          Filters
          {activeFiltersCount > 0 ? (
            <Badge variant="secondary" className="text-[10px] h-4 px-1 min-w-4">
              {activeFiltersCount}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="flex flex-col gap-0 p-0">
        <SheetHeader className="shrink-0 border-b border-border/80 px-4 py-3">
          <SheetTitle className="text-base font-semibold">Filters</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="space-y-3 px-4 py-4">
            {categories.map(category => {
              const categorySlug = toSlug(category.parent);
              const isActiveCategory = categorySlug === activeCategory;
              const productsCount = category.products?.length ?? 0;

              return (
                <div key={category._id} className="space-y-2">
                  <Button
                    type="button"
                    variant={isActiveCategory ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => handleCategoryClick(categorySlug)}
                  >
                    <span className="truncate text-left text-sm font-medium">
                      {category.parent}
                    </span>
                    {productsCount ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {productsCount}
                      </Badge>
                    ) : null}
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
                            className="w-full justify-start text-xs"
                            onClick={() => handleSubcategoryClick(childSlug)}
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

        <SheetFooter className="shrink-0 border-t border-border/80 px-4 py-3 flex-row gap-2">
          <Button type="button" onClick={() => setOpen(false)} className="flex-1">
            Apply Filters
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="flex-1"
          >
            Clear All
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ShopMobileFilters;

