import {
  clear_all_coupons,
  set_applied_coupons,
  set_coupon_loading,
} from '@/redux/features/coupon/couponSlice';
import { notifyError } from '@/utils/toast';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function useCouponRevalidation() {
  const dispatch = useDispatch();
  const { cart_products } = useSelector(state => state.cart);
  const { applied_coupons } = useSelector(state => state.coupon);
  const previousCartRef = useRef(null);
  const revalidationTimeoutRef = useRef(null);
  const isRevalidatingRef = useRef(false);

  // Calculate cart totals
  const calculateTotals = useCallback(() => {
    if (
      !cart_products ||
      !Array.isArray(cart_products) ||
      cart_products.length === 0
    ) {
      return { cartSubtotal: 0 };
    }

    try {
      const cartSubtotal = cart_products.reduce((total, item) => {
        const quantity = Number(item?.orderQuantity || 0);
        const price = Number(item?.price || 0);
        return total + quantity * price;
      }, 0);

      return {
        cartSubtotal: Math.round(cartSubtotal * 100) / 100,
      };
    } catch (error) {
      console.error('Error calculating totals:', error);
      return { cartSubtotal: 0 };
    }
  }, [cart_products]);

  // Re-validate all applied coupons
  const revalidateAllCoupons = useCallback(async () => {
    if (applied_coupons.length === 0) {
      console.log('🔄 No applied coupons to revalidate');
      return;
    }

    if (isRevalidatingRef.current) {
      console.log('🔄 Coupon revalidation already in progress, skipping...');
      return;
    }

    isRevalidatingRef.current = true;
    dispatch(set_coupon_loading(true));

    try {
      const { cartSubtotal } = calculateTotals();
      const couponCodes = applied_coupons.map(c => c.couponCode);

      console.log('🔄 Revalidating coupons after cart change:', {
        couponCodes,
        cartSubtotal,
        cartItemsCount: cart_products.length,
        appliedCouponsCount: applied_coupons.length,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupon/validate-multiple`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            couponCodes: couponCodes,
            cartItems: cart_products,
            cartTotal: cartSubtotal,
            cartSubtotal: cartSubtotal,
            shippingCost: 0,
            excludeAppliedCoupons: [], // Don't exclude any since we're revalidating
          }),
        }
      );

      const result = await response.json();

      if (result.success && result.data.appliedCoupons) {
        console.log('✅ Coupon revalidation successful:', {
          originalCount: applied_coupons.length,
          newCount: result.data.appliedCoupons.length,
          totalDiscount: result.data.totalDiscount,
        });

        dispatch(set_applied_coupons(result.data.appliedCoupons));

        // Show notification if some coupons were removed
        const removedCount =
          applied_coupons.length - result.data.appliedCoupons.length;
        if (removedCount > 0) {
          notifyError(
            `${removedCount} coupon(s) are no longer valid and have been removed.`
          );
        }
      } else {
        console.log('❌ All coupons invalid during revalidation');
        // All coupons invalid, clear them
        dispatch(clear_all_coupons());
        notifyError(
          'All applied coupons are no longer valid and have been removed.'
        );
      }
    } catch (error) {
      console.error('❌ Coupon revalidation error:', error);
      // Keep existing coupons on revalidation error
    } finally {
      dispatch(set_coupon_loading(false));
      isRevalidatingRef.current = false;
    }
  }, [applied_coupons, cart_products, calculateTotals, dispatch]);

  // Check if cart has changed significantly (quantity changes)
  const hasCartChanged = useCallback((currentCart, previousCart) => {
    if (!previousCart) {
      console.log('🔄 First cart load, no previous cart to compare');
      return false;
    }

    if (currentCart.length !== previousCart.length) {
      console.log('🔄 Cart length changed:', {
        previous: previousCart.length,
        current: currentCart.length,
      });
      return true;
    }

    // Check if any product quantities have changed
    for (let i = 0; i < currentCart.length; i++) {
      const currentItem = currentCart[i];
      const previousItem = previousCart[i];

      if (!previousItem) {
        console.log('🔄 New item added to cart');
        return true;
      }

      // Check if quantity changed
      if (currentItem.orderQuantity !== previousItem.orderQuantity) {
        console.log('🔄 Quantity changed for product:', {
          productId: currentItem._id,
          title: currentItem.title,
          previousQuantity: previousItem.orderQuantity,
          currentQuantity: currentItem.orderQuantity,
        });
        return true;
      }

      // Check if product ID changed (product was replaced)
      if (currentItem._id !== previousItem._id) {
        console.log('🔄 Product ID changed:', {
          previousId: previousItem._id,
          currentId: currentItem._id,
        });
        return true;
      }
    }

    return false;
  }, []);

  // Debounced revalidation function
  const debouncedRevalidation = useCallback(() => {
    // Clear existing timeout
    if (revalidationTimeoutRef.current) {
      clearTimeout(revalidationTimeoutRef.current);
    }

    // Set new timeout for debounced revalidation
    revalidationTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Executing debounced coupon revalidation...');
      revalidateAllCoupons();
    }, 500); // 500ms debounce delay
  }, [revalidateAllCoupons]);

  // Effect to watch for cart changes and revalidate coupons
  useEffect(() => {
    const currentCart = cart_products;
    const previousCart = previousCartRef.current;

    // Only revalidate if cart has actually changed and we have applied coupons
    if (
      hasCartChanged(currentCart, previousCart) &&
      applied_coupons.length > 0
    ) {
      console.log('🔄 Cart changed, scheduling coupon revalidation...');
      debouncedRevalidation();
    }

    // Update the previous cart reference
    previousCartRef.current = currentCart;
  }, [
    cart_products,
    applied_coupons.length,
    hasCartChanged,
    debouncedRevalidation,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (revalidationTimeoutRef.current) {
        clearTimeout(revalidationTimeoutRef.current);
      }
    };
  }, []);

  return {
    revalidateAllCoupons,
  };
}
