
import { PRIMARY_LINKS } from '@/appdata/navigation';
import { Suspense } from 'react';

import DesktopNav from './desktop-nav';
import HeaderActions from './header-actions';
import HeaderBrand from './header-brand';
import HeaderMenuButton from './header-menu-button';
import HeaderSearch from './header-search';
import { getCategoriesShow } from '@/server/categories';


export default async function HeaderV2() {
  "use cache";
  // Header structure doesn't depend on categories - render immediately
  // DesktopNavWithCategories is a separate cached component
  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-header text-header-foreground border-b border-border">
        <div className="container mx-auto px-3 md:px-6">
          {/* Top row */}
          <div className="flex h-16 md:h-28 items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="md:hidden">
                <HeaderMenuButton links={PRIMARY_LINKS} />
              </div>
              <HeaderBrand />
            </div>

            {/* Desktop navigation inline on the same row */}
            {/* Separate cached component - categories cached, DesktopNav streams in */}
            {/* DesktopNav uses usePathname() which needs Suspense even though categories are cached */}
            <div className="hidden md:block shrink-0">
              <Suspense
                fallback={
                  <nav aria-label="Primary" className="hidden md:flex items-center gap-2">
                    <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
                    <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
                  </nav>
                }
              >
                <DesktopNavWithCategories />
              </Suspense>
            </div>

            {/* Centered search grows to fill remaining space on desktop */}
            <div className="hidden md:block flex-1 px-2">
              <HeaderSearch
                className="w-full max-w-3xl mx-auto"
              />
            </div>

            <div className="shrink-0">
              {/* HeaderActions is a client component with hooks - wrap in Suspense */}
              <Suspense
                fallback={
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="h-10 w-10 md:h-11 md:w-11 animate-pulse rounded-full bg-muted"></div>
                    <div className="h-10 w-10 md:h-11 md:w-11 animate-pulse rounded-full bg-muted"></div>
                    <div className="h-10 w-10 md:h-11 md:w-11 animate-pulse rounded-full bg-muted"></div>
                  </div>
                }
              >
                <HeaderActions />
              </Suspense>
            </div>
          </div>
          {/* Mobile search below the row */}
          <div className="md:hidden pb-3">
            <HeaderSearch className="w-full" />
          </div>
        </div>
      </header>
    </>
  );
}

// Separate cached component for DesktopNav with categories
// This allows HeaderV2 to prerender immediately without blocking on categories
async function DesktopNavWithCategories() {
  "use cache";
  const categories = await getCategoriesShow();
  // DesktopNav is a client component - can be passed directly to cached component
  return <DesktopNav categories={categories || []} />;
}
