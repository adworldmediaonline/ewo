'use client';

import useCartInfo from '@/hooks/use-cart-info';
import { openCartMini } from '@/redux/features/cartSlice';
import { Heart, ShoppingCart, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthDialog from './auth-dialog';
import CartDropdown from './cart-dropdown';
import { authClient } from '@/lib/authClient';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
export interface HeaderActionsProps {
  showBadges?: boolean;
}

export function HeaderActions({
  showBadges = true,
}: HeaderActionsProps): React.ReactElement {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isPendingSignOut, startTransition] = React.useTransition();
  const dispatch = useDispatch();
  const { quantity } = useCartInfo();
  const wishlist: unknown[] = useSelector(
    (s: any) => s?.wishlist?.wishlist ?? []
  );
  const user = useSelector((s: any) => s?.auth?.user ?? null);

  function handleOpenCart() {
    dispatch(openCartMini());
  }

  // signout
  const handleSignOut = () => {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/sign-in'); // redirect to login page
          },
        },
      });
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

      {isPending ? (
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      ) : null}

      {session ? (
        // <Link
        //   href="/profile"
        //   aria-label="Account"
        //   className="inline-flex items-center gap-2 md:gap-3"
        // >
        //   <span className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-muted text-foreground">
        //     <UserIcon className="h-5 w-5 md:h-5 md:w-5" />
        //   </span>
        //   <div className="hidden md:flex flex-col leading-tight text-header-foreground">
        //     <span className="text-xs/4 opacity-80">Hi, Welcome</span>
        //     <span className="text-sm font-semibold">
        //       {user?.name || 'User'}
        //     </span>
        //   </div>
        // </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
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
              <Link href="/dashboard" className="flex items-center">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/change-password" className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Change Password</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={handleSignOut}
              disabled={isPendingSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isPendingSignOut ? 'Signing out...' : 'Sign out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      {!session && !isPending ? (
        // <AuthDialog>
        //   <button
        //     type="button"
        //     aria-label="Open login"
        //     className="inline-flex items-center gap-2 md:gap-3"
        //   >
        //     <span className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-muted text-foreground">
        //       <UserIcon className="h-5 w-5 md:h-5 md:w-5" />
        //     </span>
        //   </button>
        // </AuthDialog>
        // <div className="flex items-center space-x-2">
        //   <Button variant="ghost" asChild>
        //     <Link href="/sign-in">Sign in</Link>
        //   </Button>
        //   <Button asChild>
        //     <Link href="/sign-up">Sign up</Link>
        //   </Button>
        // </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="rounded-full relative inline-flex h-10 w-10 md:h-11 md:w-11 items-center justify-center border border-border bg-background text-foreground hover:bg-accent"
            >
              {/* <Avatar className="h-10 w-10">
                <AvatarImage src={''} alt={'user'} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {session.user.name
                    ? getInitials(session.user.name)
                    : session.user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar> */}

              <span className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-muted text-foreground">
                <UserIcon className="h-5 w-5 md:h-5 md:w-5" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            {/* <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel> */}

            <DropdownMenuItem asChild>
              <Link href="/sign-in" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Sign In</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/sign-up" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Sign Up</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

export default HeaderActions;
