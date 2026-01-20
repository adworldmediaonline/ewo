/**
 * Coupon Feature Configuration
 *
 * Feature flags to control coupon-related functionality.
 * Set these flags to enable/disable features as needed.
 */

/**
 * Enable automatic coupon application
 * When true: Coupons are automatically applied when products are added to cart
 * When false: Coupons must be manually applied by the user
 *
 * Default: false (disabled)
 */
export const ENABLE_AUTO_COUPON_APPLICATION = false;

/**
 * Enable automatic coupon code auto-fill in cart dropdown
 * When true: Coupon codes are automatically filled in the cart dropdown input
 * When false: Users must manually enter coupon codes
 *
 * Default: false (disabled)
 */
export const ENABLE_AUTO_COUPON_FILL = false;
