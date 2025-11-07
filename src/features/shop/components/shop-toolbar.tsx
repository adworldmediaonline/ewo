'use client';

import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [searchValue, setSearchValue] = useState(initialSearch);

  // Sync local search value with external changes (e.g., clear filters)
  useEffect(() => {
    setSearchValue(initialSearch);
  }, [initialSearch]);

  // Debounce search commits
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue.trim() !== initialSearch) {
        onSearchCommit(searchValue.trim());
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchValue, initialSearch, onSearchCommit]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-1 sm:flex-row sm:items-center">
        <Input
          value={searchValue}
          onChange={event => setSearchValue(event.target.value)}
          placeholder="Search products..."
          className="h-10 w-full sm:max-w-sm"
          aria-label="Search products"
        />

        <Select value={sortKey} onValueChange={onSortChange}>
          <SelectTrigger className="h-10 w-full sm:w-52">
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

      <div className="flex items-center justify-between gap-3 sm:justify-end">
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
  );
};

export default ShopToolbar;

