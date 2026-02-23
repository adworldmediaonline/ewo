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

        <div className="py-2 lg:py-6">
          {/* Toolbar skeleton - full width above */}
          <div className="mb-4 lg:mb-6">
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          <div className="flex w-full items-start gap-4 lg:gap-8">
            {/* Sidebar skeleton - hidden on mobile */}
            <aside className="hidden lg:block w-56 shrink-0 self-start border-r border-border pr-6 space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </aside>

            <section className="flex-1 space-y-6 min-w-0">
              {/* Product grid skeleton - 12 cards to match initial page size */}
              <div
                className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6"
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
