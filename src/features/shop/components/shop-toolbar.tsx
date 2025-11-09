'use client';

import DebouncedSearchInput from '@/components/common/debounced-search-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SHOP_SORT_OPTIONS } from '../shop-types';

interface ShopToolbarProps {
  initialSearch: string;
  onSearchCommit: (value: string) => void;
  sortKey: string;
  onSortChange: (value: string) => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  onClearFilters: () => void;
  totalProducts?: number;
}

const ShopToolbar = ({
  initialSearch,
  onSearchCommit,
  sortKey,
  onSortChange,
  hasActiveFilters,
  activeFiltersCount,
  onClearFilters,
  totalProducts,
}: ShopToolbarProps) => {

  return (
    <div className="flex flex-col gap-2 sm:gap-4">
      {/* Mobile: Everything in single compact row */}
      <div className="flex items-center gap-1.5 sm:hidden">
        <DebouncedSearchInput
          initialValue={initialSearch}
          onSearchChange={onSearchCommit}
          placeholder="Search..."
          className="h-9 flex-1 min-w-0 text-xs"
        />

        <Select value={sortKey} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 w-[90px] text-[10px] px-2">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SHOP_SORT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:border-destructive hover:bg-destructive/5 shrink-0"
            aria-label={`Clear ${activeFiltersCount} filters`}
          >
            <span className="text-xs font-bold">×</span>
          </Button>
        ) : typeof totalProducts === 'number' ? (
          <Badge
            variant="outline"
            className="h-9 inline-flex items-center px-2 text-[10px] font-medium shrink-0 whitespace-nowrap"
          >
            {totalProducts}
          </Badge>
        ) : null}
      </div>

      {/* Desktop: Original layout */}
      <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-row items-center gap-3">
          <DebouncedSearchInput
            initialValue={initialSearch}
            onSearchChange={onSearchCommit}
            placeholder="Search products..."
            className="h-10 w-full max-w-sm"
          />

          <Select value={sortKey} onValueChange={onSortChange}>
            <SelectTrigger className="h-10 w-52">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SHOP_SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-3">
          {typeof totalProducts === 'number' ? (
            <Badge
              variant="outline"
              className="h-10 inline-flex items-center px-4 text-sm font-medium"
            >
              {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
            </Badge>
          ) : null}

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={onClearFilters}
              className="h-10 px-4 text-sm font-medium text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/5"
            >
              Clear ({activeFiltersCount})
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ShopToolbar;

