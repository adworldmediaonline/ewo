'use client';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export default function ProductDetailsFixedBar({ productItem, onAddToCart, onProceedToBuy }) {
  const { status } = productItem || {};


  return (
    <>
      {/* Fixed Bottom Bar for Mobile - Add to Cart & Proceed to Buy */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-background border-t border-border shadow-lg"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0.75rem)' }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Add to Cart Button */}
            <Button
              onClick={() => onAddToCart?.(productItem)}
              disabled={status === 'out-of-stock'}
              variant="outline"
              size="lg"
              className="flex-1 h-12 text-base font-medium"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>

            {/* Proceed to Buy Button */}
            <Button
              onClick={() => onProceedToBuy?.(productItem)}
              disabled={status === 'out-of-stock'}
              size="lg"
              className="flex-1 h-12 text-base font-medium"
            >
              Proceed to Buy
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed bar on mobile */}
      <div className="h-20 md:h-0" />
    </>
  );
}

