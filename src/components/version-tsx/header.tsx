'use client';

import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { PRIMARY_LINKS } from '@/appdata/navigation';
import useCartInfo from '@/hooks/use-cart-info';
// import { openCartMini } from '@/redux/features/cartSlice';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
// import CartMiniSheet from './cart-mini-sheet';
import DesktopNav from './desktop-nav';
import HeaderActions from './header-actions';
import HeaderBrand from './header-brand';
import HeaderMenuButton from './header-menu-button';
import HeaderSearch from './header-search';
import { CategoryItem as MenuCategoryItem } from './shop-menu-content';

// Consistent slug generation function
function toSlug(label: string): string {
  if (!label) return '';
  return label
    .toLowerCase()
    .replace(/&/g, 'and') // Replace & with 'and' for better URL readability
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// interface CategoryItem {
//   _id: string;
//   parent: string;
//   status?: string;
//   products?: unknown[];
//   children?: string[];
//   img?: string;
// }

export default function HeaderV2(): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const _dispatch = useDispatch();

  const _wishlist: unknown[] = useSelector(
    (s: any) => s?.wishlist?.wishlist ?? []
  );
  const _user: { name?: string; imageURL?: string } | null = useSelector(
    (s: any) => s?.auth?.user ?? null
  );
  const _quantity = useCartInfo();

  const { data } = useGetShowCategoryQuery(undefined as unknown as void);
  const categories: MenuCategoryItem[] = (data?.result ??
    []) as MenuCategoryItem[];
  const _visibleCategories = categories.filter(
    c => (c.products?.length ?? 0) > 0 && c.status === 'Show'
  );

  const mobileSearchRef = React.useRef<HTMLInputElement>(null);
  const desktopSearchRef = React.useRef<HTMLInputElement>(null);

  // function handleOpenCart(): void {
  //   dispatch(openCartMini());
  // }

  function handleCategoryRoute(title: string): void {
    const slug = toSlug(title);
    router.push(`/shop?category=${slug}`);
  }

  function handleChildCategoryRoute(parent: string, child: string): void {
    const parentSlug = toSlug(parent);
    const childSlug = toSlug(child);
    router.push(`/shop?category=${parentSlug}&subcategory=${childSlug}`);
  }

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
            <div className="hidden md:block shrink-0">
              <DesktopNav
                pathname={pathname}
                categories={categories}
                onSelectCategory={handleCategoryRoute}
                onSelectSubcategory={handleChildCategoryRoute}
              />
            </div>

            {/* Centered search grows to fill remaining space on desktop */}
            <div className="hidden md:block flex-1 px-2">
              <HeaderSearch
                inputRef={desktopSearchRef}
                className="w-full max-w-3xl mx-auto"
              />
            </div>

            <div className="shrink-0">
              <HeaderActions />
            </div>
          </div>
          {/* Mobile search below the row */}
          <div className="md:hidden pb-3">
            <HeaderSearch inputRef={mobileSearchRef} className="w-full" />
          </div>
        </div>
      </header>
      {/* <CartMiniSheet /> */}
    </>
  );
}
