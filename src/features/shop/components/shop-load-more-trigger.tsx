'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

interface ShopLoadMoreTriggerProps {
  canFetchMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  hasProducts: boolean;
}

const ShopLoadMoreTrigger = forwardRef<HTMLDivElement, ShopLoadMoreTriggerProps>(
  ({ canFetchMore, isLoadingMore, onLoadMore, hasProducts }, ref) => {
    if (!hasProducts) {
      return null;
    }

    return (
      <div ref={ref} className="mt-10 flex flex-col items-center gap-4">
        {canFetchMore ? (
          isLoadingMore ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading more products...</span>
            </div>
          ) : (
            <Button variant="outline" onClick={onLoadMore}>
              Load More Products
            </Button>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            You've reached the end of all products.
          </p>
        )}
      </div>
    );
  }
);

ShopLoadMoreTrigger.displayName = 'ShopLoadMoreTrigger';

export default ShopLoadMoreTrigger;

