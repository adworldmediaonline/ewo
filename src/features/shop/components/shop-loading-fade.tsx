'use client';

interface ShopLoadingFadeProps {
  /** Number of placeholder slots (default: 8) */
  count?: number;
}

/**
 * Fade-in loading placeholder for the shop product grid.
 * Pure opacity fade - no skeleton blocks, no pulse, no blocky shapes.
 */
export default function ShopLoadingFade({
  count = 8,
}: ShopLoadingFadeProps): React.ReactElement {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6 animate-shop-fade-in"
      role="status"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-border/10 bg-card/50"
        >
          <div className="aspect-square w-full" />
          <div className="p-4 space-y-2">
            <div className="h-5 w-20" />
            <div className="h-4 w-full" />
            <div className="h-4 w-3/4" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-16" />
              <div className="h-4 w-12" />
            </div>
          </div>
          <div className="p-4 pt-0">
            <div className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
