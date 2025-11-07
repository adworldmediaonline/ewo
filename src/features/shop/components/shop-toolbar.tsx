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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchCommit(searchValue.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchValue, onSearchCommit]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-1 sm:flex-row">
        <Input
          value={searchValue}
          onChange={event => setSearchValue(event.target.value)}
          placeholder="Search products..."
          className="h-11 w-full sm:max-w-xs"
          aria-label="Search products"
        />

        <Select value={sortKey} onValueChange={onSortChange}>
          <SelectTrigger className="h-11 sm:w-56">
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

      <div className="flex items-center justify-between gap-2">
        {typeof totalProducts === 'number' ? (
          <Badge variant="outline" className="hidden sm:inline-flex">
            {totalProducts} products
          </Badge>
        ) : null}

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            Clear ({activeFiltersCount})
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default ShopToolbar;

