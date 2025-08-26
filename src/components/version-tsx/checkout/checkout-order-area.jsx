'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
// internal
import { ScrollArea } from '@/components/ui/scroll-area';
import useCartInfo from '@/hooks/use-cart-info';
import {
  add_cart_product,
  quantityDecrement,
} from '@/redux/features/cartSlice';
import { load_applied_coupons } from '@/redux/features/coupon/couponSlice';
import { Minus, Plus } from '@/svg';
// Removed CSS module import; Tailwind-only styling

export default function CheckoutOrderArea({ checkoutData, isGuest }) {
  const dispatch = useDispatch();

  // Save discount values locally to preserve during checkout
  const [savedAddressDiscount, setSavedAddressDiscount] = useState(0);
  const [savedDiscountEligible, setSavedDiscountEligible] = useState(null);
  const [savedDiscountMessage, setSavedDiscountMessage] = useState('');

  const {
    handleShippingCost,
    cartTotal = 0,
    isCheckoutSubmit,
    shippingCost,
    discountAmount,
    processingPayment,
    address_discount_eligible,
    address_discount_message,
    addressDiscountAmount,
    handleCouponSubmit,
    handleRemoveCoupon,
    handleClearAllCoupons,
    couponRef,
    couponApplyMsg,
  } = checkoutData;

  const {
    cart_products,
    totalShippingCost,
    shippingDiscount,
    firstTimeDiscount,
  } = useSelector(state => state.cart);

  const { total, totalWithShipping, subtotal, firstTimeDiscountAmount } =
    useCartInfo();

  const { isCheckoutSubmitting } = useSelector(state => state.order);

  // Enhanced multiple coupon state
  const {
    applied_coupons,
    total_coupon_discount,
    coupon_error,
    coupon_loading,
  } = useSelector(state => state.coupon);

  // Load applied coupons on component mount
  useEffect(() => {
    dispatch(load_applied_coupons());
  }, [dispatch]);

  // Save discount values when they change and we're not in checkout process
  useEffect(() => {
    if (!isCheckoutSubmit && !isCheckoutSubmitting) {
      setSavedAddressDiscount(addressDiscountAmount);
      setSavedDiscountEligible(address_discount_eligible);
      setSavedDiscountMessage(address_discount_message);
    }
  }, [
    addressDiscountAmount,
    address_discount_eligible,
    address_discount_message,
    isCheckoutSubmit,
    isCheckoutSubmitting,
  ]);

  // Use saved or current values depending on checkout state
  const displayAddressDiscount = isCheckoutSubmit
    ? savedAddressDiscount
    : addressDiscountAmount;
  const displayDiscountEligible = isCheckoutSubmit
    ? savedDiscountEligible
    : address_discount_eligible;
  const displayDiscountMessage = isCheckoutSubmit
    ? savedDiscountMessage
    : address_discount_message;

  // Update shipping cost in checkout data when it changes
  useEffect(() => {
    handleShippingCost(totalShippingCost);
  }, [totalShippingCost, handleShippingCost]);

  // Calculate discount percentage to display
  const discountPercentage =
    shippingDiscount > 0 ? (shippingDiscount * 100).toFixed(0) : 0;

  // Calculate final total with all discounts
  const calculateFinalTotal = () => {
    // Ensure we have a valid base total
    const baseTotal = Number(totalWithShipping);

    // If totalWithShipping is NaN or invalid, calculate it manually
    if (isNaN(baseTotal) || baseTotal <= 0) {
      const cartTotal =
        cart_products?.reduce(
          (sum, item) => sum + Number(item.price) * Number(item.orderQuantity),
          0
        ) || 0;

      const shipping = Number(totalShippingCost) || 0;
      const firstTimeDiscountAmt = Number(firstTimeDiscountAmount) || 0;

      const manualTotal = cartTotal + shipping - firstTimeDiscountAmt;

      let finalTotal = manualTotal;

      // Subtract multiple coupon discounts
      if (Number(total_coupon_discount) > 0) {
        finalTotal -= Number(total_coupon_discount);
      } else if (Number(discountAmount) > 0) {
        // Fall back to legacy discount amount
        finalTotal -= Number(discountAmount);
      }

      // Subtract address discount
      const addressDiscount = Number(displayAddressDiscount) || 0;
      if (addressDiscount > 0) {
        finalTotal -= addressDiscount;
      }

      return Math.max(0, finalTotal);
    }

    let finalTotal = baseTotal;

    // Subtract multiple coupon discounts
    if (Number(total_coupon_discount) > 0) {
      finalTotal -= Number(total_coupon_discount);
    } else if (Number(discountAmount) > 0) {
      // Fall back to legacy discount amount
      finalTotal -= Number(discountAmount);
    }

    // Subtract address discount
    const addressDiscount = Number(displayAddressDiscount) || 0;
    if (addressDiscount > 0) {
      finalTotal -= addressDiscount;
    }

    // Ensure total doesn't go below 0 and is a valid number
    const result = Math.max(0, finalTotal);
    return isNaN(result) ? 0 : result;
  };

  // handle add product quantity
  const handleAddProduct = product => {
    dispatch(add_cart_product(product));
  };

  // handle decrement product quantity
  const handleDecrement = product => {
    dispatch(quantityDecrement(product));
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 md:p-6 border border-border">
      <h3 className="text-xl font-semibold text-foreground mb-4 md:mb-6">
        Your Order
      </h3>

      {/* Scrollable area for order items */}
      <ScrollArea className="h-[300px] md:h-[400px] pr-2">
        <div className="space-y-4 mb-4">
          {cart_products.map(item => (
            <div
              key={item._id}
              className="flex items-center justify-between py-3 md:py-4 border-b border-border last:border-0"
            >
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden">
                  <Image
                    src={item.img || '/placeholder-product.png'}
                    alt={item.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm md:text-base">
                    {item.title}
                  </h4>
                  {item.selectedOption && (
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {item.selectedOption.title} (+$
                      {Number(item.selectedOption.price).toFixed(2)})
                    </p>
                  )}
                  <div className="flex items-center mt-1 md:mt-2">
                    <button
                      type="button"
                      onClick={() => handleDecrement(item)}
                      className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-l-md border border-border bg-background text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={
                        isCheckoutSubmit ||
                        processingPayment ||
                        item.orderQuantity <= 1
                      }
                    >
                      <Minus width={10} height={10} />
                    </button>
                    <span className="w-8 h-6 md:w-10 md:h-8 flex items-center justify-center border-y border-border bg-background text-foreground text-xs md:text-sm">
                      {item.orderQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddProduct(item)}
                      className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-r-md border border-border bg-background text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={isCheckoutSubmit || processingPayment}
                    >
                      <Plus width={10} height={10} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-foreground font-medium text-sm md:text-base">
                ${(item.price * item.orderQuantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
