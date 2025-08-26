'use client';

import ClientOnlyWrapper from '@/components/client-only-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useCartInfo from '@/hooks/use-cart-info';
import { authClient } from '@/lib/authClient';
import { Heart, LogOut, Settings, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CartDropdown from './cart-dropdown';

export interface HeaderActionsProps {
  showBadges?: boolean;
}

export function HeaderActions({
  showBadges = true,
}: HeaderActionsProps): React.ReactElement {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isPendingSignOut, startTransition] = React.useTransition();
  const _dispatch = useDispatch();
  const { quantity } = useCartInfo();
  const wishlist: unknown[] = useSelector(
    (s: any) => s?.wishlist?.wishlist ?? []
  );

  // signout
  const handleSignOut = () => {
    startTransition(async () => {
      await authClient.signOut();
      router.push('/sign-in'); // redirect to login page
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ClientOnlyWrapper
      fallback={
        <div className="flex items-center gap-2 md:gap-4">
          <div className="h-10 w-10 md:h-11 md:w-11 animate-pulse rounded-full bg-muted"></div>
          <div className="h-10 w-10 md:h-11 md:w-11 animate-pulse rounded-full bg-muted"></div>
          <div className="h-10 w-10 md:h-11 md:w-11 animate-pulse rounded-full bg-muted"></div>
        </div>
      }
    >
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

        {/* {isPending ? (
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : null} */}

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={session.user.image || ''}
                    alt={session.user.name || session.user.email}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {session.user.name
                      ? getInitials(session.user.name)
                      : session.user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={isPendingSignOut}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isPendingSignOut ? 'Signing out...' : 'Sign out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/sign-in"
            className="inline-flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-accent"
          >
            <User className="h-5 w-5 md:h-5 md:w-5" />
          </Link>
        )}
      </div>
    </ClientOnlyWrapper>
  );
}

export default HeaderActions;
