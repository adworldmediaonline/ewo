'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import { Search, X } from 'lucide-react';
import * as React from 'react';

export interface ShopFilters {
  search: string;
  category: string;
  subcategory: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ShopFiltersProps {
  filters: ShopFilters;
  onFiltersChange: (filters: ShopFilters) => void;
  onClearFilters: () => void;
}

const sortOptions = [
  { value: 'skuArrangementOrderNo-asc', label: 'Default Order' },
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'title-asc', label: 'Name: A to Z' },
  { value: 'title-desc', label: 'Name: Z to A' },
];

export default function ShopFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: ShopFiltersProps): React.ReactElement {
  const { data: categories } = useGetShowCategoryQuery('');
  const [localSearch, setLocalSearch] = React.useState(filters.search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: localSearch });
  };

  const handleCategoryChange = (category: string) => {
    const newCategory = filters.category === category ? '' : category;
    onFiltersChange({
      ...filters,
      category: newCategory,
      subcategory: '', // Reset subcategory when category changes
    });
  };

  const handleSubcategoryChange = (subcategory: string) => {
    const newSubcategory =
      filters.subcategory === subcategory ? '' : subcategory;
    onFiltersChange({ ...filters, subcategory: newSubcategory });
  };

  const handleSortChange = (sortBy: string) => {
    const [field, order] = sortBy.split('-');
    onFiltersChange({
      ...filters,
      sortBy: field,
      sortOrder: order as 'asc' | 'desc',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.subcategory ||
    filters.sortBy ||
    filters.sortOrder;

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
            onChange={e => setLocalSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Separator />

      {/* Sort Options */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Sort By</Label>
        <Select
          onValueChange={handleSortChange}
          value={`${filters.sortBy}-${filters.sortOrder}`}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a sort option" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Categories</Label>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {categories?.result?.map((cat: any) => (
              <Button
                key={cat._id}
                variant={filters.category === cat.parent ? 'default' : 'ghost'}
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
        </ScrollArea>
      </div>

      {/* Subcategories - Only show when a category is selected */}
      {filters.category && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label className="text-sm font-medium">Subcategories</Label>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {categories?.result
                  ?.find((cat: any) => cat.parent === filters.category)
                  ?.children?.map((subcat: string) => (
                    <Button
                      key={subcat}
                      variant={
                        filters.subcategory === subcat ? 'default' : 'ghost'
                      }
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleSubcategoryChange(subcat)}
                    >
                      {subcat}
                    </Button>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

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
