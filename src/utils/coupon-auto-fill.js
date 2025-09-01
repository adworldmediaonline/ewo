/**
 * Utility functions for coupon auto-fill functionality
 * These functions help manage coupon codes that should be auto-filled on checkout
 */

/**
 * Set a coupon code to be auto-filled on the checkout page
 * @param {string} couponCode - The coupon code to auto-fill
 * @param {Object} options - Additional options
 * @param {boolean} options.persistUntilApplied - Whether to keep the code until it's applied (default: false)
 */
export const setPendingCouponCode = (couponCode, options = {}) => {
  if (!couponCode || typeof couponCode !== 'string') {
    return;
  }

  const { persistUntilApplied = false } = options;

  try {
    const couponData = {
      code: couponCode.trim(),
      timestamp: Date.now(),
      persistUntilApplied,
    };

    localStorage.setItem('pendingCouponCode', JSON.stringify(couponData));
  } catch (error) {}
};

/**
 * Get the pending coupon code
 * @returns {string|null} The pending coupon code or null if none exists
 */
export const getPendingCouponCode = () => {
  try {
    const pendingCoupon = localStorage.getItem('pendingCouponCode');
    if (!pendingCoupon) return null;

    const parsed = JSON.parse(pendingCoupon);

    // Check if the coupon has expired (older than 1 hour)
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > oneHour) {
      clearPendingCouponCode();
      return null;
    }

    return typeof parsed === 'string' ? parsed : parsed.code;
  } catch (error) {
    return null;
  }
};

/**
 * Clear the pending coupon code
 */
export const clearPendingCouponCode = () => {
  try {
    localStorage.removeItem('pendingCouponCode');
  } catch (error) {}
};

/**
 * Navigate to checkout with a pre-filled coupon code
 * @param {Object} router - Next.js router instance
 * @param {string} couponCode - The coupon code to pre-fill
 * @param {Object} options - Additional options
 * @param {boolean} options.useUrlParam - Whether to use URL parameter instead of localStorage (default: false)
 */
export const navigateToCheckoutWithCoupon = (
  router,
  couponCode,
  options = {}
) => {
  if (!router || !couponCode) {
    return;
  }

  const { useUrlParam = false } = options;

  if (useUrlParam) {
    // Use URL parameter for the coupon code
    router.push(`/checkout?coupon=${encodeURIComponent(couponCode)}`);
  } else {
    // Use localStorage for the coupon code
    setPendingCouponCode(couponCode);
    router.push('/checkout');
  }
};

/**
 * Enhanced navigation hook for guest cart that supports coupon auto-fill
 * This can be used to extend the existing useGuestCartNavigation hook
 */
export const createCouponEnabledNavigation = router => {
  return {
    navigateToCheckout: (couponCode = null) => {
      if (couponCode) {
        navigateToCheckoutWithCoupon(router, couponCode);
      } else {
        router.push('/checkout');
      }
    },
    navigateToCheckoutWithCoupon: couponCode => {
      navigateToCheckoutWithCoupon(router, couponCode);
    },
  };
};
