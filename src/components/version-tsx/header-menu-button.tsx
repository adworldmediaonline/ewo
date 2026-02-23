'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ArrowRight, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { processCategoriesForShowcase } from '@/lib/process-categories-for-showcase';
import type { CategoryItem } from '@/lib/server-data';
import { API_ENDPOINT } from '@/server/api-endpoint';
import { CategoryCard } from './categories/category-card';

export interface HeaderMenuButtonProps {
  links: { href: string; label: string }[];
  categories?: CategoryItem[];
}

/** Match desktop: Show categories with products */
const visibleCategoriesFilter = (c: CategoryItem) =>
  (c.products?.length ?? 0) > 0 && (c.status === 'Show' || !c.status);

const fetchCategoriesClient = async (): Promise<CategoryItem[]> => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!base) return [];
  try {
    const res = await fetch(`${base}${API_ENDPOINT.CATEGORIES}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.result) ? data.result : [];
  } catch {
    return [];
  }
};

export function HeaderMenuButton({
  links,
  categories = [],
}: HeaderMenuButtonProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [clientCategories, setClientCategories] = React.useState<
    CategoryItem[]
  >([]);
  const pathname = usePathname();

  const handleLinkClick = React.useCallback(() => {
    setOpen(false);
  }, []);

  // Close sheet when route changes (e.g. after main nav or category link click)
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleCategorySectionClick = React.useCallback(() => {
    setOpen(false);
  }, []);

  // Fallback: fetch categories on client when sheet opens and server passed none
  React.useEffect(() => {
    if (!open) return;
    if ((categories?.length ?? 0) > 0) return;
    let cancelled = false;
    fetchCategoriesClient().then((data) => {
      if (!cancelled) setClientCategories(data);
    });
    return () => {
      cancelled = true;
    };
  }, [open, categories?.length]);

  const allCategories = React.useMemo(() => {
    const fromServer = categories ?? [];
    if (fromServer.length > 0) return fromServer;
    return clientCategories;
  }, [categories, clientCategories]);

  const visibleCategories = React.useMemo(
    () => (allCategories || []).filter(visibleCategoriesFilter),
    [allCategories]
  );

  const processedCategories = React.useMemo(
    () => processCategoriesForShowcase(visibleCategories),
    [visibleCategories]
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
          <span className="hidden sm:inline">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-[min(320px,90vw)] max-w-full flex-col border-r bg-background p-0"
      >
        <SheetHeader className="shrink-0 border-b px-4 py-4">
          <SheetTitle className="text-left text-lg font-semibold">
            Menu
          </SheetTitle>
        </SheetHeader>
        <nav
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
          aria-label="Mobile menu"
        >
          {/* Primary links */}
          <div className="shrink-0 px-2 py-3">
            {links.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-[48px] items-center rounded-lg px-3 py-3 text-base font-medium transition-colors duration-200 active:scale-[0.98] ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-muted/80'
                  }`}
                  onClick={handleLinkClick}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Shop by Category - same design as desktop dropdown with images */}
          <div
            className="shrink-0 border-t border-border/80 px-3 py-4"
            onClick={handleCategorySectionClick}
          >
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shop by Category
            </h3>
            {processedCategories.length > 0 ? (
              <div
                className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3"
                role="list"
                aria-label="Shop categories"
              >
                {processedCategories.map((item, index) => (
                  <CategoryCard
                    key={item._id}
                    item={item}
                    index={index}
                    variant="mega"
                    onNavigate={handleCategorySectionClick}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col overflow-hidden rounded-lg border border-border bg-muted/40"
                    aria-hidden
                  >
                    <div className="aspect-[4/3] animate-pulse bg-muted/60" />
                    <div className="h-6 animate-pulse bg-muted/40" />
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/shop"
              className="mt-4 flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              onClick={handleLinkClick}
              aria-label="Explore all categories"
            >
              Explore all
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default HeaderMenuButton;
