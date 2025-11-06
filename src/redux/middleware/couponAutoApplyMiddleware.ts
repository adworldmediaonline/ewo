/**
 * Coupon Auto-Apply Middleware
 * Listens for cart actions and automatically applies coupons
 */

import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { autoApplyCoupon, revalidateAppliedCoupons } from '@/utils/coupon-auto-apply';

// Debounce helper to prevent multiple simultaneous auto-apply attempts
let autoApplyTimeout: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 500; // ms

export const couponAutoApplyMiddleware: Middleware = store => next => action => {
  // Type assertion for action
  const typedAction = action as AnyAction;

  // Execute the action first
  const result = next(action);

  // Check if this is a cart action that should trigger auto-apply
  const shouldAutoApply = [
    'cart/add_cart_product',
    'cart/increment_quantity',
    'cart/decrement_quantity',
    'cart/remove_product',
  ].includes(typedAction.type);

  if (shouldAutoApply) {
    // Clear any pending auto-apply
    if (autoApplyTimeout) {
      clearTimeout(autoApplyTimeout);
    }

    // Debounce to avoid multiple rapid calls
    autoApplyTimeout = setTimeout(async () => {
      const state = store.getState();
      const { cart_products, totalShippingCost, shippingDiscount } = state.cart;
      const { applied_coupons } = state.coupon;
      const { address_discount } = state.order || { address_discount: 0 };

      // Get first-time discount info
      const firstTimeDiscount = state.cart.firstTimeDiscount?.isApplied
        ? state.cart.firstTimeDiscount.percentage
        : 0;

      // Skip if cart is empty (for remove_product action)
      if (typedAction.type === 'cart/remove_product' && cart_products.length === 0) {
        return;
      }

      // Use revalidate for quantity changes and removals, auto-apply for additions
      if (typedAction.type === 'cart/add_cart_product') {
        await autoApplyCoupon({
          cartProducts: cart_products,
          appliedCoupons: applied_coupons,
          dispatch: store.dispatch,
          totalShippingCost,
          addressDiscount: address_discount,
          firstTimeDiscount,
        });
      } else {
        await revalidateAppliedCoupons({
          cartProducts: cart_products,
          appliedCoupons: applied_coupons,
          dispatch: store.dispatch,
          totalShippingCost,
          addressDiscount: address_discount,
          firstTimeDiscount,
        });
      }
    }, DEBOUNCE_DELAY);
  }

  // Clear coupons when cart is cleared
  if (typedAction.type === 'cart/clearCart') {
    const state = store.getState();
    if (state.coupon.applied_coupons.length > 0) {
      // Import dynamically to avoid circular dependency
      import('@/redux/features/coupon/couponSlice').then(({ clear_all_coupons }) => {
        store.dispatch(clear_all_coupons());
      });
    }
  }

  return result;
};

