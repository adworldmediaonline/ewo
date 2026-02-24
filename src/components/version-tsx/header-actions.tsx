'use client';

import ClientOnlyWrapper from '@/components/client-only-wrapper';
import { AuthDialog } from '@/components/auth/auth-dialog';
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
import { CartDrawer } from './cart-drawer';

export interface HeaderActionsProps {
  showBadges?: boolean;
}

export function HeaderActions({
  showBadges = true,
}: HeaderActionsProps): React.ReactElement {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isPendingSignOut, startTransition] = React.useTransition();
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const _dispatch = useDispatch();
  const { quantity } = useCartInfo();
  const wishlist: unknown[] = useSelector(
    (s: any) => s?.wishlist?.wishlist ?? []
  );

  // signout
  const handleSignOut = () => {
    startTransition(async () => {
      const currentPath = window.location.pathname;
      await authClient.signOut();

      if (currentPath.startsWith('/profile') || currentPath.startsWith('/settings')) {
        router.push('/');
      } else {
        router.refresh();
      }
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
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="h-8 w-8 md:h-9 md:w-9 animate-pulse rounded-full bg-muted"></div>
          <div className="h-8 w-8 md:h-9 md:w-9 animate-pulse rounded-full bg-muted"></div>
          <div className="h-8 w-8 md:h-9 md:w-9 animate-pulse rounded-full bg-muted"></div>
        </div>
      }
    >
      <div className="flex items-center gap-1.5 md:gap-2">
        <Link
          href="/wishlist"
          aria-label="Wishlist"
          className="relative inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-accent"
        >
          <Heart className="h-4 w-4 md:h-4 md:w-4" />
          {showBadges && wishlist.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-semibold text-primary-foreground">
              {wishlist.length}
            </span>
          )}
        </Link>

        <button
          aria-label="Cart"
          className="relative inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-accent"
          type="button"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="h-4 w-4 md:h-4 md:w-4" />
          {showBadges && quantity > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-semibold text-primary-foreground">
              {quantity}
            </span>
          )}
        </button>
        <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />

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
                className="relative h-8 w-8 md:h-9 md:w-9 rounded-full"
              >
                <Avatar className="h-8 w-8 md:h-9 md:w-9">
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
          <>
            <button
              onClick={() => setAuthDialogOpen(true)}
              aria-label="Sign in"
              className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-accent transition-colors"
          >
            <User className="h-4 w-4 md:h-4 md:w-4" />
            </button>
            <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
          </>
        )}
      </div>
    </ClientOnlyWrapper>
  );
}

export default HeaderActions;
