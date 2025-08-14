'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import * as React from 'react';

export interface ShopFilters {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ShopFiltersProps {
  filters: ShopFilters;
  onFiltersChange: (filters: ShopFilters) => void;
  onClearFilters: () => void;
}

const sortOptions = [
  { value: 'createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price' },
  { value: 'title', label: 'Name' },
];

export default function ShopFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: ShopFiltersProps): React.ReactElement {
  const { data: categories } = useGetShowCategoryQuery();
  const [localSearch, setLocalSearch] = React.useState(filters.search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: localSearch });
  };

  const handleCategoryChange = (category: string) => {
    const newCategory = filters.category === category ? '' : category;
    onFiltersChange({ ...filters, category: newCategory });
  };

  const handlePriceChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      minPrice: values[0],
      maxPrice: values[1]
    });
  };

  const handleSortChange = (sortBy: string) => {
    const [field, order] = sortBy.split('-');
    onFiltersChange({
      ...filters,
      sortBy: field,
      sortOrder: order as 'asc' | 'desc'
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.minPrice > 0 || filters.maxPrice < 1000;

  return (
    <div className="w-full space-y-6">
      {/* Search */}
      <div className="space-y-3">
        <Label htmlFor="search" className="text-sm font-medium">
          Search Products
        </Label>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            id="search"
            placeholder="Search products..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Categories</Label>
        <div className="space-y-2">
          {categories?.result?.map((cat: any) => (
            <Button
              key={cat._id}
              variant={filters.category === cat.parent ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => handleCategoryChange(cat.parent)}
            >
              {cat.parent}
              {cat.products?.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {cat.products.length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="px-2">
          <Slider
            value={[filters.minPrice, filters.maxPrice]}
            onValueChange={handlePriceChange}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>${filters.minPrice}</span>
            <span>${filters.maxPrice}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Sort Options */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Sort By</Label>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.sortBy === option.value ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => handleSortChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onClearFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );
}
