/**
 * Auto-Apply Coupon Utility
 * Automatically applies the best available coupon when products are added to cart
 * Handles product-specific coupons and multiple coupon scenarios
 */

import { add_applied_coupon, set_coupon_loading } from '@/redux/features/coupon/couponSlice';
import { Dispatch } from '@reduxjs/toolkit';

interface CartProduct {
  _id: string;
  title: string;
  price: number | string;
  finalPriceDiscount: number | string;
  orderQuantity: number;
  shipping?: { price?: number };
  [key: string]: any;
}

interface AppliedCoupon {
  _id: string;
  couponCode: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  title?: string;
  [key: string]: any;
}

interface CouponData {
  _id: string;
  couponCode: string;
  status: string;
  discountAmount?: number;
  discountPercentage?: number;
  minimumAmount?: number;
  discountType: 'percentage' | 'fixed';
  title?: string;
  [key: string]: any;
}

interface AutoApplyParams {
  cartProducts: CartProduct[];
  appliedCoupons: AppliedCoupon[];
  dispatch: Dispatch;
  totalShippingCost?: number;
  addressDiscount?: number;
  firstTimeDiscount?: number;
}

/**
 * Calculate cart totals for coupon validation
 */
const calculateCartTotals = (
  cartProducts: CartProduct[],
  totalShippingCost = 0,
  addressDiscount = 0,
  firstTimeDiscount = 0
) => {
  const subtotal = cartProducts.reduce((total, item) => {
    const price = Number(item.finalPriceDiscount || item.price || 0);
    const quantity = Number(item.orderQuantity || 1);
    return total + price * quantity;
  }, 0);

  const cartTotal = subtotal + totalShippingCost - addressDiscount - firstTimeDiscount;

  return {
    subtotal,
    cartTotal,
    shipping: totalShippingCost,
  };
};

/**
 * Fetch active coupons from backend
 */
const fetchActiveCoupons = async (): Promise<CouponData[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupon/active`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data?.success && Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('[Auto-Apply] Error fetching active coupons:', error);
    return [];
  }
};

/**
 * Select first available valid coupon (no priority logic)
 */
const selectFirstAvailableCoupon = (
  availableCoupons: CouponData[],
  appliedCoupons: AppliedCoupon[]
): CouponData | null => {
  // Filter out already applied coupons
  const unappliedCoupons = availableCoupons.filter(coupon => {
    const isAlreadyApplied = appliedCoupons.some(
      applied =>
        applied.couponCode?.toLowerCase() === coupon.couponCode?.toLowerCase()
    );
    return (
      !isAlreadyApplied &&
      coupon.status === 'active' &&
      coupon.couponCode
    );
  });

  // Return first available coupon, no priority logic
  return unappliedCoupons.length > 0 ? unappliedCoupons[0] : null;
};

/**
 * Validate coupon with backend
 * Backend handles product-specific validation and discount calculation
 */
const validateCoupon = async (
  couponCode: string,
  cartProducts: CartProduct[],
  cartTotal: number,
  cartSubtotal: number,
  shippingCost: number,
  appliedCoupons: AppliedCoupon[]
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    // Determine which endpoint to use based on existing coupons
    const endpoint =
      appliedCoupons.length === 0
        ? '/api/coupon/validate'
        : '/api/coupon/validate-multiple';

    const isMultiple = appliedCoupons.length > 0;

    const requestBody = isMultiple
      ? {
          couponCodes: [couponCode],
          cartItems: cartProducts,
          cartTotal,
          cartSubtotal,
          shippingCost,
          excludeAppliedCoupons: appliedCoupons.map(c => c.couponCode),
        }
      : {
          couponCode,
          cartItems: cartProducts,
          cartTotal,
          cartSubtotal,
          shippingCost,
        };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Auto-Apply] Coupon validation error:', error);
    return { success: false, message: 'Validation failed' };
  }
};

/**
 * Main auto-apply function
 * Automatically applies the best available coupon to the cart
 */
export const autoApplyCoupon = async ({
  cartProducts,
  appliedCoupons,
  dispatch,
  totalShippingCost = 0,
  addressDiscount = 0,
  firstTimeDiscount = 0,
}: AutoApplyParams): Promise<boolean> => {
  // Skip if cart is empty
  if (!cartProducts || cartProducts.length === 0) {
    return false;
  }

  try {
    // Set loading state
    dispatch(set_coupon_loading(true));

    // Fetch active coupons
    const activeCoupons = await fetchActiveCoupons();

    if (activeCoupons.length === 0) {
      dispatch(set_coupon_loading(false));
      return false;
    }

    // Select first available coupon
    const firstAvailableCoupon = selectFirstAvailableCoupon(activeCoupons, appliedCoupons);

    if (!firstAvailableCoupon) {
      dispatch(set_coupon_loading(false));
      return false;
    }

    // Calculate cart totals
    const { cartTotal, subtotal, shipping } = calculateCartTotals(
      cartProducts,
      totalShippingCost,
      addressDiscount,
      firstTimeDiscount
    );

    // Validate coupon with backend
    const validationResult = await validateCoupon(
      firstAvailableCoupon.couponCode,
      cartProducts,
      cartTotal,
      subtotal,
      shipping,
      appliedCoupons
    );

    dispatch(set_coupon_loading(false));

    if (!validationResult.success || !validationResult.data) {
      // Silently fail - coupon may not meet requirements yet
      return false;
    }

    // Apply the coupon based on response structure
    if (appliedCoupons.length === 0 && validationResult.data.success) {
      // Single coupon response
      const couponData = validationResult.data.data;
      dispatch(
        add_applied_coupon({
          _id: couponData.couponId || firstAvailableCoupon._id,
          couponCode: couponData.couponCode || firstAvailableCoupon.couponCode,
          discount: couponData.discount || 0,
          discountType: couponData.discountType || firstAvailableCoupon.discountType,
          discountPercentage: couponData.discountPercentage || firstAvailableCoupon.discountPercentage,
          title: couponData.title || firstAvailableCoupon.title || couponData.couponCode,
        })
      );
      return true;
    } else if (
      validationResult.data.success &&
      validationResult.data.data?.appliedCoupons?.length > 0
    ) {
      // Multiple coupons response
      const newCoupons = validationResult.data.data.appliedCoupons;
      newCoupons.forEach((couponData: any) => {
        dispatch(
          add_applied_coupon({
            _id: couponData.couponId || couponData._id,
            couponCode: couponData.couponCode,
            discount: couponData.discount || 0,
            discountType: couponData.discountType,
            discountPercentage: couponData.discountPercentage,
            title: couponData.title || couponData.couponCode,
          })
        );
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Auto-Apply] Error in auto-apply coupon:', error);
    dispatch(set_coupon_loading(false));
    return false;
  }
};

/**
 * Re-validate existing coupons against updated cart
 * Used when cart changes (quantity update, product removal, etc.)
 */
export const revalidateAppliedCoupons = async ({
  cartProducts,
  appliedCoupons,
  dispatch,
  totalShippingCost = 0,
  addressDiscount = 0,
  firstTimeDiscount = 0,
}: AutoApplyParams): Promise<void> => {
  // If no coupons applied, try to auto-apply
  if (appliedCoupons.length === 0) {
    await autoApplyCoupon({
      cartProducts,
      appliedCoupons,
      dispatch,
      totalShippingCost,
      addressDiscount,
      firstTimeDiscount,
    });
    return;
  }

  // If cart is empty, don't revalidate
  if (!cartProducts || cartProducts.length === 0) {
    return;
  }

  // For existing coupons, backend will handle revalidation on checkout
  // We just ensure new coupons can be added if eligible
  await autoApplyCoupon({
    cartProducts,
    appliedCoupons,
    dispatch,
    totalShippingCost,
    addressDiscount,
    firstTimeDiscount,
  });
};

