# Coupon Auto-Fill Feature

## Overview

The smart coupon auto-fill feature automatically pre-populates the best available coupon codes on the checkout page, providing a better user experience by eliminating the need for users to manually type coupon codes. The system intelligently selects the most beneficial coupon from active backend coupons.

## Features

### 1. Auto-Fill Sources (Priority Order)

1. **URL Parameters**: `?coupon=CODE`, `?couponCode=CODE`, or `?code=CODE` (highest priority)
2. **localStorage**: `pendingCouponCode` (set by other pages)
3. **Smart Backend Selection**: Automatically selects the best coupon from active backend coupons

### 2. Smart Behavior

- **Intelligent Selection**: Chooses the best coupon based on discount amount, minimum requirements, and discount percentage
- **Non-Intrusive**: Only fills empty input fields, never overwrites manually entered codes
- **Duplicate Prevention**: Checks if coupons are already applied before auto-filling
- **Clean State Management**: Automatically clears localStorage after auto-filling
- **Real-time UI Feedback**: Shows loading states and helpful messages
- **Error Handling**: Gracefully handles API failures with fallback messaging

## Usage Examples

### 1. URL Parameter Method

```javascript
// Direct navigation with URL parameter
router.push('/checkout?coupon=SAVE20');

// Or using the utility function
import { navigateToCheckoutWithCoupon } from '@/utils/coupon-auto-fill';
navigateToCheckoutWithCoupon(router, 'SAVE20', { useUrlParam: true });
```

### 2. localStorage Method

```javascript
// Set coupon code for auto-fill
import { setPendingCouponCode } from '@/utils/coupon-auto-fill';
setPendingCouponCode('SAVE20');
router.push('/checkout');

// Or use the combined utility
import { navigateToCheckoutWithCoupon } from '@/utils/coupon-auto-fill';
navigateToCheckoutWithCoupon(router, 'SAVE20'); // Uses localStorage by default
```

### 3. Enhanced Navigation Hook

```javascript
// In components
const { navigateToCheckout, navigateToCheckoutWithCoupon } =
  useGuestCartNavigation();

// Navigate normally
navigateToCheckout();

// Navigate with coupon pre-fill
navigateToCheckout('SAVE20'); // or
navigateToCheckoutWithCoupon('SAVE20');
```

## Component Integration

### Checkout Billing Area

- Automatically detects and fills coupon codes on component mount
- Shows helpful message when code is pre-filled
- Maintains all existing functionality

### Guest Cart Navigation Hook

- Enhanced with coupon auto-fill support
- Backward compatible with existing usage
- Optional coupon parameter for checkout navigation

## Files Modified

1. **`/src/components/version-tsx/checkout/checkout-billing-area.jsx`**

   - Added auto-fill logic with multiple source detection
   - Added helpful UI messages for pre-filled codes

2. **`/src/hooks/useGuestCartNavigation.js`**

   - Enhanced with coupon auto-fill support
   - Backward compatible with existing API

3. **`/src/utils/coupon-auto-fill.js`** (New)
   - Utility functions for managing coupon auto-fill
   - Helper functions for navigation with coupons

## Testing

### Test Cases

1. **URL Parameter**: Visit `/checkout?coupon=TEST20` - should auto-fill "TEST20"
2. **localStorage**: Set code via other page, navigate to checkout - should auto-fill
3. **Already Applied**: Auto-fill should not occur if coupon already applied
4. **Manual Entry**: Should not overwrite manually entered codes
5. **Multiple Sources**: URL parameter should take priority over localStorage

### Manual Testing

```javascript
// Console testing
localStorage.setItem(
  'pendingCouponCode',
  JSON.stringify({
    code: 'MANUAL_TEST',
    timestamp: Date.now(),
  })
);
// Navigate to /checkout - should auto-fill "MANUAL_TEST"
```

## Future Enhancements

1. **Multiple Coupons**: Auto-fill multiple coupons from cart state
2. **Coupon Page Integration**: Direct "Apply at Checkout" buttons
3. **Expiry Handling**: Enhanced expiry logic for different coupon types
4. **Analytics**: Track auto-fill success rates

## Backward Compatibility

- All existing functionality remains unchanged
- Existing checkout flows continue to work normally
- Enhanced navigation is optional and backward compatible
- No breaking changes to any existing APIs

## Notes

- Auto-fill occurs after a 100ms delay to ensure DOM readiness
- localStorage entries expire after 1 hour automatically
- Console logs help with debugging during development
- UI messages provide clear feedback to users
