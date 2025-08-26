'use client';

import { PRIMARY_LINKS } from '@/appdata/navigation';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import Link from 'next/link';
import * as React from 'react';
import { CategoryItem as MenuCategoryItem } from './shop-menu-content';
import ShopMenuMegaContent from './shop-menu-mega-content';

export interface DesktopNavProps {
  pathname: string;
  categories: MenuCategoryItem[];
  onSelectCategory: (parent: string) => void;
  onSelectSubcategory: (parent: string, child: string) => void;
}

export default function DesktopNav({
  pathname,
  categories,
  onSelectCategory,
  onSelectSubcategory,
}: DesktopNavProps): React.ReactElement {
  const visibleCategories = React.useMemo(
    () =>
      (categories || []).filter(
        c => (c.products?.length ?? 0) > 0 && c.status === 'Show'
      ),
    [categories]
  );

  return (
    <nav aria-label="Primary" className="hidden md:flex items-center gap-2">
      {/* First link (Home) */}
      <Link
        key={PRIMARY_LINKS[0].href}
        href={PRIMARY_LINKS[0].href}
        className={`px-2 py-1 text-xs md:text-sm font-medium transition-colors ${
          pathname === PRIMARY_LINKS[0].href
            ? 'text-primary-foreground'
            : 'text-muted-foreground hover:text-primary-foreground'
        }`}
        aria-current={pathname === PRIMARY_LINKS[0].href ? 'page' : undefined}
      >
        {PRIMARY_LINKS[0].label}
      </Link>
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="px-2 py-1 text-xs md:text-sm font-medium !text-primary-foreground hover:!text-primary-foreground focus:!text-primary-foreground data-[state=open]:!text-primary-foreground !bg-transparent !hover:bg-transparent !focus:bg-transparent data-[state=open]:!bg-transparent !h-auto !w-auto !rounded-none shadow-none focus-visible:ring-0 focus-visible:outline-none">
              Shop
            </NavigationMenuTrigger>
            <NavigationMenuContent className="w-[min(95vw,64rem)] md:w-[64rem] p-5 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
              {/* Toggle between two styles by swapping components */}
              <ShopMenuMegaContent
                categories={visibleCategories}
                onSelectCategory={onSelectCategory}
                onSelectSubcategory={onSelectSubcategory}
              />
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport className="border border-border bg-popover text-popover-foreground rounded-md shadow-lg" />
      </NavigationMenu>
      {/* Remaining links after Shop */}
      {PRIMARY_LINKS.slice(1).map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-2 py-1 text-xs md:text-sm font-medium transition-colors ${
            pathname === link.href
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-primary-foreground'
          }`}
          aria-current={pathname === link.href ? 'page' : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
