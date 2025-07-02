'use client';
import useCouponRevalidation from '@/hooks/use-coupon-revalidation';

export default function CouponRevalidationWrapper({ children }) {
  // Initialize the coupon revalidation hook
  useCouponRevalidation();

  return <>{children}</>;
}
