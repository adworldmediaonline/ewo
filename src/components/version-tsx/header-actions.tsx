'use client';

import useCartInfo from '@/hooks/use-cart-info';
import { openCartMini } from '@/redux/features/cartSlice';
import { Heart, ShoppingCart, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthDialog from './auth-dialog';
import CartDropdown from './cart-dropdown';

export interface HeaderActionsProps {
  showBadges?: boolean;
}

export function HeaderActions({
  showBadges = true,
}: HeaderActionsProps): React.ReactElement {
  const dispatch = useDispatch();
  const { quantity } = useCartInfo();
  const wishlist: unknown[] = useSelector(
    (s: any) => s?.wishlist?.wishlist ?? []
  );
  const user = useSelector((s: any) => s?.auth?.user ?? null);

  function handleOpenCart() {
    dispatch(openCartMini());
  }

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <Link
        href="/wishlist"
        aria-label="Wishlist"
        className="relative inline-flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-accent"
      >
        <Heart className="h-5 w-5 md:h-5 md:w-5" />
        {showBadges && wishlist.length > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {wishlist.length}
          </span>
        )}
      </Link>

      <CartDropdown>
        <button
          aria-label="Cart"
          className="relative inline-flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-accent"
          type="button"
        >
          <ShoppingCart className="h-5 w-5 md:h-5 md:w-5" />
          {showBadges && quantity > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {quantity}
            </span>
          )}
        </button>
      </CartDropdown>

      {user ? (
        <Link
          href="/profile"
          aria-label="Account"
          className="inline-flex items-center gap-2 md:gap-3"
        >
          <span className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-muted text-foreground">
            <UserIcon className="h-5 w-5 md:h-5 md:w-5" />
          </span>
          <div className="hidden md:flex flex-col leading-tight text-header-foreground">
            <span className="text-xs/4 opacity-80">Hi, Welcome</span>
            <span className="text-sm font-semibold">
              {user?.name || 'User'}
            </span>
          </div>
        </Link>
      ) : (
        <AuthDialog>
          <button
            type="button"
            aria-label="Open login"
            className="inline-flex items-center gap-2 md:gap-3"
          >
            <span className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-muted text-foreground">
              <UserIcon className="h-5 w-5 md:h-5 md:w-5" />
            </span>
          </button>
        </AuthDialog>
      )}
    </div>
  );
}

export default HeaderActions;
