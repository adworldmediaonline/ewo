import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import Wrapper from '@/components/wrapper';

/**
 * Shop loading skeleton - shows instantly when navigating to /shop.
 * Mimics breadcrumb, sidebar, toolbar, and product grid to avoid empty-screen UX.
 */
export default function ShopLoading() {
  return (
    <Wrapper>
      <div className="container mx-auto px-3 py-6 md:px-6 md:py-8">
        {/* Breadcrumb skeleton */}
        <Breadcrumb className="mb-4 md:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Skeleton className="h-4 w-12" />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Skeleton className="h-4 w-10" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex w-full gap-2 lg:gap-4 py-2 lg:py-6">
          {/* Sidebar skeleton - hidden on mobile */}
          <aside className="hidden lg:block w-56 shrink-0 space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </aside>

          <section className="flex-1 space-y-6 min-w-0">
            {/* Toolbar skeleton */}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <Skeleton className="h-10 w-full sm:w-64" />
              <Skeleton className="h-10 w-36" />
            </div>

            {/* Product grid skeleton - 12 cards to match initial page size */}
            <div
              className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-3 lg:grid-cols-3 xl:grid-cols-4"
              role="status"
              aria-label="Loading products"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </Wrapper>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
      <div className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
