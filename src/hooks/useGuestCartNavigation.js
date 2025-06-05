'use client';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { showGuestCartModal } from '@/redux/features/guestCart/guestCartSlice';

export default function useGuestCartNavigation() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector(state => state.auth);
  const { cart_products } = useSelector(state => state.cart);

  // Check if we're on an auth page
  const isAuthPage =
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/email-verify') ||
    pathname.includes('/forgot') ||
    pathname.includes('/forget-password');

  const navigateToCart = () => {
    // If user is authenticated, navigate directly
    if (user) {
      router.push('/cart');
      return;
    }

    // If cart is empty, navigate directly (let cart page handle empty state)
    if (cart_products.length === 0) {
      router.push('/cart');
      return;
    }

    // If on auth page, navigate directly (don't show modal)
    if (isAuthPage) {
      router.push('/cart');
      return;
    }

    // If guest with items in cart, show modal
    dispatch(showGuestCartModal());
  };

  const navigateToCheckout = () => {
    // If user is authenticated, navigate directly
    if (user) {
      router.push('/checkout');
      return;
    }

    // If cart is empty, navigate to cart page instead
    if (cart_products.length === 0) {
      router.push('/cart');
      return;
    }

    // If on auth page, navigate directly (don't show modal)
    if (isAuthPage) {
      router.push('/checkout');
      return;
    }

    // If guest with items in cart, show modal
    dispatch(showGuestCartModal());
  };

  return {
    navigateToCart,
    navigateToCheckout,
    isAuthenticated: !!user,
    hasCartItems: cart_products.length > 0,
  };
}
