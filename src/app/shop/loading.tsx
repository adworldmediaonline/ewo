import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import ShopLoadingFade from '@/features/shop/components/shop-loading-fade';
import Wrapper from '@/components/wrapper';

/**
 * Shop loading - fade-in placeholder for smoother navigation to /shop.
 * Uses minimal fade effect instead of skeleton blocks.
 */
export default function ShopLoading() {
  return (
    <Wrapper>
      <div className="container mx-auto px-3 py-6 md:px-6 md:py-8 animate-shop-fade-in">
        {/* Breadcrumb placeholder - minimal, no skeleton blocks */}
        <Breadcrumb className="mb-4 md:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <span className="h-4 w-12 inline-block bg-muted/10 rounded-sm" />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <span className="h-4 w-10 inline-block bg-muted/5 rounded-sm" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="py-2 lg:py-6">
          <div className="mb-4 lg:mb-6">
            <div className="h-12 w-full rounded-lg bg-muted/10" />
          </div>

          <div className="flex w-full items-start gap-4 lg:gap-8">
            <aside className="hidden lg:block w-56 shrink-0 self-start border-r border-border pr-6 space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-9 w-full rounded-md bg-muted/5" />
              ))}
            </aside>

            <section className="flex-1 space-y-6 min-w-0">
              <ShopLoadingFade count={12} />
            </section>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
