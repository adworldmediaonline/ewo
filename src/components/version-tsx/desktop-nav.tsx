'use client';

import { PRIMARY_LINKS } from '@/appdata/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Link from 'next/link';
import * as React from 'react';
import ShopMenuMegaContent from './shop-menu-mega-content';
import { usePathname } from 'next/navigation';
import type { CategoryItem } from '@/lib/server-data';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DesktopNavProps {
  categories: CategoryItem[];
}

const HOVER_CLOSE_DELAY_MS = 350;
const HOVER_ZONE_SELECTOR = '[data-shop-hover-zone]';

function isWithinHoverZone(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Node)) return false;
  const el = target as HTMLElement;
  return el.closest?.(HOVER_ZONE_SELECTOR) != null;
}

export default function DesktopNav({
  categories,
}: DesktopNavProps): React.ReactElement {
  const pathname = usePathname();
  const [shopOpen, setShopOpen] = React.useState(false);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = React.useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setShopOpen(false);
      closeTimerRef.current = null;
    }, HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const handleTriggerEnter = React.useCallback(() => {
    clearCloseTimer();
    setShopOpen(true);
  }, [clearCloseTimer]);

  const handleTriggerLeave = React.useCallback(
    (e: React.PointerEvent) => {
      if (isWithinHoverZone(e.relatedTarget)) return;
      scheduleClose();
    },
    [scheduleClose]
  );

  const handleContentEnter = React.useCallback(() => {
    clearCloseTimer();
  }, [clearCloseTimer]);

  const handleContentLeave = React.useCallback(
    (e: React.PointerEvent) => {
      if (isWithinHoverZone(e.relatedTarget)) return;
      scheduleClose();
    },
    [scheduleClose]
  );

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        clearCloseTimer();
        setShopOpen(false);
      }
    },
    [clearCloseTimer]
  );

  React.useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const visibleCategories = React.useMemo(
    () =>
      (categories || []).filter(
        (c) => (c.products?.length ?? 0) > 0 && c.status === 'Show'
      ),
    [categories]
  );

  return (
    <nav aria-label="Primary" className="hidden md:flex items-center gap-2">
      {/* First link (Home) */}
      <Link
        key={PRIMARY_LINKS[0].href}
        href={PRIMARY_LINKS[0].href}
        className={cn(
          'px-2 py-1 text-xs md:text-sm font-medium transition-colors',
          pathname === PRIMARY_LINKS[0].href
            ? 'text-primary-foreground'
            : 'text-muted-foreground hover:text-primary-foreground'
        )}
        aria-current={pathname === PRIMARY_LINKS[0].href ? 'page' : undefined}
      >
        {PRIMARY_LINKS[0].label}
      </Link>
      {/* Shop by Category - Popover opens on hover */}
      <div
        data-shop-hover-zone
        className="relative flex items-center py-1.5"
        onPointerEnter={handleTriggerEnter}
        onPointerLeave={handleTriggerLeave}
      >
        <Popover open={shopOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 text-xs md:text-sm font-medium transition-colors',
            'text-primary-foreground hover:text-primary-foreground',
            'focus-visible:ring-0 focus-visible:outline-none',
            shopOpen && 'text-primary-foreground'
          )}
          aria-label="Shop by Category"
          aria-expanded={shopOpen}
        >
          Shop by Category
          <ChevronDownIcon
            className={cn('size-3 transition-transform', shopOpen && 'rotate-180')}
            aria-hidden
          />
        </PopoverTrigger>
        <PopoverContent
          data-shop-hover-zone
          align="center"
          sideOffset={0}
          collisionPadding={16}
          onPointerEnter={handleContentEnter}
          onPointerLeave={handleContentLeave}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            'relative w-[min(calc(100vw-2rem),64rem)] max-w-[calc(100vw-2rem)]',
            'p-4 sm:p-5 md:p-6 rounded-xl border border-border shadow-xl',
            'overflow-x-hidden'
          )}
        >
          {/* Invisible bridge: extends hit area upward to cover gap between trigger and content */}
          <div
            className="absolute left-0 right-0 -top-12 h-12"
            aria-hidden
          />
          <ShopMenuMegaContent categories={visibleCategories} />
        </PopoverContent>
        </Popover>
      </div>
      {/* Remaining links after Shop */}
      {PRIMARY_LINKS.slice(1).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'px-2 py-1 text-xs md:text-sm font-medium transition-colors',
            pathname === link.href
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-primary-foreground'
          )}
          aria-current={pathname === link.href ? 'page' : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
