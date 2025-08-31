'use client';
import { navigateToCheckoutWithCoupon as navigateWithCoupon } from '@/utils/coupon-auto-fill';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

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
    router.push('/cart');
    return;
  };

  const navigateToCheckout = (couponCode = null) => {
    if (couponCode) {
      navigateWithCoupon(router, couponCode);
    } else {
      router.push('/checkout');
    }
    return;
  };

  // Enhanced navigation function for checkout with coupon pre-fill
  const navigateToCheckoutWithCoupon = couponCode => {
    navigateWithCoupon(router, couponCode);
    return;
  };

  return {
    navigateToCart,
    navigateToCheckout,
    navigateToCheckoutWithCoupon,
    isAuthenticated: !!user,
    hasCartItems: cart_products.length > 0,
  };
}
