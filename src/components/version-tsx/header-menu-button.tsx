'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ChevronRight, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { processCategoriesForShowcase } from '@/lib/process-categories-for-showcase';
import type { CategoryItem } from '@/lib/server-data';
import { API_ENDPOINT } from '@/server/api-endpoint';

export interface HeaderMenuButtonProps {
  links: { href: string; label: string }[];
  categories?: CategoryItem[];
}

/** Use all Show categories – API already returns only Show; match homepage behavior */
const visibleCategoriesFilter = (c: CategoryItem) =>
  (c.status === 'Show' || !c.status);

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

          {/* Shop by Category */}
          <div className="shrink-0 border-t border-border/80 px-2 py-4">
            <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shop by Category
            </h3>
            {processedCategories.length > 0 ? (
              <ul className="space-y-1" role="list">
                {processedCategories.map((item) => {
                  const hasSubcategoryLink =
                    item.parentCategorySlug && item.subcategorySlug;
                  const href = hasSubcategoryLink
                    ? `/shop?category=${item.parentCategorySlug}&subcategory=${item.subcategorySlug}`
                    : `/shop?category=${item.parentCategorySlug ?? ''}`;
                  const childLabels = Array.isArray(item.children)
                    ? item.children.slice(0, 3)
                    : [];
                  return (
                    <li key={item._id}>
                      <Link
                        href={href}
                        className="flex min-h-[48px] items-center justify-between gap-2 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted/80 active:scale-[0.98]"
                        onClick={handleLinkClick}
                        aria-label={`Browse ${item.parent}`}
                      >
                        <span className="min-w-0 flex-1 whitespace-normal wrap-break-word text-left">
                          {item.parent}
                          {childLabels.length > 0 && (
                            <span className="ml-1 text-muted-foreground">
                              · {childLabels.join(', ')}
                            </span>
                          )}
                        </span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="space-y-1 px-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-lg bg-muted/60"
                    aria-hidden
                  />
                ))}
              </div>
            )}
            <Link
              href="/shop"
              className="mt-3 flex min-h-[48px] items-center justify-between gap-2 rounded-lg px-3 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              onClick={handleLinkClick}
              aria-label="Explore all categories"
            >
              Explore all
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default HeaderMenuButton;
